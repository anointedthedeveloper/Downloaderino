import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const UPSTREAM_BASE = 'https://movie-api-nine-chi.vercel.app';

router.all("/proxy/{*path}", async (req: Request, res: Response) => {
  const suffix = '/' + ((req.params as any).path || '');
  const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const targetUrl = `${UPSTREAM_BASE}${suffix}${qs}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    res.set('Access-Control-Allow-Origin', '*');
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.set('Content-Type', contentType);

    res.status(upstream.status);
    const data = await upstream.text();
    res.send(data);
  } catch {
    res.status(502).json({ error: 'Upstream fetch failed' });
  }
});

export default router;
