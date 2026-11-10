/*
 * Kinetisch woordmerk LAGADO (verkenning, niet goedgekeurd). Eén bron voor animatie, matrix en hover.
 * Elke letter is één vorm op een raster van 5 × 5 blokken (zie raster.ts): een buitencontour met gaten,
 * hoekpunten op de rasterpunten. De eerste stand volgt het blokkenalfabet uit Figma; de andere standen zijn
 * ingrepen: een hoek schuin of afgerond, een gat dat hoger, lager of scheef schuift.
 */
import { animatie, paden, type Stap, type Vorm } from './raster';
import data from './woordmerk.json';

export interface Stand {
  id: string;
  label: string;
  /** Pad in een viewBox van 0 0 10 10. Voor rasterstanden gegenereerd uit `vorm`. */
  d: string;
  vorm?: Vorm;
}

export interface Letter {
  /** Id van de geanimeerde glyph in de defs. */
  id: string;
  teken: string;
  /** x-positie in het losse woordmerk (viewBox 0 0 70 10): één blok (2) tussen de letters. */
  x: number;
  /** Duur van één lus in seconden (voor alle letters gelijk: DUUR). */
  duur: number;
  /** Start in de lus (negatief = al onderweg), zodat de letters niet tegelijk bewegen. */
  begin: number;
  standen: Stand[];
  /** Paar voor de hover-variant: [van, naar] als index in `standen`. */
  hover: [number, number];
  /** De lus: welke stand, met welke ease en hoe lang. Zie Stap in raster.ts. */
  stappen: Stap[];
  /** Uitgerekende SMIL-tijdlijn (calcMode linear). */
  anim: { keyTimes: string; values: string };
}

/**
 * De bron: letters, standen en de lus per letter staan in woordmerk.json. Die bewerk je met de editor op
 * /brand/editor (export → dit bestand vervangen) of met de hand.
 */
export interface WoordmerkData {
  /** Duur van één lus in seconden, voor elke letter gelijk zodat de onderlinge verschuiving blijft staan. */
  duur: number;
  letters: (Omit<Letter, 'x' | 'standen' | 'duur' | 'anim'> & { standen: { id: string; label: string; vorm: Vorm }[] })[];
}
export const DATA = data as WoordmerkData;
export const DUUR = DATA.duur;

/** Vult de eerste stilstand aan tot de lus precies `duur` seconden is. */
export function vulAan(stappen: Stap[], duur: number, naam = 'letter'): Stap[] {
  const totaal = stappen.reduce((t, s) => t + s.morph + s.vast, 0);
  if (totaal > duur + 1e-9) throw new Error(`${naam}: stappen duren ${totaal.toFixed(2)} s, meer dan ${duur} s`);
  return stappen.map((s, n) => (n === 0 ? { ...s, vast: +(s.vast + duur - totaal).toFixed(3) } : s));
}

export const LETTERS: Letter[] = DATA.letters.map((l, i) => {
  const vormen = l.standen.map((s) => s.vorm);
  const d = paden(vormen, l.id);
  const stappen = vulAan(l.stappen, DUUR, l.id);
  const { keyTimes, values } = animatie(vormen, stappen, l.id);
  return { ...l, stappen, duur: DUUR, x: i * 12, standen: l.standen.map((s, n) => ({ ...s, d: d[n] })), anim: { keyTimes, values } };
});

/** Schetsvormen: statisch, andere puntopbouw, niet in de animatie. Index = kolom in de matrix. */
export const SCHETSEN: (Stand | null)[] = [
  null,
  null,
  { id: 'Gx', label: 'G gevel', d: 'M0 0 L7 0 L10 2 L10 10 L7.5 10 L6.5 8.8 L4.5 8.8 L0 10 Z M2 1.8 L6.5 1.8 L6.5 3 L2 3 Z M2 4 L6.5 4 L6.5 5.2 L2 5.2 Z M2 6.2 L6.5 6.2 L6.5 7.4 L2 7.4 Z' },
  null,
  { id: 'Dx', label: 'D deur', d: 'M0 0 L10 0 L10 10 L8 10 L8 5 Q8 3 6 3 L5.5 3 L5.5 10 L0 10 Z M2.5 2 L3.7 2 L3.7 8.5 L2.5 8.5 Z' },
  { id: 'Ox', label: 'O poort', d: 'M0 0 L10 0 L10 10 L0 10 Z M2 8 L2 6 Q2 2 5 2 L8 2 L8 8 Z' },
];

/** Losse woordmerk: viewBox 0 0 70 10. Tegelversie: 0 0 84 14, tegels van 14, letter op (2, 2). */
export const WOORD_BREEDTE = 70;
export const TEGEL = 14;

/** Kleurpalet van de verkenning (bron: hex uit de handover, hier als OKLCH). */
export const PALET = {
  geel: { naam: 'Geel', hex: '#F9D84A', oklch: 'oklch(88.58% 0.158 95.71)' },
  rood: { naam: 'Rood', hex: '#EA4C28', oklch: 'oklch(63.37% 0.2004 34.06)' },
  groen: { naam: 'Groen', hex: '#50B080', oklch: 'oklch(68.61% 0.1164 159.26)' },
  roze: { naam: 'Roze', hex: '#EFA2D4', oklch: 'oklch(80.21% 0.1106 340.69)' },
  blauw: { naam: 'Blauw', hex: '#4244F5', oklch: 'oklch(51.51% 0.2539 272.56)' },
} as const;

export type Kleur = keyof typeof PALET | 'zwart' | 'wit';

/** Tegels: [tegel, letter] per positie in LAGADO. */
export const TEGELS: [Kleur, Kleur][] = [
  ['geel', 'rood'],
  ['zwart', 'groen'],
  ['roze', 'zwart'],
  ['rood', 'wit'],
  ['blauw', 'geel'],
  ['zwart', 'roze'],
];

/** Losse letters in kleur, op licht en op donker. Geel en roze halen op wit geen tekstcontrast. */
export const LETTERKLEUR_LICHT: Kleur[] = ['rood', 'groen', 'blauw', 'roze', 'rood', 'blauw'];
export const LETTERKLEUR_DONKER: Kleur[] = ['geel', 'groen', 'roze', 'rood', 'geel', 'roze'];

/** WCAG-contrast van een hexkleur tegen wit en zwart. */
export function contrast(hex: string) {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16)));
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { wit: 1.05 / (y + 0.05), zwart: (y + 0.05) / 0.05 };
}
