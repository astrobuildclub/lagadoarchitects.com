/*
 * Woordmerk-editor (/brand/editor). Staat: alle letters met hun standen (punten per contour) en stappen (frames).
 * Elke wijziging gaat via wijzig(): eerst een momentopname voor ongedaan maken, dan bewaren in localStorage,
 * dan opnieuw tekenen. De vormen en de animatie komen uit raster.ts, dus wat je hier ziet is wat de site toont.
 */
import { EASES, animatie, paden, type Ease, type Stap, type Vorm } from '../lib/brand/raster';
import { DATA, KLEIN_MAX, maakKlein, vulAan, type WoordmerkData } from '../lib/brand/wordmark';

type Hoek = '' | 's' | 'r';
interface Punt {
  x: number;
  y: number;
  t: Hoek;
  m: number;
}
interface StandE {
  id: string;
  label: string;
  vorm: Punt[][];
}
/** Een set standen met frames: de grote variant (de letter zelf) of de kleine (letter.klein). */
interface Deel {
  standen: StandE[];
  stappen: Stap[];
}
interface LetterE extends Deel {
  id: string;
  teken: string;
  begin: number;
  hover: [number, number];
  klein: Deel;
}
type Maat = 'groot' | 'klein';
interface Staat {
  duur: number;
  letters: LetterE[];
}

const SLEUTEL = 'woordmerk-editor';
const PUNT = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:([rs])(\d*\.?\d+)?)?$/;
const EASE_NAMEN = Object.keys(EASES) as Ease[];
const BLOK = 2;

/* ───────────── Omzetten ───────────── */

function leesPunt(t: string): Punt {
  const m = PUNT.exec(t);
  if (!m) throw new Error(`Onbekend hoekpunt "${t}"`);
  return { x: +m[1], y: +m[2], t: (m[3] ?? '') as Hoek, m: m[4] ? +m[4] : 1 };
}
const getal = (n: number) => String(+n.toFixed(3));
const schrijfPunt = (p: Punt) => `${getal(p.x)},${getal(p.y)}${p.t}${p.t && p.m !== 1 ? getal(p.m).replace(/^0\./, '.') : ''}`;
const vormVan = (s: StandE): Vorm => s.vorm.map((c) => c.map(schrijfPunt).join(' '));

const leesStand = (s: { id: string; label: string; vorm: Vorm }): StandE => ({
  id: s.id,
  label: s.label,
  vorm: s.vorm.map((c) => c.trim().split(/\s+/).map(leesPunt)),
});

function vanData(d: WoordmerkData): Staat {
  const ids = new Set(d.letters.flatMap((l) => [...l.standen, ...(l.klein?.standen ?? [])].map((s) => s.id)));
  return {
    duur: d.duur,
    letters: d.letters.map((l) => {
      const standen = l.standen.map(leesStand);
      let klein: Deel;
      if (l.klein) klein = { standen: l.klein.standen.map(leesStand), stappen: l.klein.stappen.map((s) => ({ ...s })) };
      else {
        // Nog geen kleine variant: begin met een kopie van de eerste grote stand, stil.
        let id = `${l.id.replace(/^g/, '')}k`;
        while (ids.has(id)) id += 'k';
        ids.add(id);
        const bron = standen[l.stappen[0].stand];
        klein = { standen: [{ id, label: `${bron.label} (klein)`, vorm: structuredClone(bron.vorm) }], stappen: [{ stand: 0, morph: 0.35, ease: 'snap', vast: 0.2 }] };
      }
      return { id: l.id, teken: l.teken, begin: l.begin, hover: [l.hover[0], l.hover[1]], standen, stappen: l.stappen.map((s) => ({ ...s })), klein };
    }),
  };
}

const schrijfStappen = (st: Stap[]) => st.map((s) => ({ stand: s.stand, morph: s.morph, ease: s.ease, vast: s.vast }));

