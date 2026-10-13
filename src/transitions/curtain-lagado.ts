/**
 * Curtain, LAGADO-variant: als `curtain`, maar header en footer drijven mee
 * met de content. In `curtain` beweegt alleen `<main>` (`context.content`),
 * waardoor de header stil bleef staan terwijl de pagina eronder wegschoof.
 *
 * Eigen naam, zodat `add-interlude.sh` hem niet overschrijft (TRANSITIONS.md §7).
 */
import { gsap } from 'gsap';
import { defineTransition, panel, sign } from '../lib/interlude';
import type { TransitionContext } from '../lib/interlude';

// Instellingen
const LEAVE = { duration: 1, ease: 'power2.inOut' }; // bedekken
const ENTER = { duration: 1, ease: 'power2.out' }; // onthullen
const DRIFT = 100; // px die de pagina meebeweegt bij gaan en komen

/**
 * Alles wat meedrijft: header, content en footer van de pagina die nu in de
 * DOM staat (de oude tijdens `leave`, de nieuwe tijdens `enter`). Niets uit de
 * Interlude-laag zelf.
 */
const page = (context: TransitionContext) => [
  ...document.querySelectorAll<HTMLElement>('body > :is(.site-header, .site-footer)'),
  context.content,
];

export default defineTransition({
  name: 'curtain-lagado',
  entrance: 0.2, // de content van de pagina komt 0,2 s na de start van enter() binnen

  leave(context) {
    const up = sign(context) > 0; // terug: alles loopt andersom
    // Het vlak groeit vanaf de onderrand (bij terug: de bovenrand)…
    const el = panel(context, { style: { transformOrigin: up ? '50% 100%' : '50% 0%' } });
    return (
      gsap
        .timeline({ defaults: LEAVE })
        .fromTo(el, { scaleY: 0 }, { scaleY: 1 })
        // …terwijl de hele pagina, header incluis, wegdrijft en vervaagt.
        .to(page(context), { y: up ? -DRIFT : DRIFT, opacity: 0 }, 0)
    );
  },

  enter(context) {
    const up = sign(context) > 0;
    // Het vlak krimpt naar de bovenrand (bij terug: de onderrand)…
    const el = panel(context, { style: { transformOrigin: up ? '50% 0%' : '50% 100%' } });
    return (
      gsap
        .timeline({ defaults: ENTER })
        .fromTo(el, { scaleY: 1 }, { scaleY: 0 })
        // …en de nieuwe pagina drijft erachteraan binnen. `clearProps` haalt de
        // inline-stijlen weg, zodat de eigen CSS daarna weer geldt.
        .fromTo(
          page(context),
          { y: up ? DRIFT : -DRIFT, opacity: 0 },
          { y: 0, opacity: 1, clearProps: 'transform,opacity' },
          0
        )
    );
  },
});
