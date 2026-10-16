// Leesbare labels voor de vaste waarden uit het contentmodel.
const LABELS: Record<string, string> = {
  thuiskomen: 'Thuiskomen',
  'de-hort-op': 'De hort op',
  woning: 'Woning',
  winkel: 'Winkel',
  horeca: 'Horeca',
  kantoor: 'Kantoor',
  publiek: 'Publiek',
  'openbare-ruimte': 'Openbare ruimte',
  meubel: 'Meubel',
  af: 'Af',
  bijna: 'Bijna',
  opgetekend: 'Opgetekend',
  particulier: 'Particulier',
  zakelijk: 'Zakelijk',
  laag: '€',
  midden: '€€',
  hoog: '€€€',
  winnaar: 'Winnaar',
  genomineerd: 'Genomineerd',
  finalist: 'Finalist',
};

export const label = (value: string) => LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

/** Swatch per filterkleur (KLEUR in schema.ts). Altijd samen met het tekstlabel tonen (WCAG 1.4.1). */
export const KLEUR_SWATCH: Record<string, string> = {
  rood: 'oklch(58% 0.21 27)',
  oranje: 'oklch(72% 0.18 52)',
  geel: 'oklch(88% 0.17 95)',
  groen: 'oklch(62% 0.15 150)',
  blauw: 'oklch(52% 0.2 262)',
  paars: 'oklch(48% 0.2 300)',
  roze: 'oklch(78% 0.13 350)',
  wit: 'oklch(99% 0 0)',
  zwart: 'oklch(18% 0 0)',
  grijs: 'oklch(65% 0 0)',
};
