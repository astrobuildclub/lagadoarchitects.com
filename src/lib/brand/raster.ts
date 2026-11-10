/*
 * Raster van het woordmerk: elke letter staat op 5 × 5 blokken. Een letter is geen stapel losse blokjes
 * maar één vorm: een buitencontour plus eventueel gaten, met de hoekpunten op de rasterpunten (0–5).
 *
 * Notatie van een contour: hoekpunten "x,y" gescheiden door spaties, met een optionele ingreep op de hoek:
 *   "3,1"     rechte hoek
 *   "0,0s"    schuin: de hoek wordt één blok afgesneden ("0,0s.5" = een half blok)
 *   "0,0r"    afgerond met een straal van één blok ("2,1r.5" = een half blok, voor een rond gat)
 * Een stand is een lijst contouren: eerst de buitenvorm, dan de gaten (fill-rule evenodd).
 *
 * Morphen werkt omdat alle standen van een letter evenveel contouren en hoekpunten hebben; een hoekpunt
 * schuift over het raster naar zijn plek in de volgende stand. Een punt mag dubbel staan om het aantal
 * gelijk te houden. paden() controleert dat en geeft anders een fout.
 */

export const BLOKKEN = 5;
/** Grootte van één blok in de viewBox (10 × 10 per letter). */
export const BLOK = 2;

export type Bitmap = [string, string, string, string, string];
/** Contouren van één stand: [buitenvorm, ...gaten]. */
export type Vorm = string[];

type P = [number, number];
interface Hoekpunt {
  p: P;
  ingreep?: 'r' | 's';
  maat: number;
}

const PUNT = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:([rs])(\d*\.?\d+)?)?$/;

function leesContour(contour: string): Hoekpunt[] {
  return contour
    .trim()
    .split(/\s+/)
    .map((t) => {
      const m = PUNT.exec(t);
      if (!m) throw new Error(`Onbekend hoekpunt "${t}"`);
      return { p: [+m[1], +m[2]] as P, ingreep: m[3] as Hoekpunt['ingreep'], maat: m[4] ? +m[4] : 1 };
    });
}

const afstand = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const naar = (a: P, b: P, d: number): P => {
  const l = afstand(a, b);
  return l === 0 ? a : [a[0] + ((b[0] - a[0]) / l) * d, a[1] + ((b[1] - a[1]) / l) * d];
};
const midden = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** Eerste punt in een richting dat niet samenvalt met punt i (dubbele punten overslaan). */
function buur(pts: Hoekpunt[], i: number, stap: 1 | -1): P {
  const n = pts.length;
  for (let k = 1; k < n; k++) {
    const q = pts[(i + stap * k + n * k) % n].p;
    if (afstand(q, pts[i].p) > 0) return q;
  }
  return pts[i].p;
}

/** Hoek als aankomst-, controle- en vertrekpunt. Recht: drie keer hetzelfde punt. */
function hoek(pts: Hoekpunt[], i: number): [P, P, P] {
  const { p, ingreep, maat } = pts[i];
  if (!ingreep) return [p, p, p];
  const vorige = buur(pts, i, -1);
  const volgende = buur(pts, i, 1);
  const a = naar(p, vorige, Math.min(maat, afstand(p, vorige)));
  const b = naar(p, volgende, Math.min(maat, afstand(p, volgende)));
  return [a, ingreep === 'r' ? p : midden(a, b), b];
}

const getal = (n: number) => String(+(n * BLOK).toFixed(3));
const punt = (p: P) => `${getal(p[0])} ${getal(p[1])}`;

/**
 * Paden voor alle standen van één letter, met exact dezelfde opbouw. Een hoekpunt dat in minstens één
 * stand een ingreep heeft wordt in alle standen een Q (in de rechte standen met het controlepunt op de hoek).
 */
export function paden(standen: Vorm[], naam = 'letter'): string[] {
  const gelezen = standen.map((v) => v.map(leesContour));
  const eerste = gelezen[0];
  gelezen.forEach((v, s) => {
    if (v.length !== eerste.length) throw new Error(`${naam}: stand ${s + 1} heeft ${v.length} contouren, stand 1 heeft er ${eerste.length}`);
    v.forEach((c, k) => {
      if (c.length !== eerste[k].length)
        throw new Error(`${naam}: contour ${k + 1} van stand ${s + 1} heeft ${c.length} hoekpunten, stand 1 heeft er ${eerste[k].length}`);
    });
  });
  const gebogen = eerste.map((c, k) => c.map((_, i) => gelezen.some((v) => !!v[k][i].ingreep)));

  return gelezen.map((v) =>
    v
      .map((pts, k) => {
        const hoeken = pts.map((_, i) => hoek(pts, i));
        const delen = hoeken.map((h, i) => (gebogen[k][i] ? `L${punt(h[0])} Q${punt(h[1])} ${punt(h[2])}` : `L${punt(h[1])}`));
        // Begin waar de laatste hoek vertrekt, zodat het pad sluit waar het begon.
        const laatste = hoeken.length - 1;
        return `M${punt(gebogen[k][laatste] ? hoeken[laatste][2] : hoeken[laatste][1])} ${delen.join(' ')} Z`;
      })
      .join(' '),
  );
}

