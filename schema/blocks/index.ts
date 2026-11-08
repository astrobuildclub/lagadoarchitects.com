// Bouwstenen (`blocks`). `name` = de `type`-waarde uit src/lib/schema.ts; de query zet `_type` terug naar `type`.
// Uitzondering: `text` en `image` zijn ingebouwde Sanity-types, daarom `textBlock` en `imageBlock` (zie BLOK_TYPE).
// Nieuw bloktype: lagado-content/README.md → src/lib/schema.ts → hier → query → component → BlockRenderer.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { BREEDTE } from '../../src/lib/waarden';
import { opties, platteTekst } from '../helpers';

const kop = defineField({ name: 'kop', title: 'Kop', type: 'string' });
const tekst = (title = 'Tekst', required = true) =>
  defineField({ name: 'tekst', title, type: 'richText', validation: required ? (r) => r.required() : undefined });

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  type: 'object',
  fields: [
    defineField({
      name: 'kop',
      title: 'Kop',
      description: 'Een nieuwe regel is een vaste regelafbreking.',
      type: 'text',
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'kopWissel',
      title: 'Wisselwoorden kop',
      description: 'Woorden die na de kop wisselen. De eerste staat er zonder animatie.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'subkop', title: 'Subkop', type: 'string' }),
    defineField({ name: 'subkopWissel', title: 'Wisselwoorden subkop', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'link', title: 'Link', type: 'link' }),
    defineField({ name: 'adres', title: 'Adres tonen', description: 'Adres uit Contact als kolom.', type: 'boolean', initialValue: false }),
    tekst('Tekst (laatste kolom)', false),
    defineField({ name: 'beelden', title: 'Beelden', description: '0 tot 5.', type: 'array', of: [{ type: 'beeld' }], validation: (r) => r.max(5) }),
  ],
  preview: { select: { title: 'kop', media: 'beelden.0' }, prepare: ({ title, media }) => ({ title, subtitle: 'Hero', media }) },
});

export const text = defineType({
  name: 'textBlock',
  title: 'Tekst',
  type: 'object',
  fields: [
    kop,
    defineField({
      name: 'niveau',
      title: 'Kopniveau',
      type: 'number',
      options: { list: [2, 3], layout: 'radio', direction: 'horizontal' },
      initialValue: 2,
    }),
    tekst(),
  ],
  preview: { select: { kop: 'kop', tekst: 'tekst' }, prepare: ({ kop, tekst }) => ({ title: kop || platteTekst(tekst) || 'Tekst', subtitle: 'Tekst' }) },
});

export const image = defineType({
  name: 'imageBlock',
  title: 'Beeld',
  type: 'object',
  fields: [
    defineField({ name: 'beeld', title: 'Beeld', type: 'beeld', validation: (r) => r.required() }),
    defineField({ name: 'breedte', title: 'Breedte', type: 'string', options: { list: opties(BREEDTE), layout: 'radio', direction: 'horizontal' }, initialValue: 'content' }),
  ],
  preview: { select: { title: 'beeld.alt', media: 'beeld', breedte: 'breedte' }, prepare: ({ title, media, breedte }) => ({ title: title || 'Beeld', subtitle: `Beeld · ${breedte ?? 'content'}`, media }) },
});

export const gallery = defineType({
  name: 'gallery',
  title: 'Galerij',
  type: 'object',
  fields: [
    defineField({ name: 'kolommen', title: 'Kolommen', description: 'Mobiel altijd 2.', type: 'number', options: { list: [2, 3], layout: 'radio', direction: 'horizontal' }, initialValue: 3 }),
    defineField({ name: 'images', title: 'Beelden', type: 'array', of: [{ type: 'beeld' }], options: { layout: 'grid' }, validation: (r) => r.min(1) }),
  ],
  preview: { select: { images: 'images', media: 'images.0' }, prepare: ({ images, media }) => ({ title: `${images?.length ?? 0} beelden`, subtitle: 'Galerij', media }) },
});

