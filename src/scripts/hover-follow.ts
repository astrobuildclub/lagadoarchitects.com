// Lijstweergave op /wat: bij hover over een project hangt het projectbeeld aan de muis.
// ProjectList met `weergave` rendert `[data-hover-follow]` (een vaste laag met één <img>).
//
// Hoe het werkt:
// - Alleen met een muis (`hover: hover` en `pointer: fine`) en alleen als de lijst op
//   `data-view="lijst"` staat. Op touch of in rasterweergave gebeurt er niets.
// - Eén beeld voor de hele lijst. Bij pointerenter op een rij kopiëren we src/srcset van het
//   (verborgen) kaartbeeld naar dat ene <img>, en schaalt de laag in (gsap.to, autoAlpha).
// - Volgen: gsap.quickTo maakt per as één herbruikbare tween. Elke pointermove zet alleen
//   een nieuw doel; GSAP loopt er in 0,45 s met power3.out naartoe. Daardoor hangt het beeld
//   een fractie achter de cursor, wat zacht aanvoelt zonder eigen requestAnimationFrame-lus.
// - Het beeld staat rechts van de cursor; vlak bij de rechterrand springt het naar links.
// - Reduced motion: geen naloop en geen schaal, het beeld staat direct op zijn plek.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';

const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function init() {
  teardown?.();
  const layer = document.querySelector<HTMLElement>('[data-hover-follow]');
  const list = layer && document.getElementById(layer.dataset.hoverFollow!);
  const img = layer?.querySelector('img');
  if (!layer || !list || !img || !fine.matches) return;

  const still = reduce.matches;
  const duration = still ? 0 : 0.45;
  const xTo = gsap.quickTo(layer, 'x', { duration, ease: 'power3.out' });
  const yTo = gsap.quickTo(layer, 'y', { duration, ease: 'power3.out' });
  const gap = 24;
  let shown = false;

  const place = (e: PointerEvent, instant = false) => {
    const { width, height } = layer.getBoundingClientRect();
    const right = e.clientX + gap + width < window.innerWidth;
    const x = right ? e.clientX + gap : e.clientX - gap - width;
    const y = Math.min(Math.max(e.clientY - height / 2, gap), window.innerHeight - height - gap);
    if (instant) gsap.set(layer, { x, y });
    else {
      xTo(x);
      yTo(y);
    }
  };

  const show = (card: HTMLElement, e: PointerEvent) => {
    const source = card.querySelector('img');
    if (!source) return;
    img.srcset = source.srcset;
    img.src = source.src;
    // Eerste keer: direct op de cursor zetten, anders vliegt het beeld in vanaf (0,0).
    if (!shown) place(e, true);
    shown = true;
    gsap.to(layer, { autoAlpha: 1, scale: 1, duration: still ? 0 : 0.3, ease: 'power2.out', overwrite: 'auto' });
  };
  const hide = () => {
    shown = false;
    gsap.to(layer, { autoAlpha: 0, scale: still ? 1 : 0.92, duration: still ? 0 : 0.2, ease: 'power2.in', overwrite: 'auto' });
  };

  gsap.set(layer, { autoAlpha: 0, scale: still ? 1 : 0.92 });

  const ac = new AbortController();
  const { signal } = ac;
  list.addEventListener(
    'pointerover',
    (e) => {
      if (list.dataset.view !== 'lijst') return;
      const card = (e.target as Element).closest<HTMLElement>('.project-card');
      const from = (e.relatedTarget as Element | null)?.closest('.project-card');
      if (card && card !== from) show(card, e);
    },
    { signal },
  );
  list.addEventListener(
    'pointermove',
    (e) => {
      if (shown) place(e);
    },
    { signal },
  );
  list.addEventListener('pointerleave', hide, { signal });
  // Wisselen naar raster terwijl het beeld zichtbaar is.
  const views = new MutationObserver(() => list.dataset.view !== 'lijst' && hide());
  views.observe(list, { attributes: true, attributeFilter: ['data-view'] });

  teardown = () => {
    ac.abort();
    views.disconnect();
    gsap.killTweensOf(layer);
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());
