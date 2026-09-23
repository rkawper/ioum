import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ioumPwaPlugin(): Plugin {
  return {
    name: 'ioum-pwa-generator',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const assetsDir = path.join(distDir, 'assets');

      const assetFiles: string[] = [];
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        for (const f of files) {
          assetFiles.push(`/assets/${f}`);
        }
      }

      const precacheList = [
        '/',
        '/index.html',
        '/manifest.json',
        '/icon.svg',
        ...assetFiles,
      ];

      const swContent = `// Service Worker for IOUM offline-first standalone application
// Auto-generated during build with bundle precaching
const CACHE_NAME = 'ioum-cache-v${Date.now()}';
const PRECACHE_ASSETS = ${JSON.stringify(precacheList, null, 2)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation requests (HTML page load) -> Network first with cached index.html fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html').then((res) => res || caches.match('/'));
        })
    );
    return;
  }

  // 2. Same-origin assets (JS bundles, CSS, icons, manifest) -> Cache first, network fallback with dynamic caching
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background if online (Stale-While-Revalidate)
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {
              // Silent offline handling
            });
          return cachedResponse;
        }

        // Cache miss -> fetch from network and dynamically store in cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return networkResponse;
          })
          .catch(() => {
            if (event.request.destination === 'image') {
              return caches.match('/icon.svg');
            }
          });
      })
    );
  }
});
`;

      fs.writeFileSync(path.join(distDir, 'sw.js'), swContent, 'utf-8');
      console.log(`[PWA] Generated dist/sw.js with ${precacheList.length} precached assets.`);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), ioumPwaPlugin()],
});