export const columns = defineType({
  name: 'columns',
  title: 'Beeld naast tekst',
  type: 'object',
  fields: [
    defineField({ name: 'image', title: 'Beeld', description: 'Staand werkt het best (3:4). Op mobiel staat het beeld altijd boven de tekst.', type: 'beeld', validation: (r) => r.warning('Voeg een beeld toe, anders staat de tekst alleen.') }),
    defineField({ name: 'beeldPositie', title: 'Beeld', type: 'string', options: { list: opties(['links', 'rechts']), layout: 'radio', direction: 'horizontal' }, initialValue: 'links' }),
    kop,
    defineField({ name: 'intro', title: 'Intro', description: 'Groter dan de tekst eronder. Eén alinea.', type: 'richText' }),
    tekst('Tekst', false),
    defineField({ name: 'kolommen', title: 'Tekst in twee kolommen', description: 'Elke alinea een eigen kolom. Op mobiel onder elkaar.', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'kop', media: 'image' }, prepare: ({ title, media }) => ({ title: title || 'Beeld naast tekst', subtitle: 'Beeld naast tekst', media }) },
});

export const quote = defineType({
  name: 'quote',
  title: 'Citaat',
  type: 'object',
  fields: [
    defineField({ name: 'tekst', title: 'Citaat', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'naam', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'rol', title: 'Rol', type: 'string' }),
  ],
  preview: { select: { title: 'tekst', subtitle: 'naam' } },
});

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'object',
  description: 'Laadt pas na een klik en toestemming (AVG).',
  fields: [
    defineField({ name: 'url', title: 'YouTube- of Vimeo-URL', type: 'url', validation: (r) => r.required() }),
    defineField({ name: 'titel', title: 'Titel', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'poster', title: 'Posterbeeld', description: 'Leeg = de thumbnail van YouTube of Vimeo, opgehaald via onze eigen server (bezoekers praten vóór toestemming niet met YouTube of Vimeo).', type: 'beeld' }),
    defineField({ name: 'caption', title: 'Onderschrift', type: 'string' }),
    defineField({
      name: 'verhouding',
      title: 'Verhouding',
      description: 'Automatisch: Vimeo zoals de video is, YouTube Shorts staand (9:16), andere YouTube-video\'s 16:9.',
      type: 'string',
      options: {
        list: [
          { title: 'Automatisch', value: 'auto' },
          { title: 'Breed (16:9)', value: '16:9' },
          { title: 'Bioscoop (21:9)', value: '21:9' },
          { title: 'Klassiek (4:3)', value: '4:3' },
          { title: 'Vierkant (1:1)', value: '1:1' },
          { title: 'Staand (9:16)', value: '9:16' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'auto',
    }),
  ],
  preview: { select: { title: 'titel', media: 'poster' }, prepare: ({ title, media }) => ({ title, subtitle: 'Video', media }) },
});

export const colors = defineType({
  name: 'colors',
  title: 'Kleurpalet',
  type: 'object',
  description: 'Leeg = het kleurpalet van het project.',
  fields: [defineField({ name: 'kleuren', title: 'Kleuren', type: 'array', of: [{ type: 'kleur' }] })],
  preview: { select: { kleuren: 'kleuren' }, prepare: ({ kleuren }) => ({ title: kleuren?.length ? `${kleuren.length} kleuren` : 'Kleurpalet van het project', subtitle: 'Kleurpalet' }) },
});

export const beforeAfter = defineType({
  name: 'beforeAfter',
  title: 'Voor en na',
  type: 'object',
  fields: [
    defineField({ name: 'voor', title: 'Voor', type: 'beeld', validation: (r) => r.required() }),
    defineField({ name: 'na', title: 'Na', type: 'beeld', validation: (r) => r.required() }),
    defineField({ name: 'caption', title: 'Onderschrift', type: 'string' }),
  ],
  preview: { select: { media: 'na', title: 'caption' }, prepare: ({ media, title }) => ({ title: title || 'Voor en na', subtitle: 'Voor en na', media }) },
});

export const projectGrid = defineType({
  name: 'projectGrid',
  title: 'Projecten',
  type: 'object',
  fields: [
    kop,
    defineField({ name: 'featured', title: 'Alleen uitgelichte projecten', type: 'boolean' }),
    defineField({
      name: 'slugs',
      title: 'Vaste selectie',
      description: 'In deze volgorde. Leeg = alle projecten (of het filter hieronder).',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
    }),
    defineField({
      name: 'filter',
      title: 'Filter',
      description: 'Alleen als er geen vaste selectie is. Alle voorwaarden moeten kloppen.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'filterRegel',
          fields: [
            defineField({ name: 'veld', title: 'Veld', type: 'string', options: { list: opties(['type', 'vorm', 'kleuren', 'status', 'schaal', 'opgave', 'programma']) } }),
            defineField({ name: 'waarde', title: 'Waarde', description: 'Bv. thuiskomen, rond, blauw', type: 'string' }),
          ],
          preview: { select: { veld: 'veld', waarde: 'waarde' }, prepare: ({ veld, waarde }) => ({ title: `${veld} = ${waarde}` }) },
        }),
      ],
    }),
    defineField({ name: 'limit', title: 'Eerst zichtbaar', description: 'Zoveel kaarten eerst; de rest per zoveel via "Meer projecten".', type: 'number' }),
    defineField({ name: 'meer', title: '"Meer projecten"-knop', description: 'Uit = vast aantal kaarten in de vaste indeling.', type: 'boolean', initialValue: true }),
    defineField({ name: 'linkNaarOverzicht', title: 'Link naar overzicht', type: 'link' }),
    defineField({ name: 'links', title: 'Extra links', type: 'array', of: [{ type: 'link' }] }),
  ],
  preview: { select: { title: 'kop' }, prepare: ({ title }) => ({ title: title || 'Projecten', subtitle: 'Projecten' }) },
});

