// Cookie-consent (vanilla-cookieconsent v3) + AVG-vriendelijke embeds (iframemanager).
// Gebundeld via npm (geen CDN), Nederlands. Thumbnails van YouTube/Vimeo via onze eigen server, nooit rechtstreeks.
//
// Slim: toestemming vragen we pas als er iets is dat het nodig heeft.
// - Video's: de vraag staat op de video zelf ("Video laden" / "Altijd toestaan"). Geen banner vooraf.
// - Statistiek zonder cookies (Umami, Plausible): geen toestemming nodig, laadt in BaseLayout. Geen banner.
// - Google Analytics: plaatst cookies, dus banner bij het eerste bezoek en pas laden na "toestaan".
// "Cookie-instellingen" (footer, privacypagina) opent altijd het voorkeurenvenster om een keuze te wijzigen.
import * as CookieConsent from 'vanilla-cookieconsent';
import '@orestbida/iframemanager';

export interface ConsentConfig {
  /** Google Analytics meet-ID (G-…): alleen dan een banner en een categorie Statistiek. */
  googleId?: string;
  /** Naam van de cookieloze statistiekdienst, voor de uitleg in het voorkeurenvenster. */
  cookieloos?: string;
  privacyHref?: string;
}

type IframeManager = {
  run: (config: unknown) => void;
  reset: (hard?: boolean) => void;
  acceptService: (name: string) => void;
  rejectService: (name: string) => void;
};
const im = () => (window as unknown as { iframemanager: () => IframeManager }).iframemanager();

const MEDIA = ['youtube', 'vimeo'] as const;

// ── Google Analytics (alleen na toestemming) ─────────────────
function loadGoogleAnalytics(id: string) {
  if (document.getElementById('ga')) return;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag verwacht het arguments-object, geen array.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  // Paginawissels van de ClientRouter telt GA4 zelf (browsergeschiedenis, enhanced measurement).
  w.gtag('config', id, { anonymize_ip: true });
  const s = document.createElement('script');
  s.id = 'ga';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(s);
}

// ── Video's ──────────────────────────────────────────────────
const notice = (service: string, privacyHref: string) => ({
  nl: {
    notice: `Deze video wordt geladen via ${service}. ${service} kan daarbij cookies plaatsen. <a href="${privacyHref}">Meer informatie</a>.`,
    loadBtn: 'Video laden',
    loadAllBtn: 'Altijd toestaan',
  },
});

