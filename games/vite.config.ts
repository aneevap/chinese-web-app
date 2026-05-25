import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import type { Connect } from 'vite';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function rootAssetsPlugin() {
  return {
    name: 'root-assets',
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url = req.url || '';
        // Serve JSON data files from the repo root
        if (/^\/(courses\.json|characters_.*\.json)(\?.*)?$/.test(url)) {
          const filePath = path.join(rootDir, path.basename(url.split('?')[0]));
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json');
            res.end(fs.readFileSync(filePath, 'utf-8'));
            return;
          }
        }
        // Serve image files from the repo-root /images/ directory
        if (/^\/images\//.test(url)) {
          const relPath = url.split('?')[0].replace(/^\//, '');
          const filePath = path.join(rootDir, relPath);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath).toLowerCase();
            const mime: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.webp': 'image/webp',
            };
            res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(fs.readFileSync(filePath));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), rootAssetsPlugin()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/game.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
