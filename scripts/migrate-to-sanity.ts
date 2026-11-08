// Eenmalige migratie: lagado-content/ (markdown + beelden) → Sanity.
// Herhaalbaar: vaste document-ID's (createOrReplace), beelden één keer per bestand (Sanity ontdubbelt op inhoud).
//
//   npm run migrate -- --dry-run     alleen valideren en tellen, niets uploaden
//   npm run migrate                  alles naar de dataset uit .env (PUBLIC_SANITY_DATASET)
//
// Token: SANITY_API_WRITE_TOKEN (rol Editor), alleen lokaal. Nooit in Netlify; na de migratie intrekken.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { markdownToPortableText } from '@portabletext/markdown';
import { createClient } from '@sanity/client';
import { parse as parseYaml } from 'yaml';
import { contactSchema, pageSchema, projectSchema, settingsSchema, type Block } from './markdown-schema';

const DRY = process.argv.includes('--dry-run');
const ROOT = path.resolve(import.meta.dirname, '../lagado-content');

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// ── Hulpfuncties ──────────────────────────────────────────
type Doc = Record<string, unknown> & { _id: string; _type: string };
type Scope = { project?: string };

const stats = { beelden: 0, bestanden: 0, documenten: 0, waarschuwingen: [] as string[] };
const warn = (msg: string) => stats.waarschuwingen.push(msg);

/** Vaste `_key` op basis van de plek in het document, zodat een tweede run niets verandert. */
const keyFor = (...parts: (string | number)[]) => createHash('sha1').update(parts.join('/')).digest('hex').slice(0, 12);

/** Zet `_key` op elk object in een array (recursief). Strings en getallen krijgen geen key. */
function withKeys(value: unknown, trail = 'root'): unknown {
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      item && typeof item === 'object' && !Array.isArray(item)
        ? { _key: (item as { _key?: string })._key ?? keyFor(trail, i), ...(withKeys(item, `${trail}/${i}`) as object) }
        : withKeys(item, `${trail}/${i}`),
    );
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withKeys(v, `${trail}.${k}`)]));
  }
  return value;
}

/** Laat lege waarden weg: in Sanity is "niet ingevuld" gewoon afwezig. */
function compact<T>(value: T): T {
  if (Array.isArray(value)) return value.map(compact).filter((v) => v !== undefined) as T;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([k, v]) => [k, compact(v)] as const)
      .filter(([, v]) => v !== undefined && v !== null && v !== '' && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0));
    return Object.fromEntries(entries) as T;
  }
  return value;
}

const jaar = (n: number | undefined) => (n && n > 0 ? n : undefined);

function readFrontmatter(file: string): unknown {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`Geen frontmatter in ${file}`);
  return parseYaml(m[1]);
}

/** Markdown → Portable Text met vaste keys. Leeg = undefined. */
function pt(markdown: string | undefined, trail: string) {
  const md = markdown?.trim();
  if (!md || md === '""') return undefined;
  const blocks = markdownToPortableText(md) as Record<string, unknown>[];
  return blocks.map((b, i) => {
    const k = keyFor(trail, 'pt', i);
    const markDefs = (b.markDefs as { _key: string }[] | undefined) ?? [];
    const remap = new Map(markDefs.map((d, j) => [d._key, keyFor(trail, 'pt', i, 'mark', j)]));
    return {
      ...b,
      _key: k,
      markDefs: markDefs.map((d) => ({ ...d, _key: remap.get(d._key)! })),
      children: (b.children as { marks?: string[] }[]).map((c, j) => ({
        ...c,
        _key: keyFor(trail, 'pt', i, j),
        marks: (c.marks ?? []).map((mk) => remap.get(mk) ?? mk),
      })),
    };
  });
}

// ── Assets ────────────────────────────────────────────────
const assetCache = new Map<string, Promise<string>>();

function upload(kind: 'image' | 'file', relPath: string): Promise<string> {
  const abs = path.join(ROOT, relPath);
  if (!existsSync(abs)) throw new Error(`Bestand niet gevonden: lagado-content/${relPath}`);
  const cacheKey = `${kind}:${relPath}`;
  if (!assetCache.has(cacheKey)) {
    if (kind === 'image') stats.beelden++;
    else stats.bestanden++;
    assetCache.set(
      cacheKey,
      DRY
        ? Promise.resolve(`dry-${kind}-${keyFor(relPath)}`)
        : client.assets.upload(kind, readFileSync(abs), { filename: path.basename(abs) }).then((a) => a._id),
    );
  }
  return assetCache.get(cacheKey)!;
}

/** Pad zoals images.ts het oplost: in een project een bestandsnaam, op pagina's een pad vanaf lagado-content/. */
const imagePath = (scope: Scope, src: string, project?: string) => {
  const slug = project || scope.project;
  return slug ? `projecten/images/${slug}/${src}` : src;
};

