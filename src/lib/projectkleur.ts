// Kaartkleur van een project: `accentkleur` als die is ingevuld, anders de bepalende kleur van het
// hero-beeld (sharp, op een thumbnail van 48×48 uit de Sanity-CDN). De tekstkleur (wit of zwart) volgt
// uit het contrast (WCAG 1.4.3).
import sharp from 'sharp';
import { urlFor } from './sanity/image';
import { hexToOklch } from './color';
import type { Project, SanityImage } from './schema';

export interface Kaartkleur {
  /** Vlakkleur als oklch(). */
  vlak: string;
  /** Tekst op het vlak: de kleur met het meeste contrast. */
  tekst: string;
}

type Rgb = [number, number, number];

const WIT = 'oklch(99% 0 0)';
const ZWART = 'oklch(18% 0 0)';
const cache = new Map<string, Rgb>();
/** Als de thumbnail niet laadt: neutraal, zodat de pagina nooit op een kaartkleur breekt. */
const GRIJS: Rgb = [128, 128, 128];

const toHex = (rgb: Rgb) => `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`;

function fromHex(hex: string | undefined): Rgb | undefined {
  const m = hex?.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return undefined;
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

/** Relatieve luminantie volgens WCAG 2.x. */
function luminance([r, g, b]: Rgb) {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Bepalende kleur van een projectbeeld. Het beeld wordt verkleind tot 48×48; elke pixel met genoeg
 * verzadiging telt mee in een van 24 tintvakken, gewogen naar verzadiging. Het zwaarste vak wint en
 * levert het gemiddelde van zijn pixels. Zo wint het blauw van een trap van een witte muur.
 * Heeft het beeld nauwelijks kleur (< 4 % verzadigde pixels), dan het gemiddelde van alles.
 */
async function bepalend(beeld: SanityImage): Promise<Rgb> {
  // Asset-ID's veranderen als de foto verandert (inhoudshash): de cache blijft altijd geldig.
  // Crop en hotspot horen erbij, die zijn per project in te stellen.
  const url = urlFor(beeld).width(48).height(48).fit('crop').format('png').url();
  const hit = cache.get(url);
  if (hit) return hit;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Thumbnail voor de kaartkleur niet geladen (${res.status}): ${url}`);
  const { data } = await sharp(Buffer.from(await res.arrayBuffer())).resize(48, 48, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const vakken = Array.from({ length: 24 }, () => ({ gewicht: 0, n: 0, rgb: [0, 0, 0] }));
  const totaal = [0, 0, 0];
  let kleurrijk = 0;
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    totaal[0] += r;
    totaal[1] += g;
    totaal[2] += b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.25 || max < 50 || max > 245) continue;
    const d = max - min;
    const tint = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    const vak = vakken[Math.floor((tint / 6) * 24) % 24];
    vak.gewicht += sat;
    vak.n += 1;
    vak.rgb[0] += r;
    vak.rgb[1] += g;
    vak.rgb[2] += b;
    kleurrijk += 1;
  }
  const pixels = data.length / 3;
  const beste = vakken.reduce((a, b) => (b.gewicht > a.gewicht ? b : a));
  const rgb = (
    kleurrijk / pixels < 0.04 ? totaal.map((c) => Math.round(c / pixels)) : beste.rgb.map((c) => Math.round(c / beste.n))
  ) as Rgb;
  cache.set(url, rgb);
  return rgb;
}

export async function kaartkleur(p: Project): Promise<Kaartkleur> {
  const rgb = fromHex(p.accentkleur) ?? (await bepalend(p.hero.src).catch(() => GRIJS));
  const l = luminance(rgb);
  // Contrast met wit (L=1) tegen zwart (L≈0.0277 voor oklch 18%): kies de hoogste ratio.
  const metWit = 1.05 / (l + 0.05);
  const metZwart = (l + 0.05) / (0.0277 + 0.05);
  return { vlak: hexToOklch(toHex(rgb))!, tekst: metWit >= metZwart ? WIT : ZWART };
}
