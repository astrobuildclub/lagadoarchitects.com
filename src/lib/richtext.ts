// Hulp voor Portable Text buiten de weergave: platte tekst (SEO, JSON-LD) en "is er iets ingevuld".
import { stegaClean } from '@sanity/client/stega';
import type { RichText } from './schema';

/** Platte tekst, alinea's gescheiden door een spatie. Zonder stega: bedoeld voor <head> en JSON-LD. */
export function platteTekst(value: RichText | undefined): string {
  if (!value?.length) return '';
  return stegaClean(
    value
      .map((b) => (Array.isArray(b.children) ? (b.children as { text?: string }[]).map((c) => c.text ?? '').join('') : ''))
      .filter(Boolean)
      .join(' ')
      .trim(),
  );
}

export const heeftTekst = (value: RichText | undefined) => platteTekst(value) !== '';