const iframeConfig = (privacyHref: string) => ({
  currLang: 'nl',
  services: {
    youtube: {
      embedUrl: 'https://www.youtube-nocookie.com/embed/{data-id}',
      // Placeholder via onze eigen server (src/pages/api/video-thumbnail): geen contact met YouTube vóór toestemming.
      // Een eigen posterbeeld (data-thumbnail) gaat voor.
      thumbnailUrl: '/api/video-thumbnail/youtube/{data-id}',
      iframe: { allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen;' },
      cookie: { name: 'cc_youtube' },
      languages: notice('YouTube', privacyHref),
    },
    vimeo: {
      embedUrl: 'https://player.vimeo.com/video/{data-id}?dnt=1',
      thumbnailUrl: '/api/video-thumbnail/vimeo/{data-id}',
      iframe: { allow: 'fullscreen; picture-in-picture;' },
      cookie: { name: 'cc_vimeo' },
      languages: notice('Vimeo', privacyHref),
    },
  },
  // "Altijd toestaan" op een video → ook in de cookie-voorkeuren vastleggen (en andersom).
  onChange: ({ changedServices, eventSource }: { changedServices: string[]; eventSource: { type: string; action: string } }) => {
    if (eventSource.type !== 'click') return;
    const accepted = CookieConsent.getUserPreferences().acceptedServices.media ?? [];
    const next =
      eventSource.action === 'accept'
        ? [...new Set([...accepted, ...changedServices])]
        : accepted.filter((s) => !changedServices.includes(s));
    CookieConsent.acceptService(next, 'media');
  },
});

/** Video's in de pagina koppelen aan de huidige keuze. Opnieuw na elke page swap. */
function scanEmbeds(privacyHref: string) {
  const manager = im();
  // Hard reset: elke pagina begint met schone facades (ook na een ClientRouter-swap).
  manager.reset(true);
  manager.run(iframeConfig(privacyHref));
  for (const s of MEDIA) {
    if (CookieConsent.acceptedService(s, 'media')) manager.acceptService(s);
  }
}

// ── Start ────────────────────────────────────────────────────
let started = false;

export function initConsent({ googleId, cookieloos, privacyHref = '/privacy' }: ConsentConfig = {}) {
  scanEmbeds(privacyHref);
  if (started) return;
  started = true;

  // Eén listener voor alle "Cookie-instellingen"-knoppen. Cookieconsent koppelt [data-cc] zelf maar één
  // keer, bij de start; knoppen die de ClientRouter later in de pagina zet, zou hij missen.
  document.addEventListener('click', (event) => {
    const knop = event.target instanceof Element && event.target.closest('[data-cc="show-preferencesModal"]');
    if (!knop) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    CookieConsent.showPreferences();
  });

  const mediaService = (name: (typeof MEDIA)[number], label: string) => ({
    label,
    onAccept: () => im().acceptService(name),
    onReject: () => im().rejectService(name),
  });

  const statistiek = googleId
    ? [
        {
          title: 'Statistiek',
          description: 'Google Analytics: hoe bezoekers de site gebruiken. Plaatst cookies en stuurt gegevens naar Google.',
          linkedCategory: 'analytics',
        },
      ]
    : cookieloos
      ? [
          {
            title: 'Statistiek',
            description: `We tellen bezoeken met ${cookieloos}: zonder cookies en zonder persoonsgegevens. Daar is geen toestemming voor nodig.`,
          },
        ]
      : [];

  CookieConsent.run({
    // Banner alleen als er iets is dat vooraf toestemming nodig heeft (Google Analytics).
    autoShow: !!googleId,
    // Zonder dit ziet cookieconsent automatische browsers (ook tests) als bot en start hij niet.
    hideFromBots: false,
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      media: {
        services: { youtube: mediaService('youtube', 'YouTube'), vimeo: mediaService('vimeo', 'Vimeo') },
      },
      ...(googleId && {
        analytics: {
          // Intrekken: Google-cookies weg en herladen, zodat het script ook weg is.
          autoClear: { cookies: [{ name: /^_ga/ }, { name: '_gid' }], reloadPage: true },
        },
      }),
    },
    onConsent: () => {
      if (googleId && CookieConsent.acceptedCategory('analytics')) loadGoogleAnalytics(googleId);
    },
    onChange: () => {
      if (googleId && CookieConsent.acceptedCategory('analytics')) loadGoogleAnalytics(googleId);
    },
    language: {
      default: 'nl',
      translations: {
        nl: {
          consentModal: {
            title: 'Cookies',
            description: `Mogen we met Google Analytics bijhouden hoe de site gebruikt wordt? Dat plaatst cookies. Video's van YouTube en Vimeo vragen apart toestemming. <a href="${privacyHref}">Privacyverklaring</a>`,
            acceptAllBtn: 'Toestaan',
            acceptNecessaryBtn: 'Weigeren',
            showPreferencesBtn: 'Instellingen',
          },
          preferencesModal: {
            title: 'Cookie-instellingen',
            acceptAllBtn: 'Alles toestaan',
            acceptNecessaryBtn: 'Alleen noodzakelijk',
            savePreferencesBtn: 'Keuze opslaan',
            closeIconLabel: 'Sluiten',
            serviceCounterLabel: 'dienst|diensten',
            sections: [
              {
                description: `Kies wat je toestaat. Je kunt je keuze altijd aanpassen via 'Cookie-instellingen' onderaan de pagina. Meer in onze <a href="${privacyHref}">privacyverklaring</a>.`,
              },
              {
                title: 'Noodzakelijk',
                description: 'Onthoudt je keuze hier en het kleurthema (licht/donker). Geen tracking.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Ingesloten media',
                description: "Video's van YouTube (via youtube-nocookie.com) en Vimeo. Deze diensten kunnen cookies plaatsen zodra je een video laadt.",
                linkedCategory: 'media',
              },
              ...statistiek,
            ],
          },
        },
      },
    },
  });
}
