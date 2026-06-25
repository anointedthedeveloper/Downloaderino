import { Router } from "express";
import type { Request, Response } from "express";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const router = Router();

const ALLOWED_DOMAINS = [
  'hakunaymatata.com',
  'bcdnxw.hakunaymatata.com',
  'cacdn.hakunaymatata.com',
  'aoneroom.com',
  'pbcdnw.aoneroom.com',
  'macdn.aoneroom.com',
];

router.get("/dl", async (req: Request, res: Response): Promise<void> => {
  const rawUrl = req.query.url as string | undefined;
  const filename = (req.query.filename as string | undefined) || 'download';

  if (!rawUrl) {
    res.status(400).json({ error: 'Missing url' });
    return;
  }

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    res.status(400).json({ error: 'Invalid url' });
    return;
  }

  const isAllowed = ALLOWED_DOMAINS.some(
    (d) => target.hostname === d || target.hostname.endsWith('.' + d)
  );
  if (!isAllowed) {
    res.status(403).json({ error: 'Domain not allowed' });
    return;
  }

  const rangeHeader = req.headers['range'];

  const upstreamHeaders: Record<string, string> = {
    'Origin': 'https://downloader2.com',
    'Referer': 'https://downloader2.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };
  if (rangeHeader) {
    upstreamHeaders['Range'] = rangeHeader;
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Disposition', `attachment; filename="${filename}"`);
    res.set('Cache-Control', 'no-store');

    for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
      const v = upstream.headers.get(h);
      if (v) res.set(h, v);
    }

    res.status(upstream.status);

    if (upstream.body) {
      await pipeline(Readable.fromWeb(upstream.body as any), res);
    } else {
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'Upstream fetch failed' });
    }
  }
});

router.options("/dl", (_req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.status(204).end();
});

export default router;
