import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import http from 'http';

// Serverless proxy: fetches the media file server-side with the required
// Origin/Referer headers (forbidden in browsers) and streams it back.
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { url, filename } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }

  // Only allow proxying to known CDN domains
  const allowed = ['hakunaymatata.com', 'aoneroom.com', 'bcdnxw.hakunaymatata.com'];
  if (!allowed.some(d => target.hostname.endsWith(d))) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  const reqHeaders: Record<string, string> = {
    'Origin': 'https://downloader2.com',
    'Referer': 'https://downloader2.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };

  const proto = target.protocol === 'https:' ? https : http;

  const proxyReq = proto.get(target.toString(), { headers: reqHeaders }, (proxyRes) => {
    // Forward content-type and content-length for proper download handling
    const ct = proxyRes.headers['content-type'] ?? 'application/octet-stream';
    const cl = proxyRes.headers['content-length'];

    res.setHeader('Content-Type', ct);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${typeof filename === 'string' ? filename : 'download'}"`,
    );
    if (cl) res.setHeader('Content-Length', cl);
    res.setHeader('Cache-Control', 'no-store');

    res.status(proxyRes.statusCode ?? 200);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Upstream error' });
  });

  req.on('close', () => proxyReq.destroy());
}
