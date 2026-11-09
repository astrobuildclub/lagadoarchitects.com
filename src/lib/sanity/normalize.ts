// Van GROQ-resultaat naar de vorm uit schema.ts. Los van loadQuery, zodat het ook buiten Astro te testen is.
import { stegaClean } from '@sanity/client/stega';
import type { z } from 'astro/zod';

// ── Normaliseren ───────────────────────────────────────────
// In de Presentation tool krijgen strings onzichtbare stega-tekens (voor de klikbare overlays). Die mogen
// alleen blijven in tekst die we tonen; waarden voor logica, klassen, URL's en filters worden schoongemaakt.
const TOON = new Set([
  'title', 'tagline', 'vraag', 'kop', 'subkop', 'caption', 'naam', 'rol', 'titel', 'medium',
  'tekst', 'text', 'label', 'opdrachtgever', 'plaats', 'wijk', 'siteNaam', 'payoff', 'straat', 'postcode', 'bezoek',
]);

/** Beeld zonder bestand: alleen nog alt/caption over. */
const leegBeeld = (o: Record<string, unknown>) => !('src' in o) && 'alt' in o && Object.keys(o).every((k) => k === 'alt' || k === 'caption');

/**
 * GROQ geeft `null` voor lege velden, Zod verwacht ze afwezig. Lege beelden vallen weg,
 * stega blijft alleen in getoonde tekst.
 */
function normalize(value: unknown, key = ''): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return TOON.has(key) ? value : stegaClean(value);
  if (Array.isArray(value)) return value.map((v) => normalize(v, key)).filter((v) => v !== undefined);
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const n = normalize(v, k);
      if (n !== undefined) out[k] = n;
    }
    return leegBeeld(out) ? undefined : out;
  }
  return value;
}

/** projectGrid: de Studio bewaart het filter als lijst regels, de site gebruikt `{ veld: waarde }`. */
function filterAlsRecord(blocks: unknown) {
  if (!Array.isArray(blocks)) return;
  for (const b of blocks as Record<string, unknown>[]) {
    if (b.type === 'projectGrid' && Array.isArray(b.filter)) {
      b.filter = Object.fromEntries((b.filter as { veld?: string; waarde?: string }[]).filter((r) => r.veld && r.waarde).map((r) => [r.veld, r.waarde]));
    }
  }
}

/**
 * Beeldbouwstenen zonder (volledig) beeld weglaten in plaats van de hele pagina te laten vallen: een net
 * toegevoegd blok in de Studio, of een upload die nog bezig is of mislukte. Lege blokken renderen niets.
 */
function zonderLegeBeeldblokken(blocks: unknown) {
  if (!Array.isArray(blocks)) return blocks;
  return (blocks as Record<string, unknown>[]).filter((b) => {
    if (b.type === 'image') return 'src' in b;
    if (b.type === 'beforeAfter') return (['voor', 'na'] as const).every((k) => (b[k] as { src?: unknown } | undefined)?.src);
    return true;
  });
}

export function parse<S extends z.ZodType>(schema: S, raw: unknown, wat: string): z.infer<S> {
  const data = normalize(raw) as Record<string, unknown> | undefined;
  if (!data) throw new Error(`${wat} ontbreekt in Sanity`);
  filterAlsRecord(data.blocks);
  if (data.blocks) data.blocks = zonderLegeBeeldblokken(data.blocks);
  const res = schema.safeParse(data);
  if (!res.success) throw new Error(`${wat} klopt niet met het contentmodel:\n${res.error.message}`);
  return res.data;
}

