// Tekst die woord voor woord inkleurt terwijl je scrollt (de vraag op een projectpagina,
// `[data-ink]` met per woord een `.ink`-span).
//
// Hoe het werkt:
// - Zonder JS of met reduced motion staat de tekst gewoon in kleur.
// - Met JS krijgt het blok `data-ink-on`: de woorden worden gedimd (CSS).
// - Bij scrollen rekenen we uit hoe ver het blok door het beeld is: 0 als de bovenkant
//   op 85% van de viewport staat, 1 als de onderkant op 45% staat. Elk woord krijgt
//   `is-in` zodra de voortgang zijn plek in de zin passeert; een CSS-transitie op `color`
//   maakt het zacht. Terug scrollen kleurt weer uit.
// - Eén scroll-listener (passive) met requestAnimationFrame, dus hooguit één meting per frame.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function init() {
  teardown?.();
  const blocks = [...document.querySelectorAll<HTMLElement>('[data-ink]')];
  if (!blocks.length || reduce.matches) return;

  const items = blocks.map((block) => ({ block, words: [...block.querySelectorAll<HTMLElement>('.ink')] }));
  items.forEach(({ block }) => block.setAttribute('data-ink-on', ''));

  let frame = 0;
  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    items.forEach(({ block, words }) => {
      const r = block.getBoundingClientRect();
      const start = vh * 0.85;
      const end = vh * 0.45;
      // Afstand die de bovenkant aflegt van `start` tot de onderkant op `end` staat.
      const progress = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const lit = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle('is-in', i < lit));
    });
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  teardown = () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    cancelAnimationFrame(frame);
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());
