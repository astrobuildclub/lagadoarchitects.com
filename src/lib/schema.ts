// Contentmodel. Veldnamen en waardenlijsten volgen lagado-content/README.md
// en worden later 1-op-1 het Sanity-schema. Wijzig eerst de README, dan dit bestand.
import { z } from 'astro/zod';

// ── Waardenlijsten ─────────────────────────────────────────
// Filters op /projecten (Victors eigen woorden, zie README).
export const TYPE = ['thuiskomen', 'de-hort-op'] as const;
export const VORM = ['recht', 'rond', 'schuin'] as const;
export const KLEUR = ['rood', 'oranje', 'geel', 'groen', 'blauw', 'paars', 'roze', 'wit', 'zwart', 'grijs'] as const;
export const STATUS = ['af', 'bijna', 'opgetekend'] as const;
export const SCHAAL = ['stoel', 'kamer', 'huis', 'plein'] as const;
export const OPGAVE = ['interieur', 'verbouw', 'nieuwbouw', 'landschap'] as const;
export const MATERIAAL = ['hout', 'steen', 'beton', 'glas', 'tegels', 'metaal'] as const;

export const PROGRAMMA = ['woning', 'winkel', 'horeca', 'kantoor', 'publiek', 'openbare-ruimte', 'meubel'] as const;
export const OPDRACHTGEVER_TYPE = ['particulier', 'zakelijk', 'publiek'] as const;
export const PRIJSKLASSE = ['laag', 'midden', 'hoog'] as const;
export const BREEDTE = ['content', 'popout', 'feature', 'full'] as const;
/** Kaarthoogte op de homepage (projectGrid): hoog, toren en groot beslaan 2 rijen, de rest 1 (Figma 447:2103). */
export const HOMEPAGE_GROOTTE = ['mini', 'klein', 'hoog', 'toren', 'breed', 'groot', 'lang'] as const;
/** Vorm van de kaart in het homeraster; leeg = afgeleid van de eerste `vorm`. */
export const KAARTVORM = ['ovaal', 'afgerond', 'zacht', 'recht', 'schuin'] as const;

// ── Bouwstenen voor velden ─────────────────────────────────
const text = z.string().optional();
const href = z.string().optional();

/** Beeld: `alt` is verplicht (WCAG 1.1.1), `""` betekent decoratief. */
export const imageRef = z.object({
  src: z.string(),
  alt: z.string(),
  caption: text,
});

const link = z.object({ label: z.string(), href: z.string() });
const seo = z
  .object({ titel: text, beschrijving: text })
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
  resultaat: z.enum(['winnaar', 'genomineerd', 'finalist']).optional(),
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
  /** Korte tekst (markdown) als laatste kolom, bv. de herkomst van de naam. */
  tekst: text,
  /** 0–5 beelden; leeg = hero zonder beeld. */
  beelden: z.array(imageRef.extend({ project: text })).max(5).default([]),
});

const textBlock = z.object({
  type: z.literal('text'),
  kop: text,
  niveau: z.union([z.literal(2), z.literal(3)]).optional(),
  tekst: z.string(),
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
  tekst: z.string(),
  image: imageRef,
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
  poster: text,
  caption: text,
});

const kleur = z.object({ label: z.string(), hex: z.string() });
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
      bio: text,
      linkedin: text,
    }),
  ),
});

const listBlock = z.object({
  type: z.literal('list'),
  soort: z.enum(['pers', 'awards']),
  kop: text,
  items: z.array(listItem).default([]),
  /** Haal items uit een andere pagina (bv. `bureau`) in plaats van `items`. */
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
  items: z.array(z.object({ titel: z.string(), tekst: text })).default([]),
});

const logosBlock = z.object({
  type: z.literal('logos'),
  kop: text,
  items: z
    .array(z.object({ naam: z.string(), logo: imageRef.pick({ src: true, alt: true }).optional(), href }))
    .default([]),
});

const downloadItem = z.object({ label: z.string(), bestand: z.string() });
const downloadsBlock = z.object({
  type: z.literal('downloads'),
  kop: text,
  items: z.array(downloadItem).default([]),
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
]);
export type Block = z.infer<typeof block>;
export type BlockOf<T extends Block['type']> = Extract<Block, { type: T }>;
export type ImageRef = z.infer<typeof imageRef>;
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
  footer: z.object({
    tekst: text,
    links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    privacy: z.string(),
    /** Uitsmijter onderaan de footer (Gulliver). */
  }),
  seo: z.object({
    titelPatroon: z.string().default('%s'),
    beschrijving: text,
    deelAfbeelding: z.object({ src: z.string(), alt: z.string() }).partial().optional(),
  }),
  projecten: z
    .object({ intro: text, toonPrijsfilter: z.boolean().default(false) })
    .default({ toonPrijsfilter: false }),
  analytics: text,
});

export const pageSchema = z.object({
  title: z.string(),
  intro: text,
  seo,
  blocks: z.array(block).default([]),
});

export const contactSchema = z.object({
  title: z.string(),
  intro: text,
  tekst: text,
  sfeerbeeld: z.object({ src: z.string(), alt: z.string() }).optional(),
  contactpersoon: z.object({ naam: z.string(), rol: text }).optional(),
  /** Portret met quote van de oprichter. `quote` is markdown (links mogen). */
  bio: z.object({ kop: text, foto: z.object({ src: z.string(), alt: z.string() }).optional(), quote: z.string() }).optional(),
  /** Oproep voor stagiairs. `tekst` is markdown. */
  stage: z.object({ kop: z.string(), tekst: z.string() }).optional(),
  email: z.string(),
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
    .object({ link: text, statischBeeld: z.object({ src: z.string(), alt: z.string() }).optional() })
    .optional(),
  bedrijf: z.object({
    kvk: text,
    btw: text,
    architectenregister: text,
    bank: text,
    lidmaatschappen: z.array(z.object({ label: z.string(), href })).default([]),
  }),
  social: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
  downloads: z.array(downloadItem).default([]),
  seo,
});

const persoon = z.object({ naam: z.string(), url: text });

export const projectSchema = z
  .object({
    // Identiteit
    title: z.string().min(1),
    tagline: z.string().min(1),
    /** De ontwerpvraag, groot bovenaan de projecttekst. Trigger voor bezoekers om hun eigen vraag te herkennen. */
    vraag: text,
    intro: z.string().min(1),

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
    pressKit: text,

    seo,
    blocks: z.array(block).default([]),
  })
  .refine((p) => p.status !== 'af' || !!p.jaarOplevering, {
    message: 'jaarOplevering is verplicht als status = af',
    path: ['jaarOplevering'],
  });

export type Settings = z.infer<typeof settingsSchema>;
export type Page = z.infer<typeof pageSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Project = z.infer<typeof projectSchema> & { slug: string };