async function beeld(
  scope: Scope,
  img: { src?: string; alt?: string; caption?: string } | undefined,
  opts: { project?: string; decoratief?: boolean } = {},
) {
  if (!img?.src) return undefined;
  const ref = await upload('image', imagePath(scope, img.src, opts.project));
  return {
    _type: 'beeld',
    asset: { _type: 'reference', _ref: ref },
    alt: img.alt,
    caption: img.caption,
    ...(opts.decoratief ? { decoratief: true } : {}),
  };
}

async function bestand(relPath: string | undefined) {
  if (!relPath) return undefined;
  return { _type: 'file', asset: { _type: 'reference', _ref: await upload('file', relPath) } };
}

// ── References naar projecten ─────────────────────────────
let projectSlugs = new Set<string>();
const projectId = (slug: string) => `project.${slug}`;
function projectRef(slug: string | undefined, waar: string) {
  if (!slug) return undefined;
  if (!projectSlugs.has(slug)) {
    warn(`${waar}: project "${slug}" bestaat niet, link weggelaten`);
    return undefined;
  }
  return { _type: 'reference', _ref: projectId(slug) };
}

// ── Gedeelde objecten ─────────────────────────────────────
const link = (l: { label?: string; href?: string } | undefined) => (l ? { _type: 'link', label: l.label, href: l.href } : undefined);
const seo = (s: { titel?: string; beschrijving?: string } | undefined) => (s ? { _type: 'seo', titel: s.titel, beschrijving: s.beschrijving } : undefined);
const persoon = (p: { naam: string; url?: string }) => ({ _type: 'persoon', naam: p.naam, url: p.url });
const downloadItem = async (d: { label: string; bestand: string }) => ({ _type: 'downloadItem', label: d.label, bestand: await bestand(d.bestand) });

// ── Blokken ───────────────────────────────────────────────
async function block(b: Block, scope: Scope, trail: string): Promise<Record<string, unknown>> {
  switch (b.type) {
    case 'hero':
      return {
        _type: 'hero',
        kop: b.kop,
        kopWissel: b.kopWissel,
        subkop: b.subkop,
        subkopWissel: b.subkopWissel,
        link: link(b.link),
        adres: b.adres,
        tekst: pt(b.tekst, `${trail}.tekst`),
        beelden: await Promise.all(b.beelden.map((i) => beeld(scope, i, { project: i.project }))),
      };
    case 'text':
      return { _type: 'textBlock', kop: b.kop, niveau: b.niveau, tekst: pt(b.tekst, `${trail}.tekst`) };
    case 'image':
      return { _type: 'imageBlock', beeld: await beeld(scope, b), breedte: b.breedte };
    case 'gallery':
      return { _type: 'gallery', kolommen: b.kolommen, images: await Promise.all(b.images.map((i) => beeld(scope, i))) };
    case 'columns':
      return { _type: 'columns', kop: b.kop, tekst: pt(b.tekst, `${trail}.tekst`), image: await beeld(scope, b.image), beeldPositie: b.beeldPositie };
    case 'quote':
      return { _type: 'quote', tekst: b.tekst, naam: b.naam, rol: b.rol };
    case 'video':
      // Poster heeft geen eigen alt: de knop draagt de titel, het beeld is decoratief.
      return { _type: 'video', url: b.url, titel: b.titel, caption: b.caption, poster: await beeld(scope, b.poster ? { src: b.poster } : undefined, { decoratief: true }) };
    case 'colors':
      return { _type: 'colors', kleuren: b.kleuren.map((k) => ({ _type: 'kleur', ...k })) };
    case 'beforeAfter':
      return { _type: 'beforeAfter', voor: await beeld(scope, b.voor), na: await beeld(scope, b.na), caption: b.caption };
    case 'projectGrid':
      return {
        _type: 'projectGrid',
        kop: b.kop,
        featured: b.featured,
        slugs: b.slugs?.map((s) => projectRef(s, trail)),
        filter: b.filter && Object.entries(b.filter).map(([veld, waarde]) => ({ _type: 'filterRegel', veld, waarde })),
        limit: b.limit,
        meer: b.meer,
        linkNaarOverzicht: link(b.linkNaarOverzicht),
        links: b.links.map(link),
      };
    case 'statement':
      return { _type: 'statement', tekst: b.tekst };
    case 'team':
      return {
        _type: 'team',
        kop: b.kop,
        personen: await Promise.all(
          b.personen.map(async (p, i) => ({
            _type: 'teamlid',
            naam: p.naam,
            rol: p.rol,
            foto: await beeld(scope, p.foto),
            bio: pt(p.bio, `${trail}.personen.${i}.bio`),
            linkedin: p.linkedin,
          })),
        ),
      };
    case 'list':
      return {
        _type: 'list',
        soort: b.soort,
        kop: b.kop,
        items: b.items.map((item) => ({ _type: 'listItem', ...item, jaar: jaar(item.jaar), project: projectRef(item.project, trail) })),
        toonUit: b.toonUit,
        limit: b.limit,
        zichtbaar: b.zichtbaar,
      };
    case 'cta':
      return { _type: 'cta', tekst: b.tekst, label: b.label, href: b.href };
    case 'services':
      return {
        _type: 'services',
        kop: b.kop,
        anker: b.anker,
        vormen: b.vormen,
        items: b.items.map((item, i) => ({ _type: 'dienst', titel: item.titel, tekst: pt(item.tekst, `${trail}.items.${i}`) })),
      };
    case 'logos':
      return {
        _type: 'logos',
        kop: b.kop,
        items: await Promise.all(b.items.map(async (item) => ({ _type: 'logoItem', naam: item.naam, logo: await beeld(scope, item.logo), href: item.href }))),
      };
    case 'downloads':
      return { _type: 'downloads', kop: b.kop, items: await Promise.all(b.items.map(downloadItem)) };
  }
}

