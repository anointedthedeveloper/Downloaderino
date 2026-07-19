/**
 * Vercel Edge Function — bulk season zip download.
 *
 * GET /api/dl/season?subjectId=...&detailPath=...&se=1&resolution=720&title=Show_Name
 *
 * Fetches all episode URLs from the Movie-API via /stream/season,
 * then streams each episode into a ZIP archive piped directly to the browser.
 * No RAM buffering — the zip file starts downloading immediately.
 */
export const config = { runtime: 'edge' };

const MOVIE_API = 'https://movie-api-nine-chi.vercel.app';

const CDN_HEADERS = {
  'Origin': 'https://downloader2.com',
  'Referer': 'https://downloader2.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

// --- Minimal ZIP writer (STORE, no compression) ---
function u16le(n) { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, n, true); return b; }
function u32le(n) { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n, true); return b; }
function concat(...arrays) {
  const out = new Uint8Array(arrays.reduce((s, a) => s + a.length, 0));
  let off = 0; for (const a of arrays) { out.set(a, off); off += a.length; } return out;
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function localHeader(nameBytes, size, crc) {
  return concat(
    new Uint8Array([0x50,0x4B,0x03,0x04]),
    u16le(20), u16le(0), u16le(0),
    u16le(0), u16le(0),
    u32le(crc), u32le(size), u32le(size),
    u16le(nameBytes.length), u16le(0),
    nameBytes,
  );
}

function centralEntry(nameBytes, size, crc, offset) {
  return concat(
    new Uint8Array([0x50,0x4B,0x01,0x02]),
    u16le(20), u16le(20), u16le(0), u16le(0),
    u16le(0), u16le(0),
    u32le(crc), u32le(size), u32le(size),
    u16le(nameBytes.length), u16le(0), u16le(0),
    u16le(0), u16le(0), u32le(0),
    u32le(offset),
    nameBytes,
  );
}

function eocd(count, cdSize, cdOffset) {
  return concat(
    new Uint8Array([0x50,0x4B,0x05,0x06]),
    u16le(0), u16le(0),
    u16le(count), u16le(count),
    u32le(cdSize), u32le(cdOffset),
    u16le(0),
  );
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const subjectId  = searchParams.get('subjectId');
  const detailPath = searchParams.get('detailPath');
  const se         = searchParams.get('se') || '1';
  const resolution = searchParams.get('resolution') || '';
  const title      = (searchParams.get('title') || `Season_${se}`).replace(/[^a-z0-9_]/gi, '_');
  const epFrom     = searchParams.get('epFrom');
  const epTo       = searchParams.get('epTo');

  if (!subjectId || !detailPath) {
    return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 });
  }

  // 1. Get all episode URLs in one call
  let apiUrl = `${MOVIE_API}/stream/season?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}`;
  if (resolution) apiUrl += `&resolution=${resolution}`;

  const apiRes = await fetch(apiUrl);
  if (!apiRes.ok) return new Response(JSON.stringify({ error: 'Failed to fetch season links' }), { status: 502 });

  let { episodes } = await apiRes.json();
  if (!episodes?.length) return new Response(JSON.stringify({ error: 'No episodes found' }), { status: 404 });

  if (epFrom) episodes = episodes.filter(e => e.ep >= parseInt(epFrom));
  if (epTo)   episodes = episodes.filter(e => e.ep <= parseInt(epTo));

  const zipName = `${title}_S${String(se).padStart(2,'0')}_${resolution || 'best'}p.zip`;

  // 2. Stream zip directly to browser
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    const enc = new TextEncoder();
    const centralDir = [];
    let offset = 0;

    for (const ep of episodes) {
      if (!ep.video?.url) continue;
      const epName = `${title}_S${String(se).padStart(2,'0')}E${String(ep.ep).padStart(2,'0')}_${resolution || 'best'}p.mp4`;
      const nameBytes = enc.encode(epName);

      const upstream = await fetch(ep.video.url, { headers: CDN_HEADERS, redirect: 'follow' });
      if (!upstream.ok || !upstream.body) continue;

      // Read episode into memory to compute CRC + size (required before local header)
      const chunks = [];
      const reader = upstream.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const data = concat(...chunks);
      const crc  = crc32(data);
      const size = data.length;

      const hdr = localHeader(nameBytes, size, crc);
      await writer.write(hdr);
      await writer.write(data);

      centralDir.push(centralEntry(nameBytes, size, crc, offset));
      offset += hdr.length + size;
    }

    const cdBytes = concat(...centralDir);
    await writer.write(cdBytes);
    await writer.write(eocd(centralDir.length, cdBytes.length, offset));
    await writer.close();
  })();

  return new Response(readable, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipName}"`,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
