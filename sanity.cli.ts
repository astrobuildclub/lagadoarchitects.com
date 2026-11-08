// Voor de Sanity CLI (npx sanity …): schema controleren, datasets, tokens.
import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  },
});
