// Project. Groepen en volgorde volgen lagado-content/README.md → "Opbouw van een project".
import { defineArrayMember, defineField, defineType } from 'sanity';
import {
  HOMEPAGE_GROOTTE,
  KAARTVORM,
  KLEUR,
  MATERIAAL,
  OPDRACHTGEVER_TYPE,
  OPGAVE,
  PRIJSKLASSE,
  PROGRAMMA,
  SCHAAL,
  STATUS,
  TYPE,
  VORM,
} from '../../src/lib/waarden';
import { blocksField } from '../blocks';
import { opties } from '../helpers';

const meerkeuze = (name: string, title: string, waarden: readonly string[], description?: string) =>
  defineField({
    name,
    title,
    description,
    group: 'filters',
    type: 'array',
    of: [{ type: 'string' }],
    options: { list: opties(waarden), layout: 'grid' },
  });

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'identiteit', title: 'Identiteit', default: true },
    { name: 'verhaal', title: 'Verhaal' },
    { name: 'filters', title: 'Filters' },
    { name: 'gegevens', title: 'Projectgegevens' },
    { name: 'weergave', title: 'Beeld & weergave' },
    { name: 'credits', title: 'Credits & pers' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // Identiteit
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'identiteit', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'URL',
      description: '/projecten/…',
      type: 'slug',
      group: 'identiteit',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'tagline', title: 'Tagline', description: 'Eén zin, voor de kaart en de hero.', type: 'string', group: 'identiteit', validation: (r) => r.required() }),
    defineField({
      name: 'vraag',
      title: 'Ontwerpvraag',
      description: 'In één zin, groot boven de projecttekst. Bv. "Hoe maak je een uitgesproken woning in een nieuwbouwcasco?"',
      type: 'string',
      group: 'identiteit',
    }),
    defineField({ name: 'intro', title: 'Intro', description: '2 tot 4 zinnen.', type: 'richText', group: 'identiteit', validation: (r) => r.required() }),

    // Verhaal
    { ...blocksField(), group: 'verhaal' },

    // Filters (volgorde zoals op /projecten)
    defineField({ name: 'type', title: 'Bestemming', type: 'string', group: 'filters', options: { list: opties(TYPE), layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    meerkeuze('vorm', 'Vorm', VORM, 'De eerste bepaalt de vorm van de projectkaart.'),
    meerkeuze('kleuren', 'Kleur', KLEUR, 'Hoofdkleur(en).'),
    defineField({ name: 'status', title: 'Gebouwd', type: 'string', group: 'filters', options: { list: opties(STATUS), layout: 'radio', direction: 'horizontal' }, validation: (r) => r.required() }),
    defineField({ name: 'schaal', title: 'Schaal', type: 'string', group: 'filters', options: { list: opties(SCHAAL), layout: 'radio', direction: 'horizontal' } }),
    meerkeuze('opgave', 'Opgave', OPGAVE),
    meerkeuze('materialen', 'Materiaal', MATERIAAL, 'Alleen in het factsheet, geen filter.'),
    defineField({
      name: 'prijsklasse',
      title: 'Prijsklasse',
      description: "Nooit getoond zonder akkoord van Victor (Pagina's → Projecten → Prijsklasse tonen).",
      type: 'string',
      group: 'filters',
      options: { list: opties(PRIJSKLASSE), layout: 'radio', direction: 'horizontal' },
    }),

    // Projectgegevens (factsheet)
    defineField({
      name: 'locatie',
      title: 'Locatie',
      type: 'object',
      group: 'gegevens',
      options: { columns: 2 },
      fields: [
        defineField({ name: 'plaats', title: 'Plaats', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'wijk', title: 'Wijk', type: 'string' }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'omvang', title: 'Omvang (m²)', type: 'number', group: 'gegevens' }),
    defineField({ name: 'opdrachtgeverType', title: 'Soort opdrachtgever', type: 'string', group: 'gegevens', options: { list: opties(OPDRACHTGEVER_TYPE), layout: 'radio', direction: 'horizontal' } }),
    defineField({ name: 'opdrachtgever', title: 'Opdrachtgever', description: 'Leeg = de soort wordt getoond.', type: 'string', group: 'gegevens' }),
    defineField({ name: 'bouwteam', title: 'Bouwteam', type: 'array', of: [{ type: 'persoon' }], group: 'gegevens' }),
    defineField({ name: 'fotografie', title: 'Fotografie', type: 'array', of: [{ type: 'persoon' }], group: 'gegevens' }),
    defineField({ name: 'jaarOpdracht', title: 'Jaar opdracht', type: 'number', group: 'gegevens' }),
    defineField({
      name: 'jaarOplevering',
      title: 'Jaar oplevering',
      description: 'Verplicht als Gebouwd = Af.',
      type: 'number',
      group: 'gegevens',
      validation: (r) =>
        r.custom((jaar, ctx) => ((ctx.document as { status?: string })?.status === 'af' && !jaar ? 'Verplicht als het project af is' : true)),
    }),
    defineField({ name: 'programma', title: 'Programma', description: 'Op de projectkaart; geen filter.', type: 'string', group: 'gegevens', options: { list: opties(PROGRAMMA) }, validation: (r) => r.required() }),

    // Kleur, beeld en weergave
    defineField({
      name: 'accentkleur',
      title: 'Accentkleur',
      description: 'Hex, bv. #1f4fd1. Pagina-accent en kaartkleur; leeg = de bepalende kleur van het hero-beeld.',
      type: 'string',
      group: 'weergave',
      validation: (r) => r.regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { name: 'hex' }).warning('Gebruik een hexwaarde'),
    }),
    defineField({ name: 'kleurpalet', title: 'Kleurpalet', description: 'Voor het kleurpalet-blok.', type: 'array', of: [{ type: 'kleur' }], group: 'weergave' }),
    defineField({ name: 'hero', title: 'Hero-beeld', type: 'beeld', group: 'weergave', validation: (r) => r.required() }),
    defineField({ name: 'featured', title: 'Uitgelicht op de home', type: 'boolean', group: 'weergave', initialValue: false }),
    defineField({
      name: 'homepageGrootte',
      title: 'Kaartgrootte op de home',
      description: '1 rij: mini, klein, breed, lang · 2 rijen: hoog, toren, groot.',
      type: 'string',
      group: 'weergave',
      options: { list: opties(HOMEPAGE_GROOTTE) },
      initialValue: 'klein',
    }),
    defineField({ name: 'kaartvorm', title: 'Kaartvorm op de home', description: 'Leeg = uit de eerste vorm.', type: 'string', group: 'weergave', options: { list: opties(KAARTVORM) } }),
    defineField({ name: 'volgorde', title: 'Volgorde', description: 'Laag = eerst.', type: 'number', group: 'weergave', initialValue: 0 }),
    defineField({
      name: 'gerelateerd',
      title: 'Gerelateerd',
      description: 'Max. 3. Leeg = het volgende project.',
      type: 'array',
      group: 'weergave',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'project' }] })],
      validation: (r) => r.max(3),
    }),

    // Credits, pers en awards
    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      group: 'credits',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'credit',
          fields: [
            defineField({ name: 'rol', title: 'Rol', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'personen', title: 'Personen', type: 'array', of: [{ type: 'persoon' }] }),
          ],
          preview: { select: { title: 'rol', p0: 'personen.0.naam', p1: 'personen.1.naam' }, prepare: ({ title, p0, p1 }) => ({ title, subtitle: [p0, p1].filter(Boolean).join(', ') }) },
        }),
      ],
    }),
    defineField({ name: 'pers', title: 'Pers', type: 'array', of: [{ type: 'persItem' }], group: 'credits' }),
    defineField({ name: 'awards', title: 'Awards', type: 'array', of: [{ type: 'awardItem' }], group: 'credits' }),
    defineField({ name: 'pressKit', title: 'Press-kit', type: 'file', group: 'credits' }),

    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  orderings: [
    { title: 'Volgorde', name: 'volgorde', by: [{ field: 'volgorde', direction: 'asc' }, { field: 'title', direction: 'asc' }] },
    { title: 'Titel', name: 'titel', by: [{ field: 'title', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', type: 'type', jaar: 'jaarOplevering', media: 'hero' },
    prepare: ({ title, type, jaar, media }) => ({ title, subtitle: [type, jaar].filter(Boolean).join(' · '), media }),
  },
});
