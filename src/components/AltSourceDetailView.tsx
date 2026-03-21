import React, { useState, useRef } from 'react';
import { ArrowLeft, Download, ExternalLink, Film, X, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AltSourceDetail } from '../types';
import { api } from '../api';

interface Props {
  detail: AltSourceDetail;
  loading: boolean;
  onBack: () => void;
}

interface DownloadTask {
  id: string;
  name: string;
  progress: number;
  status: 'downloading' | 'done' | 'error';
  background: boolean;
}

async function downloadWithProgress(
  url: string,
  filename: string,
  onProgress: (pct: number) => void,
  signal: AbortSignal
) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const total = parseInt(res.headers.get('content-length') || '0', 10);
  const reader = res.body!.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
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

export const AltSourceDetailView: React.FC<Props> = ({ detail, loading, onBack }) => {
  const [tasks, setTasks] = useState<DownloadTask[]>([]);
  const abortRefs = useRef<Record<string, AbortController>>({});

  const startDownload = async (label: string, targetUrl: string) => {
    const id = Date.now().toString();
    const ctrl = new AbortController();
    abortRefs.current[id] = ctrl;
    const filename = label.replace(/[^a-z0-9]/gi, '_') + '.mp4';
    const proxyUrl = api.getAltSourceProxyUrl(targetUrl);
    setTasks(prev => [...prev, { id, name: label, progress: 0, status: 'downloading', background: false }]);
    try {
      await downloadWithProgress(proxyUrl, filename, pct => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: pct < 0 ? 50 : pct } : t));
      }, ctrl.signal);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, progress: 100, status: 'done' } : t));
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'error' } : t));
      }
    }
  };

  const cancelTask = (id: string) => {
    abortRefs.current[id]?.abort();
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-8 pb-20"
    >
      <motion.button
        whileHover={{ x: -5 }}
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border-subtle text-sm font-bold text-gray-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
      >
        <ArrowLeft size={16} /> Back to catalogue
      </motion.button>

      {/* Download Progress Panel */}
      <AnimatePresence>
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 right-6 z-50 w-80 space-y-2"
          >
            {tasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate text-foreground">{task.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                      {task.status === 'done' ? '✓ Complete' :
                       task.status === 'error' ? '✗ Failed' :
                       task.background ? `⬇ Background · ${task.progress > 0 ? task.progress + '%' : '…'}` :
                       `Downloading… ${task.progress > 0 ? task.progress + '%' : ''}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {task.status === 'downloading' && !task.background && (
                      <button
                        onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, background: true } : t))}
                        className="w-6 h-6 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                      >
                        <WifiOff size={11} />
                      </button>
                    )}
                    <button
                      onClick={() => cancelTask(task.id)}
                      className="w-6 h-6 rounded-lg bg-background border border-border-subtle flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${task.status === 'error' ? 'bg-red-500' : 'bg-primary'}`}
                    animate={{ width: task.status === 'downloading' && task.progress === 0 ? '30%' : `${task.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12">
        {/* Poster */}
        <div className="space-y-4">
          <div className="relative rounded-[24px] overflow-hidden shadow-2xl border border-border-subtle aspect-[2/3] max-w-[260px] mx-auto lg:max-w-none bg-orange-500/5 flex items-center justify-center">
            {detail.cover
              ? <img src={detail.cover} alt={detail.title} className="w-full h-full object-cover" />
              : <Film size={64} className="text-orange-500/30" />}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-xl bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                AltSource
              </span>
            </div>
          </div>
          <a
            href={detail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl transition-all text-sm"
          >
            <ExternalLink size={15} /> View Source Page
          </a>
        </div>

        {/* Info + Downloads */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-500 font-black uppercase tracking-[0.2em] text-[10px]">
              <Film size={14} /> AltSource
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">{detail.title}</h2>
            {detail.description && (
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-base font-medium max-w-3xl">
                {detail.description}
              </p>
            )}
          </div>

          {/* Download Center */}
          <div className="bg-surface border border-border-subtle rounded-[24px] p-6 md:p-8 shadow-2xl space-y-6">
            <div className="border-b border-border-subtle pb-5 space-y-1">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Download size={22} className="text-orange-500" /> Download Links
              </h3>
              <p className="text-xs font-medium text-gray-400">
                In-App downloads show progress. Direct opens in your browser.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 py-6 text-gray-400 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  Loading download links…
                </motion.div>
              ) : detail.downloads.length === 0 ? (
                <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-gray-400 font-medium py-4">
                  No direct download links found. Visit the source page directly.
                </motion.p>
              ) : (
                <motion.div key="links" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3">
                  {detail.downloads.map((dl, idx) => {
                    const activeTask = tasks.find(t => t.name === dl.label && t.status === 'downloading');
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-background border border-border-subtle rounded-2xl overflow-hidden"
                      >
                        <div className="flex items-center gap-4 px-4 py-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                            <Download size={16} />
                          </div>
                          <span className="flex-grow font-bold text-sm">{dl.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-border-subtle">
                          <button
                            onClick={() => !activeTask && startDownload(dl.label, dl.url)}
                            disabled={!!activeTask}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-orange-500/5 text-xs font-black text-orange-500 transition-colors disabled:opacity-50"
                          >
                            {activeTask
                              ? <><div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> Downloading…</>
                              : <><Download size={13} /> In-App</>}
                          </button>
                          <a
                            href={dl.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-background hover:bg-surface text-xs font-black text-gray-400 hover:text-foreground transition-colors border-l border-border-subtle"
                          >
                            <ExternalLink size={13} /> Direct
                          </a>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