/** Eén losse stand als pad (legenda, voorbeelden). */
export const pad = (vorm: Vorm) => paden([vorm])[0];

/**
 * Bitmap → contouren (alleen voor statische weergave, zoals het alfabet). Randen van gevulde blokken die
 * tegen elkaar liggen vallen weg; wat overblijft wordt aaneengeregen tot gesloten vormen. Buitenvormen
 * lopen met de klok mee, gaten ertegenin: tekenen met fill-rule nonzero.
 */
export function traceer(bitmap: Bitmap): string {
  const sleutel = (p: P) => `${p[0]},${p[1]}`;
  const randen = new Map<string, P[]>();
  const voeg = (a: P, b: P) => {
    const terug = randen.get(sleutel(b));
    const i = terug?.findIndex((q) => q[0] === a[0] && q[1] === a[1]) ?? -1;
    if (terug && i >= 0) {
      terug.splice(i, 1);
      return;
    }
    randen.set(sleutel(a), [...(randen.get(sleutel(a)) ?? []), b]);
  };
  bitmap.forEach((regel, y) =>
    [...regel].forEach((t, x) => {
      if (t !== '#') return;
      voeg([x, y], [x + 1, y]);
      voeg([x + 1, y], [x + 1, y + 1]);
      voeg([x + 1, y + 1], [x, y + 1]);
      voeg([x, y + 1], [x, y]);
    }),
  );

  const lussen: P[][] = [];
  for (const [start, doelen] of randen) {
    while (doelen.length) {
      const begin = start.split(',').map(Number) as P;
      const lus: P[] = [begin];
      let huidig = begin;
      let richting: P = [0, 0];
      for (;;) {
        const opties = randen.get(sleutel(huidig)) ?? [];
        if (!opties.length) break;
        // Bij een kruispunt (blokken die alleen met een hoek raken) rechtsaf: vormen blijven gescheiden.
        let keus = 0;
        if (opties.length > 1) {
          const rechts: P = [-richting[1], richting[0]];
          keus = Math.max(0, opties.findIndex((q) => q[0] - huidig[0] === rechts[0] && q[1] - huidig[1] === rechts[1]));
        }
        const volgende = opties.splice(keus, 1)[0];
        richting = [volgende[0] - huidig[0], volgende[1] - huidig[1]];
        huidig = volgende;
        if (huidig[0] === begin[0] && huidig[1] === begin[1]) break;
        lus.push(huidig);
      }
      // Punten op een rechte lijn weglaten.
      const kaal = lus.filter((p, i) => {
        const a = lus[(i - 1 + lus.length) % lus.length];
        const b = lus[(i + 1) % lus.length];
        return (b[0] - a[0]) * (p[1] - a[1]) !== (b[1] - a[1]) * (p[0] - a[0]);
      });
      lussen.push(kaal);
    }
  }
  return lussen.map((l) => `M${l.map(punt).join(' L')} Z`).join(' ');
}

/** Het alfabet uit Figma (Lagado, "Alfabet A–Z · 5×5"): de basisvorm van elke letter. */
export const ALFABET: Record<string, Bitmap> = {
  A: ['#####', '##.##', '##.##', '#####', '##.##'],
  B: ['####.', '##.##', '####.', '##.##', '####.'],
  C: ['#####', '##...', '##...', '##...', '#####'],
  D: ['####.', '##.##', '##.##', '##.##', '####.'],
  E: ['#####', '##...', '####.', '##...', '#####'],
  F: ['#####', '##...', '####.', '##...', '##...'],
  G: ['#####', '##...', '##.##', '##..#', '#####'],
  H: ['##.##', '##.##', '#####', '##.##', '##.##'],
  I: ['#####', '.###.', '.###.', '.###.', '#####'],
  J: ['..###', '...##', '...##', '##.##', '#####'],
  K: ['##.##', '####.', '###..', '####.', '##.##'],
  L: ['##...', '##...', '##...', '#####', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['##..#', '###.#', '#####', '##.##', '##..#'],
  O: ['#####', '##.##', '##.##', '##.##', '#####'],
  P: ['#####', '##.##', '#####', '##...', '##...'],
  Q: ['####.', '##.#.', '##.#.', '####.', '...##'],
  R: ['####.', '##.##', '####.', '###..', '##.##'],
  S: ['#####', '##...', '#####', '...##', '#####'],
  T: ['#####', '.###.', '.###.', '.###.', '.###.'],
  U: ['##.##', '##.##', '##.##', '##.##', '#####'],
  V: ['##.##', '##.##', '##.##', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['##.##', '.#.#.', '..#..', '.#.#.', '##.##'],
  Y: ['##.##', '##.##', '.###.', '..#..', '..#..'],
  Z: ['#####', '...##', '..##.', '.##..', '#####'],
};
