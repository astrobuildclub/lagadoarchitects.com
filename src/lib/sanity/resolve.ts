// Koppelt documenten aan URL's voor de Presentation tool: welk document hoort bij welke pagina,
// en op welke pagina's wordt een document gebruikt ("Used on … pages").
import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

const PAGINAS = {
  'page-home': { title: 'Home', href: '/' },
  'page-bureau': { title: 'Over', href: '/over' },
  'page-privacy': { title: 'Privacy', href: '/privacy' },
  contact: { title: 'Contact', href: '/contact' },
} as const;

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/', filter: `_id == "page-home"` },
    { route: '/over', filter: `_id == "page-bureau"` },
    { route: '/privacy', filter: `_id == "page-privacy"` },
    { route: '/contact', filter: `_id == "contact"` },
    { route: '/projecten/:slug', filter: `_type == "project" && slug.current == $slug` },
  ]),
  locations: {
    project: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || 'Project', href: `/projecten/${doc?.slug}` },
          { title: 'Projecten', href: '/projecten' },
          { title: 'Home', href: '/' },
        ],
      }),
    }),
    page: defineLocations({
      select: { id: '_id' },
      resolve: (doc) => {
        const pagina = PAGINAS[(doc?.id ?? '').replace(/^drafts\./, '') as keyof typeof PAGINAS];
        return pagina ? { locations: [pagina] } : undefined;
      },
    }),
    contact: defineLocations({
      select: { title: 'title' },
      resolve: () => ({ locations: [PAGINAS.contact, { title: 'Home', href: '/' }] }),
    }),
    // Site-brede documenten staan op elke pagina.
    siteSettings: defineLocations({ message: 'Op elke pagina', tone: 'positive' }),
    navigatie: defineLocations({ message: 'Header en footer, op elke pagina', tone: 'positive' }),
  },
};
