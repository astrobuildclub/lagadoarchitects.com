// Sanity Studio, ingebouwd in de site op /admin (@sanity/astro).
// Presentation tool: de site met drafts en klikbare overlays (standards/SANITY.md §3).
import { nlNLLocale } from '@sanity/locale-nl-nl';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { ProjectsIcon } from '@sanity/icons/Projects';
import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { resolve } from './src/lib/sanity/resolve';
import { SINGLETONS, schemaTypes } from './schema';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'unque637';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

// In de Studio op /admin is de site dezelfde origin; lokaal (sanity CLI) valt hij terug op de dev-server.
const previewOrigin = typeof location !== 'undefined' ? location.origin : 'http://localhost:4321';

const singletonIds = new Set(Object.keys(SINGLETONS));
/** Types die alleen als singleton bestaan: geen "nieuw document" in de Studio. Pagina's kun je wel aanmaken. */
const singletonTypes = new Set(['siteSettings', 'contact']);
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  name: 'lagado',
  title: 'LAGADO architects',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.documentTypeListItem('project')
              .title('Projecten')
              .icon(ProjectsIcon)
              .child(S.documentTypeList('project').title('Projecten').defaultOrdering([{ field: 'volgorde', direction: 'asc' }])),
            // Alle pagina's in één lijst: Home, Contact, Over, Privacy en wat je zelf toevoegt.
            // Home en Contact kun je niet verwijderen of dupliceren (vaste ID's, zie SINGLETONS).
            S.listItem()
              .title("Pagina's")
              .id('paginas')
              .icon(DocumentsIcon)
              .child(
                S.documentList()
                  .title("Pagina's")
                  .apiVersion('2025-01-01')
                  .filter('_type in ["page", "contact"]')
                  .defaultOrdering([{ field: 'title', direction: 'asc' }])
                  .initialValueTemplates([S.initialValueTemplateItem('page')])
                  .canHandleIntent((intent, { type }) => ['create', 'edit'].includes(intent) && ['page', 'contact'].includes(type)),
              ),
            S.divider(),
            S.listItem()
              .title(SINGLETONS.siteSettings.title)
              .id('siteSettings')
              .icon(CogIcon)
              .child(S.document().schemaType('siteSettings').documentId('siteSettings').title(SINGLETONS.siteSettings.title)),
          ]),
    }),
    presentationTool({
      resolve,
      previewUrl: { initial: previewOrigin, previewMode: { enable: '/api/preview', disable: '/api/preview/disable' } },
    }),
    nlNLLocale(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      singletonIds.has(context.documentId ?? '') ? input.filter(({ action }) => action && singletonActions.has(action)) : input,
  },
});
