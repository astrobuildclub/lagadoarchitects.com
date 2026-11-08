// Pagina's (home, over, privacy en nieuwe), contact en de site-instellingen (met menu en footer).
import { defineArrayMember, defineField, defineType, type SlugValidationContext } from 'sanity';
import { blocksField } from '../blocks';
import { platteTekst } from '../helpers';

/** Home heeft een vaste ID en geen slug: hij staat op `/`. */
export const HOME_ID = 'page-home';
const isHome = (doc: { _id?: string } | undefined) => (doc?._id ?? '').replace(/^drafts\./, '') === HOME_ID;

/** URL's die al een eigen route hebben (src/pages/). Een pagina mag daar niet op landen. */
const GERESERVEERD = new Set(['projecten', 'contact', 'admin', 'api', '404', 'robots.txt', 'sitemap-index.xml']);

const seoGroups = [
  { name: 'content', title: 'Content', default: true },
  { name: 'seo', title: 'SEO' },
];

/**
 * Pagina. Home (vaste ID, op `/`) en zelf aan te maken pagina's op `/<slug>`.
 * Template `blokken`: bouwstenen zoals de home en Over. Template `tekst`: één lopende tekst met koppen (Privacy).
 */
export const page = defineType({
  name: 'page',
  title: 'Pagina',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'URL',
      description: 'lagadoarchitects.com/…',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 60, isUnique: slugIsUniek },
      hidden: ({ document }) => isHome(document),
      validation: (r) =>
        r.custom((slug: { current?: string } | undefined, ctx) => {
          if (isHome(ctx.document)) return true;
          if (!slug?.current) return 'Verplicht';
          if (GERESERVEERD.has(slug.current)) return `/${slug.current} is al een vaste pagina, kies een andere URL`;
          return true;
        }),
    }),
    defineField({
      name: 'template',
      title: 'Template',
      type: 'string',
      group: 'content',
      options: {
        list: [
          { title: 'Bouwstenen', value: 'blokken' },
          { title: 'Tekst (zoals Privacy)', value: 'tekst' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'blokken',
      hidden: ({ document }) => isHome(document),
    }),
    defineField({ name: 'intro', title: 'Intro', type: 'richText', group: 'content' }),
    defineField({ ...blocksField(), group: 'content', hidden: ({ document }) => document?.template === 'tekst' }),
    defineField({
      name: 'inhoud',
      title: 'Tekst',
      description: 'Koppen via het stijlmenu (Kop 2, Kop 3).',
      type: 'richTextPagina',
      group: 'content',
      hidden: ({ document }) => document?.template !== 'tekst',
    }),
    defineField({
      name: 'cookieKnop',
      title: 'Knop "Cookie-instellingen aanpassen" onderaan',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      hidden: ({ document }) => document?.template !== 'tekst',
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', id: '_id' },
    prepare: ({ title, slug, id }) => ({ title, subtitle: isHome({ _id: id }) ? '/' : slug ? `/${slug}` : 'Nog geen URL' }),
  },
});

/** Unieke slug onder pagina's (ook de drafts van hetzelfde document tellen niet als dubbel). */
export async function slugIsUniek(slug: string, ctx: SlugValidationContext) {
  const id = ctx.document?._id.replace(/^drafts\./, '');
  const client = ctx.getClient({ apiVersion: '2025-01-01' });
  return !(await client.fetch('count(*[_type == "page" && slug.current == $slug && !(_id in [$id, $draft])])', { slug, id, draft: `drafts.${id}` }));
}

const adresVeld = defineField({
  name: 'adres',
  title: 'Adres',
  type: 'object',
  options: { columns: 2 },
  fields: [
    defineField({ name: 'naam', title: 'Naam', type: 'string' }),
    defineField({ name: 'straat', title: 'Straat + nummer', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'postcode', title: 'Postcode', type: 'string' }),
    defineField({ name: 'plaats', title: 'Plaats', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'land', title: 'Land (ISO)', type: 'string', initialValue: 'NL' }),
    defineField({ name: 'bezoek', title: 'Bezoek', description: 'Bv. "Alleen op afspraak".', type: 'string' }),
  ],
});

export const contact = defineType({
  name: 'contact',
  title: 'Contact',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'gegevens', title: 'Gegevens' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'intro', title: 'Intro', type: 'richText', group: 'content' }),
    defineField({ name: 'tekst', title: 'Tekst', type: 'richText', group: 'content' }),
    defineField({ name: 'sfeerbeeld', title: 'Sfeerbeeld', type: 'beeld', group: 'content' }),
    defineField({
      name: 'contactpersoon',
      title: 'Contactpersoon',
      type: 'object',
      group: 'content',
      fields: [defineField({ name: 'naam', title: 'Naam', type: 'string' }), defineField({ name: 'rol', title: 'Rol', type: 'string' })],
    }),
    defineField({
      name: 'bio',
      title: 'Bio van de oprichter',
      type: 'object',
      group: 'content',
      fields: [
        defineField({ name: 'kop', title: 'Kop', type: 'string' }),
        defineField({ name: 'foto', title: 'Foto', type: 'beeld' }),
        defineField({ name: 'quote', title: 'Quote', type: 'richText' }),
      ],
    }),
    defineField({
      name: 'stage',
      title: 'Stage',
      type: 'object',
      group: 'content',
      fields: [defineField({ name: 'kop', title: 'Kop', type: 'string' }), defineField({ name: 'tekst', title: 'Tekst', type: 'richText' })],
    }),
    defineField({ name: 'email', title: 'E-mail', type: 'string', group: 'gegevens', validation: (r) => r.required().email() }),
    defineField({ name: 'telefoon', title: 'Telefoon', type: 'string', group: 'gegevens' }),
    { ...adresVeld, group: 'gegevens', validation: (r) => r.required() },
    defineField({
      name: 'kaart',
      title: 'Kaart',
      description: 'Geen iframe (AVG): een link en eventueel een eigen beeld.',
      type: 'object',
      group: 'gegevens',
      fields: [defineField({ name: 'link', title: 'Link naar kaartdienst', type: 'url' }), defineField({ name: 'statischBeeld', title: 'Statisch beeld', type: 'beeld' })],
    }),
    defineField({
      name: 'bedrijf',
      title: 'Bedrijfsgegevens',
      type: 'object',
      group: 'gegevens',
      fields: [
        defineField({ name: 'kvk', title: 'KvK', type: 'string' }),
        defineField({ name: 'btw', title: 'Btw', type: 'string' }),
        defineField({ name: 'architectenregister', title: 'Architectenregister', type: 'string' }),
        defineField({ name: 'bank', title: 'Bank (IBAN)', type: 'string' }),
        defineField({ name: 'lidmaatschappen', title: 'Lidmaatschappen', type: 'array', of: [defineArrayMember({ type: 'object', name: 'lidmaatschap', fields: [defineField({ name: 'label', title: 'Label', type: 'string' }), defineField({ name: 'href', title: 'URL', type: 'url' })] })] }),
      ],
    }),
    defineField({ name: 'social', title: 'Social', type: 'array', of: [{ type: 'link' }], group: 'gegevens' }),
    defineField({ name: 'downloads', title: 'Downloads', type: 'array', of: [{ type: 'downloadItem' }], group: 'gegevens' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: { prepare: () => ({ title: 'Contact' }) },
});

/** Site-instellingen (standards/SANITY.md §1, met de Nederlandse veldnamen van dit project). */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site-instellingen',
  type: 'document',
  groups: [
    { name: 'algemeen', title: 'Algemeen', default: true },
    { name: 'menu', title: 'Menu' },
    { name: 'footer', title: 'Footer' },
    { name: 'projecten', title: 'Projecten' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'navigatie',
      title: 'Hoofdmenu',
      description: 'Maximaal 5. Interne pagina\'s als pad: /projecten, /over, /contact.',
      type: 'array',
      of: [{ type: 'link' }],
      group: 'menu',
      validation: (r) => r.required().min(1).max(5),
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      group: 'footer',
      fields: [
        defineField({
          name: 'kolommen',
          title: 'Kolommen',
          description:
            'Vier kolommen onder het logo; de eerste is twee keer zo breed. Nieuwe regel: Shift+Enter. Een link naar #cookies wordt de knop "Cookie-instellingen".',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'footerKolom',
              title: 'Kolom',
              fields: [defineField({ name: 'tekst', title: 'Tekst', type: 'richText' })],
              preview: {
                select: { tekst: 'tekst' },
                prepare: ({ tekst }) => ({ title: platteTekst(tekst).slice(0, 80) || 'Lege kolom' }),
              },
            }),
          ],
          validation: (r) => r.max(4),
        }),
      ],
    }),
    defineField({ name: 'siteNaam', title: 'Sitenaam', type: 'string', group: 'algemeen', validation: (r) => r.required() }),
    defineField({ name: 'payoff', title: 'Payoff', type: 'string', group: 'algemeen', validation: (r) => r.required() }),
    defineField({ name: 'taal', title: 'Taal', type: 'string', group: 'algemeen', initialValue: 'nl', readOnly: true }),
    defineField({ name: 'url', title: 'URL', description: 'Zonder slash aan het eind.', type: 'url', group: 'algemeen', validation: (r) => r.required() }),
    defineField({
      name: 'analytics',
      title: 'Statistiek',
      description: 'Alleen cookieloos en pas na toestemming. Het script staat in de omgevingsvariabelen.',
      type: 'string',
      group: 'algemeen',
      readOnly: true,
    }),
    defineField({
      name: 'projecten',
      title: 'Projectoverzicht',
      type: 'object',
      group: 'projecten',
      fields: [
        defineField({
          name: 'intro',
          title: 'Intro op /projecten',
          description: 'Een link naar #verras wordt de knop "Verras me".',
          type: 'richText',
        }),
        defineField({
          name: 'toonPrijsfilter',
          title: 'Prijsklasse tonen',
          description: 'Alleen met akkoord van Victor.',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO-standaarden',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'titelPatroon',
          title: 'Titelpatroon',
          description: '%s wordt de paginatitel, bv. "%s — LAGADO architects".',
          type: 'string',
          validation: (r) => r.custom((v) => !v || v.includes('%s') || 'Moet %s bevatten'),
        }),
        defineField({ name: 'beschrijving', title: 'Standaardbeschrijving', type: 'text', rows: 3, validation: (r) => r.max(160).warning('Zoekmachines tonen ongeveer 155 tekens') }),
        defineField({ name: 'deelAfbeelding', title: 'Standaard deelafbeelding', description: 'Wordt bijgesneden tot 1200×630. Leeg = /og-default.png.', type: 'beeld' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site-instellingen' }) },
});
