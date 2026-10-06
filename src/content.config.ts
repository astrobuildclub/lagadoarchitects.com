// Content collections. Bron: lagado-content/ (frontmatter-only .md-bestanden).
// Schema's staan in src/lib/schema.ts; lees data alleen via src/lib/content.ts.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { contactSchema, pageSchema, projectSchema, settingsSchema } from './lib/schema';

const base = './lagado-content';

export const collections = {
  settings: defineCollection({ loader: glob({ pattern: 'site.md', base }), schema: settingsSchema }),
  pages: defineCollection({ loader: glob({ pattern: ['home.md', 'bureau.md', 'privacy.md'], base }), schema: pageSchema }),
  contact: defineCollection({ loader: glob({ pattern: 'contact.md', base }), schema: contactSchema }),
  // Bestanden die met _ beginnen (sjablonen) worden overgeslagen.
  projecten: defineCollection({ loader: glob({ pattern: ['*.md', '!_*.md'], base: `${base}/projecten` }), schema: projectSchema }),
};
