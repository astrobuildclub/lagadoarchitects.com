// Woordmerkanimatie: één versie van het kinetische woordmerk. Het veld `data` is de JSON uit de editor
// (src/scripts/woordmerk-editor.ts), die hier in de Studio zelf draait (WoordmerkInput). Welke versie waar
// speelt, kies je in de Site-instellingen → Woordmerk. Een nieuwe versie: dupliceer een document.
import { defineField, defineType } from 'sanity';
import { WoordmerkInput } from '../components/WoordmerkInput';
import { DATA, bouwLetters, type WoordmerkData } from '../../src/lib/brand/wordmark';

/** Leest en controleert de JSON met dezelfde rekenkern als de site: wat hier slaagt, rendert ook. */
export function leesWoordmerk(json: string | undefined): WoordmerkData {
  if (!json) throw new Error('Leeg');
  const data = JSON.parse(json) as WoordmerkData;
  if (!data || typeof data.duur !== 'number' || !Array.isArray(data.letters)) throw new Error('Dit is geen woordmerk');
  if (data.letters.length !== 6) throw new Error(`LAGADO heeft 6 letters, dit woordmerk ${data.letters.length}`);
  bouwLetters(data);
  return data;
}

export const woordmerk = defineType({
  name: 'woordmerk',
  title: 'Woordmerkanimatie',
  type: 'document',
  fields: [
    defineField({ name: 'naam', title: 'Naam', description: 'Bv. "Rustig, december".', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'data',
      title: 'Animatie',
      description: 'Versleep de hoekpunten en stel de frames in. Wijzigingen worden bewaard als concept; publiceer om ze op de site te zetten.',
      type: 'text',
      components: { input: WoordmerkInput },
      initialValue: () => JSON.stringify(DATA, null, 2),
      validation: (r) =>
        r.required().custom((v) => {
          try {
            leesWoordmerk(v);
            return true;
          } catch (e) {
            return `Animatie klopt niet: ${(e as Error).message}`;
          }
        }),
    }),
    defineField({ name: 'notitie', title: 'Notitie', description: 'Waarom deze versie, voor wie, wat is anders.', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'naam', subtitle: 'notitie' } },
});
