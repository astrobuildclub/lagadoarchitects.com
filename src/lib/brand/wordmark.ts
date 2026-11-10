/*
 * Kinetisch woordmerk LAGADO (verkenning, niet goedgekeurd). Eén bron voor animatie, matrix en hover.
 * Elke letter is één vorm op een raster van 5 × 5 blokken (zie raster.ts): een buitencontour met gaten,
 * hoekpunten op de rasterpunten. De eerste stand volgt het blokkenalfabet uit Figma; de andere standen zijn
 * ingrepen: een hoek schuin of afgerond, een gat dat hoger, lager of scheef schuift.
 */
import { animatie, paden, type Stap, type Vorm } from './raster';

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

/** Eén lus duurt voor elke letter even lang, zodat de onderlinge verschuiving blijft staan. */
export const DUUR = 6;

type Opzet = Omit<Letter, 'x' | 'standen' | 'duur' | 'anim'> & { standen: { id: string; label: string; vorm: Vorm }[] };

/** Stap-afkorting: stand, morph (s), ease, vast (s). */
const st = (stand: number, morph: number, ease: Stap['ease'], vast: number): Stap => ({ stand, morph, ease, vast });

// Contouren in blokken (0–5). Zie raster.ts voor de notatie: "0,0s" schuin, "0,0r" afgerond, "2,1r.5" half blok.
const OPZET: Opzet[] = [
  {
    id: 'gL',
    teken: 'L',
    begin: 0,
    hover: [0, 2],
    // De treden schieten trapsgewijs omhoog en zakken daarna in, de bovenste eerst, tot een L die even nawipt.
    stappen: [
      st(0, 0.35, 'snap', 0.8),
      st(1, 0.22, 'uit', 0.06),
      st(2, 0.22, 'uit', 1),
      st(1, 0.2, 'val', 0.02),
      st(0, 0.3, 'veer', 1),
      st(3, 0.35, 'snap', 1),
    ],
    standen: [
      // Tien hoekpunten in elke stand: per kolom rechts van de stam een bovenkant (2,a 3,a 3,b 4,b 4,c 5,c).
      // In de rechte L liggen die op één lijn; daaruit groeien de treden.
      { id: 'L1', label: 'L recht', vorm: ['0,0 2,0 2,3 3,3 3,3 4,3 4,3 5,3 5,5 0,5'] },
      { id: 'L2', label: 'L halve trap', vorm: ['0,0 2,0 2,2 3,2 3,3 4,3 4,3 5,3 5,5 0,5'] },
      { id: 'L3', label: 'L grote trap', vorm: ['0,0 2,0 2,1 3,1 3,2 4,2 4,3 5,3 5,5 0,5'] },
      { id: 'L4', label: 'L schuin', vorm: ['0,0s 2,0 2,3 3,3 3,3 4,3 4,3 5,3s 5,5 0,5'] },
    ],
  },
  {
    id: 'gA',
    teken: 'A',
    begin: -0.35,
    hover: [0, 1],
    stappen: [st(0, 0.35, 'snap', 1.4), st(1, 0.35, 'veer', 1.4), st(2, 0.4, 'snap', 1.4)],
    standen: [
      { id: 'A1r', label: 'A recht', vorm: ['0,0 5,0 5,5 3,5 3,4 2,4 2,5 0,5', '2,1 3,1 3,3 2,3'] },
      { id: 'A1s', label: 'A met scheef gat', vorm: ['0,0 5,0 5,5 3,5 3,4 2,4 2,5 0,5', '2,2 3,1 3,3 2,3'] },
      { id: 'A1o', label: 'A afgerond, gat rond', vorm: ['0,0r 5,0r 5,5 3,5 3,4 2,4 2,5 0,5', '2,1r.5 3,1r.5 3,3 2,3'] },
    ],
  },
  {
    id: 'gG',
    teken: 'G',
    begin: -0.7,
    hover: [0, 1],
    stappen: [st(0, 0.35, 'snap', 1.4), st(1, 0.35, 'snap', 1.4), st(2, 0.4, 'uit', 1.4)],
    standen: [
      { id: 'Gr', label: 'G recht', vorm: ['0,0 5,0 5,1 2,1 2,4 4,4 4,3 3,3 3,2 5,2 5,5 0,5'] },
      { id: 'Gs', label: 'G schuin', vorm: ['0,0s 5,0 5,1 2,1 2,4 4,4 4,3 3,3 3,2 5,2 5,5s 0,5'] },
      { id: 'Go', label: 'G afgerond', vorm: ['0,0r 5,0 5,1 2,1 2,4 4,4 4,3 3,3 3,2 5,2 5,5 0,5r'] },
    ],
  },
  {
    id: 'gA2',
    teken: 'A',
    begin: -2.2,
    hover: [0, 1],
    stappen: [st(0, 0.35, 'snap', 1.4), st(1, 0.35, 'veer', 1.4), st(2, 0.4, 'uit', 1.4)],
    standen: [
      { id: 'A2c', label: 'A afgeschuind, gat hoog', vorm: ['0,0s 5,0s 5,5 3,5 3,3 2,3 2,5 0,5', '2,1 3,1 3,2 2,2'] },
      { id: 'A2s', label: 'A met scheef gat', vorm: ['0,0 5,0 5,5 3,5 3,3 2,3 2,5 0,5', '2,2 3,1 3,2 2,2'] },
      { id: 'A2o', label: 'A afgerond, gat rond', vorm: ['0,0r 5,0r 5,5 3,5 3,3 2,3 2,5 0,5', '2,1r.5 3,1r.5 3,2 2,2'] },
    ],
  },
  {
    id: 'gD',
    teken: 'D',
    begin: -1.05,
    hover: [0, 1],
    stappen: [st(0, 0.3, 'snap', 0.9), st(1, 0.3, 'snap', 0.9), st(2, 0.35, 'uit', 0.9), st(3, 0.35, 'veer', 0.9)],
    standen: [
      { id: 'Dr', label: 'D recht', vorm: ['0,0 4,0 4,1 5,1 5,4 4,4 4,5 0,5', '2,1 3,1 3,4 2,4'] },
      { id: 'Ds', label: 'D schuin, gat scheef', vorm: ['0,0 4,0 5,1 5,1 5,4 5,4 4,5 0,5', '2,1 3,2 3,3 2,4'] },
      { id: 'Do', label: 'D afgerond, gat rond', vorm: ['0,0 4,0 5,0r 5,1 5,4 5,5r 4,5 0,5', '2,1r.5 3,1r.5 3,4r.5 2,4r.5'] },
      { id: 'Dh', label: 'D met gat hoog', vorm: ['0,0 4,0 4,1 5,1 5,4 4,4 4,5 0,5', '2,1 3,1 3,3 2,3'] },
    ],
  },
  {
    id: 'gO',
    teken: 'O',
    begin: -1.4,
    hover: [0, 1],
    stappen: [st(0, 0.3, 'snap', 0.9), st(1, 0.3, 'snap', 0.9), st(2, 0.35, 'uit', 0.9), st(3, 0.35, 'veer', 0.9)],
    standen: [
      { id: 'Or', label: 'O recht', vorm: ['0,0 5,0 5,5 0,5', '2,1 3,1 3,4 2,4'] },
      { id: 'Os', label: 'O schuin, gat scheef', vorm: ['0,0s 5,0 5,5s 0,5', '2,2 3,1 3,3 2,4'] },
      { id: 'Oo', label: 'O afgerond, gat hoog', vorm: ['0,0r 5,0r 5,5r 0,5r', '2,1 3,1 3,3 2,3'] },
      { id: 'Oo2', label: 'O afgerond, gat laag', vorm: ['0,0r 5,0r 5,5r 0,5r', '2,2 3,2 3,4 2,4'] },
    ],
  },
];

export const LETTERS: Letter[] = OPZET.map((l, i) => {
  const vormen = l.standen.map((s) => s.vorm);
  const d = paden(vormen, l.id);
  // De rest van de lus gaat naar de eerste stand, zodat elke letter precies DUUR seconden duurt.
  const totaal = l.stappen.reduce((t, s) => t + s.morph + s.vast, 0);
  if (totaal > DUUR) throw new Error(`${l.id}: stappen duren ${totaal.toFixed(2)} s, meer dan ${DUUR} s`);
  const stappen = l.stappen.map((s, n) => (n === 0 ? { ...s, vast: +(s.vast + DUUR - totaal).toFixed(3) } : s));
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
