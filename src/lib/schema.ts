// Contentmodel zoals de site het gebruikt. Bron is Sanity (schema/); de queries in src/lib/sanity/queries.ts
// leveren precies deze vorm, en Zod controleert dat bij elk request. Wijzig eerst schema/, dan dit bestand.
import { z } from 'astro/zod';

// ── Waardenlijsten (src/lib/waarden.ts, gedeeld met de Studio) ──
import {
  BREEDTE,
  HOMEPAGE_GROOTTE,
  KAARTVORM,
  KLEUR,
  MATERIAAL,
  OPDRACHTGEVER_TYPE,
  OPGAVE,
  PRIJSKLASSE,
  PROGRAMMA,
  RESULTAAT,
  SCHAAL,
  STATUS,
  TYPE,
  VORM,
} from './waarden';
export * from './waarden';

// ── Bouwstenen voor velden ─────────────────────────────────
const text = z.string().optional();
/** Invulplek: verplicht in de Studio, maar nog leeg mag (Victor vult later in). Leeg = `""`, componenten slaan het over. */
const invulplek = z.string().default('');
const href = z.string().optional();

/** Sanity-beeld: asset met afmetingen, plus crop en hotspot uit de Studio. */
const fractie = z.number().nullable().optional();
export const sanityImage = z.object({
  asset: z.object({
    _id: z.string(),
    url: z.string(),
    metadata: z.object({
      dimensions: z.object({ width: z.number(), height: z.number() }),
    }),
  }),
  crop: z.object({ top: fractie, bottom: fractie, left: fractie, right: fractie }).nullable().optional(),
  hotspot: z.object({ x: fractie, y: fractie, width: fractie, height: fractie }).nullable().optional(),
});

/** Portable Text (alinea's, vet, cursief, links, lijstjes). Leeg = []. */
export const richText = z.array(z.looseObject({ _type: z.string(), _key: z.string().optional() }));
const rich = richText.optional();

/** Beeld: `alt` is verplicht (WCAG 1.1.1), `""` betekent decoratief. */
export const imageRef = z.object({
  src: sanityImage,
  alt: z.string(),
  caption: text,
});

const link = z.object({ label: z.string(), href: invulplek });
/** SEO per document. `noindex`: geen Google, sitemap, llms.txt of AI-crawlers. */
const seo = z
  .object({ titel: text, beschrijving: text, noindex: z.boolean().optional() })
  .optional();

const persItem = z.object({
  jaar: z.number().optional(),
  medium: text,
  titel: text,
  url: text,
  project: text,
});
const awardItem = z.object({
  jaar: z.number().optional(),
  naam: text,
  resultaat: z.enum(RESULTAAT).optional(),
  project: text,
});

/** Item in een list-blok: pers- én award-velden (welke getoond worden hangt af van `soort`). */
const listItem = persItem.extend(awardItem.shape);

// ── Blokken ────────────────────────────────────────────────
const heroBlock = z.object({
  type: z.literal('hero'),
  kop: z.string(),
  /** Woorden die na `kop` wisselen; de eerste staat er zonder animatie. */
  kopWissel: z.array(z.string()).default([]),
  subkop: text,
  subkopWissel: z.array(z.string()).default([]),
  link: link.optional(),
  /** Adres uit contact.md als kolom naast kop en subkop. */
  adres: z.boolean().default(false),
  /** Korte tekst als laatste kolom, bv. de herkomst van de naam. */
  tekst: rich,
  /** 0–5 beelden; leeg = hero zonder beeld. */
  beelden: z.array(imageRef).max(5).default([]),
});

const textBlock = z.object({
  type: z.literal('text'),
  kop: text,
  niveau: z.union([z.literal(2), z.literal(3)]).optional(),
  tekst: richText.default([]),
});

const imageBlock = imageRef.extend({
  type: z.literal('image'),
  breedte: z.enum(BREEDTE).default('content'),
});

