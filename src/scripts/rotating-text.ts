// Wisselende woorden in de hero (Hero.astro, `kopWissel` / `subkopWissel`).
//
// Hoe het werkt:
// - De wisselzin staat inline in de gewone tekst. Elk woord zit in een masker
//   (`.w`, clip-path) met daarin het bewegende deel (`.w__i`). Tussen de woorden staan
//   gewone spaties, dus de browser breekt per woord om, net als normale tekst.
// - Eén wissel = drie stappen na elkaar, geen overlap: oude woorden schuiven omhoog
//   het masker uit (stagger), de tekst wordt vervangen, nieuwe woorden komen van onderen
//   in met een kleine veer (back.out). Daarna wacht een delayedCall `hold` seconden.
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
  index: number;
  /** Lopende tween of wachttijd; nieuwe stappen ontstaan in callbacks. */
  current?: gsap.core.Tween | gsap.core.Timeline;
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function fill(target: HTMLElement, phrase: string) {
  target.replaceChildren();
  phrase.split(' ').forEach((word, i) => {
    if (i > 0) target.append(' ');
    const mask = document.createElement('span');
    mask.className = 'w';
    const inner = document.createElement('span');
    inner.className = 'w__i';
    inner.textContent = word;
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
    return [{ block, target, phrases, hold: Number(root.dataset.hold ?? 3), delay: Number(root.dataset.delay ?? 0), index: 0 }];
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
    const outgoing = r.target.querySelectorAll('.w__i');
    track(
      r,
      gsap.to(outgoing, {
        y: '-1.3em',
        opacity: 0,
        rotation: -2,
        duration: 0.38,
        stagger: 0.045,
        ease: 'power2.in',
        onComplete: () => {
          r.index = (r.index + 1) % r.phrases.length;
          fill(r.target, r.phrases[r.index]);
          const incoming = r.target.querySelectorAll('.w__i');
          track(
            r,
            gsap.fromTo(
              incoming,
              { y: '1.3em', opacity: 0, rotation: 2 },
              {
                y: 0,
                opacity: 1,
                rotation: 0,
                duration: 0.62,
                stagger: 0.055,
                ease: 'back.out(1.2)',
                onComplete: () => wait(r, r.hold),
              },
            ),
          );
        },
      }),
    );
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
