/*
 * Losse SVG-bestanden van het woordmerk (downloads in de editor). Rekent met dezelfde letters als de site
 * (bouwLetters in wordmark.ts), dus wat je downloadt is wat de site toont. Kleur: currentColor, zwart als
 * het bestand los wordt geopend.
 */
import { WOORD_BREEDTE, type Letter } from './wordmark';

const kop = (viewBox: string, titel: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" role="img" aria-label="${titel}"><title>${titel}</title>`;

const pad = (d: string, x: number, extra = '') =>
  `<path d="${d}" fill-rule="evenodd"${x ? ` transform="translate(${x} 0)"` : ''}>${extra}</path>`;

/** Tijd in de lus van een letter (0 ≤ t < duur), rekening houdend met zijn verschuiving `begin`. */
const lokaal = (l: Letter, t: number) => (((t - l.begin) % l.duur) + l.duur) % l.duur;

/** Pad van een letter op tijd t: het keyframe waar de SMIL-animatie dan staat (ze liggen ~30 ms uit elkaar). */
export function padOp(l: Letter, t: number): string {
  const u = lokaal(l, t) / l.duur;
  const tijden = l.anim.keyTimes.split(';').map(Number);
  const waarden = l.anim.values.split(';');
  let i = 0;
  while (i + 1 < tijden.length && tijden[i + 1] <= u) i++;
  return waarden[i];
}

/** Het hele woordmerk op tijd t, als statische SVG. */
export function frameSvg(letters: Letter[], t: number, titel = 'LAGADO'): string {
  return `${kop(`0 0 ${WOORD_BREEDTE} 10`, titel)}${letters.map((l) => pad(padOp(l, t), l.x)).join('')}</svg>\n`;
}

/** Het hele woordmerk met per letter een stand (index in `standen`), als statische SVG. */
export function standenSvg(letters: Letter[], standen: number[], titel = 'LAGADO'): string {
  return `${kop(`0 0 ${WOORD_BREEDTE} 10`, titel)}${letters.map((l, i) => pad(l.standen[standen[i]].d, l.x)).join('')}</svg>\n`;
}

/** Het geanimeerde woordmerk als één losstaand bestand (SMIL): speelt af in elke browser. */
export function geanimeerdSvg(letters: Letter[], titel = 'LAGADO'): string {
  const anim = (l: Letter) =>
    `<animate attributeName="d" dur="${l.duur}s" begin="${l.begin}s" repeatCount="indefinite" calcMode="linear" keyTimes="${l.anim.keyTimes}" values="${l.anim.values}"/>`;
  return `${kop(`0 0 ${WOORD_BREEDTE} 10`, titel)}${letters.map((l) => pad(l.standen[l.stappen[0].stand].d, l.x, anim(l))).join('')}</svg>\n`;
}

/** Eén stand van één letter, viewBox 0 0 10 10. */
export function letterSvg(d: string, titel: string): string {
  return `${kop('0 0 10 10', titel)}${pad(d, 0)}</svg>\n`;
}

/**
 * Stilstanden: de momenten in de lus waarop alle letters tegelijk stilstaan, elk in een stand. Per letter
 * de intervallen (in lustijd) waarin hij stilstaat, verschoven met `begin`; de doorsnede daarvan geeft de
 * frames. Per combinatie van standen één frame (het midden van het eerste interval).
 */
export function stilstanden(letters: Letter[]): { t: number; standen: number[] }[] {
  if (!letters.length) return [];
  const duur = letters[0].duur;
  // Per letter: [van, tot, stand] in globale tijd, binnen 0..duur (een interval over de rand wordt gesplitst).
  const perLetter = letters.map((l) => {
    const uit: [number, number, number][] = [];
    let t = 0;
    l.stappen.forEach((s, n) => {
      if (n > 0) t += s.morph;
      const van = t;
      t += s.vast;
      if (s.vast <= 0) return;
      for (const schuif of [-duur, 0, duur]) {
        const a = Math.max(0, van + l.begin + schuif);
        const b = Math.min(duur, t + l.begin + schuif);
        if (b - a > 1e-6) uit.push([a, b, s.stand]);
      }
    });
    return uit;
  });

  let doorsnede: { van: number; tot: number; standen: number[] }[] = perLetter[0].map(([van, tot, s]) => ({ van, tot, standen: [s] }));
  for (const intervallen of perLetter.slice(1)) {
    const volgende: typeof doorsnede = [];
    for (const d of doorsnede)
      for (const [van, tot, s] of intervallen) {
        const a = Math.max(d.van, van);
        const b = Math.min(d.tot, tot);
        if (b - a > 0.02) volgende.push({ van: a, tot: b, standen: [...d.standen, s] });
      }
    doorsnede = volgende;
  }

  const gezien = new Set<string>();
  return doorsnede
    .sort((a, b) => a.van - b.van)
    .filter((d) => {
      const k = d.standen.join(',');
      if (gezien.has(k)) return false;
      gezien.add(k);
      return true;
    })
    .map((d) => ({ t: +((d.van + d.tot) / 2).toFixed(3), standen: d.standen }));
}
