// Projectkop (`[data-kop-in]`): alles komt subtiel binnen zodra de pagina in beeld is.
//
// Hoe het werkt:
// - De tekst (titel, intro, elk feit in de factsheet) schuift een klein stukje omhoog en vervaagt in,
//   kort na elkaar (stagger). De tagline doet dat al woord voor woord via words-in.ts.
// - De foto (met vorm en al) vervaagt in en krimpt licht van 104% naar 100%.
// - Loopt er een paginatransitie (Interlude, `[data-interlude]` niet `idle`), dan wachten we op
//   `interlude:idle`, net als words-in.ts: anders is de animatie al voorbij voordat je hem ziet.
// - Zonder JS of met reduced motion staat alles er gewoon.
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
import { gsap } from 'gsap';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function init() {
  teardown?.();
  const kop = document.querySelector<HTMLElement>('[data-kop-in]');
  if (!kop || reduce.matches) return;

  const tekst = kop.querySelectorAll<HTMLElement>('h1, .project-kop__verhaal, .facts > div');
  const beeld = kop.querySelector<HTMLElement>('.project-kop__beeld');
  gsap.set(tekst, { y: '0.75rem', opacity: 0 });
  if (beeld) gsap.set(beeld, { opacity: 0, scale: 1.04 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.to(tekst, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04, clearProps: 'transform,opacity' }, 0);
  if (beeld) tl.to(beeld, { opacity: 1, scale: 1, duration: 1.2, clearProps: 'transform,opacity' }, 0.1);

  const play = () => tl.play();
  const state = document.querySelector<HTMLElement>('[data-interlude]')?.dataset.state;
  const busy = !!state && state !== 'idle';
  if (busy) document.addEventListener('interlude:idle', play, { once: true });
  else play();

  teardown = () => {
    document.removeEventListener('interlude:idle', play);
    tl.kill();
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());

export {};
