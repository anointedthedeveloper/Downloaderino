const https = require('https');
const http = require('http');

/**
 * Vercel serverless proxy for media/subtitle downloads.
 *
 * The CDN requires Origin + Referer headers that browsers cannot set
 * (forbidden headers). This function runs server-side with no such restriction.
 *
 * GET /api/dl?url=<encoded-cdn-url>&filename=<encoded-filename>
 */
module.exports = function handler(req, res) {
  const { url, filename } = req.query;

  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  let target;
  try {
    target = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid url' });
    return;
  }

  // Allowlist — only proxy known CDN domains
  const allowed = [
    'hakunaymatata.com',
    'bcdnxw.hakunaymatata.com',
    'cacdn.hakunaymatata.com',
    'aoneroom.com',
    'pbcdnw.aoneroom.com',
    'macdn.aoneroom.com',
  ];
  const isAllowed = allowed.some(
    (d) => target.hostname === d || target.hostname.endsWith('.' + d)
  );
  if (!isAllowed) {
    res.status(403).json({ error: 'Domain not allowed' });
    return;
  }

  const reqHeaders = {
    Origin: 'https://downloader2.com',
    Referer: 'https://downloader2.com/',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };

  const safeFilename = typeof filename === 'string' ? filename : 'download';
  const proto = target.protocol === 'https:' ? https : http;

  function pipe(sourceRes) {
    const status = sourceRes.statusCode || 200;

    // Follow one redirect
    if (status >= 300 && status < 400 && sourceRes.headers.location) {
      const loc = sourceRes.headers.location;
      const rProto = loc.startsWith('https') ? https : http;
      const rReq = rProto.get(loc, { headers: reqHeaders }, pipe);
      rReq.on('error', (err) => {
        if (!res.headersSent) res.status(502).json({ error: err.message });
      });
      return;
    }

    const ct = sourceRes.headers['content-type'] || 'application/octet-stream';
    const cl = sourceRes.headers['content-length'];

    res.setHeader('Content-Type', ct);
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (cl) res.setHeader('Content-Length', cl);

    res.status(status);
    sourceRes.pipe(res);
  }

  const proxyReq = proto.get(target.toString(), { headers: reqHeaders }, pipe);

  proxyReq.on('error', (err) => {
    if (!res.headersSent) res.status(502).json({ error: err.message });
  });

  req.on('close', () => proxyReq.destroy());
};
