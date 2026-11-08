// /llms.txt (llmstxt.org, standards/SEO.md §6): wie LAGADO is en een index van de pagina's,
// zodat AI-assistenten snel de juiste pagina vinden. Intro uit de site-instellingen (tab SEO).
// Nieuwe vaste route? Ook toevoegen aan VAST hieronder en in sitemap-index.xml.ts.
import { stegaClean } from '@sanity/client/stega';
import type { APIRoute } from 'astro';
import { getContact, getSettings } from '../lib/content';
import { loadQuery } from '../lib/sanity/load-query';
import { LLMS_QUERY } from '../lib/sanity/queries';

type Item = { title: string; slug: string; beschrijving?: string | null };

// slug = ID van het Sanity-document (voor "Verbergen voor zoekmachines").
const VAST: Item[] = [
  { title: 'Projecten', slug: 'projecten', beschrijving: 'Overzicht van alle projecten, te filteren.' },
  { title: 'Contact', slug: 'contact', beschrijving: 'Adres, e-mail en telefoon.' },
];

const regel = (tekst?: string | null) => (tekst ?? '').replace(/\s+/g, ' ').trim();

export const GET: APIRoute = async ({ site }) => {
  const [settings, contact, { data }] = await Promise.all([
    getSettings(),
    getContact(),
    loadQuery<{ vastVerborgen: string[]; paginas: Item[]; projecten: Item[] }>({ query: LLMS_QUERY }),
  ]);

  const link = (pad: string, i: Item) => {
    const uitleg = regel(i.beschrijving);
    return `- [${regel(i.title)}](${new URL(pad, site).href})${uitleg ? `: ${uitleg}` : ''}`;
  };

  const adres = [contact.adres.straat, contact.adres.postcode, contact.adres.plaats].filter(Boolean).join(', ');
  const contactRegels = [
    contact.email && `E-mail: ${contact.email}`,
    contact.telefoon && `Telefoon: ${contact.telefoon}`,
    adres && `Adres: ${adres}`,
  ].filter(Boolean);

  const body = [
    `# ${regel(settings.siteNaam)}`,
    '',
    `> ${regel(settings.payoff)}`,
    '',
    regel(settings.seo.llmsIntro || settings.seo.beschrijving),
    ...(contactRegels.length ? ['', ...contactRegels] : []),
    '',
    "## Pagina's",
    '',
    ...VAST.filter((i) => !data.vastVerborgen.includes(i.slug)).map((i) => link(`/${i.slug}`, i)),
    ...data.paginas.map((i) => link(`/${i.slug}`, i)),
    ...(data.projecten.length ? ['', '## Projecten', '', ...data.projecten.map((i) => link(`/projecten/${i.slug}`, i))] : []),
    '',
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return new Response(stegaClean(body), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
