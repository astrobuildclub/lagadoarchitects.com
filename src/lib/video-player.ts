// Afspelen van ingesloten video's (YouTube, Vimeo), zonder extra scripts van die diensten:
// we praten via postMessage met de players in de iframes die iframemanager plaatst.
//
// 1. Autoplay na een klik: alleen de video waarop de bezoeker "Video laden" of "Altijd toestaan" klikt,
//    gaat meteen spelen. Andere video's die door "Altijd toestaan" laden, blijven stil.
// 2. Eén tegelijk: begint er een te spelen, dan pauzeren alle andere op de pagina.
//
// De iframes hebben allow="autoplay" (consent.ts). De klik op de pagina geldt als gebruikersactie, dus de
// browser staat afspelen met geluid toe. Weigert een browser het toch (bv. Safari met strenge instellingen),
// dan staat de video gewoon klaar en drukt de bezoeker zelf op play.

const ORIGINS = {
  youtube: ['https://www.youtube-nocookie.com', 'https://www.youtube.com'],
  vimeo: ['https://player.vimeo.com'],
} as const;
type Dienst = keyof typeof ORIGINS;

type Speler = { iframe: HTMLIFrameElement; dienst: Dienst; klaar: boolean; autoplay: boolean };
const spelers = new Map<Window, Speler>();

/** Container waarop net geklikt is: de iframe die daarin verschijnt, mag meteen spelen. */
let aangeklikt: Element | null = null;

function stuur(s: Speler, bericht: object) {
  const origin = s.dienst === 'vimeo' ? ORIGINS.vimeo[0] : new URL(s.iframe.src).origin;
  s.iframe.contentWindow?.postMessage(s.dienst === 'youtube' ? JSON.stringify(bericht) : bericht, origin);
}

const speel = (s: Speler) =>
  stuur(s, s.dienst === 'youtube' ? { event: 'command', func: 'playVideo', args: [] } : { method: 'play' });

const pauzeer = (s: Speler) =>
  stuur(s, s.dienst === 'youtube' ? { event: 'command', func: 'pauseVideo', args: [] } : { method: 'pause' });

function pauzeerAnderen(bron: Speler) {
  for (const s of spelers.values()) if (s !== bron && s.iframe.isConnected) pauzeer(s);
}

/** Aanmelden: YouTube stuurt pas berichten na "listening"; Vimeo na addEventListener. */
function aanmelden(s: Speler) {
  if (s.dienst === 'youtube') {
    // Herhalen tot de player reageert: het eerste bericht kan te vroeg zijn.
    let pogingen = 0;
    const tik = () => {
      if (s.klaar || !s.iframe.isConnected || pogingen++ > 20) return;
      stuur(s, { event: 'listening', id: s.iframe.id, channel: 'widget' });
      setTimeout(tik, 250);
    };
    tik();
  } else {
    stuur(s, { method: 'addEventListener', value: 'play' });
  }
}

function registreer(iframe: HTMLIFrameElement) {
  const container = iframe.closest<HTMLElement>('div[data-service]');
  const dienst = container?.dataset.service as Dienst | undefined;
  if (!container || !dienst || !(dienst in ORIGINS) || !iframe.contentWindow) return;
  if (!iframe.id) iframe.id = `video-${Math.random().toString(36).slice(2, 9)}`;

  const s: Speler = { iframe, dienst, klaar: false, autoplay: container === aangeklikt };
  if (s.autoplay) aangeklikt = null;
  spelers.set(iframe.contentWindow, s);
  iframe.addEventListener('load', () => aanmelden(s));
  aanmelden(s);
}

function bericht(event: MessageEvent) {
  const s = spelers.get(event.source as Window);
  if (!s || !(ORIGINS[s.dienst] as readonly string[]).includes(event.origin)) return;

  let data: Record<string, unknown>;
  try {
    data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
  } catch {
    return;
  }
  if (!data || typeof data !== 'object') return;

  if (s.dienst === 'youtube') {
    if (data.event === 'onReady' || data.event === 'initialDelivery') {
      if (!s.klaar) {
        s.klaar = true;
        stuur(s, { event: 'command', func: 'addEventListener', args: ['onStateChange'] });
        if (s.autoplay) speel(s);
      }
    }
    // playerState 1 = speelt.
    const info = data.info as { playerState?: number } | number | undefined;
    const speelt = (data.event === 'onStateChange' && info === 1) || (data.event === 'infoDelivery' && typeof info === 'object' && info?.playerState === 1);
    if (speelt) pauzeerAnderen(s);
  } else {
    if (data.event === 'ready' && !s.klaar) {
      s.klaar = true;
      stuur(s, { method: 'addEventListener', value: 'play' });
      if (s.autoplay) speel(s);
    }
    if (data.event === 'play') pauzeerAnderen(s);
  }
}

let gestart = false;

/** Eén keer per sessie. Observeert <html>, niet <body>: de ClientRouter vervangt bij elke page swap de hele body. */
export function initVideoPlayer() {
  if (gestart) return;
  gestart = true;

  // Capture: vóór iframemanager, die de iframe in dezelfde klik plaatst.
  document.addEventListener(
    'click',
    (event) => {
      const knop = event.target instanceof Element && event.target.closest('div[data-service] .c-l-b, div[data-service] .c-la-b');
      if (knop) aangeklikt = knop.closest('div[data-service]');
    },
    true,
  );

  window.addEventListener('message', bericht);

  new MutationObserver((mutaties) => {
    for (const m of mutaties) {
      for (const node of m.addedNodes) {
        if (node instanceof HTMLIFrameElement) registreer(node);
        else if (node instanceof Element) node.querySelectorAll('div[data-service] iframe').forEach((i) => registreer(i as HTMLIFrameElement));
      }
    }
    // Opruimen: iframes die weg zijn (intrekken, navigeren).
    for (const [win, s] of spelers) if (!s.iframe.isConnected) spelers.delete(win);
  }).observe(document.documentElement, { childList: true, subtree: true });
}
