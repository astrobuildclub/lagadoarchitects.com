// Projectkaarten (ProjectCard.astro): foto tonen en door de beelden scrubben.
//
// Hoe het werkt:
// - Muis (`hover: hover`): CSS toont bij hover de foto. Bij de eerste pointerenter zetten we de
//   overige beelden uit de <template> in de kaart (zo laden ze pas als iemand ze wil zien).
//   /projecten: de horizontale positie van de muis kiest het beeld (links het eerste, rechts het
//   laatste). Home: elke seconde het volgende beeld. Bij pointerleave terug naar het hero-beeld.
// - Touch (`hover: none`): een IntersectionObserver zet `.is-open` zodra de kaart in de
//   middelste strook van het scherm staat (rootMargin -30% boven en onder) en haalt hem weer weg
//   als de kaart uit beeld gaat. CSS toont dan de foto met de kleurbalk.
// - Reduced motion op touch: geen wissel bij scrollen, de foto staat er direct.
// - In de lijstweergave op /projecten gebeurt er niets; daar hangt het beeld aan de muis (hover-follow.ts).
// - ClientRouter: start op astro:page-load, ruimt op bij astro:before-swap.
const hover = window.matchMedia('(hover: hover)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
let teardown: (() => void) | undefined;

function initMuis(card: HTMLElement, signal: AbortSignal) {
  const vlak = card.querySelector<HTMLElement>('.project-card__vorm');
  const beelden = card.querySelector<HTMLElement>('.project-card__beelden');
  const template = card.querySelector<HTMLTemplateElement>('template[data-meer-beelden]');
  if (!vlak || !beelden || !template) return;
  let imgs: HTMLImageElement[] = [];
  let actief = 0;

  const zet = (i: number) => {
    if (i === actief) return;
    actief = i;
    imgs.forEach((img, j) => img.classList.toggle('is-actief', j === i));
  };

  card.addEventListener(
    'pointerenter',
    () => {
      if (template.isConnected) {
        beelden.append(template.content.cloneNode(true));
        template.remove();
      }
      imgs = [...beelden.querySelectorAll('img')];
    },
    { signal },
  );
  // Home: geen scrub, maar een diavoorstelling zolang de muis op de kaart staat: elke seconde het
  // volgende beeld, hard (zonder fade), beginnend bij het eerste. Met reduced motion blijft het eerste staan.
  if (card.classList.contains('project-card--vlak')) {
    let timer: number | undefined;
    card.addEventListener(
      'pointerenter',
      () => {
        if (reduce.matches || imgs.length < 2) return;
        timer = window.setInterval(() => zet((actief + 1) % imgs.length), 1000);
      },
      { signal },
    );
    const stop = () => {
      window.clearInterval(timer);
      zet(0);
    };
    card.addEventListener('pointerleave', stop, { signal });
    signal.addEventListener('abort', () => window.clearInterval(timer));
    return;
  }
  card.addEventListener(
    'pointermove',
    (e) => {
      if (card.closest('[data-view="lijst"]')) return;
      const { left, width } = vlak.getBoundingClientRect();
      const pos = Math.min(Math.max((e.clientX - left) / width, 0), 0.999);
      zet(Math.floor(pos * imgs.length));
    },
    { signal },
  );
  card.addEventListener('pointerleave', () => zet(0), { signal });
}

function init() {
  teardown?.();
  const cards = [...document.querySelectorAll<HTMLElement>('.project-card')];
  if (!cards.length) return;
  const ac = new AbortController();
  let observer: IntersectionObserver | undefined;

  if (hover.matches) {
    cards.forEach((card) => initMuis(card, ac.signal));
  } else if (reduce.matches) {
    cards.forEach((card) => card.classList.add('is-open'));
  } else {
    observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-open', e.isIntersecting)),
      { rootMargin: '-30% 0px -30% 0px' },
    );
    cards.forEach((card) => observer!.observe(card));
  }

  teardown = () => {
    ac.abort();
    observer?.disconnect();
    teardown = undefined;
  };
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => teardown?.());

export {};
