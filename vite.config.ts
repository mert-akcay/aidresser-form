import { defineConfig } from "vite";
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Provide a simple development-time proxy for fetching M3U playlists
  // This runs only in the dev server and helps avoid browser CORS errors
  configureServer(server: ViteDevServer) {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
      try {
        if (!req.url || !req.url.startsWith('/m3u-proxy')) return next();

        // Support preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end();
          return;
        }

        const base = `http://${req.headers.host}`;
        const parsed = new URL(req.url, base);
        const target = parsed.searchParams.get('url');

        if (!target) {
          res.statusCode = 400;
          res.end('Missing url query parameter');
          return;
        }

        // Fetch the remote resource from the dev server (server-side) to avoid browser CORS
        console.log('[dev m3u-proxy] fetching', target);

        // Build headers for upstream fetch by copying most client headers but prefer a safe Host
        const upstreamHeaders: Record<string, string> = {};
        for (const [k, v] of Object.entries(req.headers || {})) {
          if (!v) continue;
          // skip host header to avoid upstream host mismatches
          if (k.toLowerCase() === 'host') continue;
          // convert header values to string
          upstreamHeaders[k] = Array.isArray(v) ? v.join(',') : String(v);
        }

        // Fetch upstream with forwarded headers (supports Range, Cookies, Authorization, etc.)
        // Use an AbortController to avoid hanging forever if the upstream server is slow/unreachable.
        const controller = new AbortController();
        const FETCH_TIMEOUT_MS = 15000; // 15s
        const timeout = setTimeout(() => {
          try { controller.abort(); } catch (e) { console.debug('abort failed', e); }
        }, FETCH_TIMEOUT_MS);

        let upstream;
        try {
          upstream = await fetch(target, { method: 'GET', headers: upstreamHeaders, signal: controller.signal });
        } catch (fetchErr: unknown) {
          clearTimeout(timeout);
          const errName = ((): string => {
            if (!fetchErr || typeof fetchErr !== 'object') return String(fetchErr);
            const obj = fetchErr as Record<string, unknown>;
            if ('name' in obj && typeof obj.name === 'string') return obj.name;
            return String(fetchErr);
          })();
          console.error('[dev m3u-proxy] upstream fetch failed or timed out', errName);
          res.statusCode = errName === 'AbortError' ? 504 : 502;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Credentials', 'true');
          res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');
          res.end(errName === 'AbortError' ? 'Upstream timed out' : 'Proxy fetch error');
          return;
        }
        clearTimeout(timeout);

        const contentType = (upstream.headers.get('content-type') || 'application/octet-stream').toLowerCase();
        const isM3u8 = contentType.includes('mpegurl') || target.split('?')[0].endsWith('.m3u8');

        res.statusCode = upstream.status;
        // Mirror important headers to help the browser and player
        const mirror = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'etag'];
        for (const h of mirror) {
          const val = upstream.headers.get(h);
          if (val) res.setHeader(h, val);
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('X-Proxied-From', target);

        if (isM3u8) {
          const text = await upstream.text();
          // Rewrite URL lines (non-comment lines) to use the proxy so subsequent segment/key requests also go through this middleware
          const lines = text.split(/\r?\n/);
          const rewritten = lines
            .map((line) => {
              if (!line || line.startsWith('#')) return line;
              try {
                const abs = new URL(line, target).toString();
                return `/m3u-proxy?url=${encodeURIComponent(abs)}`;
              } catch (e) {
                return line;
              }
            })
            .join('\n');
          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
          res.end(rewritten);
          return;
        }

        // If upstream provides a streaming body, pipe it directly to the client to preserve Range and streaming semantics
  type ResponseWithBody = { body?: NodeJS.ReadableStream } & Response;
  const body = (upstream as unknown as ResponseWithBody).body;
        if (body && typeof body.pipe === 'function') {
          // Node stream: pipe to response
          try {
            body.pipe(res);
            return;
          } catch (pipeErr) {
            console.debug('pipe failed, falling back to buffer', pipeErr);
          }
        }

        // Fallback: buffer the response and send
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
        res.end(buf);
      } catch (err) {
        console.error('[dev m3u-proxy] error', err);
        res.statusCode = 502;
        res.end('Proxy error');
      }
    });
  }
}));
