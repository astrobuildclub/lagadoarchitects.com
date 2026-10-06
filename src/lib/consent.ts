// Cookie-consent (vanilla-cookieconsent v3) + GDPR-vriendelijke embeds (iframemanager).
// Patroon uit AstroStudioStarter/narwal, maar: via npm gebundeld (geen CDN), alles in het
// Nederlands, en geen thumbnails van YouTube/Vimeo vóór toestemming (dat is ook een request).
import * as CookieConsent from 'vanilla-cookieconsent';
import '@orestbida/iframemanager';

type IframeManager = {
  run: (config: unknown) => void;
  reset: (hard?: boolean) => void;
  acceptService: (name: string) => void;
  rejectService: (name: string) => void;
};
const im = () => (window as unknown as { iframemanager: () => IframeManager }).iframemanager();

const MEDIA = ['youtube', 'vimeo'] as const;

/** Statistiek staat uit tot er een cookieloos script in .env staat (zie .env.example). */
const ANALYTICS_SRC = import.meta.env.PUBLIC_ANALYTICS_SRC as string | undefined;
const ANALYTICS_DOMAIN = import.meta.env.PUBLIC_ANALYTICS_DOMAIN as string | undefined;

function loadAnalytics() {
  if (!ANALYTICS_SRC || document.getElementById('analytics')) return;
  const s = document.createElement('script');
  s.id = 'analytics';
  s.defer = true;
  s.src = ANALYTICS_SRC;
  if (ANALYTICS_DOMAIN) s.dataset.domain = ANALYTICS_DOMAIN;
  document.head.append(s);
}

const notice = (service: string) => ({
  nl: {
    notice: `Deze video wordt geladen via ${service}. ${service} kan daarbij cookies plaatsen. <a href="/privacy">Meer informatie</a>.`,
    loadBtn: 'Video laden',
    loadAllBtn: 'Altijd toestaan',
  },
});

const iframeConfig = {
  currLang: 'nl',
  services: {
    youtube: {
      embedUrl: 'https://www.youtube-nocookie.com/embed/{data-id}',
      iframe: { allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen;' },
      cookie: { name: 'cc_youtube' },
      languages: notice('YouTube'),
    },
    vimeo: {
      embedUrl: 'https://player.vimeo.com/video/{data-id}?dnt=1',
      iframe: { allow: 'fullscreen; picture-in-picture;' },
      cookie: { name: 'cc_vimeo' },
      languages: notice('Vimeo'),
    },
  },
  // Klik op "Altijd toestaan" in een video → ook in de consent-voorkeuren vastleggen.
  onChange: ({ changedServices, eventSource }: { changedServices: string[]; eventSource: { type: string; action: string } }) => {
    if (eventSource.type !== 'click') return;
    const accepted = CookieConsent.getUserPreferences().acceptedServices.media ?? [];
    const next =
      eventSource.action === 'accept'
        ? [...new Set([...accepted, ...changedServices])]
        : accepted.filter((s) => !changedServices.includes(s));
    CookieConsent.acceptService(next, 'media');
  },
};

/** Video's in de pagina koppelen aan de huidige consent. Opnieuw aanroepen na een page swap. */
function scanEmbeds() {
  const manager = im();
  // Hard reset: begin elke pagina met schone facades (ook na een ClientRouter-swap).
  manager.reset(true);
  manager.run(iframeConfig);
  for (const s of MEDIA) {
    if (CookieConsent.acceptedService(s, 'media')) manager.acceptService(s);
  }
}

let started = false;

export function initConsent(privacyHref = '/privacy') {
  scanEmbeds();
  if (started) return;
  started = true;

  const mediaService = (name: (typeof MEDIA)[number], label: string) => ({
    label,
    onAccept: () => im().acceptService(name),
    onReject: () => im().rejectService(name),
  });

  CookieConsent.run({
    guiOptions: {
      consentModal: { layout: 'box', position: 'bottom left', equalWeightButtons: true },
      preferencesModal: { layout: 'box', equalWeightButtons: true },
    },
    categories: {
      necessary: { enabled: true, readOnly: true },
      media: {
        services: { youtube: mediaService('youtube', 'YouTube'), vimeo: mediaService('vimeo', 'Vimeo') },
      },
      analytics: {},
    },
    onConsent: () => {
      if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
    },
    // Video's volgen wijzigingen via onAccept/onReject per dienst (zie mediaService).
    onChange: () => {
      if (CookieConsent.acceptedCategory('analytics')) loadAnalytics();
    },
    language: {
      default: 'nl',
      translations: {
        nl: {
          consentModal: {
            title: 'Cookies',
            description: `We gebruiken alleen noodzakelijke cookies. Video's van YouTube en Vimeo laden pas als je daar toestemming voor geeft. <a href="${privacyHref}">Privacyverklaring</a>`,
            acceptAllBtn: 'Alles toestaan',
            acceptNecessaryBtn: 'Alleen noodzakelijk',
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
                description: `Kies welke cookies je toestaat. Je kunt je keuze altijd aanpassen via 'Cookie-instellingen' onderaan de pagina. Meer in onze <a href="${privacyHref}">privacyverklaring</a>.`,
              },
              {
                title: 'Noodzakelijk',
                description: 'Nodig om je keuze en het kleurthema (licht/donker) te onthouden.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Ingesloten media',
                description: "Video's van YouTube (zonder tracking-domein) en Vimeo. Deze diensten kunnen cookies plaatsen.",
                linkedCategory: 'media',
              },
              {
                title: 'Statistiek',
                description: 'Anonieme bezoekersstatistiek, zonder cookies en zonder persoonsgegevens.',
                linkedCategory: 'analytics',
              },
            ],
          },
        },
      },
    },
  });
}
