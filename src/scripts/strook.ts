// Strook van het dienstenblok (`[data-strook]`, weergave Beelden of Vormen): een carousel.
//
// Hoe het werkt:
// - Het venster scrolt horizontaal met CSS scroll-snap: swipen (touch, trackpad) werkt zonder JS.
// - De pijlen (`[data-strook-vorige]`, `[data-strook-volgende]`) schuiven één kaart (breedte + tussenruimte)
//   op; met reduced motion zonder animatie. Aan het begin of eind is de betreffende pijl uitgeschakeld;
//   past alles in het raster, dan blijven de pijlen verborgen.
// - Een kaart die (deels) buiten het raster staat, krijgt 20% opacity en wordt naar verhouding
//   zichtbaarder naarmate hij het raster in schuift: opacity = 0,2 + 0,8 × zichtbaar deel. Dat geldt links
//   (vorige kaarten) en rechts (volgende kaarten): het venster loopt aan beide kanten door tot de schermrand.
// - Klik op een gedimde kaart (`data-buiten`): de carousel schuift precies zo ver dat die kaart in het raster
//   staat. Alleen voor de muis; met het toetsenbord gaan de pijlen.
// - Slepen met de muis (alleen `hover: hover` en `pointer: fine`; touch swipet al native):
//   - pointerdown legt beginpunt en scrollpositie vast en zet `data-sleept` (CSS zet de snap dan uit,
//     anders trekt de browser bij elke beweging terug naar de dichtstbijzijnde kaart).
//   - pointermove: scrollLeft = beginscroll − verplaatsing. We houden de snelheid bij (px/ms).
//   - pointerup: doel = huidige positie + snelheid × 200 ms (een zwiep schiet hooguit één kaart door),
//     afgerond op de dichtstbijzijnde kaart; daar scrollen we vloeiend heen en daarna gaat de snap weer aan.
//   - Meer dan 5 px gesleept? Dan wordt de klik die volgt ingeslikt (geen kaart- of linkklik per ongeluk).
// - Volgcursor: een cirkel die met gsap.quickTo achter de muis aan loopt (0,35 s, power3.out): elke
//   pointermove zet alleen een nieuw doel, GSAP loopt er vloeiend naartoe, dus hij ijlt licht na.
//   Boven een gedimde kaart toont hij een pijl (klik = die kant op), anders de sleephand. Tijdens slepen
//   krimpt hij iets. De echte cursor is boven de strook verborgen; de cirkel staat aan <body> (position:
//   fixed mag geen getransformeerde voorouder hebben). Reduced motion: geen naloop en geen schaal.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';

const MIN = 0.2;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const muis = window.matchMedia('(hover: hover) and (pointer: fine)');
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
      item.toggleAttribute('data-buiten', deel < 0.98);
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
  const naarKaart = (e: MouseEvent) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('[data-buiten]');
    if (!item || !rij.contains(item) || (e.target as HTMLElement).closest('a')) return;
    const raster = sectie.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const verschil = r.left < raster.left ? r.left - raster.left : r.right - raster.right;
    venster.scrollBy({ left: verschil, behavior: reduce.matches ? 'instant' : 'smooth' });
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
  rij.addEventListener('click', naarKaart);
  update();
  const sleepOpruimen = muis.matches ? sleep(sectie, venster, rij, items) : () => {};

  return () => {
    sleepOpruimen();
    cancelAnimationFrame(frame);
    venster.removeEventListener('scroll', opScroll);
    window.removeEventListener('resize', opScroll);
    vorige?.removeEventListener('click', naarVorige);
    volgende?.removeEventListener('click', naarVolgende);
    rij.removeEventListener('click', naarKaart);
  };
}

