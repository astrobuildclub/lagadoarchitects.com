// Wisselende woorden in de hero (Hero.astro, `kopWissel` / `subkopWissel`).
//
// Hoe het werkt:
// - De wisselzin staat inline in de gewone tekst. Elk woord zit met zijn spatie in een
//   eigen span (`.w` met `.w__i`), dus de browser breekt per woord om en de onderstreping
//   loopt door onder de spaties.
// - Eén wissel, zonder beweging. Alle tijden in seconden, per regel als data-attribuut op
//   `[data-rotate]` (Hero.astro):
//     data-hold  zo lang staat de zin
//     data-uit   stap per woord bij het verdwijnen (0 = alle woorden tegelijk weg, hard)
//     data-leeg  zo lang blijft het daarna leeg
//     data-in    stap per woord bij het verschijnen
//     data-fade  duur van de fade-in per woord (opacity 0 → 1; 0 = hard aan)
//   Volgorde: staan → weg (van achter naar voor) → leeg → nieuwe woorden één voor één erin.
// - Nieuwe woorden worden onzichtbaar aangemaakt (inline visibility: hidden) en verschijnen
//   door die stijl weer weg te halen. Zo is er geen frame waarin de nieuwe zin al te zien is,
//   en erft de meetkloon (reserve) nooit een geforceerd zichtbaar woord.
// - De hoogte van de kop/subkop wordt vooraf gereserveerd: een onzichtbare kloon op
//   dezelfde breedte meet elke variant en het blok krijgt de grootste hoogte als
//   min-block-size. Zo schuift de inhoud eronder niet als een variant langer is.
// - WCAG 2.2.2: pauzeknop. Ook pauze bij een verborgen tab. Met reduced motion
//   gebeurt er niets en blijft de eerste variant staan.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';

