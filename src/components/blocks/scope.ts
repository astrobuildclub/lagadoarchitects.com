// Gedeelde props voor alle blokken.
import type { BlockOf, Block, RichText } from '../../lib/schema';
import { heeftTekst } from '../../lib/richtext';
import type { ImageScope } from '../../lib/images';

export interface BlockScope extends ImageScope {
  /** Kleurpalet van het project; fallback voor een leeg `colors`-blok. */
  kleurpalet?: { label: string; hex: string }[];
}

export interface BlockProps<T extends Block['type']> {
  block: BlockOf<T>;
  scope: BlockScope;
  /** Positie in de pagina; index 0 is boven de vouw (eager laden). */
  index: number;
}

/** Ingevuld? Werkt voor gewone tekst en Portable Text (leeg = []). */
export function has(s: string | undefined): s is string;
export function has(s: RichText | undefined): s is RichText;
export function has(s: string | RichText | undefined) {
  return typeof s === 'string' ? s.trim() !== '' : heeftTekst(s);
}

/** Compile-fout als er een bloktype in het schema staat zonder case in BlockRenderer. */
export const assertNever = (_: never) => null;
