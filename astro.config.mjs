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
  vite: {
    // Dev: alles wat de Studio (/admin) en de site laden vooraf laten bundelen. Anders ontdekt Vite ze pas
    // onderweg, bundelt opnieuw en verwijzen al geladen Studio-onderdelen naar oude versies:
    // "504 Outdated Optimize Dep", zwart scherm of "Upload mislukt". Bij hardnekkige fouten: astro dev stop,
    // rm -rf node_modules/.vite, opnieuw starten.
    optimizeDeps: {
      include: [
        'sanity',
        'sanity/structure',
        'sanity/presentation',
        '@sanity/locale-nl-nl',
        '@sanity/icons/Cog',
        '@sanity/icons/Documents',
        '@sanity/icons/Projects',
        '@sanity/visual-editing/react',
        'styled-components',
        'react',
        'react-dom',
        'react-dom/client',
        'react-is',
        'react-compiler-runtime',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@orestbida/iframemanager',
        'vanilla-cookieconsent',
        'gsap',
        'lottie-web/build/player/lottie_light',
      ],
    },
  },
});
