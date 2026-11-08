// Beelden komen als Sanity-beeld uit de query (`src` in een beeld-object); <Img> maakt er een srcset van.
// Hier alleen wat over meerdere beelden gaat.
import type { Project, SanityImage } from './schema';

/** Context waarin een blok rendert (bv. het project, voor het kleurpalet). */
export interface ImageScope {
  project?: string;
}

/** Beelden van een project in leesvolgorde: hero, dan de beelden uit de blokken. Uniek, maximaal `max`. */
export function projectBeelden(p: Pick<Project, 'hero' | 'blocks'>, max = 6): SanityImage[] {
  const beelden: SanityImage[] = [p.hero.src];
  for (const b of p.blocks) {
    if (b.type === 'image') beelden.push(b.src);
    else if (b.type === 'gallery') beelden.push(...b.images.map((i) => i.src));
    else if (b.type === 'columns') beelden.push(b.image.src);
    else if (b.type === 'beforeAfter') beelden.push(b.voor.src, b.na.src);
  }
  const gezien = new Set<string>();
  return beelden.filter((b) => !gezien.has(b.asset._id) && gezien.add(b.asset._id)).slice(0, max);
}
