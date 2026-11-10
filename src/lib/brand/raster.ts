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
 * gelijk te houden. paden() en animatie() controleren dat en geven anders een fout. De tussenstanden
 * rekent animatie() zelf uit (positie en ingreep per hoekpunt), zodat de vorm onderweg klopt.
 */

export const BLOKKEN = 5;
/** Grootte van één blok in de viewBox (10 × 10 per letter). */
export const BLOK = 2;

export type Bitmap = [string, string, string, string, string];
/** Contouren van één stand: [buitenvorm, ...gaten]. */
export type Vorm = string[];

type P = [number, number];

/** Hoekpunt als getallen: positie, grootte van de ingreep (0 = recht) en rondheid (1 = rond, 0 = schuin). */
interface Hoekpunt {
  p: P;
  maat: number;
  rond: number;
  /** Heeft dit hoekpunt in deze stand een ingreep (voor de rondheid van de tussenstanden). */
  ingreep: boolean;
}
type Stand = Hoekpunt[][];

const PUNT = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:([rs])(\d*\.?\d+)?)?$/;

function leesContour(contour: string): Hoekpunt[] {
  return contour
    .trim()
    .split(/\s+/)
    .map((t) => {
      const m = PUNT.exec(t);
      if (!m) throw new Error(`Onbekend hoekpunt "${t}"`);
      const ingreep = !!m[3];
      return { p: [+m[1], +m[2]] as P, maat: ingreep ? (m[4] ? +m[4] : 1) : 0, rond: m[3] === 'r' ? 1 : 0, ingreep };
    });
}

function lees(standen: Vorm[], naam: string): Stand[] {
  const gelezen = standen.map((v) => v.map(leesContour));
  const eerste = gelezen[0];
  gelezen.forEach((v, s) => {
    if (v.length !== eerste.length) throw new Error(`${naam}: stand ${s + 1} heeft ${v.length} contouren, stand 1 heeft er ${eerste.length}`);
    v.forEach((c, k) => {
      if (c.length !== eerste[k].length)
        throw new Error(`${naam}: contour ${k + 1} van stand ${s + 1} heeft ${c.length} hoekpunten, stand 1 heeft er ${eerste[k].length}`);
    });
  });
  return gelezen;
}

const afstand = (a: P, b: P) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const naar = (a: P, b: P, d: number): P => {
  const l = afstand(a, b);
  return l === 0 ? a : [a[0] + ((b[0] - a[0]) / l) * d, a[1] + ((b[1] - a[1]) / l) * d];
};
const mix = (a: number, b: number, u: number) => a + (b - a) * u;
const mixP = (a: P, b: P, u: number): P => [mix(a[0], b[0], u), mix(a[1], b[1], u)];

/** Eerste hoekpunt in een richting dat niet samenvalt met punt i (dubbele punten overslaan). */
function buur(pts: Hoekpunt[], i: number, stap: 1 | -1): Hoekpunt {
  const n = pts.length;
  for (let k = 1; k < n; k++) {
    const q = pts[(((i + stap * k) % n) + n) % n];
    if (afstand(q.p, pts[i].p) > 1e-9) return q;
  }
  return pts[i];
}

/**
 * Hoek als aankomst-, controle- en vertrekpunt. Recht: drie keer hetzelfde punt. De ingreep is nooit groter
 * dan de rand ernaast, en hooguit de helft als de buurhoek ook een ingreep heeft (geen overlap).
 */
function hoek(pts: Hoekpunt[], i: number): [P, P, P] {
  const { p, maat, rond } = pts[i];
  if (maat <= 1e-6) return [p, p, p];
  const vorige = buur(pts, i, -1);
  const volgende = buur(pts, i, 1);
  const ruimte = (q: Hoekpunt) => afstand(p, q.p) * (q.maat > 1e-6 ? 0.5 : 1);
  const a = naar(p, vorige.p, Math.min(maat, ruimte(vorige)));
  const b = naar(p, volgende.p, Math.min(maat, ruimte(volgende)));
  return [a, mixP([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], p, rond), b];
}

const getal = (n: number) => String(+(n * BLOK).toFixed(3));
const punt = (p: P) => `${getal(p[0])} ${getal(p[1])}`;

/** Welke hoekpunten in minstens één stand een ingreep hebben: die worden in alle standen een Q. */
const gebogenIn = (standen: Stand[]) => standen[0].map((c, k) => c.map((_, i) => standen.some((v) => v[k][i].ingreep)));

function teken(stand: Stand, gebogen: boolean[][]): string {
  return stand
    .map((pts, k) => {
      const hoeken = pts.map((_, i) => hoek(pts, i));
      const delen = hoeken.map((h, i) => (gebogen[k][i] ? `L${punt(h[0])} Q${punt(h[1])} ${punt(h[2])}` : `L${punt(h[1])}`));
      // Begin waar de laatste hoek vertrekt, zodat het pad sluit waar het begon.
      const laatste = hoeken.length - 1;
      return `M${punt(gebogen[k][laatste] ? hoeken[laatste][2] : hoeken[laatste][1])} ${delen.join(' ')} Z`;
    })
    .join(' ');
}

