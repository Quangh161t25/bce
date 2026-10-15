import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';
import url from 'url';

function bingProxyPlugin() {
  return {
    name: 'bing-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/bing-images', async (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const q = parsedUrl.query.q || '';
        if (!q) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ items: [] }));
        }
        try {
          const bingUrl = 'https://www.bing.com/images/search?q=' + encodeURIComponent(q);
          const response = await fetch(bingUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
            }
          });
          const html = await response.text();
          const murlRegex = /murl&quot;:&quot;(https?:[^&]+)&quot;/g;
          const t1Regex = /t1&quot;:&quot;([^&]+)&quot;/g;
          const murls = [...html.matchAll(murlRegex)].map(m => m[1]);
          const titles = [...html.matchAll(t1Regex)].map(m => m[1]);
          const items = murls.map((u, i) => ({
            link: u.replace(/\\/g, ''),
            title: titles[i] || q
          }));
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ items }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message, items: [] }));
        }
      });
    }
  };
}

const isSingleFile = process.env.SINGLE_FILE === 'true';

// Nguồn web nằm trong web/, build ra dist/ (extension mở dist/index.html)
export default defineConfig({
  root: path.resolve(__dirname, 'web'),
  base: './',
  plugins: [
    react(),
    isSingleFile ? viteSingleFile() : null,
    bingProxyPlugin()
  ].filter(Boolean),
  css: {
    postcss: {
      plugins: []
    }
  },
  build: {
    outDir: path.resolve(__dirname, isSingleFile ? 'dist-standalone' : 'dist'),
    emptyOutDir: true,
    target: 'esnext',
    assetsInlineLimit: isSingleFile ? 100000000 : 4096,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'web/index.html'),
      output: {
        // Tên file cố định để mỗi lần build không sinh file mới trong git
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    // Cho phép web import shared/google-config.js nằm ngoài thư mục web/
    fs: { allow: [path.resolve(__dirname)] }
  }
});