export const statement = defineType({
  name: 'statement',
  title: 'Statement',
  type: 'object',
  description: 'Eén grote, vette zin.',
  fields: [defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 2, validation: (r) => r.required() })],
  preview: { select: { title: 'tekst' }, prepare: ({ title }) => ({ title, subtitle: 'Statement' }) },
});

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'object',
  fields: [
    kop,
    defineField({
      name: 'personen',
      title: 'Personen',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'teamlid',
          fields: [
            defineField({ name: 'naam', title: 'Naam', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'rol', title: 'Rol', type: 'string' }),
            defineField({ name: 'foto', title: 'Foto', type: 'beeld' }),
            defineField({ name: 'bio', title: 'Bio', type: 'richText' }),
            defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url' }),
          ],
          preview: { select: { title: 'naam', subtitle: 'rol', media: 'foto' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'kop' }, prepare: ({ title }) => ({ title: title || 'Team', subtitle: 'Team' }) },
});

export const list = defineType({
  name: 'list',
  title: 'Pers of awards',
  type: 'object',
  fields: [
    defineField({ name: 'soort', title: 'Soort', type: 'string', options: { list: opties(['pers', 'awards']), layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    kop,
    defineField({ name: 'intro', title: 'Intro', description: 'Korte tekst onder de kop, naast de lijst.', type: 'richText' }),
    defineField({ name: 'items', title: 'Items', type: 'array', of: [{ type: 'listItem' }] }),
    defineField({
      name: 'toonUit',
      title: 'Items van een andere pagina',
      description: 'In plaats van eigen items, bv. de awards van Over.',
      type: 'reference',
      to: [{ type: 'page' }],
      options: { filter: 'defined(slug.current)' },
    }),
    defineField({ name: 'limit', title: 'Maximaal', type: 'number' }),
    defineField({ name: 'zichtbaar', title: 'Direct zichtbaar', description: 'De rest achter "Toon alles".', type: 'number' }),
  ],
  preview: { select: { title: 'kop', soort: 'soort' }, prepare: ({ title, soort }) => ({ title: title || soort, subtitle: 'Pers of awards' }) },
});

export const cta = defineType({
  name: 'cta',
  title: 'Afsluitende actie',
  type: 'object',
  fields: [
    defineField({ name: 'tekst', title: 'Tekst', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'label', title: 'Knoptekst', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', title: 'URL', type: 'string', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'tekst', subtitle: 'label' } },
});

export const services = defineType({
  name: 'services',
  title: 'Diensten',
  type: 'object',
  fields: [
    kop,
    defineField({ name: 'anker', title: 'Anker', description: 'Bv. diensten → /over#diensten', type: 'string' }),
    defineField({
      name: 'weergave',
      title: 'Weergave',
      description:
        'Raster: tegels naast elkaar. Beelden: een strook met per dienst een beeld. Vormen: donkere vormen over een achtergrondbeeld. Beelden en vormen schuiven mee met het scrollen (desktop) of zijn te swipen (mobiel).',
      type: 'string',
      options: { list: opties(['raster', 'beelden', 'vormen']), layout: 'radio', direction: 'horizontal' },
      initialValue: 'raster',
    }),
    defineField({ name: 'vormen', title: 'Tegels in de projectvormen', type: 'boolean', initialValue: false, hidden: ({ parent }) => (parent?.weergave ?? 'raster') !== 'raster' }),
    defineField({
      name: 'achtergrond',
      title: 'Achtergrondbeeld',
      description: 'Liggend en breed (bv. 3:2). De vormen schuiven eroverheen.',
      type: 'beeld',
      hidden: ({ parent }) => parent?.weergave !== 'vormen',
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'dienst',
          fields: [
            defineField({ name: 'titel', title: 'Titel', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'tekst', title: 'Tekst', type: 'richText' }),
            defineField({ name: 'beeld', title: 'Beeld', description: 'Voor de weergave Beelden (staand, 3:4).', type: 'beeld' }),
          ],
          preview: { select: { title: 'titel', media: 'beeld' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'kop' }, prepare: ({ title }) => ({ title: title || 'Diensten', subtitle: 'Diensten' }) },
});

export const logos = defineType({
  name: 'logos',
  title: 'Logo\'s',
  type: 'object',
  fields: [
    kop,
    defineField({
      name: 'items',
      title: 'Logo\'s',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'logoItem',
          fields: [
            defineField({ name: 'naam', title: 'Naam', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'logo', title: 'Logo', type: 'beeld' }),
            defineField({ name: 'href', title: 'URL', type: 'url' }),
          ],
          preview: { select: { title: 'naam', media: 'logo' } },
        }),
      ],
    }),
  ],
  preview: { select: { title: 'kop' }, prepare: ({ title }) => ({ title: title || 'Logo\'s', subtitle: 'Logo\'s' }) },
});

export const downloads = defineType({
  name: 'downloads',
  title: 'Downloads',
  type: 'object',
  fields: [kop, defineField({ name: 'items', title: 'Bestanden', type: 'array', of: [{ type: 'downloadItem' }] })],
  preview: { select: { title: 'kop' }, prepare: ({ title }) => ({ title: title || 'Downloads', subtitle: 'Downloads' }) },
});

/** Sanity-naam → `type` op de site, voor de twee blokken die anders heten. */
export const BLOK_TYPE: Record<string, string> = { textBlock: 'text', imageBlock: 'image' };

export const blockTypes = [hero, text, image, gallery, columns, quote, video, colors, beforeAfter, projectGrid, statement, team, list, cta, services, logos, downloads];

/** Bloktypes die op een pagina of in een project mogen. */
export const blocksField = (name = 'blocks', title = 'Bouwstenen') =>
  defineField({
    name,
    title,
    type: 'array',
    of: blockTypes.map((b) => defineArrayMember({ type: b.name })),
    options: {
      insertMenu: { views: [{ name: 'list' }] },
    },
  });