function naarData(s: Staat): WoordmerkData {
  return {
    duur: s.duur,
    letters: s.letters.map((l) => ({
      id: l.id,
      teken: l.teken,
      begin: l.begin,
      hover: l.hover,
      standen: l.standen.map((st) => ({ id: st.id, label: st.label, vorm: vormVan(st) })),
      stappen: schrijfStappen(l.stappen),
      klein: { standen: l.klein.standen.map((st) => ({ id: st.id, label: st.label, vorm: vormVan(st) })), stappen: schrijfStappen(l.klein.stappen) },
    })),
  };
}

/** Controle bij importeren en laden: gooit een leesbare fout. */
function valideer(d: WoordmerkData) {
  if (!d || typeof d.duur !== 'number' || !Array.isArray(d.letters)) throw new Error('Dit is geen woordmerk-bestand.');
  for (const l of d.letters) {
    paden(
      l.standen.map((s) => s.vorm),
      l.id,
    );
    if (!l.stappen.length) throw new Error(`${l.id}: geen frames`);
    for (const [naam, deel] of [[l.id, l], [`${l.id} klein`, l.klein ?? { standen: l.standen, stappen: l.stappen }]] as const)
      for (const s of deel.stappen) {
        if (!deel.standen[s.stand]) throw new Error(`${naam}: frame verwijst naar stand ${s.stand + 1}, die bestaat niet`);
        if (!EASE_NAMEN.includes(s.ease)) throw new Error(`${naam}: onbekende ease "${s.ease}"`);
      }
    if (l.klein) {
      if (!l.klein.stappen.length) throw new Error(`${l.id} klein: geen frames`);
      paden(
        l.klein.standen.map((s) => s.vorm),
        `${l.id} klein`,
      );
    }
  }
}

/* ───────────── Staat ───────────── */

let staat: Staat;
const terug: string[] = [];
const vooruit: string[] = [];
const sel = { letter: 0, maat: 'groot' as Maat, frame: 0, punt: null as null | [number, number] };

const momentopname = () => JSON.stringify(naarData(staat));
const letter = () => staat.letters[sel.letter];
const klein = () => sel.maat === 'klein';
/** De variant die je bewerkt: groot (de letter zelf) of klein. */
const deel = (): Deel => (klein() ? letter().klein : letter());
const stap = () => deel().stappen[sel.frame];
const stand = () => deel().standen[stap().stand];

function klem() {
  sel.letter = Math.min(Math.max(0, sel.letter), staat.letters.length - 1);
  sel.frame = Math.min(Math.max(0, sel.frame), deel().stappen.length - 1);
  if (sel.punt) {
    const [k, i] = sel.punt;
    if (!stand().vorm[k]?.[i]) sel.punt = null;
  }
}

function bewaar() {
  try {
    localStorage.setItem(SLEUTEL, momentopname());
  } catch {}
}

function wijzig(fn: () => void) {
  terug.push(momentopname());
  if (terug.length > 200) terug.shift();
  vooruit.length = 0;
  fn();
  klem();
  bewaar();
  render();
}

function herstel(van: string[], naar: string[]) {
  const v = van.pop();
  if (!v) return;
  naar.push(momentopname());
  staat = vanData(JSON.parse(v));
  klem();
  bewaar();
  render();
}

/* ───────────── DOM ───────────── */

const $ = <T extends Element = HTMLElement>(id: string) => document.getElementById(id) as unknown as T;
const doek = $<SVGSVGElement>('doek');
const voorbeeld = $<SVGSVGElement>('voorbeeld');
const woord = $<SVGSVGElement>('woord');
const scrub = $<HTMLInputElement>('scrub');
const speel = $<HTMLButtonElement>('speel');
const tijd = $<HTMLOutputElement>('tijd');
const melding = $('melding');

