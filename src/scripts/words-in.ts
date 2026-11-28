// Woorden verschijnen kort na elkaar zodra een blok in beeld komt (`[data-words-in]`).
//
// Hoe het werkt:
// - De woorden staan al in de HTML, elk in een masker (`.w`, clip-path) met daarin het
//   bewegende deel (`.w__i`). Zonder JS staat de tekst er gewoon.
// - Bij astro:page-load maakt GSAP de woorden onzichtbaar. Een IntersectionObserver
//   start de animatie als 40% van het blok in beeld is: elk woord verschijnt met een
//   korte fade, zonder verplaatsing of veer, in het tempo van de wisseltekst op de home
//   (Hero.astro: data-in 0.25, data-fade 0.1). Eén keer per pagina.
// - Loopt er een paginatransitie (Interlude, `[data-interlude]` niet `idle`), dan wachten
//   we op `interlude:idle`: anders is de animatie al klaar voordat de pagina in beeld is.
// - `[data-words-in="split"]` (rich text, bv. het verhaal in de footer): de woorden staan niet
//   in de HTML; GSAP SplitText knipt ze bij page-load in `.w__i`-spans (alleen fade, geen masker).
// - Lange teksten: de stagger krimpt zodat het hele blok binnen ~3 s verschijnt.
// - Met reduced motion gebeurt er niets (en wordt er ook niet geknipt).
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function init() {
  teardown?.();
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-words-in]')];
  if (!blocks.length || reduce.matches) return;

  const splits = blocks
    .filter((block) => block.dataset.wordsIn === 'split')
    .map((block) => SplitText.create(block, { type: 'words', wordsClass: 'w__i' }));

  const words = (block: Element) => block.querySelectorAll('.w__i');
  blocks.forEach((block) => gsap.set(words(block), { opacity: 0 }));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const w = words(entry.target);
        gsap.to(w, {
          opacity: 1,
          duration: 0.1,
          stagger: Math.min(0.25, 3 / w.length),
          ease: 'none',
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
    splits.forEach((split) => split.revert());
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());
