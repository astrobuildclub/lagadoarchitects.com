// De enige plek die content leest. Bron: Sanity, via loadQuery() (published, of drafts in de Presentation tool).
// De queries leveren de vorm uit schema.ts; Zod controleert die bij elk request, zodat componenten
// en pagina's niets van Sanity hoeven te weten.
import { stegaClean } from '@sanity/client/stega';
import { loadQuery } from './sanity/load-query';
import { parse } from './sanity/normalize';
import { CONTACT_QUERY, HOME_QUERY, PAGE_QUERY, PROJECTS_QUERY, SETTINGS_QUERY } from './sanity/queries';
import {
  contactSchema,
  pageSchema,
  projectSchema,
  settingsSchema,
  type Block,
  type Contact,
  type ListItem,
  type Page,
  type Project,
  type Settings,
} from './schema';

// ── Documenten ─────────────────────────────────────────────
export async function getSettings(): Promise<Settings> {
  const { data } = await loadQuery({ query: SETTINGS_QUERY });
  return parse(settingsSchema, data, 'Site-instellingen');
}

export async function getHome(): Promise<Page> {
  const { data } = await loadQuery({ query: HOME_QUERY });
  return parse(pageSchema, data, 'Home');
}

/** Pagina op `/<slug>`; `undefined` als die niet bestaat (dan 404). */
export async function getPage(slug: string): Promise<Page | undefined> {
  const { data } = await loadQuery({ query: PAGE_QUERY, params: { slug } });
  return data ? parse(pageSchema, data, `Pagina /${slug}`) : undefined;
}

export async function getContact(): Promise<Contact> {
  const { data } = await loadQuery({ query: CONTACT_QUERY });
  return parse(contactSchema, data, 'Contact');
}

/**
 * Alle projecten, op `volgorde` (laag = eerst), daarna op titel. Een project dat niet klopt met het model
 * (bv. een half ingevulde draft in de preview) wordt overgeslagen en gelogd, zodat de rest van de site blijft werken.
 */
export async function getProjects(): Promise<Project[]> {
  const { data } = await loadQuery<unknown[]>({ query: PROJECTS_QUERY });
  return (data ?? [])
    .flatMap((raw) => {
      const slug = (raw as { slug?: string }).slug ?? '?';
      try {
        return [{ ...parse(projectSchema, raw, `Project ${slug}`), slug: stegaClean(slug) }];
      } catch (err) {
        console.error(err instanceof Error ? err.message : err);
        return [];
      }
    })
    .sort((a, b) => a.volgorde - b.volgorde || a.title.localeCompare(b.title, 'nl'));
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}

/**
 * Selectie voor een projectGrid-blok: expliciete slugs (in die volgorde), `featured` of een filter.
 * Geeft de hele selectie terug; `limit` bepaalt in het blok hoeveel er eerst zichtbaar zijn.
 */
export async function selectProjects(opts: { slugs?: string[]; filter?: Record<string, string>; featured?: boolean }) {
  const all = (await getProjects()).filter((p) => !opts.featured || p.featured);
  const list = opts.slugs?.length
    ? opts.slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => !!p)
    : all.filter((p) =>
        Object.entries(opts.filter ?? {}).every(([k, v]) => {
          const value = (p as Record<string, unknown>)[k];
          return Array.isArray(value) ? value.includes(v) : String(value) === v;
        }),
      );
  return list;
}

/** Teaser onderaan een project: eerste `gerelateerd`, anders het volgende op volgorde (rondlopend). */
export async function getNextProject(current: Project): Promise<Project | undefined> {
  const all = await getProjects();
  const related = current.gerelateerd.map((s) => all.find((p) => p.slug === s)).find(Boolean);
  if (related) return related;
  if (all.length < 2) return undefined;
  const i = all.findIndex((p) => p.slug === current.slug);
  return all[(i + 1) % all.length];
}

// ── Opschonen van placeholders ─────────────────────────────
// Lege velden komen uit Sanity niet mee; items met alleen een jaar of resultaat tonen we niet.
export const hasContent = (item: Record<string, unknown>) =>
  Object.entries(item).some(([k, v]) => k !== 'jaar' && k !== 'resultaat' && typeof v === 'string' && v.trim() !== '');

export const cleanItems = <T extends Record<string, unknown>>(items: T[]) => items.filter(hasContent);

/** Pers- of award-items uit de list-blokken van een pagina (voor `toonUit`, de slug van die pagina). */
export async function itemsFromPage(slug: string, soort: 'pers' | 'awards'): Promise<ListItem[]> {
  const page = await getPage(slug);
  if (!page) return [];
  return page.blocks
    .filter((b): b is Extract<Block, { type: 'list' }> => b.type === 'list' && b.soort === soort)
    .flatMap((b) => cleanItems(b.items))
    .sort((a, b) => (b.jaar ?? 0) - (a.jaar ?? 0));
}