/** Slepen met de muis en de volgcursor. Geeft een opruimfunctie terug. */
function sleep(sectie: HTMLElement, venster: HTMLElement, rij: HTMLElement, items: HTMLElement[]): () => void {
  const cursor = sectie.querySelector<HTMLElement>('[data-strook-cursor]');
  const ac = new AbortController();
  const { signal } = ac;
  const still = reduce.matches;

  // ── Volgcursor ──
  if (cursor) document.body.append(cursor);
  const xTo = cursor && gsap.quickTo(cursor, 'x', { duration: still ? 0 : 0.35, ease: 'power3.out' });
  const yTo = cursor && gsap.quickTo(cursor, 'y', { duration: still ? 0 : 0.35, ease: 'power3.out' });
  if (cursor) gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
  let binnen = false;

  const richting = (e: PointerEvent) => {
    const item = (e.target as Element).closest<HTMLElement>('[data-buiten]');
    if (!item || sleept) return 'sleep';
    return item.getBoundingClientRect().left < sectie.getBoundingClientRect().left ? 'links' : 'rechts';
  };
  const toon = (e: PointerEvent) => {
    if (!cursor || e.pointerType !== 'mouse' || venster.scrollWidth <= venster.clientWidth + 1) return;
    binnen = true;
    venster.dataset.sleepbaar = '';
    cursor.hidden = false;
    gsap.set(cursor, { x: e.clientX, y: e.clientY });
    gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: still ? 0 : 0.25, ease: 'power2.out', overwrite: 'auto' });
  };
  const verberg = () => {
    binnen = false;
    delete venster.dataset.sleepbaar;
    if (cursor) gsap.to(cursor, { autoAlpha: 0, scale: still ? 1 : 0, duration: still ? 0 : 0.2, ease: 'power2.in', overwrite: 'auto' });
  };
  venster.addEventListener('pointerenter', toon, { signal });
  venster.addEventListener('pointerleave', verberg, { signal });
  venster.addEventListener(
    'pointermove',
    (e) => {
      if (!binnen) toon(e);
      if (!cursor || !binnen) return;
      xTo!(e.clientX);
      yTo!(e.clientY);
      cursor.dataset.richting = richting(e);
    },
    { signal },
  );

  // ── Slepen ──
  let sleept = false;
  let gesleept = false;
  let startX = 0;
  let startScroll = 0;
  let vorigeX = 0;
  let vorigeT = 0;
  let snelheid = 0;

  venster.addEventListener(
    'pointerdown',
    (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      sleept = true;
      gesleept = false;
      startX = vorigeX = e.clientX;
      startScroll = venster.scrollLeft;
      vorigeT = e.timeStamp;
      snelheid = 0;
      venster.dataset.sleept = '';
      venster.setPointerCapture(e.pointerId);
      if (cursor) {
        cursor.dataset.richting = 'sleep';
        gsap.to(cursor, { scale: still ? 1 : 0.8, duration: 0.2, overwrite: 'auto' });
      }
    },
    { signal },
  );
  venster.addEventListener(
    'pointermove',
    (e) => {
      if (!sleept) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 5) gesleept = true;
      venster.scrollLeft = startScroll - dx;
      const dt = e.timeStamp - vorigeT;
      if (dt > 0) snelheid = (e.clientX - vorigeX) / dt;
      vorigeX = e.clientX;
      vorigeT = e.timeStamp;
    },
    { signal },
  );
  const loslaten = (e: PointerEvent) => {
    if (!sleept) return;
    sleept = false;
    if (venster.hasPointerCapture(e.pointerId)) venster.releasePointerCapture(e.pointerId);
    if (cursor) gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: 'auto' });
    // Naar de dichtstbijzijnde kaart, met doorschieten bij een zwiep.
    const gap = parseFloat(getComputedStyle(rij).columnGap) || 0;
    const stapBreedte = (items[0]?.getBoundingClientRect().width ?? 0) + gap;
    const max = venster.scrollWidth - venster.clientWidth;
    // Zwiep: hooguit één kaart extra, anders schiet een snelle beweging door tot het eind.
    const worp = still ? 0 : Math.max(-stapBreedte, Math.min(stapBreedte, snelheid * 200));
    const ruw = stapBreedte ? Math.round((venster.scrollLeft - worp) / stapBreedte) * stapBreedte : venster.scrollLeft;
    const doel = Math.min(max, Math.max(0, ruw));
    // Snap pas terug als de scroll klaar is, anders springt hij halverwege. Staat hij al goed, dan direct.
    const snapAan = () => delete venster.dataset.sleept;
    if (Math.abs(doel - venster.scrollLeft) < 1) return snapAan();
    if ('onscrollend' in venster) venster.addEventListener('scrollend', snapAan, { once: true, signal });
    setTimeout(snapAan, 1200); // vangnet als scrollend uitblijft
    venster.scrollTo({ left: doel, behavior: still ? 'instant' : 'smooth' });
  };
  venster.addEventListener('pointerup', loslaten, { signal });
  venster.addEventListener('pointercancel', loslaten, { signal });
  // Na echt slepen geen klik doorlaten (capture: vóór de kaartklik).
  venster.addEventListener(
    'click',
    (e) => {
      if (!gesleept) return;
      e.preventDefault();
      e.stopPropagation();
      gesleept = false;
    },
    { capture: true, signal },
  );

  return () => {
    ac.abort();
    delete venster.dataset.sleepbaar;
    delete venster.dataset.sleept;
    if (cursor) {
      gsap.killTweensOf(cursor);
      cursor.remove();
    }
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
