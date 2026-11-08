// Video-URL's herkennen en de verhouding bepalen (server-side, voor het videoblok).
// iframemanager kent een vaste set verhoudingen (data-ratio); we kiezen de dichtstbijzijnde.

export type Dienst = 'youtube' | 'vimeo';
export type Video = { service: Dienst; id: string; short: boolean };

export function parseVideoUrl(url: string): Video | undefined {
  const yt = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { service: 'youtube', id: yt[1], short: /youtube\.com\/shorts\//.test(url) };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { service: 'vimeo', id: vimeo[1], short: false };
  return undefined;
}

/** Verhoudingen die iframemanager.css ondersteunt. */
const RATIOS = ['1:1', '2:1', '3:2', '5:2', '4:3', '16:9', '16:10', '20:9', '21:9', '9:16', '9:20'] as const;
export type Ratio = (typeof RATIOS)[number];

function dichtstbij(breedte: number, hoogte: number): Ratio {
  const doel = Math.log(breedte / hoogte);
  const waarde = (r: string) => {
    const [b, h] = r.split(':').map(Number);
    return Math.log(b / h);
  };
  return RATIOS.reduce((best, r) => (Math.abs(waarde(r) - doel) < Math.abs(waarde(best) - doel) ? r : best), '16:9' as Ratio);
}

// Per serverinstantie onthouden: oEmbed hoeft niet bij elk request opnieuw.
const cache = new Map<string, Ratio>();

/** Vimeo's oEmbed geeft de echte afmetingen. Mislukt het, dan 16:9. */
async function vimeoRatio(id: string): Promise<Ratio> {
  const hit = cache.get(id);
  if (hit) return hit;
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return '16:9';
    const { width, height } = (await res.json()) as { width?: number; height?: number };
    const ratio = width && height ? dichtstbij(width, height) : '16:9';
    cache.set(id, ratio);
    return ratio;
  } catch {
    return '16:9';
  }
}

/**
 * Verhouding voor de embed. Handmatig gekozen in de Studio gaat voor.
 * YouTube's oEmbed geeft vrijwel altijd 16:9 (ook bij staande video's), dus daar alleen Shorts herkennen.
 */
export async function videoRatio(video: Video, keuze: string): Promise<Ratio> {
  if (keuze !== 'auto') return keuze as Ratio;
  if (video.service === 'vimeo') return vimeoRatio(video.id);
  return video.short ? '9:16' : '16:9';
}

/** Staande of vierkante video: niet over de volle breedte, anders wordt hij hoger dan het scherm. */
export const isStaand = (ratio: Ratio) => {
  const [b, h] = ratio.split(':').map(Number);
  return b / h <= 1;
};
