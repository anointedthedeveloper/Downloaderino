import { useEffect, useRef, useState, useCallback } from 'react';
import { trackDownload } from '../analytics';

export interface DownloadTask {
  id: string;
  name: string;
  url: string;
  progress: number;
  status: 'downloading' | 'done' | 'error';
  size?: string;
  background?: boolean;
}

async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch {
    return null;
  }
}

async function streamDownload(
  url: string,
  filename: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal,
) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const total = parseInt(res.headers.get('content-length') ?? '0', 10);
  const reader = res.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(total > 0 ? Math.round((received / total) * 100) : -1);
  }
  const blob = new Blob(chunks);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function useDownloads() {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const abortRefs = useRef<Record<string, AbortController>>({});
  const swReg = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    registerSW().then(reg => { swReg.current = reg; });
  }, []);

  // Listen for SW messages (BG fetch done/fail/progress)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = async (e: MessageEvent) => {
      const { type, id, url } = e.data ?? {};
      if (type === 'BG_FETCH_DONE') {
        const cache = await caches.open('downloaderino-v1');
        const resp = await cache.match(url);
        if (resp) {
          const blob = await resp.blob();
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = id;
          a.click();
          URL.revokeObjectURL(a.href);
        }
        setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: 100, status: 'done' } : t));
      } else if (type === 'BG_FETCH_FAIL' || type === 'BG_FETCH_ABORT') {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error' } : t));
      } else if (type === 'BG_PROGRESS') {
        const { downloaded, downloadTotal } = e.data;
        const pct = downloadTotal > 0 ? Math.round((downloaded / downloadTotal) * 100) : -1;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: pct < 0 ? 50 : pct } : t));
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // Poll BG fetch progress every 2s
  useEffect(() => {
    const interval = setInterval(() => {
      const bgTasks = tasks.filter(t => t.background && t.status === 'downloading');
      if (!bgTasks.length || !swReg.current?.active) return;
      bgTasks.forEach(t => swReg.current!.active!.postMessage({ type: 'GET_BG_PROGRESS', id: t.id }));
    }, 2000);
    return () => clearInterval(interval);
  }, [tasks]);

  const startDownload = useCallback(async (
    url: string,
    filename: string,
    size: string | undefined,
    dlType: 'movie' | 'series' | 'season' | 'range',
    quality: string,
  ) => {
    const id = filename;
    trackDownload(quality, dlType);

    // Try Background Fetch first (survives tab close/reload)
    const reg = swReg.current ?? await registerSW();
    if (reg && (reg as any).backgroundFetch) {
      try {
        await (reg as any).backgroundFetch.fetch(id, [url], {
          title: `Downloading ${filename}`,
          downloadTotal: 0,
          icons: [{ src: '/favicon.svg', type: 'image/svg+xml', sizes: '96x96' }],
        });
        setTasks(prev => prev.find(t => t.id === id) ? prev : [
          ...prev, { id, name: filename, url, progress: 0, status: 'downloading', size, background: true },
        ]);
        return;
      } catch {
        // fall through to in-page
      }
    }

    // In-page streaming fallback
    const ctrl = new AbortController();
    abortRefs.current[id] = ctrl;
    setTasks(prev => prev.find(t => t.id === id) ? prev : [
      ...prev, { id, name: filename, url, progress: 0, status: 'downloading', size },
    ]);
    try {
      await streamDownload(url, filename, (pct) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: pct < 0 ? 50 : pct } : t));
      }, ctrl.signal);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: 100, status: 'done' } : t));
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error' } : t));
      }
    }
  }, []);

  const cancelDownload = useCallback((id: string) => {
    abortRefs.current[id]?.abort();
    swReg.current && (swReg.current as any).backgroundFetch?.get(id)
      .then((r: any) => r?.abort()).catch(() => {});
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismissDone = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, startDownload, cancelDownload, dismissDone };
}
