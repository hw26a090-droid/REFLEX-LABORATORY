import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';
import fs from 'fs';

const copyToStandalone = () => ({
  name: 'copy-to-standalone',
  closeBundle() {
    try {
      const distDir = path.resolve(__dirname, 'dist');
      const publicDir = path.resolve(__dirname, 'public');
      const srcPath = path.join(distDir, 'index.html');
      
      // Ensure directories exist
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      if (fs.existsSync(srcPath)) {
        // Copy to dist/reflex-test-standalone.html
        const destPathDist = path.join(distDir, 'reflex-test-standalone.html');
        fs.copyFileSync(srcPath, destPathDist);
        console.log('Successfully copied to dist/reflex-test-standalone.html');

        // Copy to public/reflex-test-standalone.html so the dev server can serve it directly without dev-scripts
        const destPathPublic = path.join(publicDir, 'reflex-test-standalone.html');
        fs.copyFileSync(srcPath, destPathPublic);
        console.log('Successfully copied to public/reflex-test-standalone.html');
      }
    } catch (err) {
      console.error('Error copying standalone file:', err);
    }
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
