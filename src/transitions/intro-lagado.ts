/**
 * Intro, LAGADO: onthult de eerste pagina van een sessie. Het vlak met het woordmerk (src/components/Intro.astro)
 * blijft `data-intro-duur` seconden staan, gerekend vanaf het begin van het laden. Een klik of toets slaat dat
 * over. Daarna schuift de onderrand van het vlak omhoog (clip-path): het woordmerk blijft staan en verdwijnt
 * achter die rand, terwijl de pagina eronder van onderen binnendrijft.
 *
 * Alleen voor `revealOnLoad` (interlude.config.ts); navigaties gebruiken `curtain-lagado`. Eigen naam, zodat
 * `add-interlude.sh` hem niet overschrijft (TRANSITIONS.md §7).
 */
import { gsap } from 'gsap';
import { defineTransition, panel } from '../lib/interlude';
import type { TransitionContext } from '../lib/interlude';

// Instellingen
const WEG = { duration: 1.3, ease: 'power3.inOut' }; // het vlak schuift weg
const DRIFT = 120; // px die de pagina van onderen meekomt
const MERK = -40; // px die het woordmerk omhoog meegaat terwijl het verdwijnt

/** Header, content en footer van de pagina (zoals in curtain-lagado). */
const page = (context: TransitionContext) => [
  ...document.querySelectorAll<HTMLElement>('body > :is(.site-header, .site-footer)'),
  context.content,
];

/** Het vlak met het woordmerk: al neergezet door Intro.astro vóór de eerste paint, anders een kaal vlak. */
function vlak(context: TransitionContext) {
  return context.root.querySelector<HTMLElement>('.intro') ?? panel(context);
}

/** Wacht tot de intro lang genoeg heeft gestaan, of tot de bezoeker klikt of een toets indrukt. */
function wacht(seconden: number) {
  const rest = seconden * 1000 - performance.now();
  if (rest <= 0) return Promise.resolve();
  return new Promise<void>((klaar) => {
    const stop = new AbortController();
    const verder = () => {
      stop.abort();
      clearTimeout(timer);
      klaar();
    };
    const timer = setTimeout(verder, rest);
    for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart'])
      window.addEventListener(type, verder, { signal: stop.signal, passive: true, capture: true });
  });
}

export default defineTransition({
  name: 'intro-lagado',
  // De pagina komt binnen met het wegschuiven zelf (enter); page scripts wachten op `interlude:idle`.
  entrance: false,

  cover: vlak,

  // Niet voor navigaties bedoeld, maar wel geldig: het vlak in één keer neerzetten.
  leave(context) {
    return gsap.fromTo(panel(context), { opacity: 0 }, { opacity: 1, duration: 0.4 });
  },

  async enter(context) {
    // Synchroon opzetten (vóór de eerste await): de laag laat zijn eigen vulling in dezelfde frame vallen.
    const el = vlak(context);
    const merk = el.querySelector('.intro__merk');
    gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.set(page(context), { y: DRIFT });

    await wacht(Number(context.root.dataset.introDuur) || 0);
    delete context.root.dataset.introDuur;

    const tl = gsap
      .timeline({ defaults: WEG })
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)' }, 0)
      .to(page(context), { y: 0, clearProps: 'transform' }, 0.1);
    if (merk) tl.to(merk, { y: MERK }, 0);
    // De projectkleur van de intro (Intro.astro) niet laten hangen op de laag: navigaties houden hun eigen kleur.
    tl.call(() => context.root.style.removeProperty('--interlude-color'));
    return tl;
  },
});
