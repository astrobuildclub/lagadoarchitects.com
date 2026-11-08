// Thumbnail van een YouTube- of Vimeo-video, via onze eigen server (AVG).
// De browser van de bezoeker praat zo vóór toestemming niet met YouTube of Vimeo: alleen deze
// server haalt het beeld op. Netlify's CDN bewaart het daarna een week.
// Een eigen posterbeeld in de Studio (videoblok → Posterbeeld) gaat altijd voor.
import type { APIRoute } from 'astro';

const ID = { youtube: /^[\w-]{11}$/, vimeo: /^\d{1,12}$/ } as const;
type Dienst = keyof typeof ID;

async function youtube(id: string): Promise<Response | undefined> {
  // maxresdefault (1280×720) bestaat niet voor elke video; hqdefault (480×360) wel.
  for (const naam of ['maxresdefault', 'hqdefault']) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${naam}.jpg`);
    if (res.ok) return res;
  }
  return undefined;
}

async function vimeo(id: string): Promise<Response | undefined> {
  const meta = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=1280`);
  if (!meta.ok) return undefined;
  const { thumbnail_url } = (await meta.json()) as { thumbnail_url?: string };
  // Alleen beelden van Vimeo's eigen CDN doorgeven.
  if (!thumbnail_url || !new URL(thumbnail_url).hostname.endsWith('vimeocdn.com')) return undefined;
  const res = await fetch(thumbnail_url);
  return res.ok ? res : undefined;
}

export const GET: APIRoute = async ({ params }) => {
  const dienst = params.service as Dienst;
  const id = params.id ?? '';
  if (!(dienst in ID) || !ID[dienst].test(id)) return new Response('Onbekende video', { status: 404 });

  const bron = await (dienst === 'youtube' ? youtube(id) : vimeo(id)).catch(() => undefined);
  const type = bron?.headers.get('content-type') ?? '';
  if (!bron || !type.startsWith('image/')) return new Response('Geen thumbnail', { status: 404 });

  return new Response(bron.body, {
    headers: {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=86400',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=604800, stale-while-revalidate=2592000',
    },
  });
};
