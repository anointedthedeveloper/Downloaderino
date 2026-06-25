/**
 * Vercel Edge Function — media/subtitle download proxy.
 *
 * Edge Functions stream the response directly with no body size limit,
 * unlike serverless functions which cap at ~4.5 MB.
 *
 * Adds Origin + Referer (forbidden browser headers) server-side so the
 * CDN accepts the request.
 *
 * GET /api/dl?url=<encoded-cdn-url>&filename=<encoded-filename>
 */
export const config = { runtime: 'edge' };

const ALLOWED_DOMAINS = [
  'hakunaymatata.com',
  'bcdnxw.hakunaymatata.com',
  'cacdn.hakunaymatata.com',
  'aoneroom.com',
  'pbcdnw.aoneroom.com',
  'macdn.aoneroom.com',
];

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' },
    });
  }

  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download';

  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'Missing url' }), { status: 400 });
  }

  let target;
  try {
    target = new URL(rawUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid url' }), { status: 400 });
  }

  const isAllowed = ALLOWED_DOMAINS.some(
    (d) => target.hostname === d || target.hostname.endsWith('.' + d)
  );
  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Domain not allowed' }), { status: 403 });
  }

  // Forward Range header for resumable downloads
  const rangeHeader = req.headers.get('range');

  const upstreamHeaders = {
    'Origin': 'https://downloader2.com',
    'Referer': 'https://downloader2.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ...(rangeHeader ? { 'Range': rangeHeader } : {}),
  };

  const upstream = await fetch(target.toString(), {
    headers: upstreamHeaders,
    redirect: 'follow',   // Edge fetch follows redirects natively
  });

  // Build response headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Cache-Control', 'no-store');

  // Forward relevant headers from upstream
  for (const h of ['content-type', 'content-length', 'content-range', 'accept-ranges']) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  // Stream the body directly — no buffering, no size limit
  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
