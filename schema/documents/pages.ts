// Pagina's (home, over, privacy), contact en de site-brede singletons.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { blocksField } from '../blocks';

const seoGroups = [
  { name: 'content', title: 'Content', default: true },
  { name: 'seo', title: 'SEO' },
];

/** Vaste pagina's met bouwstenen. Eén document per pagina, met een vaste ID (zie sanity.config.ts). */
export const page = defineType({
  name: 'page',
  title: 'Pagina',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', validation: (r) => r.required() }),
    defineField({ name: 'intro', title: 'Intro', type: 'richText', group: 'content' }),
    { ...blocksField(), group: 'content' },
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: { select: { title: 'title' } },
});

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
    { name: 'projecten', title: 'Projecten' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
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

/** Navigatie en footer, los van de site-instellingen (standards/SANITY.md). */
export const navigatie = defineType({
  name: 'navigatie',
  title: 'Navigatie en footer',
  type: 'document',
  fields: [
    defineField({ name: 'navigatie', title: 'Hoofdmenu', description: 'Maximaal 5.', type: 'array', of: [{ type: 'link' }], validation: (r) => r.required().min(1).max(5) }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        defineField({ name: 'tekst', title: 'Tekst', type: 'text', rows: 5 }),
        defineField({ name: 'links', title: 'Links', type: 'array', of: [{ type: 'link' }] }),
        defineField({ name: 'privacy', title: 'Privacy-pagina', type: 'string', initialValue: '/privacy', validation: (r) => r.required() }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Navigatie en footer' }) },
});
