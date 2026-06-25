const CACHE = 'downloaderino-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Background Fetch progress events
self.addEventListener('backgroundfetchsuccess', async (e) => {
  const bgFetch = e.registration;
  const records = await bgFetch.matchAll();
  const cache = await caches.open(CACHE);

  await Promise.all(records.map(async (record) => {
    const response = await record.responseReady;
    await cache.put(record.request, response.clone());

    // Trigger save-to-disk via postMessage to all clients
    const blob = await response.blob();
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    clients.forEach(client => {
      client.postMessage({
        type: 'BG_FETCH_DONE',
        id: bgFetch.id,
        filename: bgFetch.id, // id is the filename
        url: record.request.url,
      });
    });
  }));

  await e.updateUI({ title: `✓ Download complete` });
});

self.addEventListener('backgroundfetchfail', async (e) => {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach(client => client.postMessage({ type: 'BG_FETCH_FAIL', id: e.registration.id }));
  await e.updateUI({ title: `✗ Download failed` });
});

self.addEventListener('backgroundfetchabort', async (e) => {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach(client => client.postMessage({ type: 'BG_FETCH_ABORT', id: e.registration.id }));
});

self.addEventListener('backgroundfetchclick', () => {
  self.clients.openWindow('/');
});

// Progress polling — clients can request progress updates
self.addEventListener('message', async (e) => {
  if (e.data?.type === 'GET_BG_PROGRESS' && self.registration.backgroundFetch) {
    const reg = await self.registration.backgroundFetch.get(e.data.id);
    if (reg) {
      e.source.postMessage({
        type: 'BG_PROGRESS',
        id: e.data.id,
        downloaded: reg.downloaded,
        downloadTotal: reg.downloadTotal,
        result: reg.result,
      });
    }
  }
});
