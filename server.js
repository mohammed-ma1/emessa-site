/* eslint-disable no-console */
const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = Number.parseInt(process.env.PORT || '', 10) || 3000;
const HOST = '0.0.0.0';

const projectDist = path.join(__dirname, 'dist', 'emessa-site');
const distCandidates = [path.join(projectDist, 'browser'), projectDist];
const distDir = distCandidates.find((p) => fs.existsSync(p) && fs.statSync(p).isDirectory());

if (!distDir) {
  const msg = 'Build output not found. Run `npm run build` (creates `dist/emessa-site/`).';
  console.error(msg);
  process.exit(1);
}

const indexPath = path.join(distDir, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  if (body && res.req.method !== 'HEAD') res.end(body);
  else res.end();
}

function safeJoin(root, requestPathname) {
  const decoded = decodeURIComponent(requestPathname);
  const withoutQuery = decoded.split('?')[0];
  const normalized = path.posix.normalize(withoutQuery);
  const stripped = normalized.replace(/^(\.\.(\/|\\|$))+/, '');
  const joined = path.join(root, stripped);

  const resolvedRoot = path.resolve(root) + path.sep;
  const resolvedJoined = path.resolve(joined);
  if (!resolvedJoined.startsWith(resolvedRoot)) return null;

  return joined;
}

async function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const body = await fsp.readFile(filePath);

  const base = path.basename(filePath);
  const isHashedAsset = /\.[a-f0-9]{8,}\./i.test(base);
  const cacheControl =
    ext === '.html'
      ? 'no-cache'
      : isHashedAsset
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=3600';

  send(
    res,
    200,
    {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
    },
    body,
  );
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      return send(res, 400, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Bad Request');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, { Allow: 'GET, HEAD' }, '');
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
    const candidate = safeJoin(distDir, pathname);

    if (candidate) {
      try {
        const stat = await fsp.stat(candidate);
        if (stat.isFile()) return await serveFile(candidate, res);
      } catch {
        // fall through to SPA fallback
      }
    }

    // SPA fallback (Angular Router)
    return await serveFile(indexPath, res);
  } catch (err) {
    console.error(err);
    return send(
      res,
      500,
      { 'Content-Type': 'text/plain; charset=utf-8' },
      'Internal Server Error',
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${distDir} on http://${HOST}:${PORT}`);
});

