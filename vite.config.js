import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Custom Vite plugin to proxy YouTube searches on the backend during dev
const ytSearchPlugin = () => ({
  name: 'yt-search-proxy',
  configureServer(server) {
    server.middlewares.use('/api/yt-search', async (req, res, next) => {
      try {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const q = urlObj.searchParams.get('q');
        if (!q) {
          res.statusCode = 400;
          return res.end('Missing query');
        }
        
        const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
        // Use native fetch in Node 18+
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
          }
        });
        
        const html = await response.text();
        const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        
        res.setHeader('Content-Type', 'application/json');
        if (match) {
          res.end(JSON.stringify({ videoId: match[1] }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Video not found' }));
        }
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
      }
    });

    server.middlewares.use('/api/itunes-charts', async (req, res, next) => {
      try {
        const urlObj = new URL(req.url, `http://${req.headers.host}`);
        const limit = urlObj.searchParams.get('limit') || 30;
        const country = urlObj.searchParams.get('country') || 'us';
        const genre = urlObj.searchParams.get('genre');

        let targetUrl = `https://itunes.apple.com/${country}/rss/topsongs/limit=${limit}`;
        if (genre) targetUrl += `/genre=${genre}`;
        targetUrl += '/json';

        const response = await fetch(targetUrl);
        const data = await response.json();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(data));
      } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ytSearchPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false, // Changed so it doesn't pop up a new tab every time dev server restarts
  },
})
