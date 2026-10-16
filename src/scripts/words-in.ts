// Woorden schuiven van onder in zodra een blok in beeld komt (NextProject, `[data-words-in]`).
//
// Hoe het werkt:
// - De woorden staan al in de HTML, elk in een masker (`.w`, clip-path) met daarin het
//   bewegende deel (`.w__i`). Zonder JS staat de tekst er gewoon.
// - Bij astro:page-load zet GSAP de woorden onder het masker (y 1.3em, onzichtbaar, licht
//   gedraaid). Een IntersectionObserver start de animatie als 40% van het blok in beeld is:
//   per woord omhoog met een kleine veer (back.out), dezelfde beweging als de wisseltekst
//   in de hero. Eén keer per pagina.
// - Loopt er een paginatransitie (Interlude, `[data-interlude]` niet `idle`), dan wachten
//   we op `interlude:idle`: anders is de animatie al klaar voordat de pagina in beeld is.
// - Met reduced motion gebeurt er niets.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function init() {
  teardown?.();
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-words-in]')];
  if (!blocks.length || reduce.matches) return;

  const words = (block: Element) => block.querySelectorAll('.w__i');
  blocks.forEach((block) => gsap.set(words(block), { y: '1.3em', opacity: 0, rotation: 2 }));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        gsap.to(words(entry.target), {
          y: 0,
          opacity: 1,
          rotation: 0,
          duration: 0.62,
          stagger: 0.055,
          ease: 'back.out(1.2)',
        });
      });
    },
    { threshold: 0.4 },
  );
  const observe = () => blocks.forEach((block) => observer.observe(block));
  const state = document.querySelector<HTMLElement>('[data-interlude]')?.dataset.state;
  const busy = !!state && state !== 'idle';
  if (busy) document.addEventListener('interlude:idle', observe, { once: true });
  else observe();

  teardown = () => {
    document.removeEventListener('interlude:idle', observe);
    observer.disconnect();
    blocks.forEach((block) => gsap.killTweensOf(words(block)));
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());
