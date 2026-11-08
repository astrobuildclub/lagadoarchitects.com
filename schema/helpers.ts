// Kleine hulpfuncties voor de schema's. Waardenlijsten en labels komen uit de site zelf.
import { label } from '../src/lib/labels';

/** `options.list` voor een vaste waardenlijst, met de labels zoals ze op de site staan. */
export const opties = (waarden: readonly string[]) => waarden.map((value) => ({ title: label(value), value }));

/** Platte tekst uit Portable Text, voor previews in de Studio. */
export function platteTekst(blocks: unknown): string {
  if (!Array.isArray(blocks)) return '';
  return blocks
    .map((b) => (b?._type === 'block' && Array.isArray(b.children) ? b.children.map((c: { text?: string }) => c.text ?? '').join('') : ''))
    .join(' ')
    .trim();
}