const galleryBlock = z.object({
  type: z.literal('gallery'),
  kolommen: z.union([z.literal(2), z.literal(3)]).default(3),
  images: z.array(imageRef),
});

const columnsBlock = z.object({
  type: z.literal('columns'),
  kop: text,
  intro: richText.default([]),
  tekst: richText.default([]),
  kolommen: z.boolean().default(false),
  image: imageRef.optional(),
  beeldPositie: z.enum(['links', 'rechts']).default('rechts'),
});

const quoteBlock = z.object({
  type: z.literal('quote'),
  tekst: z.string(),
  naam: z.string(),
  rol: text,
});

const videoBlock = z.object({
  type: z.literal('video'),
  url: z.string(),
  titel: z.string(),
  poster: sanityImage.optional(),
  caption: text,
  /** `auto` = uit de video zelf (Vimeo oEmbed, YouTube Shorts 9:16), anders 16:9. */
  verhouding: z.enum(['auto', '16:9', '21:9', '4:3', '1:1', '9:16']).default('auto'),
});

const kleur = z.object({ label: z.string(), hex: invulplek });
const colorsBlock = z.object({
  type: z.literal('colors'),
  kleuren: z.array(kleur).default([]),
});

const beforeAfterBlock = z.object({
  type: z.literal('beforeAfter'),
  voor: imageRef.pick({ src: true, alt: true }),
  na: imageRef.pick({ src: true, alt: true }),
  caption: text,
});

const projectGridBlock = z.object({
  type: z.literal('projectGrid'),
  kop: text,
  slugs: z.array(z.string()).optional(),
  filter: z.record(z.string(), z.string()).optional(),
  /** Alleen projecten met `featured: true`. */
  featured: z.boolean().optional(),
  /** Zoveel kaarten eerst; de rest van de selectie komt per `limit` via "Meer projecten". */
  limit: z.number().optional(),
  /** `false`: vast aantal (`limit`), geen "Meer projecten"; het raster wordt sluitend gemaakt. */
  meer: z.boolean().default(true),
  linkNaarOverzicht: link.optional(),
  /** Extra links onder het raster, naast linkNaarOverzicht (bv. naar de diensten op /over). */
  links: z.array(link).default([]),
});

/** Grote, vette zin (mantra) over de breedte van de pagina. */
const statementBlock = z.object({
  type: z.literal('statement'),
  tekst: z.string(),
});

const teamBlock = z.object({
  type: z.literal('team'),
  kop: text,
  personen: z.array(
    z.object({
      naam: z.string(),
      rol: text,
      foto: imageRef.pick({ src: true, alt: true }).optional(),
      bio: rich,
      linkedin: text,
    }),
  ),
});

const listBlock = z.object({
  type: z.literal('list'),
  soort: z.enum(['pers', 'awards']),
  kop: text,
  intro: richText.default([]),
  items: z.array(listItem).default([]),
  /** Haal items uit een andere pagina (bv. `bureau`) in plaats van `items`. */
  /** Slug van de pagina waar de items vandaan komen. */
  toonUit: text,
  limit: z.number().optional(),
  /** Zoveel items direct zichtbaar; de rest achter "Toon alles" (uitklap). */
  zichtbaar: z.number().optional(),
});

const ctaBlock = z.object({
  type: z.literal('cta'),
  tekst: z.string(),
  label: z.string(),
  href: z.string(),
});

const servicesBlock = z.object({
  type: z.literal('services'),
  kop: text,
  /** Anker voor links, bv. `diensten` → /over#diensten. */
  anker: text,
  /** Tegels in de kaartvormen (recht, rond, schuin om en om) en accentkleuren. */
  vormen: z.boolean().default(false),
  /** raster: tegels (zoals voorheen). beelden: strook met beeld per dienst. vormen: donkere vormen over `achtergrond`. */
  weergave: z.enum(['raster', 'beelden', 'vormen']).default('raster'),
  achtergrond: imageRef.optional(),
  items: z.array(z.object({ titel: z.string(), tekst: rich, beeld: imageRef.optional() })).default([]),
});

