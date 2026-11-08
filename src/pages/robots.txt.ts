// robots.txt (standards/SEO.md §5). Server-rendered: de AI-instellingen en verborgen pagina's komen uit Sanity.
// - Trainingscrawlers: weg als "AI-modellen mogen de content gebruiken voor training" uit staat.
// - AI-zoekcrawlers (de site verschijnt met bronlink in AI-antwoorden): alleen weg als "Vindbaar in AI-zoekmachines" uit staat.
// - Pagina's met "Verbergen voor zoekmachines": per AI-crawler uitgesloten. Google leest de noindex-tag zelf,
//   en mag de pagina daarom níét geblokkeerd krijgen (anders ziet hij de noindex nooit).
// Een crawler met een eigen groep negeert de *-groep: de AI-groep herhaalt daarom /admin en /api/.
// Namen van crawlers veranderen: lijsten eens per halfjaar nalopen.
import type { APIRoute } from 'astro';
import { getSettings } from '../lib/content';
import { loadQuery } from '../lib/sanity/load-query';
import { VERBORGEN_QUERY } from '../lib/sanity/queries';

const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'];
const ZOEK_BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];

const ALTIJD_DICHT = ['/admin', '/api/'];

type Verborgen = { _id: string; _type: string; slug?: string };

/** Zelfde URL's als de routes in src/pages/. `$` = precies dit pad (niet /over-ons bij /over). */
function pad(d: Verborgen): string | undefined {
  const id = d._id.replace(/^drafts\./, '');
  if (id === 'page-home') return '/$';
  if (d._type === 'projectenPagina') return '/projecten$';
  if (d._type === 'contact') return '/contact$';
  if (!d.slug) return undefined;
  return d._type === 'project' ? `/projecten/${d.slug}$` : `/${d.slug}$`;
}

export const GET: APIRoute = async ({ site }) => {
  const [settings, { data }] = await Promise.all([getSettings(), loadQuery<Verborgen[]>({ query: VERBORGEN_QUERY })]);
  const { aiTraining, aiZoeken } = settings.seo;
  const verborgen = [...new Set(data.map(pad).filter((p): p is string => !!p))].sort();

  // Meerdere User-agent-regels boven één set regels is één groep (RFC 9309): crawlers met dezelfde regels samen.
  const groep = (bots: string[], dicht: string[]) => ['', ...bots.map((b) => `User-agent: ${b}`), ...dicht.map((p) => `Disallow: ${p}`)];
  const lines = ['User-agent: *', 'Allow: /', ...ALTIJD_DICHT.map((p) => `Disallow: ${p}`)];

  const helemaalDicht = [...(!aiTraining || !aiZoeken ? TRAINING_BOTS : []), ...(!aiZoeken ? ZOEK_BOTS : [])];
  const deelsDicht = [...TRAINING_BOTS, ...ZOEK_BOTS].filter((b) => !helemaalDicht.includes(b));

  if (helemaalDicht.length) lines.push(...groep(helemaalDicht, ['/']));
  if (deelsDicht.length && verborgen.length) lines.push(...groep(deelsDicht, [...ALTIJD_DICHT, ...verborgen]));

  lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
