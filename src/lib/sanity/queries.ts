// GROQ-queries. Ze leveren de vorm uit src/lib/schema.ts: `type` i.p.v. `_type`, slugs i.p.v. references,
// bestands-URL's i.p.v. assets, en beelden als `{ src, alt, caption }` met `src` = Sanity-beeld.
import groq from 'groq';

const ASSET = groq`asset->{ _id, url, metadata { dimensions { width, height } } }`;

/**
 * Velden `src`, `alt`, `caption` van een beeld-object. `pad` is het pad naar het beeld (`beeld.`) of leeg
 * binnen een projectie van het beeld zelf. Decoratief = lege alt. Zonder asset geen `src`.
 */
const img = (pad = '') => groq`
  "src": select(defined(${pad}asset) => { "asset": ${pad}${ASSET}, "crop": ${pad}crop, "hotspot": ${pad}hotspot }),
  "alt": select(${pad}decoratief == true => "", coalesce(${pad}alt, "")),
  "caption": ${pad}caption
`;
const IMG = img();

/** Alleen het Sanity-beeld, voor velden zonder alt (video-poster). */
const src = (veld: string) => groq`select(defined(${veld}.asset) => { "asset": ${veld}.${ASSET}, "crop": ${veld}.crop, "hotspot": ${veld}.hotspot })`;

/** Bestands-URL met `?dl=`: het `download`-attribuut werkt niet op een ander domein, Sanity forceert de download zelf. */
const DL = groq`bestand.asset->url + "?dl="`;

const BLOCKS = groq`
  ...,
  "type": select(_type == "textBlock" => "text", _type == "imageBlock" => "image", _type),
  _type == "imageBlock" => { ${img('beeld.')} },
  _type == "hero" => { "beelden": beelden[] { ${IMG} } },
  _type == "gallery" => { "images": images[] { ${IMG} } },
  _type == "columns" => { "image": image { ${IMG} } },
  _type == "video" => { "poster": ${src('poster')} },
  _type == "beforeAfter" => { "voor": voor { ${IMG} }, "na": na { ${IMG} } },
  _type == "projectGrid" => { "slugs": slugs[]->slug.current, "filter": filter[] { veld, waarde } },
  _type == "team" => { "personen": personen[] { ..., "foto": foto { ${IMG} } } },
  _type == "list" => { "items": items[] { ..., "project": project->slug.current } },
  _type == "logos" => { "items": items[] { ..., "logo": logo { ${IMG} } } },
  _type == "downloads" => { "items": items[] { label, "bestand": ${DL} } }
`;

export const SETTINGS_QUERY = groq`{
  "instellingen": *[_id == "siteSettings"][0] {
    ...,
    seo { ..., "deelAfbeelding": deelAfbeelding { ${IMG} } }
  },
  "navigatie": *[_id == "navigatie"][0] { navigatie, footer }
}`;

export const PAGE_QUERY = groq`*[_id == $id][0] {
  title, intro, seo,
  "blocks": blocks[] { ${BLOCKS} }
}`;

export const CONTACT_QUERY = groq`*[_id == "contact"][0] {
  ...,
  "sfeerbeeld": sfeerbeeld { ${IMG} },
  "bio": bio { ..., "foto": foto { ${IMG} } },
  "kaart": kaart { link, "statischBeeld": statischBeeld { ${IMG} } },
  "downloads": downloads[] { label, "bestand": ${DL} }
}`;

export const PROJECTS_QUERY = groq`*[_type == "project" && defined(slug.current)] {
  ...,
  "slug": slug.current,
  "hero": hero { ${IMG} },
  "gerelateerd": gerelateerd[]->slug.current,
  "pers": pers[] { ..., "project": project->slug.current },
  "awards": awards[] { ..., "project": project->slug.current },
  "pressKit": pressKit.asset->url + "?dl=",
  "blocks": blocks[] { ${BLOCKS} }
}`;

/** Voor de sitemap: alleen wat nodig is. */
export const SITEMAP_QUERY = groq`*[_type == "project" && defined(slug.current) && seo.noindex != true] { "slug": slug.current, _updatedAt }`;
