// Gedeelde props voor alle blokken.
import type { BlockOf, Block } from '../../lib/schema';
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

/** Koppen: een `kop` met lege string telt als geen kop. */
export const has = (s: string | undefined): s is string => !!s && s.trim() !== '';

/** Compile-fout als er een bloktype in het schema staat zonder case in BlockRenderer. */
export const assertNever = (_: never) => null;
