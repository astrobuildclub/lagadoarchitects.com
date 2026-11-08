// @ts-check
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
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
  // Statisch tot de datalaag op Sanity draait (fase 4); de Studio op /admin rendert in de browser.
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
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/admin') }),
  ],
});
