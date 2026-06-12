import type { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';
import http from 'http';

/**
 * Serverless proxy for media/subtitle downloads.
 *
 * The CDN requires Origin + Referer headers that browsers forbid setting
 * in fetch(). This function runs server-side where there's no such restriction.
 *
 * Usage: GET /api/dl?url=<encoded-cdn-url>&filename=<encoded-filename>
 */
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

  // Allowlist — only proxy known CDN domains
  const allowed = [
    'hakunaymatata.com',
    'bcdnxw.hakunaymatata.com',
    'cacdn.hakunaymatata.com',
    'aoneroom.com',
    'pbcdnw.aoneroom.com',
    'macdn.aoneroom.com',
  ];
  if (!allowed.some(d => target.hostname === d || target.hostname.endsWith('.' + d))) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  const reqHeaders: Record<string, string> = {
    'Origin': 'https://downloader2.com',
    'Referer': 'https://downloader2.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };

  const proto = target.protocol === 'https:' ? https : http;
  const safeFilename = typeof filename === 'string' ? filename : 'download';

  const proxyReq = proto.get(target.toString(), { headers: reqHeaders }, (proxyRes) => {
    const status = proxyRes.statusCode ?? 200;

    if (status >= 300 && status < 400 && proxyRes.headers.location) {
      // Follow one redirect
      const redirectUrl = proxyRes.headers.location;
      const redirectProto = redirectUrl.startsWith('https') ? https : http;
      const redirectReq = redirectProto.get(redirectUrl, { headers: reqHeaders }, (redirectRes) => {
        pipeResponse(redirectRes, res, safeFilename);
      });
      redirectReq.on('error', (err) => {
        console.error('Redirect proxy error:', err.message);
        if (!res.headersSent) res.status(502).json({ error: 'Upstream redirect error' });
      });
      return;
    }

    pipeResponse(proxyRes, res, safeFilename);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) res.status(502).json({ error: 'Upstream error' });
  });

  req.on('close', () => proxyReq.destroy());
}

function pipeResponse(proxyRes: http.IncomingMessage, res: VercelResponse, filename: string) {
  const ct = proxyRes.headers['content-type'] ?? 'application/octet-stream';
  const cl = proxyRes.headers['content-length'];

  res.setHeader('Content-Type', ct);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  if (cl) res.setHeader('Content-Length', cl);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.status(proxyRes.statusCode ?? 200);
  proxyRes.pipe(res);
}
