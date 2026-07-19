import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';
import fs from 'fs';
import { execSync } from 'child_process';

const copyToStandalone = () => ({
  name: 'copy-to-standalone',
  closeBundle() {
    try {
      const distDir = path.resolve(__dirname, 'dist');
      const srcPath = path.join(distDir, 'index.html');

      if (fs.existsSync(srcPath)) {
        // Copy to dist/reflex-test-standalone.html
        const destPathDist = path.join(distDir, 'reflex-test-standalone.html');
        fs.copyFileSync(srcPath, destPathDist);
        console.log('Successfully copied to dist/reflex-test-standalone.html');
      }
    } catch (err) {
      console.error('Error copying standalone file:', err);
    }
  }
});

const serveStandaloneInDev = () => ({
  name: 'serve-standalone-in-dev',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = req.url ? req.url.split('?')[0] : '';
      if (pathname === '/reflex-test-standalone.html') {
        console.log('[Dev Server] Dynamic build requested for reflex-test-standalone.html');
        try {
          // Run the build synchronously to generate the latest standalone file in dist/
          execSync('npm run build', { stdio: 'inherit' });
          
          const filePath = path.resolve(__dirname, 'dist', 'reflex-test-standalone.html');
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="reflex-test-standalone.html"');
            res.statusCode = 200;
            res.end(content);
            return;
          }
        } catch (err) {
          console.error('[Dev Server] Error building standalone file:', err);
          res.statusCode = 500;
          res.end('Error building standalone file: ' + err.message);
          return;
        }
      }
      next();
    });
  }
});

export default defineConfig(() => {
  return {
    base: process.env.GITHUB_ACTIONS ? '/REFLEX-LABORATORY/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile(),
      copyToStandalone(),
      serveStandaloneInDev(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