function meld(tekst: string, fout = false) {
  melding.textContent = tekst;
  melding.toggleAttribute('data-fout', fout);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const komma = (n: number, d = 2) => n.toFixed(d).replace('.', ',');

/** Na opnieuw tekenen de focus terugzetten op het element met dezelfde data-focus. */
function metFocus(fn: () => void) {
  const sleutel = (document.activeElement as HTMLElement | null)?.dataset?.focus;
  fn();
  if (sleutel) document.querySelector<HTMLElement | SVGElement>(`[data-focus="${sleutel}"]`)?.focus();
}

function render() {
  metFocus(() => {
    renderLetters();
    renderDoek();
    renderPunt();
    renderStand();
    renderStrip();
  });
  renderVoorbeeld();
  $<HTMLButtonElement>('ongedaan').disabled = !terug.length;
  $<HTMLButtonElement>('opnieuw').disabled = !vooruit.length;
}

/* Letters */

function renderLetters() {
  document.querySelectorAll<HTMLButtonElement>('[data-maat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.maat === sel.maat)));
  document.documentElement.toggleAttribute('data-ed-klein', klein());
  $('letters').innerHTML = staat.letters
    .map(
      (l, i) =>
        `<button type="button" class="knop" data-letter="${i}" data-focus="letter-${i}" aria-pressed="${i === sel.letter}" aria-label="Letter ${i + 1}: ${esc(l.teken)}">${esc(l.teken)}</button>`,
    )
    .join('');
}
$('letters').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-letter]');
  if (!b) return;
  sel.letter = +b.dataset.letter!;
  sel.frame = 0;
  sel.punt = null;
  render();
});
$('maat').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-maat]');
  if (!b || b.dataset.maat === sel.maat) return;
  sel.maat = b.dataset.maat as Maat;
  sel.frame = 0;
  sel.punt = null;
  render();
  if (voorbeeld.animationsPaused()) zetTijd(0);
});

/* Tekenvlak */

function renderDoek() {
  const l = deel();
  const d = paden(l.standen.map(vormVan), letter().id);
  const vorigeStand = l.stappen[(sel.frame - 1 + l.stappen.length) % l.stappen.length].stand;
  const delen: string[] = [];

  for (let g = 0; g <= 5; g++) {
    delen.push(`<line class="lijn" x1="0" y1="${g * BLOK}" x2="10" y2="${g * BLOK}"/>`);
    delen.push(`<line class="lijn" x1="${g * BLOK}" y1="0" x2="${g * BLOK}" y2="10"/>`);
    delen.push(`<text class="as" x="${g * BLOK}" y="-0.8">${g}</text><text class="as" x="-0.8" y="${g * BLOK}">${g}</text>`);
  }
  if (vorigeStand !== stap().stand) delen.push(`<path class="ui" d="${d[vorigeStand]}" fill-rule="evenodd"/>`);
  delen.push(`<path class="vorm" d="${d[stap().stand]}" fill-rule="evenodd"/>`);
  delen.push(`<path class="rand" d="${d[stap().stand]}"/>`);
  for (let x = 0; x <= 5; x++) for (let y = 0; y <= 5; y++) delen.push(`<circle class="stip" cx="${x * BLOK}" cy="${y * BLOK}" r="0.07"/>`);

  // Punten op dezelfde plek: één getal ernaast.
  const plekken = new Map<string, number>();
  stand().vorm.forEach((c) => c.forEach((p) => plekken.set(`${p.x},${p.y}`, (plekken.get(`${p.x},${p.y}`) ?? 0) + 1)));
  plekken.forEach((n, plek) => {
    if (n < 2) return;
    const [x, y] = plek.split(',').map(Number);
    delen.push(`<text class="aantal" x="${x * BLOK + 0.4}" y="${y * BLOK - 0.4}">${n}</text>`);
  });

  stand().vorm.forEach((c, k) =>
    c.forEach((p, i) => {
      const gekozen = sel.punt?.[0] === k && sel.punt?.[1] === i;
      const cx = p.x * BLOK;
      const cy = p.y * BLOK;
      const teken =
        p.t === 'r'
          ? `<circle class="teken" cx="${cx}" cy="${cy}" r="0.24"/>`
          : p.t === 's'
            ? `<rect class="teken" x="${cx - 0.19}" y="${cy - 0.19}" width="0.38" height="0.38" transform="rotate(45 ${cx} ${cy})"/>`
            : `<rect class="teken" x="${cx - 0.2}" y="${cy - 0.2}" width="0.4" height="0.4"/>`;
      const soort = p.t === 'r' ? 'rond' : p.t === 's' ? 'schuin' : 'recht';
      delen.push(
        `<g class="punt${gekozen ? ' is-gekozen' : ''}" data-k="${k}" data-i="${i}" data-focus="punt-${k}-${i}" tabindex="0" role="button" aria-pressed="${gekozen}" aria-label="${k === 0 ? 'Buitenrand' : `Gat ${k}`}, punt ${i + 1}: ${getal(p.x)}, ${getal(p.y)}, ${soort}"><circle class="raak" cx="${cx}" cy="${cy}" r="0.45"/>${teken}</g>`,
      );
    }),
  );
  doek.innerHTML = delen.join('');
}

