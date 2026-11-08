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

/** Projectoverzicht op /projecten: intro, filterinstellingen en SEO. Vaste ID, de projecten zelf staan onder Projecten. */
export const PROJECTEN_ID = 'projecten';

export const projectenPagina = defineType({
  name: 'projectenPagina',
  title: 'Projectenpagina',
  type: 'document',
  groups: seoGroups,
  fields: [
    defineField({ name: 'title', title: 'Titel', type: 'string', group: 'content', initialValue: 'Projecten', validation: (r) => r.required() }),
    defineField({
      name: 'intro',
      title: 'Intro',
      description: 'Een link naar #verras wordt de knop "Verras me".',
      type: 'richText',
      group: 'content',
    }),
    defineField({
      name: 'toonPrijsfilter',
      title: 'Prijsklasse tonen',
      description: 'Alleen met akkoord van Victor.',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo', group: 'seo' }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: title || 'Projecten', subtitle: '/projecten' }),
  },
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
    { name: 'statistiek', title: 'Statistiek' },
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
      description:
        'Umami en Plausible tellen zonder cookies en zonder persoonsgegevens: ze draaien zonder toestemmingsbanner. Google Analytics plaatst cookies: dan vraagt de site eerst toestemming. Noem de dienst in de privacyverklaring.',
      type: 'object',
      group: 'statistiek',
      fields: [
        defineField({
          name: 'dienst',
          title: 'Dienst',
          type: 'string',
          options: {
            list: [
              { title: 'Geen', value: 'geen' },
              { title: 'Umami (cookieloos)', value: 'umami' },
              { title: 'Plausible (cookieloos)', value: 'plausible' },
              { title: 'Google Analytics (met toestemming)', value: 'google' },
            ],
            layout: 'radio',
          },
          initialValue: 'geen',
        }),
        defineField({
          name: 'umamiId',
          title: 'Umami website-ID',
          description: 'Umami → Settings → Websites → Edit → Website ID.',
          type: 'string',
          hidden: ({ parent }) => parent?.dienst !== 'umami',
          validation: (r) => r.custom((v, ctx) => ((ctx.parent as { dienst?: string })?.dienst === 'umami' && !v ? 'Verplicht voor Umami' : true)),
        }),
        defineField({
          name: 'umamiScript',
          title: 'Umami-script',
          description: 'Leeg = Umami Cloud (https://cloud.umami.is/script.js). Eigen server: de URL van script.js daar.',
          type: 'url',
          hidden: ({ parent }) => parent?.dienst !== 'umami',
        }),
        defineField({
          name: 'plausibleDomein',
          title: 'Plausible-domein',
          description: 'Zoals in Plausible ingesteld, bv. lagadoarchitects.com.',
          type: 'string',
          hidden: ({ parent }) => parent?.dienst !== 'plausible',
          validation: (r) => r.custom((v, ctx) => ((ctx.parent as { dienst?: string })?.dienst === 'plausible' && !v ? 'Verplicht voor Plausible' : true)),
        }),
        defineField({
          name: 'plausibleScript',
          title: 'Plausible-script',
          description: 'Leeg = https://plausible.io/js/script.js. Eigen server (Community Edition): de URL daar.',
          type: 'url',
          hidden: ({ parent }) => parent?.dienst !== 'plausible',
        }),
        defineField({
          name: 'googleId',
          title: 'Google Analytics meet-ID',
          description: 'G-XXXXXXXXXX. Laadt pas na toestemming; zonder toestemming geen enkel verzoek naar Google.',
          type: 'string',
          hidden: ({ parent }) => parent?.dienst !== 'google',
          validation: (r) =>
            r.custom((v, ctx) => {
              if ((ctx.parent as { dienst?: string })?.dienst !== 'google') return true;
              return /^G-[A-Z0-9]+$/.test(v ?? '') ? true : 'Een meet-ID begint met G-';
            }),
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
        defineField({
          name: 'llmsIntro',
          title: 'Intro voor AI-assistenten',
          description:
            'Twee à drie zinnen: wie, wat, voor wie, waar. Komt bovenaan /llms.txt, de samenvatting die ChatGPT, Claude en Perplexity lezen. Leeg = standaardbeschrijving.',
          type: 'text',
          rows: 4,
        }),
        defineField({
          name: 'aiTraining',
          title: 'AI-modellen mogen de content gebruiken voor training',
          description:
            'Uit = trainingscrawlers (GPTBot, ClaudeBot, Google-Extended …) worden geweerd. AI-zoekmachines die naar de site verwijzen blijven altijd welkom.',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site-instellingen' }) },
});
