// Beelden staan in lagado-content/ (niet in src/), zodat de contentmap de enige bron blijft.
// Alle beeldbestanden worden bij de build ingelezen; een ontbrekend bestand = bouwfout.
import type { ImageMetadata } from 'astro';
import type { Project } from './schema';

const files = import.meta.glob<{ default: ImageMetadata }>('/lagado-content/**/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

const downloads = import.meta.glob<string>('/lagado-content/downloads/**/*', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Context waarin een blok rendert: binnen een project zijn `src`-waarden bestandsnamen. */
export interface ImageScope {
  project?: string;
}

function lookup(path: string): ImageMetadata {
  const file = files[`/lagado-content/${path}`];
  if (!file) {
    throw new Error(`Beeld niet gevonden: lagado-content/${path}. Draai \`npm run placeholders\` of voeg het bestand toe.`);
  }
  return file.default;
}

/** Projectbeeld: `src` is een bestandsnaam in projecten/images/<slug>/. */
export const projectImage = (slug: string, src: string) => lookup(`projecten/images/${slug}/${src}`);

/** Pagina-beeld: `src` is een pad vanaf lagado-content/. */
export const pageImage = (src: string) => lookup(src);

/** Lost `src` op binnen de scope van het blok. Leeg `src` = geen beeld. */
export function resolveImage(scope: ImageScope, src: string | undefined, project?: string): ImageMetadata | undefined {
  if (!src) return undefined;
  const slug = project || scope.project;
  return slug ? projectImage(slug, src) : pageImage(src);
}

/** Download-URL voor een bestand in lagado-content/ (bv. downloads/voorwaarden.pdf). Leeg = undefined. */
export function downloadUrl(bestand: string | undefined): string | undefined {
  if (!bestand) return undefined;
  const url = downloads[`/lagado-content/${bestand}`];
  if (!url) throw new Error(`Download niet gevonden: lagado-content/${bestand}`);
  return url;
}

/** Beeldnamen van een project in leesvolgorde: hero, dan de beelden uit de blokken. Uniek, maximaal `max`. */
export function projectBeelden(p: Pick<Project, 'hero' | 'blocks'>, max = 6): string[] {
  const namen = [p.hero.src];
  for (const b of p.blocks) {
    if (b.type === 'image') namen.push(b.src);
    else if (b.type === 'gallery') namen.push(...b.images.map((i) => i.src));
    else if (b.type === 'columns') namen.push(b.image.src);
    else if (b.type === 'beforeAfter') namen.push(b.voor.src, b.na.src);
  }
  return [...new Set(namen.filter(Boolean))].slice(0, max);
}