let sleep: { pointer: number; k: number; i: number; voor: string; veranderd: boolean } | null = null;

function rasterPunt(e: PointerEvent): [number, number] {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(doek.getScreenCTM()!.inverse());
  const stapje = e.shiftKey ? 0.5 : 1;
  const zet = (v: number) => Math.min(5, Math.max(0, Math.round(v / BLOK / stapje) * stapje));
  return [zet(p.x), zet(p.y)];
}

doek.addEventListener('pointerdown', (e) => {
  const g = (e.target as Element).closest<SVGGElement>('.punt');
  if (!g) {
    sel.punt = null;
    metFocus(() => {
      renderDoek();
      renderPunt();
    });
    return;
  }
  e.preventDefault();
  const k = +g.dataset.k!;
  const i = +g.dataset.i!;
  sel.punt = [k, i];
  sleep = { pointer: e.pointerId, k, i, voor: momentopname(), veranderd: false };
  doek.setPointerCapture(e.pointerId);
  renderDoek();
  renderPunt();
});

doek.addEventListener('pointermove', (e) => {
  if (!sleep || e.pointerId !== sleep.pointer) return;
  const p = stand().vorm[sleep.k][sleep.i];
  const [x, y] = rasterPunt(e);
  if (x === p.x && y === p.y) return;
  p.x = x;
  p.y = y;
  sleep.veranderd = true;
  renderDoek();
  renderPunt();
});

function laatLos(e: PointerEvent) {
  if (!sleep || e.pointerId !== sleep.pointer) return;
  if (sleep.veranderd) {
    terug.push(sleep.voor);
    vooruit.length = 0;
    bewaar();
    render();
  }
  sleep = null;
  doek.querySelector<SVGGElement>('.punt.is-gekozen')?.focus({ preventScroll: true });
}
doek.addEventListener('pointerup', laatLos);
doek.addEventListener('pointercancel', laatLos);

doek.addEventListener('focusin', (e) => {
  const g = (e.target as Element).closest<SVGGElement>('.punt');
  if (!g || sleep) return;
  const k = +g.dataset.k!;
  const i = +g.dataset.i!;
  if (sel.punt?.[0] === k && sel.punt?.[1] === i) return;
  sel.punt = [k, i];
  doek.querySelectorAll('.punt').forEach((el) => {
    const ja = el === g;
    el.classList.toggle('is-gekozen', ja);
    el.setAttribute('aria-pressed', String(ja));
  });
  renderPunt();
});

