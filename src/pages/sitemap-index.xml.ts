// Sitemap. @astrojs/sitemap ziet server-rendered routes niet, dus de projecten komen hier uit Sanity.
// Eén bestand is genoeg (ver onder de 50.000 URL's); de naam blijft gelijk voor robots.txt en zoekmachines.
import type { APIRoute } from 'astro';
import { loadQuery } from '../lib/sanity/load-query';
import { SITEMAP_QUERY } from '../lib/sanity/queries';

// Vaste routes; pagina's (Over, Privacy, …) en projecten komen uit Sanity.
const VAST = ['/', '/projecten', '/contact'];

export const GET: APIRoute = async ({ site }) => {
  type Item = { slug: string; _updatedAt: string };
  const { data } = await loadQuery<{ projecten: Item[]; paginas: Item[] }>({ query: SITEMAP_QUERY });
  const urls = [
    ...VAST.map((pad) => ({ loc: new URL(pad, site).href })),
    ...data.paginas.map((p) => ({ loc: new URL(`/${p.slug}`, site).href, lastmod: p._updatedAt.slice(0, 10) })),
    ...data.projecten.map((p) => ({ loc: new URL(`/projecten/${p.slug}`, site).href, lastmod: p._updatedAt.slice(0, 10) })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
