// robots.txt (standards/SEO.md §5). Server-rendered: de AI-trainingsinstelling komt uit Sanity.
// Zoek- en ophaalcrawlers (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot …) nooit blokkeren:
// die zorgen dat de site in AI-antwoorden verschijnt. Lijst met trainingsbots eens per halfjaar nalopen.
import type { APIRoute } from 'astro';
import { getSettings } from '../lib/content';

const TRAINING_BOTS = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent'];

export const GET: APIRoute = async ({ site }) => {
  const settings = await getSettings();

  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/'];

  // Een crawler met een eigen groep negeert de *-groep, dus dit raakt de rest niet.
  if (!settings.seo.aiTraining) {
    for (const bot of TRAINING_BOTS) lines.push('', `User-agent: ${bot}`, 'Disallow: /');
  }

  lines.push('', `Sitemap: ${new URL('sitemap-index.xml', site).href}`);

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