doek.addEventListener('keydown', (e) => {
  const g = (e.target as Element).closest<SVGGElement>('.punt');
  if (!g || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = +g.dataset.k!;
  const i = +g.dataset.i!;
  const s = e.shiftKey ? 0.5 : 1;
  const richting: Record<string, [number, number]> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
  const hoek: Record<string, Hoek> = { r: 'r', s: 's', x: '' };
  const r = richting[e.key];
  const h = hoek[e.key.toLowerCase()];
  if (!r && h === undefined) return;
  e.preventDefault();
  wijzig(() => {
    const p = stand().vorm[k][i];
    sel.punt = [k, i];
    if (r) {
      p.x = Math.min(5, Math.max(0, p.x + r[0]));
      p.y = Math.min(5, Math.max(0, p.y + r[1]));
    } else p.t = h;
  });
});

/* Paneel: punt */

function renderPunt() {
  const p = sel.punt ? stand().vorm[sel.punt[0]][sel.punt[1]] : null;
  const velden = ['p-x', 'p-y', 'p-type', 'p-maat'].map((id) => $<HTMLInputElement>(id));
  velden.forEach((v) => (v.disabled = !p));
  $('punt-naam').textContent = p && sel.punt ? `${sel.punt[0] === 0 ? 'buitenrand' : `gat ${sel.punt[0]}`} · ${sel.punt[1] + 1}` : 'kies een punt';
  if (!p) return;
  const [x, y, type, maat] = velden;
  if (document.activeElement !== x) x.value = getal(p.x);
  if (document.activeElement !== y) y.value = getal(p.y);
  type.value = p.t;
  maat.value = String(p.m);
  maat.disabled = !p.t;
}

function zetPunt(fn: (p: Punt) => void) {
  if (!sel.punt) return;
  const [k, i] = sel.punt;
  wijzig(() => fn(stand().vorm[k][i]));
}
const klemBlok = (v: number) => Math.min(5, Math.max(0, Math.round(v * 2) / 2));
$<HTMLInputElement>('p-x').addEventListener('change', (e) => zetPunt((p) => (p.x = klemBlok(+(e.target as HTMLInputElement).value))));
$<HTMLInputElement>('p-y').addEventListener('change', (e) => zetPunt((p) => (p.y = klemBlok(+(e.target as HTMLInputElement).value))));
$<HTMLSelectElement>('p-type').addEventListener('change', (e) => zetPunt((p) => (p.t = (e.target as HTMLSelectElement).value as Hoek)));
$<HTMLSelectElement>('p-maat').addEventListener('change', (e) => zetPunt((p) => (p.m = +(e.target as HTMLSelectElement).value)));

/* Paneel: stand en begin */

function renderStand() {
  const l = deel();
  $('stand-keuze').innerHTML = l.standen
    .map((s, n) => `<option value="${n}"${n === stap().stand ? ' selected' : ''}>${esc(s.id)} · ${esc(s.label)}</option>`)
    .join('');
  const label = $<HTMLInputElement>('stand-label');
  if (document.activeElement !== label) label.value = stand().label;
  const begin = $<HTMLInputElement>('letter-begin');
  if (document.activeElement !== begin) begin.value = getal(letter().begin);
}
$('stand-keuze').addEventListener('change', (e) => wijzig(() => (stap().stand = +(e.target as HTMLSelectElement).value)));
$('stand-label').addEventListener('change', (e) => wijzig(() => (stand().label = (e.target as HTMLInputElement).value.trim() || stand().id)));
$('letter-begin').addEventListener('change', (e) => wijzig(() => (letter().begin = Math.min(0, +(e.target as HTMLInputElement).value || 0))));

/* Frames */

function renderStrip() {
  const l = deel();
  const d = paden(l.standen.map(vormVan), letter().id);
  $('strip').innerHTML = l.stappen
    .map((s, j) => {
      const easeOpties = EASE_NAMEN.map((n) => `<option${n === s.ease ? ' selected' : ''}>${n}</option>`).join('');
      return `<li class="frame">
        <div class="overgang">
          <span class="overgang__label">${j === 0 ? (klein() ? 'Terug aan het eind' : 'Terug naar begin') : 'Overgang'}</span>
          <select data-j="${j}" data-veld="ease" data-focus="f-${j}-ease" aria-label="Ease naar frame ${j + 1}">${easeOpties}</select>
          <input type="number" min="0.05" step="0.05" value="${getal(s.morph)}" data-j="${j}" data-veld="morph" data-focus="f-${j}-morph" aria-label="Duur van de morph naar frame ${j + 1}, in seconden" />
        </div>
        <button type="button" class="frame__knop" data-frame="${j}" data-focus="f-${j}" aria-pressed="${j === sel.frame}">
          <svg viewBox="-1 -1 12 12" aria-hidden="true"><path d="${d[s.stand]}" fill-rule="evenodd"/></svg>
          <span>${j + 1} · ${esc(l.standen[s.stand].id)}</span>
        </button>
        <label class="stil">${j === 0 && klein() ? 'Wacht' : 'Stil'} <input type="number" min="0" step="0.05" value="${getal(s.vast)}" data-j="${j}" data-veld="vast" data-focus="f-${j}-vast" aria-label="Stilstand van frame ${j + 1}, in seconden" /></label>
      </li>`;
    })
    .join('');

  const totaal = l.stappen.reduce((t, s) => t + s.morph + s.vast, 0);
  const el = $('totaal');
  const max = klein() ? KLEIN_MAX : staat.duur;
  const over = totaal > max + 1e-9;
  el.textContent = klein()
    ? l.stappen.length < 2
      ? 'Eén frame: de kleine letter staat stil. Voeg een frame toe om hem te laten bewegen.'
      : over
        ? `Duurt ${komma(totaal)} s, langer dan ${komma(max, 1)} s: maak morphs of stilstanden korter.`
        : `Speelt één keer, ${komma(totaal)} s (hooguit ${komma(max, 1)} s), en eindigt in frame 1.`
    : over
      ? `Lus duurt ${komma(totaal)} s, langer dan ${komma(staat.duur, 0)} s: maak morphs of stilstanden korter.`
      : `Lus: ${komma(totaal)} s van ${komma(staat.duur, 0)} s, de overige ${komma(staat.duur - totaal)} s staat het eerste frame stil.`;
  el.toggleAttribute('data-fout', over);

  $<HTMLButtonElement>('frame-weg').disabled = l.stappen.length < 2;
  $<HTMLButtonElement>('frame-links').disabled = sel.frame === 0;
  $<HTMLButtonElement>('frame-rechts').disabled = sel.frame === l.stappen.length - 1;
}

$('strip').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-frame]');
  if (!b) return;
  sel.frame = +b.dataset.frame!;
  render();
  if (voorbeeld.animationsPaused()) zetTijd(frameTijd(sel.frame));
});
$('strip').addEventListener('change', (e) => {
  const v = e.target as HTMLInputElement | HTMLSelectElement;
  const j = Number(v.dataset.j);
  const veld = v.dataset.veld as keyof Stap;
  if (!veld) return;
  wijzig(() => {
    const s = deel().stappen[j];
    if (veld === 'ease') s.ease = v.value as Ease;
    else if (veld === 'morph') s.morph = Math.max(0.05, +(+v.value).toFixed(3) || 0.05);
    else if (veld === 'vast') s.vast = Math.max(0, +(+v.value).toFixed(3) || 0);
  });
});