/**
 * Tussenstand op voortgang u (0 = a, 1 = b; mag even buiten 0–1 voor een veer). Positie en grootte van de
 * ingreep schuiven mee; een hoek die recht wordt houdt de rondheid van de stand waar hij vandaan komt.
 */
function tussen(a: Stand, b: Stand, u: number): Stand {
  return a.map((c, k) =>
    c.map((h, i) => {
      const g = b[k][i];
      const rondA = h.ingreep ? h.rond : g.rond;
      const rondB = g.ingreep ? g.rond : h.rond;
      return {
        p: mixP(h.p, g.p, u),
        maat: Math.max(0, mix(h.maat, g.maat, u)),
        rond: Math.min(1, Math.max(0, mix(rondA, rondB, u))),
        ingreep: h.ingreep || g.ingreep,
      };
    }),
  );
}

/** Paden voor alle standen van één letter, met exact dezelfde opbouw (voor matrix, hover en stilstand). */
export function paden(standen: Vorm[], naam = 'letter'): string[] {
  const gelezen = lees(standen, naam);
  const gebogen = gebogenIn(gelezen);
  return gelezen.map((s) => teken(s, gebogen));
}

/** Eén losse stand als pad (legenda, voorbeelden). */
export const pad = (vorm: Vorm) => paden([vorm])[0];

/* ───────────── Beweging ───────────── */

/**
 * Eases als cubic-bezier. Omdat de tussenstanden hier worden uitgerekend mogen ze buiten 0–1 komen:
 * dat kan met SMIL-keySplines niet.
 */
export const EASES = {
  /** Snel en strak, voor de buitenvorm. */
  snap: [0.85, 0, 0.15, 1],
  /** Schiet weg en remt lang af, voor iets dat opbouwt. */
  uit: [0.16, 1, 0.3, 1],
  /** Valt steeds sneller, voor inzakken. */
  val: [0.55, 0, 1, 0.45],
  /** Schiet iets door en veert terug, voor gaten die verschuiven en een landing. */
  veer: [0.34, 1.56, 0.64, 1],
} as const;
export type Ease = keyof typeof EASES;

/** Voortgang (y) bij tijd x van een cubic-bezier, zoals CSS die rekent. */
function bezier([x1, y1, x2, y2]: readonly number[], x: number): number {
  const b = (t: number, p1: number, p2: number) => 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let n = 0; n < 40; n++) {
    const t = (lo + hi) / 2;
    if (b(t, x1, x2) < x) lo = t;
    else hi = t;
  }
  return b((lo + hi) / 2, y1, y2);
}

/** Eén stap in de lus: naar `stand` in `morph` seconden met `ease`, daarna `vast` seconden stil. */
export interface Stap {
  stand: number;
  morph: number;
  ease: Ease;
  vast: number;
}

/**
 * SMIL-tijdlijn voor één letter. Elke overgang wordt in kleine stappen uitgerekend (ongeveer elke 30 ms),
 * zodat de vorm in elk frame klopt: hoekpunten schuiven en afrondingen groeien samen, zonder deukjes.
 * De eerste stap is het begin van de lus; zijn `morph` en `ease` gelden voor de overgang terug vanaf de laatste.
 */
export function animatie(standen: Vorm[], stappen: Stap[], naam = 'letter') {
  const gelezen = lees(standen, naam);
  const gebogen = gebogenIn(gelezen);
  const duur = stappen.reduce((t, s) => t + s.morph + s.vast, 0);
  const tijden: number[] = [];
  const waarden: string[] = [];
  const zet = (t: number, d: string) => {
    tijden.push(t);
    waarden.push(d);
  };

  let t = 0;
  const eerste = gelezen[stappen[0].stand];
  zet(0, teken(eerste, gebogen));
  t += stappen[0].vast;
  zet(t, teken(eerste, gebogen));

  const reeks = [...stappen.slice(1), stappen[0]];
  let van = eerste;
  for (const stap of reeks) {
    const naarStand = gelezen[stap.stand];
    const n = Math.max(4, Math.round(stap.morph / 0.03));
    for (let k = 1; k <= n; k++) {
      const u = k === n ? 1 : bezier(EASES[stap.ease], k / n);
      zet(t + (stap.morph * k) / n, teken(tussen(van, naarStand, u), gebogen));
    }
    t += stap.morph;
    if (stap !== stappen[0]) {
      t += stap.vast;
      zet(t, teken(naarStand, gebogen));
    }
    van = naarStand;
  }

  return {
    duur: +duur.toFixed(3),
    keyTimes: tijden.map((x) => +(x / duur).toFixed(5)).join(';'),
    values: waarden.join(';'),
  };
}

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
