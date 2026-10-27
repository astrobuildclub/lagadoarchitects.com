// Dobbelsteen in "Verras me" (ProjectFilter.astro): Lottie-animatie "hover-pinch" bij hover en focus.
//
// Hoe het werkt:
// - Een Lottie-bestand is alleen data (vormen en keyframes); de browser kan dat niet zelf afspelen.
//   lottie-web (lichte SVG-versie, ±47 kB gzip) tekent het als SVG en speelt het af.
// - Speler en animatie laden pas bij de eerste hover of focus (dynamische import), dus niet bij
//   het openen van de pagina. Tot die tijd, zonder JS of met reduced motion staat het statische
//   SVG-icoon er.
// - Na het laden vervangt de Lottie-SVG het statische icoon; elke hover speelt hem vanaf frame 0.
// - Kleur via CSS (currentColor), zodat hij licht/donker volgt; de kleur in de json telt niet.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import type { AnimationItem } from 'lottie-web';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let animaties: AnimationItem[] = [];
let controller: AbortController | undefined;

async function laad(knop: HTMLButtonElement) {
  if (knop.dataset.lottie) return;
  knop.dataset.lottie = 'laden';
  const [{ default: lottie }, { default: data }] = await Promise.all([
    import('lottie-web/build/player/lottie_light'),
    import('../assets/lottie/dobbelsteen.json'),
  ]);
  const icoon = knop.querySelector<SVGElement>('.verras-knop__icoon');
  if (!icoon || !knop.isConnected) return;
  const plek = document.createElement('span');
  plek.className = 'verras-knop__lottie';
  plek.setAttribute('aria-hidden', 'true');
  icoon.after(plek);
  const anim = lottie.loadAnimation({
    container: plek,
    renderer: 'svg',
    loop: false,
    autoplay: false,
    // Kopie: lottie past de data aan tijdens het afspelen.
    animationData: structuredClone(data),
  });
  animaties.push(anim);
  anim.addEventListener('DOMLoaded', () => {
    knop.dataset.lottie = 'klaar';
    if (knop.matches(':hover, :focus-visible')) anim.goToAndPlay(0, true);
  });
  knop.addEventListener('pointerenter', () => anim.goToAndPlay(0, true), { signal: controller?.signal });
  knop.addEventListener('focus', () => anim.goToAndPlay(0, true), { signal: controller?.signal });
}

function init() {
  controller?.abort();
  animaties.forEach((a) => a.destroy());
  animaties = [];
  if (reduce.matches) return;
  controller = new AbortController();
  const { signal } = controller;
  document.querySelectorAll<HTMLButtonElement>('.verras-knop').forEach((knop) => {
    const start = () => laad(knop);
    knop.addEventListener('pointerenter', start, { signal, once: true });
    knop.addEventListener('focus', start, { signal, once: true });
  });
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => {
  controller?.abort();
  animaties.forEach((a) => a.destroy());
  animaties = [];
});