const logosBlock = z.object({
  type: z.literal('logos'),
  kop: text,
  items: z
    .array(z.object({ naam: z.string(), logo: imageRef.pick({ src: true, alt: true }).optional(), href }))
    .default([]),
});

/** `bestand` is de URL van het bestand in Sanity. */
const downloadItem = z.object({ label: z.string(), bestand: invulplek });
const downloadsBlock = z.object({
  type: z.literal('downloads'),
  kop: text,
  items: z.array(downloadItem).default([]),
});

/** Gegevens komen uit het Contact-document, niet uit het blok. */
const contactgegevensBlock = z.object({
  type: z.literal('contactgegevens'),
  kop: text,
});

export const block = z.discriminatedUnion('type', [
  heroBlock,
  textBlock,
  imageBlock,
  galleryBlock,
  columnsBlock,
  quoteBlock,
  videoBlock,
  colorsBlock,
  beforeAfterBlock,
  projectGridBlock,
  statementBlock,
  teamBlock,
  listBlock,
  ctaBlock,
  servicesBlock,
  logosBlock,
  downloadsBlock,
  contactgegevensBlock,
]);
export type Block = z.infer<typeof block>;
export type BlockOf<T extends Block['type']> = Extract<Block, { type: T }>;
export type ImageRef = z.infer<typeof imageRef>;
export type SanityImage = z.infer<typeof sanityImage>;
export type RichText = z.infer<typeof richText>;
export type PersItem = z.infer<typeof persItem>;
export type AwardItem = z.infer<typeof awardItem>;
export type ListItem = z.infer<typeof listItem>;

// ── Documenten ─────────────────────────────────────────────
export const settingsSchema = z.object({
  siteNaam: z.string(),
  payoff: z.string(),
  taal: z.string().default('nl'),
  url: z.url(),
  navigatie: z.array(link).min(1).max(5),
  /** Vier kolommen onder het logo (de eerste twee breed). Een link naar #cookies is de knop Cookie-instellingen. */
  footer: z.object({ kolommen: z.array(z.object({ tekst: richText.default([]) })).max(4).default([]) }).default({ kolommen: [] }),
  seo: z.object({
    titelPatroon: z.string().default('%s'),
    beschrijving: text,
    deelAfbeelding: imageRef.pick({ src: true, alt: true }).optional(),
    /** Bovenaan /llms.txt. */
    llmsIntro: text,
    /** Uit = trainingscrawlers geweerd in robots.txt. */
    aiTraining: z.boolean().default(true),
    /** Uit = ook AI-zoekmachines (ChatGPT, Claude, Perplexity) geweerd: de site verschijnt niet meer in hun antwoorden. */
    aiZoeken: z.boolean().default(true),
  }),
  /** Statistiek: cookieloos (Umami, Plausible) zonder banner, Google Analytics pas na toestemming. */
  analytics: z
    .object({
      dienst: z.enum(['geen', 'umami', 'plausible', 'google']).default('geen'),
      umamiId: text,
      umamiScript: text,
      plausibleDomein: text,
      plausibleScript: text,
      googleId: text,
    })
    .default({ dienst: 'geen' }),
});

export const pageSchema = z.object({
  title: z.string(),
  /** Leeg bij de home (die staat op `/`). */
  slug: text,
  /** `blokken`: bouwstenen. `tekst`: één lopende tekst met koppen (`inhoud`), zoals Privacy. */
  template: z.enum(['blokken', 'tekst']).default('blokken'),
  intro: rich,
  /** Breed beeld onder de paginakop (template `blokken`). */
  beeld: imageRef.optional(),
  seo,
  blocks: z.array(block).default([]),
  inhoud: richText.default([]),
  /** Tekstpagina: knop "Cookie-instellingen aanpassen" onderaan (Privacy). */
  cookieKnop: z.boolean().default(false),
});

