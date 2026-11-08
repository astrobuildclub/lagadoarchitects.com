// Strook van het dienstenblok (`[data-strook]`, weergave Beelden of Vormen).
//
// Hoe het werkt:
// - Desktop (≥ 48rem, zonder reduced motion): de rij schuift mee met het scrollen van de pagina, zonder
//   de pagina vast te zetten (geen pin, dus geen scroll-jacking). ScrollTrigger koppelt de scrollpositie
//   aan `x` van de rij (`scrub`) tussen START en EIND: daarvoor staat de rij aan het begin, daarna staat
//   de laatste kaart rechts in het raster. `scrub: 0.6` laat de rij
//   0,6 s naijlen, zodat hij zacht meebeweegt in plaats van schokkerig met elke scrolltik.
// - Mobiel en met reduced motion: een gewone swipe-carousel (CSS scroll-snap); hier niets te animeren.
// - In beide gevallen: een kaart die (deels) buiten het raster staat, krijgt 20% opacity en wordt
//   naar verhouding zichtbaarder naarmate hij het raster in schuift: opacity = 0,2 + 0,8 × zichtbaar deel.
// - gsap.matchMedia wisselt tussen de twee standen als het scherm of de voorkeur verandert en zet alles
//   terug (`revert`) bij het wisselen en bij het opruimen.
// - Loopt er een paginatransitie (Interlude), dan pas meten na `interlude:idle`.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SCRUB = '(min-width: 48rem) and (prefers-reduced-motion: no-preference)';
const SWIPE = '(max-width: 47.99rem), (prefers-reduced-motion: reduce)';
const MIN = 0.2;
// Bereik van de beweging: begint als de bovenkant van de sectie op 60% van het scherm staat (ruim in beeld)
// en is klaar als de onderkant daar staat, zodat je de laatste kaart nog helemaal ziet staan.
const START = 'top 60%';
const EIND = 'bottom 60%';

let teardown: (() => void) | undefined;

/** Opacity per kaart: hoeveel ervan binnen het raster (de sectie) staat. */
function zetZichtbaarheid(sectie: HTMLElement, items: HTMLElement[]) {
  const raster = sectie.getBoundingClientRect();
  for (const item of items) {
    const r = item.getBoundingClientRect();
    const binnen = Math.max(0, Math.min(r.right, raster.right + 1) - Math.max(r.left, raster.left - 1));
    const deel = r.width ? Math.min(1, binnen / r.width) : 1;
    item.style.opacity = String(MIN + (1 - MIN) * deel);
  }
}

function strook(sectie: HTMLElement, mm: gsap.MatchMedia) {
  const venster = sectie.querySelector<HTMLElement>('[data-strook-venster]');
  const rij = sectie.querySelector<HTMLElement>('[data-strook-rij]');
  if (!venster || !rij) return;
  const items = [...rij.children] as HTMLElement[];
  const update = () => zetZichtbaarheid(sectie, items);

  mm.add(SCRUB, () => {
    // Hoe ver de rij moet schuiven: wat er rechts buiten de sectie valt.
    const afstand = () => Math.max(0, rij.scrollWidth - sectie.clientWidth);
    if (!afstand()) {
      update();
      return;
    }
    sectie.dataset.scrub = '';
    venster.removeAttribute('tabindex'); // niets meer om met het toetsenbord te scrollen
    gsap.to(rij, {
      x: () => -afstand(),
      ease: 'none',
      // Op de tween zelf (niet op de ScrollTrigger): door `scrub` ijlt de rij na, de opacity volgt de rij.
      onUpdate: update,
      scrollTrigger: {
        trigger: sectie,
        start: START,
        end: EIND,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: update,
      },
    });
    update();
    return () => {
      delete sectie.dataset.scrub;
      venster.setAttribute('tabindex', '0');
      items.forEach((item) => (item.style.opacity = ''));
    };
  });

  mm.add(SWIPE, () => {
    let frame = 0;
    const opScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    venster.addEventListener('scroll', opScroll, { passive: true });
    window.addEventListener('resize', opScroll);
    update();
    return () => {
      cancelAnimationFrame(frame);
      venster.removeEventListener('scroll', opScroll);
      window.removeEventListener('resize', opScroll);
      items.forEach((item) => (item.style.opacity = ''));
    };
  });
}

function init() {
  teardown?.();
  const secties = [...document.querySelectorAll<HTMLElement>('[data-strook]')];
  if (!secties.length) return;

  const mm = gsap.matchMedia();
  const start = () => secties.forEach((s) => strook(s, mm));
  const state = document.querySelector<HTMLElement>('[data-interlude]')?.dataset.state;
  const busy = !!state && state !== 'idle';
  if (busy) document.addEventListener('interlude:idle', start, { once: true });
  else start();

  teardown = () => {
    document.removeEventListener('interlude:idle', start);
    mm.revert();
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());

export {};
