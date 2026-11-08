// @ts-check
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

// .env is in astro.config nog niet via import.meta.env beschikbaar.
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://lagadoarchitects.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  // Server-rendered: content komt per request uit Sanity (achter Netlify's CDN-cache, zie middleware.ts),
  // zodat publicaties zonder build online staan en Visual Editing drafts kan tonen.
  output: 'server',
  adapter: netlify(),
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID || 'unque637',
      dataset: PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2025-01-01',
      useCdn: false,
      studioBasePath: '/admin',
      stega: { studioUrl: '/admin' },
    }),
    react(),
  ],
});