/** /projecten: intro, filterinstellingen en SEO (document met vaste ID `projecten`). */
export const projectenPaginaSchema = z.object({
  title: z.string().default('Projecten'),
  intro: rich,
  toonPrijsfilter: z.boolean().default(false),
  seo,
});

export const contactSchema = z.object({
  title: z.string(),
  intro: rich,
  sfeerbeeld: imageRef.optional(),
  blocks: z.array(block).default([]),
  contactpersoon: z.object({ naam: z.string(), rol: text }).optional(),
  email: invulplek,
  telefoon: text,
  adres: z.object({
    naam: text,
    straat: z.string(),
    postcode: text,
    plaats: z.string(),
    land: z.string().default('NL'),
    bezoek: text,
  }),
  kaart: z
    .object({ link: text })
    .optional(),
  bedrijf: z.object({
    kvk: text,
    btw: text,
    architectenregister: text,
    bank: text,
    lidmaatschappen: z.array(z.object({ label: z.string(), href })).default([]),
  }),
  social: z.array(link).default([]),
  downloads: z.array(downloadItem).default([]),
  seo,
});

const persoon = z.object({ naam: z.string(), url: text });

// "jaarOplevering verplicht als status = af" bewaakt de Studio bij publiceren (schema/documents/project.ts);
// hier niet, zodat een onvolledige draft in de Presentation tool toch te zien is.
export const projectSchema = z
  .object({
    // Identiteit
    title: z.string().min(1),
    tagline: z.string().min(1),
    /** De ontwerpvraag, groot bovenaan de projecttekst. Trigger voor bezoekers om hun eigen vraag te herkennen. */
    vraag: text,
    intro: richText.default([]),

    // Filters (volgorde zoals op /projecten); ook getoond in het factsheet
    type: z.enum(TYPE),
    vorm: z.array(z.enum(VORM)).default([]),
    kleuren: z.array(z.enum(KLEUR)).default([]),
    status: z.enum(STATUS),
    schaal: z.enum(SCHAAL).nullable().optional(),
    materialen: z.array(z.enum(MATERIAAL)).default([]),
    /** Soort opgave; filter onder "Verfijn tot op de millimeter". */
    opgave: z.array(z.enum(OPGAVE)).default([]),
    prijsklasse: z.enum(PRIJSKLASSE).nullable().optional(),

    // Projectgegevens (factsheet)
    locatie: z.object({ plaats: z.string().min(1), wijk: text }),
    /** Omvang in m². */
    omvang: z.number().optional(),
    opdrachtgeverType: z.enum(OPDRACHTGEVER_TYPE).optional(),
    opdrachtgever: text,
    bouwteam: z.array(persoon).default([]),
    fotografie: z.array(persoon).default([]),
    jaarOpdracht: z.number().optional(),
    jaarOplevering: z.number().optional(),
    /** Feit voor de projectkaart, geen filter en niet in het factsheet. */
    programma: z.enum(PROGRAMMA),

    // Kleur, beeld en weergave
    accentkleur: text,
    kleurpalet: z.array(kleur).default([]),

    hero: imageRef.pick({ src: true, alt: true }),
    featured: z.boolean().default(false),
    /** Kaartgrootte op de homepage: klein, hoog, toren, breed of groot. */
    homepageGrootte: z.enum(HOMEPAGE_GROOTTE).default('klein'),
    kaartvorm: z.enum(KAARTVORM).optional(),
    volgorde: z.number().default(0),
    gerelateerd: z.array(z.string()).max(3).default([]),

    // Credits, pers en awards (onderaan de pagina)
    credits: z.array(z.object({ rol: z.string(), personen: z.array(persoon) })).default([]),
    pers: z.array(persItem).default([]),
    awards: z.array(awardItem).default([]),
    /** URL van het bestand in Sanity. */
    pressKit: text,

    seo,
    blocks: z.array(block).default([]),
  });

export type Settings = z.infer<typeof settingsSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type ProjectenPagina = z.infer<typeof projectenPaginaSchema>;
export type Project = z.infer<typeof projectSchema> & { slug: string };