/** Unieke id voor een nieuwe stand: letter-id zonder de g, plus een nummer (ids gelden voor de hele pagina). */
function nieuweId() {
  const alle = new Set(staat.letters.flatMap((l) => [...l.standen, ...l.klein.standen].map((s) => s.id)));
  const basis = `${letter().id.replace(/^g/, '')}${klein() ? 'k' : ''}`;
  let n = deel().standen.length + 1;
  while (alle.has(`${basis}-${n}`)) n++;
  return `${basis}-${n}`;
}

$('frame-nieuw').addEventListener('click', () =>
  wijzig(() => {
    const l = deel();
    const kopie: StandE = { id: nieuweId(), label: `${stand().label} (kopie)`, vorm: structuredClone(stand().vorm) };
    l.standen.push(kopie);
    l.stappen.splice(sel.frame + 1, 0, { ...stap(), stand: l.standen.length - 1, vast: 0.6 });
    sel.frame++;
    meld(`Nieuwe stand ${kopie.id}, een kopie van de vorige. Versleep de punten.`);
  }),
);
$('frame-herhaal').addEventListener('click', () =>
  wijzig(() => {
    deel().stappen.splice(sel.frame + 1, 0, { ...stap(), vast: 0.6 });
    sel.frame++;
  }),
);
function verschuif(r: -1 | 1) {
  wijzig(() => {
    const st = deel().stappen;
    const j = sel.frame;
    [st[j], st[j + r]] = [st[j + r], st[j]];
    sel.frame = j + r;
  });
}
$('frame-links').addEventListener('click', () => verschuif(-1));
$('frame-rechts').addEventListener('click', () => verschuif(1));
$('frame-weg').addEventListener('click', () =>
  wijzig(() => {
    deel().stappen.splice(sel.frame, 1);
    sel.frame = Math.max(0, sel.frame - 1);
  }),
);
$('opruimen').addEventListener('click', () => {
  const l = deel();
  const hover = klein() ? [] : letter().hover;
  const gebruikt = new Set([...l.stappen.map((s) => s.stand), ...hover]);
  const weg = l.standen.filter((_, n) => !gebruikt.has(n)).map((s) => s.id);
  if (!weg.length) return meld('Alle standen worden gebruikt.');
  wijzig(() => {
    const nieuw = new Map<number, number>();
    l.standen = l.standen.filter((_, n) => {
      if (!gebruikt.has(n)) return false;
      nieuw.set(n, nieuw.size);
      return true;
    });
    l.stappen.forEach((s) => (s.stand = nieuw.get(s.stand)!));
    if (!klein()) letter().hover = [nieuw.get(hover[0])!, nieuw.get(hover[1])!];
    meld(`Verwijderd: ${weg.join(', ')}.`);
  });
});