interface Rotator {
  block: HTMLElement;
  target: HTMLElement;
  phrases: string[];
  hold: number;
  delay: number;
  uit: number;
  leeg: number;
  in: number;
  fade: number;
  index: number;
  /** Lopende tween of wachttijd; nieuwe stappen ontstaan in callbacks. */
  current?: gsap.core.Tween | gsap.core.Timeline;
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function fill(target: HTMLElement, phrase: string, hidden = false) {
  target.replaceChildren();
  const words = phrase.split(' ');
  words.forEach((word, i) => {
    const mask = document.createElement('span');
    mask.className = 'w';
    const inner = document.createElement('span');
    inner.className = 'w__i';
    // Spatie in het woord zelf (zie Hero.astro): de onderstreping loopt door en verdwijnt mee.
    inner.textContent = i < words.length - 1 ? `${word} ` : word;
    if (hidden) inner.style.visibility = 'hidden';
    mask.append(inner);
    target.append(mask);
  });
}

/** Grootste hoogte van alle varianten op de huidige breedte. */
function reserve(r: Rotator) {
  r.block.style.minBlockSize = '';
  const width = r.block.getBoundingClientRect().width;
  const clone = r.block.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: 'absolute',
    insetBlockStart: '0',
    insetInlineStart: '0',
    inlineSize: `${width}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
  });
  clone.setAttribute('aria-hidden', 'true');
  r.block.after(clone);
  const target = clone.querySelector<HTMLElement>('[data-words]')!;
  let max = 0;
  for (const phrase of r.phrases) {
    fill(target, phrase);
    max = Math.max(max, clone.getBoundingClientRect().height);
  }
  clone.remove();
  r.block.style.minBlockSize = `${Math.ceil(max)}px`;
}

function init() {
  teardown?.();
  const roots = [...document.querySelectorAll<HTMLElement>('[data-rotate]')];
  if (!roots.length) return;

  const rotators: Rotator[] = roots.flatMap((root) => {
    const target = root.querySelector<HTMLElement>('[data-words]');
    const block = root.closest<HTMLElement>('[data-rotate-block]');
    const phrases: string[] = target ? JSON.parse(target.dataset.words ?? '[]') : [];
    if (!target || !block || phrases.length < 2) return [];
    const d = root.dataset;
    const num = (v: string | undefined, standaard: number) => (v === undefined || v === '' ? standaard : Number(v));
    return [
      {
        block,
        target,
        phrases,
        hold: num(d.hold, 5),
        delay: num(d.delay, 0),
        uit: num(d.uit, 0),
        leeg: num(d.leeg, 1),
        in: num(d.in, 0.5),
        fade: num(d.fade, 0.2),
        index: 0,
      },
    ];
  });
  if (!rotators.length) return;

  const button = document.querySelector<HTMLButtonElement>('[data-rotate-toggle]');
  let userPaused = false;
  const isPaused = () => userPaused || document.hidden;

  /** Elke nieuwe stap start gepauzeerd als de animatie op pauze staat. */
  const track = <T extends gsap.core.Tween | gsap.core.Timeline>(r: Rotator, t: T) => {
    r.current = t;
    if (isPaused()) t.pause();
    return t;
  };

  const wait = (r: Rotator, seconds: number) => track(r, gsap.delayedCall(seconds, () => swap(r)));

  function swap(r: Rotator) {
    const outgoing = [...r.target.querySelectorAll<HTMLElement>('.w__i')].reverse();
    const uit = gsap.timeline({ onComplete: () => verschijn(r) });
    outgoing.forEach((w, i) => uit.set(w, { visibility: 'hidden' }, i * r.uit));
    uit.set({}, {}, Math.max(outgoing.length - 1, 0) * r.uit + r.leeg);
    track(r, uit);
  }

  function verschijn(r: Rotator) {
    r.index = (r.index + 1) % r.phrases.length;
    fill(r.target, r.phrases[r.index], true);
    const incoming = [...r.target.querySelectorAll<HTMLElement>('.w__i')];
    const tl = gsap.timeline({ onComplete: () => wait(r, r.hold) });
    incoming.forEach((w, i) => {
      // Zichtbaar maken door de inline verberging weg te halen (zie fill), dan de fade.
      tl.call(() => w.style.removeProperty('visibility'), [], i * r.in);
      if (r.fade > 0) tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: r.fade, ease: 'none' }, i * r.in);
    });
    track(r, tl);
  }

  const sync = () => rotators.forEach((r) => (isPaused() ? r.current?.pause() : r.current?.resume()));

  const stop = () => {
    rotators.forEach((r) => {
      r.current?.kill();
      r.current = undefined;
      r.index = 0;
      fill(r.target, r.phrases[0]);
    });
  };

  const start = () => {
    stop();
    if (button) button.hidden = reduce.matches;
    if (reduce.matches) return;
    rotators.forEach((r) => wait(r, r.hold + r.delay));
  };

  // Hoogte opnieuw meten als de breedte verandert (niet bij elke hoogteverandering).
  let lastWidth = 0;
  let frame = 0;
  const measure = () => rotators.forEach(reserve);
  const observer = new ResizeObserver(([entry]) => {
    const width = Math.round(entry.contentRect.width);
    if (width === lastWidth) return;
    lastWidth = width;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  });
  observer.observe(rotators[0].block.parentElement!);
  document.fonts.ready.then(measure);

  const onToggle = () => {
    userPaused = !userPaused;
    button!.setAttribute('aria-pressed', String(userPaused));
    button!.textContent = userPaused ? 'Animatie hervatten' : 'Animatie pauzeren';
    sync();
  };
  button?.addEventListener('click', onToggle);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', start);

  start();

  teardown = () => {
    rotators.forEach((r) => r.current?.kill());
    observer.disconnect();
    cancelAnimationFrame(frame);
    button?.removeEventListener('click', onToggle);
    document.removeEventListener('visibilitychange', sync);
    reduce.removeEventListener('change', start);
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());
