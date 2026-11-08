// Koppelt documenten aan URL's voor de Presentation tool: welk document hoort bij welke pagina,
// en op welke pagina's wordt een document gebruikt ("Used on … pages").
import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation';

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/', filter: `_id == "page-home"` },
    { route: '/contact', filter: `_id == "contact"` },
    { route: '/projecten', filter: `_id == "projecten"` },
    { route: '/projecten/:slug', filter: `_type == "project" && slug.current == $slug` },
    { route: '/:slug', filter: `_type == "page" && slug.current == $slug` },
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
      select: { title: 'title', slug: 'slug.current', id: '_id' },
      resolve: (doc) => {
        if ((doc?.id ?? '').replace(/^drafts\./, '') === 'page-home') return { locations: [{ title: 'Home', href: '/' }] };
        return doc?.slug ? { locations: [{ title: doc.title || doc.slug, href: `/${doc.slug}` }] } : undefined;
      },
    }),
    projectenPagina: defineLocations({
      select: { title: 'title' },
      resolve: () => ({ locations: [{ title: 'Projecten', href: '/projecten' }] }),
    }),
    contact: defineLocations({
      select: { title: 'title' },
      resolve: () => ({ locations: [{ title: 'Contact', href: '/contact' }, { title: 'Home', href: '/' }] }),
    }),
    // Menu en footer staan op elke pagina.
    siteSettings: defineLocations({ message: 'Menu, footer en SEO: op elke pagina', tone: 'positive' }),
  },
};