/* ───────────── Voorbeeld ───────────── */

const NS = 'http://www.w3.org/2000/svg';

const duurVan = (st: Stap[]) => st.reduce((t, s) => t + s.morph + s.vast, 0);
/**
 * Lengte van de lus in het voorbeeld. Groot: de lus van de site. Klein speelt op de site één keer; hier herhaalt
 * hij, na de langste kleine letter plus een seconde stilte, zodat alle letters samen opnieuw beginnen.
 */
const lusduur = (m: Maat) => (m === 'groot' ? staat.duur : Math.max(...staat.letters.map((l) => duurVan(l.klein.stappen))) + 1);

function glyph(l: LetterE, m: Maat, x = 0) {
  const d = m === 'groot' ? l : l.klein;
  const vormen = d.standen.map(vormVan);
  const naam = m === 'groot' ? l.id : `${l.id} klein`;
  const pad = document.createElementNS(NS, 'path');
  pad.setAttribute('d', paden(vormen, naam)[d.stappen[0].stand]);
  pad.setAttribute('fill-rule', 'evenodd');
  if (x) pad.setAttribute('transform', `translate(${x} 0)`);
  if (d.stappen.length < 2) return pad;
  const stappen = m === 'groot' ? vulAan(d.stappen, staat.duur, naam) : d.stappen;
  const a = animatie(vormen, stappen, naam);
  const lus = lusduur(m);
  // Klein: tijden schalen naar de lus en de rest stil laten staan in de eindstand.
  const keyTimes = m === 'groot' ? a.keyTimes : `${a.keyTimes.split(';').map((k) => +((+k * a.duur) / lus).toFixed(5)).join(';')};1`;
  const values = m === 'groot' ? a.values : `${a.values};${a.values.slice(a.values.lastIndexOf(';') + 1)}`;
  const anim = document.createElementNS(NS, 'animate');
  Object.entries({
    attributeName: 'd',
    dur: `${lus}s`,
    begin: `${m === 'groot' ? l.begin : 0}s`,
    repeatCount: 'indefinite',
    calcMode: 'linear',
    keyTimes,
    values,
  }).forEach(([k, v]) => anim.setAttribute(k, v));
  pad.append(anim);
  return pad;
}

function renderVoorbeeld() {
  try {
    if (klein()) staat.letters.forEach((l) => maakKlein(naarData({ duur: staat.duur, letters: [l] }).letters[0]));
    voorbeeld.replaceChildren(glyph(letter(), sel.maat));
    woord.replaceChildren(...staat.letters.map((l, i) => glyph(l, sel.maat, i * 12)));
    document.querySelectorAll<SVGSVGElement>('[data-ware]').forEach((svg) => {
      const m = svg.dataset.ware as Maat;
      svg.replaceChildren(...staat.letters.map((l, i) => glyph(l, m, i * 12)));
    });
    scrub.max = String(lusduur(sel.maat));
    if (melding.hasAttribute('data-fout')) meld('');
  } catch (e) {
    meld((e as Error).message, true);
  }
}