const blocks = (list: Block[], scope: Scope, docId: string) => Promise.all(list.map((b, i) => block(b, scope, `${docId}.blocks.${i}`)));

// ── Documenten ────────────────────────────────────────────
/**
 * Een concept mag onvolledig zijn (Sanity valideert pas bij publiceren). Alleen het ontbrekende
 * opleverjaar wordt toegestaan; andere fouten blijven fouten.
 */
function parseConcept(raw: Record<string, unknown>, slug: string) {
  const res = projectSchema.safeParse(raw);
  if (res.success) return res.data;
  if (!res.error.issues.every((i) => i.path.join('.') === 'jaarOplevering')) throw res.error;
  warn(`concept ${slug}: jaarOplevering ontbreekt (moet erin vóór publiceren)`);
  return { ...projectSchema.parse({ ...raw, jaarOplevering: 1 }), jaarOplevering: undefined };
}

/** `draft`: verborgen projecten (`_naam.md`) worden een Sanity-draft, zichtbaar in de Studio maar niet live. */
async function projectDoc(slug: string, draft = false): Promise<Doc> {
  const raw = readFrontmatter(path.join(ROOT, 'projecten', `${draft ? '_' : ''}${slug}.md`)) as Record<string, unknown>;
  const p = draft ? parseConcept(raw, slug) : projectSchema.parse(raw);
  const scope = { project: slug };
  const id = `${draft ? 'drafts.' : ''}${projectId(slug)}`;
  return {
    _id: id,
    _type: 'project',
    title: p.title,
    slug: { _type: 'slug', current: slug },
    tagline: p.tagline,
    vraag: p.vraag,
    intro: pt(p.intro, `${id}.intro`),
    blocks: await blocks(p.blocks, scope, id),
    type: p.type,
    vorm: p.vorm,
    kleuren: p.kleuren,
    status: p.status,
    schaal: p.schaal ?? undefined,
    opgave: p.opgave,
    materialen: p.materialen,
    prijsklasse: p.prijsklasse ?? undefined,
    locatie: p.locatie,
    omvang: p.omvang || undefined,
    opdrachtgeverType: p.opdrachtgeverType,
    opdrachtgever: p.opdrachtgever,
    bouwteam: p.bouwteam.map(persoon),
    fotografie: p.fotografie.map(persoon),
    jaarOpdracht: jaar(p.jaarOpdracht),
    jaarOplevering: jaar(p.jaarOplevering),
    programma: p.programma,
    accentkleur: p.accentkleur,
    kleurpalet: p.kleurpalet.map((k) => ({ _type: 'kleur', ...k })),
    hero: await beeld(scope, p.hero),
    featured: p.featured,
    homepageGrootte: p.homepageGrootte,
    kaartvorm: p.kaartvorm,
    volgorde: p.volgorde,
    gerelateerd: p.gerelateerd.map((s) => projectRef(s, `${id}.gerelateerd`)),
    credits: p.credits.map((c) => ({ _type: 'credit', rol: c.rol, personen: c.personen.filter((x) => x.naam).map(persoon) })),
    pers: p.pers.map((x) => ({ _type: 'persItem', ...x, jaar: jaar(x.jaar), project: projectRef(x.project, `${id}.pers`) })),
    awards: p.awards.map((x) => ({ _type: 'awardItem', ...x, jaar: jaar(x.jaar), project: projectRef(x.project, `${id}.awards`) })),
    pressKit: await bestand(p.pressKit),
    seo: seo(p.seo),
  };
}

