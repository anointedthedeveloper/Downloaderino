import { Router } from "express";
import type { Request, Response } from "express";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import archiver from "archiver";

const router = Router();

const UPSTREAM = process.env.MOVIE_API_URL || "https://movie-api-nine-chi.vercel.app";

const ALLOWED_DOMAINS = [
  'hakunaymatata.com',
  'bcdnxw.hakunaymatata.com',
  'cacdn.hakunaymatata.com',
  'aoneroom.com',
  'pbcdnw.aoneroom.com',
  'macdn.aoneroom.com',
];

const CDN_HEADERS = {
  'Origin': 'https://downloader2.com',
  'Referer': 'https://downloader2.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

// Single file proxy
router.get("/dl", async (req: Request, res: Response): Promise<void> => {
  const rawUrl = req.query.url as string | undefined;
  const filename = (req.query.filename as string | undefined) || 'download';

  if (!rawUrl) { res.status(400).json({ error: 'Missing url' }); return; }

  let target: URL;
  try { target = new URL(rawUrl); } catch {
    res.status(400).json({ error: 'Invalid url' }); return;
  }

  const isAllowed = ALLOWED_DOMAINS.some(
    (d) => target.hostname === d || target.hostname.endsWith('.' + d)
  );
  if (!isAllowed) { res.status(403).json({ error: 'Domain not allowed' }); return; }

  const upstreamHeaders: Record<string, string> = { ...CDN_HEADERS };
  const rangeHeader = req.headers['range'];
  if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

  try {
    const upstream = await fetch(target.toString(), { headers: upstreamHeaders, redirect: 'follow' });
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
    if (!res.headersSent) res.status(502).json({ error: 'Upstream fetch failed' });
  }
});

// Bulk season zip — streams all episodes into a zip piped directly to the browser
router.get("/dl/season", async (req: Request, res: Response): Promise<void> => {
  const { subjectId, detailPath, se = '1', resolution } = req.query as Record<string, string>;

  if (!subjectId || !detailPath) {
    res.status(400).json({ error: 'Missing params: subjectId, detailPath' }); return;
  }

  try {
    // Fetch all episode links from Movie-API in one call
    const apiUrl = `${UPSTREAM}/stream/season?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}${resolution ? `&resolution=${resolution}` : ''}`;
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) { res.status(502).json({ error: 'Failed to fetch season links' }); return; }

    const { episodes } = await apiRes.json() as { season: number; episodes: Array<{ ep: number; video: { url: string } }> };
    if (!episodes?.length) { res.status(404).json({ error: 'No episodes found' }); return; }

    const title = (req.query.title as string || `Season_${se}`).replace(/[^a-z0-9]/gi, '_');
    const zipName = `${title}_S${String(se).padStart(2, '0')}_${resolution || 'best'}p.zip`;

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${zipName}"`);
    res.set('Transfer-Encoding', 'chunked');

    const archive = archiver('zip', { store: true }); // store=true: no compression, fast for video
    archive.pipe(res);

    for (const ep of episodes) {
      if (!ep.video?.url) continue;
      const epFilename = `${title}_S${String(se).padStart(2, '0')}E${String(ep.ep).padStart(2, '0')}_${resolution || 'best'}p.mp4`;
      const upstream = await fetch(ep.video.url, { headers: CDN_HEADERS, redirect: 'follow' });
      if (!upstream.ok || !upstream.body) continue;
      archive.append(Readable.fromWeb(upstream.body as any), { name: epFilename });
    }

    await archive.finalize();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: 'Failed to build zip' });
  }
});

router.options("/dl", (_req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.status(204).end();
});

export default router;
