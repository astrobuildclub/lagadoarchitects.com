// Reveal on scroll: de directe kinderen van `[data-reveal]` (de blokken van een pagina) schuiven
// subtiel omhoog en vervagen in zodra ze in beeld komen.
//
// Hoe het werkt:
// - Onderdelen met een eigen animatie doen niet mee: de projectkop (`data-kop-in`), de vraag
//   (`data-ink`) en alles met woorden die inschuiven (`data-words-in`, zoals "Volgend project").
// - Bij astro:page-load zet GSAP de blokken een klein stukje lager en onzichtbaar. Een
//   IntersectionObserver speelt per blok de animatie af zodra de bovenkant ruim in beeld is
//   (rootMargin -10% onder); één keer per blok. Blokken die al in beeld staan komen direct.
// - Loopt er een paginatransitie (Interlude), dan wachten we op `interlude:idle`, net als words-in.ts.
// - Zonder JS of met reduced motion staat alles er gewoon.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const EIGEN = '[data-kop-in], [data-ink], [data-words-in], script, style, template';
let teardown: (() => void) | undefined;

function init() {
  teardown?.();
  if (reduce.matches) return;
  const blokken = [...document.querySelectorAll<HTMLElement>('[data-reveal] > *')].filter(
    (el) => !el.matches(EIGEN) && !el.querySelector(EIGEN),
  );
  if (!blokken.length) return;

  gsap.set(blokken, { y: '1.5rem', opacity: 0 });

  const observer = new IntersectionObserver(
    (entries) => {
      const nu = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      nu.forEach((el) => observer.unobserve(el));
      // Komen er meer tegelijk in beeld, dan kort na elkaar.
      gsap.to(nu, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', clearProps: 'transform,opacity' });
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  const observe = () => blokken.forEach((el) => observer.observe(el));
  const state = document.querySelector<HTMLElement>('[data-interlude]')?.dataset.state;
  const busy = !!state && state !== 'idle';
  if (busy) document.addEventListener('interlude:idle', observe, { once: true });
  else observe();

  teardown = () => {
    document.removeEventListener('interlude:idle', observe);
    observer.disconnect();
    gsap.killTweensOf(blokken);
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());

export {};
