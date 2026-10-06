// De enige plek die content leest. Als Sanity komt, worden alleen deze functies vervangen
// (GROQ in plaats van getCollection); componenten en pagina's blijven gelijk.
import { getCollection, getEntry } from 'astro:content';
import type { Block, Contact, ListItem, Page, Project, Settings } from './schema';

export async function getSettings(): Promise<Settings> {
  const entry = await getEntry('settings', 'site');
  if (!entry) throw new Error('lagado-content/site.md ontbreekt');
  return entry.data;
}

export async function getPage(id: 'home' | 'bureau' | 'privacy'): Promise<Page> {
  const entry = await getEntry('pages', id);
  if (!entry) throw new Error(`lagado-content/${id}.md ontbreekt`);
  return entry.data;
}

export async function getContact(): Promise<Contact> {
  const entry = await getEntry('contact', 'contact');
  if (!entry) throw new Error('lagado-content/contact.md ontbreekt');
  return entry.data;
}

/** Alle projecten, op `volgorde` (laag = eerst), daarna op titel. */
export async function getProjects(): Promise<Project[]> {
  const entries = await getCollection('projecten');
  return entries
    .map((e) => ({ ...e.data, slug: e.id }))
    .sort((a, b) => a.volgorde - b.volgorde || a.title.localeCompare(b.title, 'nl'));
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}

/** Selectie voor een projectGrid-blok: expliciete slugs (in die volgorde) of een filter. */
export async function selectProjects(opts: { slugs?: string[]; filter?: Record<string, string>; limit?: number }) {
  const all = await getProjects();
  const list = opts.slugs?.length
    ? opts.slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Project => !!p)
    : all.filter((p) =>
        Object.entries(opts.filter ?? {}).every(([k, v]) => {
          const value = (p as Record<string, unknown>)[k];
          return Array.isArray(value) ? value.includes(v) : String(value) === v;
        }),
      );
  return opts.limit ? list.slice(0, opts.limit) : list;
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
// Het sjabloon gebruikt `jaar: 0000` en lege strings als invulplek. Die tonen we niet.
export const hasContent = (item: Record<string, unknown>) =>
  Object.entries(item).some(([k, v]) => k !== 'jaar' && k !== 'resultaat' && typeof v === 'string' && v.trim() !== '');

export const cleanItems = <T extends Record<string, unknown>>(items: T[]) => items.filter(hasContent);

/** Pers- of award-items uit de list-blokken van een pagina (voor `toonUit`). */
export async function itemsFromPage(id: 'home' | 'bureau', soort: 'pers' | 'awards'): Promise<ListItem[]> {
  const page = await getPage(id);
  return page.blocks
    .filter((b): b is Extract<Block, { type: 'list' }> => b.type === 'list' && b.soort === soort)
    .flatMap((b) => cleanItems(b.items))
    .sort((a, b) => (b.jaar ?? 0) - (a.jaar ?? 0));
}
