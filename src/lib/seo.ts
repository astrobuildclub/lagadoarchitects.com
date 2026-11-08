// Titel, beschrijving en gestructureerde data. Fallbacks: pagina → site-instellingen.
// Alles hier komt in de <head> of JSON-LD: zonder stega-tekens (Visual Editing).
import { stegaClean } from '@sanity/client/stega';
import type { Contact, RichText, Settings } from './schema';

export interface SeoInput {
  title: string;
  seo?: { titel?: string; beschrijving?: string };
  /** Fallback-beschrijving uit de content (intro, tagline). */
  fallbackDescription?: string;
}

export function pageTitle(settings: Settings, input: SeoInput, isHome = false) {
  if (isHome) return stegaClean(input.seo?.titel || `${settings.siteNaam} — ${settings.payoff}`);
  return stegaClean(settings.seo.titelPatroon.replace('%s', input.seo?.titel || input.title));
}

export function pageDescription(settings: Settings, input: SeoInput) {
  const text = input.seo?.beschrijving || input.fallbackDescription || settings.seo.beschrijving || settings.payoff;
  const clean = stegaClean(text).replace(/\s+/g, ' ').trim();
  return clean.length > 160 ? `${clean.slice(0, 157).trimEnd()}…` : clean;
}

/** JSON-LD voor het bureau. ArchitectureFirm is een subtype van Organization/LocalBusiness. */
export function organizationJsonLd(settings: Settings, contact: Contact) {
  const footerLinks = settings.footer.kolommen.flatMap((k) => linksIn(k.tekst));
  const sameAs = [...contact.social.map((l) => l.href), ...footerLinks].filter((h) => /^https?:\/\/(www\.)?(instagram|linkedin|facebook|pinterest|youtube|vimeo)\./.test(h));
  return {
    '@context': 'https://schema.org',
    '@type': 'ArchitectureFirm',
    '@id': `${settings.url}/#organisatie`,
    name: settings.siteNaam,
    slogan: settings.payoff,
    url: settings.url,
    logo: `${settings.url}/favicon.svg`,
    ...(contact.email && { email: contact.email }),
    ...(contact.telefoon && { telephone: contact.telefoon }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.adres.straat,
      ...(contact.adres.postcode && { postalCode: contact.adres.postcode }),
      addressLocality: contact.adres.plaats,
      addressCountry: contact.adres.land,
    },
    ...(contact.bedrijf.kvk && { identifier: { '@type': 'PropertyValue', name: 'KvK', value: contact.bedrijf.kvk } }),
    ...(contact.bedrijf.btw && { vatID: contact.bedrijf.btw }),
    ...(sameAs.length && { sameAs: [...new Set(sameAs)] }),
  };
}

/** Alle link-URL's in Portable Text (voor `sameAs`). */
function linksIn(value: RichText): string[] {
  return value.flatMap((b) => ((b.markDefs as { _type?: string; href?: string }[] | undefined) ?? []).filter((d) => d._type === 'link' && d.href).map((d) => stegaClean(d.href!)));
}
