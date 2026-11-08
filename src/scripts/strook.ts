// Strook van het dienstenblok (`[data-strook]`, weergave Beelden of Vormen): een carousel.
//
// Hoe het werkt:
// - Het venster scrolt horizontaal met CSS scroll-snap: swipen (touch, trackpad) werkt zonder JS.
// - De pijlen (`[data-strook-vorige]`, `[data-strook-volgende]`) schuiven één kaart (breedte + tussenruimte)
//   op; met reduced motion zonder animatie. Aan het begin of eind is de betreffende pijl uitgeschakeld;
//   past alles in het raster, dan blijven de pijlen verborgen.
// - Een kaart die (deels) buiten het raster staat, krijgt 20% opacity en wordt naar verhouding
//   zichtbaarder naarmate hij het raster in schuift: opacity = 0,2 + 0,8 × zichtbaar deel.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
const MIN = 0.2;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function strook(sectie: HTMLElement): () => void {
  const venster = sectie.querySelector<HTMLElement>('[data-strook-venster]');
  const rij = sectie.querySelector<HTMLElement>('[data-strook-rij]');
  const vorige = sectie.querySelector<HTMLButtonElement>('[data-strook-vorige]');
  const volgende = sectie.querySelector<HTMLButtonElement>('[data-strook-volgende]');
  const pijlen = sectie.querySelector<HTMLElement>('[data-strook-pijlen]');
  if (!venster || !rij) return () => {};
  const items = [...rij.children] as HTMLElement[];

  const update = () => {
    const raster = sectie.getBoundingClientRect();
    for (const item of items) {
      const r = item.getBoundingClientRect();
      const binnen = Math.max(0, Math.min(r.right, raster.right + 1) - Math.max(r.left, raster.left - 1));
      const deel = r.width ? Math.min(1, binnen / r.width) : 1;
      item.style.opacity = String(MIN + (1 - MIN) * deel);
    }
    const max = venster.scrollWidth - venster.clientWidth;
    if (pijlen) pijlen.hidden = max <= 1;
    if (vorige) vorige.disabled = venster.scrollLeft <= 1;
    if (volgende) volgende.disabled = venster.scrollLeft >= max - 1;
  };

  const stap = (richting: 1 | -1) => {
    const gap = parseFloat(getComputedStyle(rij).columnGap) || 0;
    const breedte = (items[0]?.getBoundingClientRect().width ?? 0) + gap;
    venster.scrollBy({ left: richting * breedte, behavior: reduce.matches ? 'instant' : 'smooth' });
  };
  const naarVorige = () => stap(-1);
  const naarVolgende = () => stap(1);

  let frame = 0;
  const opScroll = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  venster.addEventListener('scroll', opScroll, { passive: true });
  window.addEventListener('resize', opScroll);
  vorige?.addEventListener('click', naarVorige);
  volgende?.addEventListener('click', naarVolgende);
  update();

  return () => {
    cancelAnimationFrame(frame);
    venster.removeEventListener('scroll', opScroll);
    window.removeEventListener('resize', opScroll);
    vorige?.removeEventListener('click', naarVorige);
    volgende?.removeEventListener('click', naarVolgende);
  };
}

function init() {
  teardown?.();
  const opruimen = [...document.querySelectorAll<HTMLElement>('[data-strook]')].map(strook);
  teardown = () => {
    opruimen.forEach((f) => f());
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());

export {};