/** Moment in de lus waarop frame j helemaal bereikt is. */
function frameTijd(j: number) {
  const l = deel().stappen;
  const totaal = duurVan(l);
  const st = klein() ? l : l.map((s, n) => (n === 0 ? { ...s, vast: s.vast + Math.max(0, staat.duur - totaal) } : s));
  let t = st[0].vast;
  for (let n = 1; n <= j; n++) t += st[n].morph + (n < j ? st[n].vast : 0);
  return j === 0 ? 0 : t;
}

function zetTijd(t: number) {
  voorbeeld.pauseAnimations();
  voorbeeld.setCurrentTime(t);
  scrub.value = String(t);
  tijd.value = `${komma(t)} s`;
  speel.textContent = 'Afspelen';
}

scrub.addEventListener('input', () => zetTijd(+scrub.value));
speel.addEventListener('click', () => {
  if (voorbeeld.animationsPaused()) {
    voorbeeld.unpauseAnimations();
    speel.textContent = 'Pauzeren';
  } else zetTijd(voorbeeld.getCurrentTime() % lusduur(sel.maat));
});
function lus() {
  if (!voorbeeld.animationsPaused()) {
    const t = voorbeeld.getCurrentTime() % lusduur(sel.maat);
    scrub.value = String(t);
    tijd.value = `${komma(t)} s`;
  }
  requestAnimationFrame(lus);
}

/* ───────────── Export en import ───────────── */

const json = () => `${JSON.stringify(naarData(staat), null, 2)}\n`;

function klaarVoorExport() {
  try {
    staat.letters.forEach((l) => vulAan(l.stappen, staat.duur, l.id));
    naarData(staat).letters.forEach((l) => maakKlein(l));
    return true;
  } catch (e) {
    meld(`Niet geëxporteerd: ${(e as Error).message}.`, true);
    return false;
  }
}

$('exporteer').addEventListener('click', () => {
  if (!klaarVoorExport()) return;
  const url = URL.createObjectURL(new Blob([json()], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'woordmerk.json' });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  meld('woordmerk.json gedownload. Vervang daarmee src/lib/brand/woordmerk.json.');
});

$('kopieer').addEventListener('click', async () => {
  if (!klaarVoorExport()) return;
  try {
    await navigator.clipboard.writeText(json());
    meld('JSON gekopieerd naar het klembord.');
  } catch {
    meld('Kopiëren lukt niet in deze browser; gebruik Exporteren.', true);
  }
});

$<HTMLInputElement>('importeer').addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  const bestand = input.files?.[0];
  input.value = '';
  if (!bestand) return;
  try {
    const d = JSON.parse(await bestand.text()) as WoordmerkData;
    valideer(d);
    wijzig(() => {
      staat = vanData(d);
      sel.frame = 0;
      sel.punt = null;
    });
    meld(`${bestand.name} geïmporteerd.`);
  } catch (err) {
    meld(`Importeren mislukt: ${(err as Error).message}`, true);
  }
});

$('terugzetten').addEventListener('click', () => {
  wijzig(() => {
    staat = vanData(DATA);
    sel.punt = null;
  });
  meld('Teruggezet naar de versie van de site. Ongedaan maken kan met ⌘Z.');
});

$('ongedaan').addEventListener('click', () => herstel(terug, vooruit));
$('opnieuw').addEventListener('click', () => herstel(vooruit, terug));
document.addEventListener('keydown', (e) => {
  if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
  const doel = e.target as HTMLElement;
  if (doel.matches('input:not([type="range"]), select, textarea')) return;
  e.preventDefault();
  if (e.shiftKey) herstel(vooruit, terug);
  else herstel(terug, vooruit);
});

/* ───────────── Start ───────────── */

function laad(): Staat {
  try {
    const bewaard = localStorage.getItem(SLEUTEL);
    if (bewaard && bewaard !== JSON.stringify(DATA)) {
      const d = JSON.parse(bewaard) as WoordmerkData;
      valideer(d);
      meld('Je laatste werk uit deze browser is geladen.');
      return vanData(d);
    }
  } catch {}
  return vanData(DATA);
}

staat = laad();
render();
lus();
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  zetTijd(0);
  woord.pauseAnimations();
  document.querySelectorAll<SVGSVGElement>('[data-ware]').forEach((svg) => svg.pauseAnimations());
}
