// Sanity Studio, ingebouwd in de site op /admin (@sanity/astro).
// Presentation tool (Visual Editing) volgt in fase 4, samen met /api/preview (zie docs/sanity-plan.md).
import { nlNLLocale } from '@sanity/locale-nl-nl';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentIcon } from '@sanity/icons/Document';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { MenuIcon } from '@sanity/icons/Menu';
import { ProjectsIcon } from '@sanity/icons/Projects';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { SINGLETONS, schemaTypes } from './schema';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'unque637';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

const singletonIds = new Set(Object.keys(SINGLETONS));
/** Types die alleen als singleton bestaan: geen "nieuw document" in de Studio. */
const singletonTypes = new Set(['siteSettings', 'navigatie', 'page', 'contact']);
const singletonActions = new Set(['publish', 'discardChanges', 'restore']);

const icons: Record<string, typeof CogIcon> = {
  siteSettings: CogIcon,
  navigatie: MenuIcon,
  contact: EnvelopeIcon,
};

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
            S.divider(),
            ...(['page.home', 'page.bureau', 'page.privacy', 'contact'] as const).map((id) =>
              S.listItem()
                .title(SINGLETONS[id].title)
                .id(id)
                .icon(icons[id] ?? DocumentIcon)
                .child(S.document().schemaType(SINGLETONS[id].type).documentId(id).title(SINGLETONS[id].title)),
            ),
            S.divider(),
            ...(['navigatie', 'siteSettings'] as const).map((id) =>
              S.listItem()
                .title(SINGLETONS[id].title)
                .id(id)
                .icon(icons[id])
                .child(S.document().schemaType(SINGLETONS[id].type).documentId(id).title(SINGLETONS[id].title)),
            ),
          ]),
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