async function pageDoc(name: 'home' | 'bureau' | 'privacy'): Promise<Doc> {
  const p = pageSchema.parse(readFrontmatter(path.join(ROOT, `${name}.md`)));
  const id = `page.${name}`;
  return { _id: id, _type: 'page', title: p.title, intro: pt(p.intro, `${id}.intro`), blocks: await blocks(p.blocks, {}, id), seo: seo(p.seo) };
}

async function contactDoc(): Promise<Doc> {
  const c = contactSchema.parse(readFrontmatter(path.join(ROOT, 'contact.md')));
  return {
    _id: 'contact',
    _type: 'contact',
    title: c.title,
    intro: pt(c.intro, 'contact.intro'),
    tekst: pt(c.tekst, 'contact.tekst'),
    sfeerbeeld: await beeld({}, c.sfeerbeeld),
    contactpersoon: c.contactpersoon,
    bio: c.bio && { kop: c.bio.kop, foto: await beeld({}, c.bio.foto), quote: pt(c.bio.quote, 'contact.bio.quote') },
    stage: c.stage && { kop: c.stage.kop, tekst: pt(c.stage.tekst, 'contact.stage.tekst') },
    email: c.email,
    telefoon: c.telefoon,
    adres: c.adres,
    kaart: c.kaart && { link: c.kaart.link, statischBeeld: await beeld({}, c.kaart.statischBeeld) },
    bedrijf: { ...c.bedrijf, lidmaatschappen: c.bedrijf.lidmaatschappen.map((l) => ({ _type: 'lidmaatschap', ...l })) },
    social: c.social.map(link),
    downloads: await Promise.all(c.downloads.map(downloadItem)),
    seo: seo(c.seo),
  };
}

async function settingsDocs(): Promise<Doc[]> {
  const s = settingsSchema.parse(readFrontmatter(path.join(ROOT, 'site.md')));
  return [
    {
      _id: 'siteSettings',
      _type: 'siteSettings',
      siteNaam: s.siteNaam,
      payoff: s.payoff,
      taal: s.taal,
      url: s.url,
      analytics: s.analytics,
      projecten: { intro: pt(s.projecten.intro, 'siteSettings.projecten.intro'), toonPrijsfilter: s.projecten.toonPrijsfilter },
      seo: { titelPatroon: s.seo.titelPatroon, beschrijving: s.seo.beschrijving, deelAfbeelding: await beeld({}, s.seo.deelAfbeelding as { src?: string; alt?: string }) },
    },
    {
      _id: 'navigatie',
      _type: 'navigatie',
      navigatie: s.navigatie.map(link),
      footer: { tekst: s.footer.tekst, links: s.footer.links.map(link), privacy: s.footer.privacy },
    },
  ];
}

// ── Uitvoeren ─────────────────────────────────────────────
async function main() {
  if (!DRY && !process.env.SANITY_API_WRITE_TOKEN) throw new Error('SANITY_API_WRITE_TOKEN ontbreekt (rol Editor, alleen lokaal).');

  const bestanden = readdirSync(path.join(ROOT, 'projecten')).filter((f) => f.endsWith('.md') && f !== '_template.md');
  const slugs = bestanden.filter((f) => !f.startsWith('_')).map((f) => f.replace(/\.md$/, ''));
  const concepten = bestanden.filter((f) => f.startsWith('_')).map((f) => f.replace(/^_|\.md$/g, ''));
  projectSlugs = new Set(slugs);

  console.log(`${DRY ? '[dry-run] ' : ''}Dataset ${client.config().dataset}: ${slugs.length} projecten, ${concepten.length} concepten + pagina's`);

  const docs: Doc[] = [
    ...(await settingsDocs()),
    await contactDoc(),
    ...(await Promise.all((['home', 'bureau', 'privacy'] as const).map(pageDoc))),
  ];
  // Projecten na elkaar: beperkt het aantal gelijktijdige uploads.
  for (const slug of slugs) {
    docs.push(await projectDoc(slug));
    process.stdout.write('.');
  }
  for (const slug of concepten) docs.push(await projectDoc(slug, true));
  process.stdout.write('\n');

  const prepared = docs.map((d) => compact(withKeys(d, d._id)) as Doc);
  stats.documenten = prepared.length;

  if (!DRY) {
    const tx = client.transaction();
    for (const d of prepared) tx.createOrReplace(d);
    await tx.commit({ visibility: 'async' });
  }

  console.log(`Documenten: ${stats.documenten} · beelden: ${stats.beelden} · bestanden: ${stats.bestanden}`);
  if (stats.waarschuwingen.length) console.log(`Waarschuwingen:\n- ${[...new Set(stats.waarschuwingen)].join('\n- ')}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
