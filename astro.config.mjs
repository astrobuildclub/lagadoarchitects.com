// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://lagadoarchitects.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
});
