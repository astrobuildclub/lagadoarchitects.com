# Plan: LAGADO van markdown naar Sanity

## Context
De site leest nu alle content uit `lagado-content/*.md` via Astro content collections (Zod in `src/lib/schema.ts`, één datalaag in `src/lib/content.ts`, beelden via `src/lib/images.ts`). Het model is vanaf dag één opgezet als 1-op-1 Sanity-schema. Doel: Victor beheert content zelf in een Studio op `/admin`, met live preview (Visual Editing) volgens `standards/SANITY.md`. Besluiten: **server-output + Visual Editing**, **Portable Text** voor `tekst`-velden.

Uitgangspunt blijft: veldnamen ongewijzigd, componenten krijgen hetzelfde datavorm-contract. Wat wél verandert: beelden (Sanity-assets i.p.v. bestanden) en rich text (Portable Text i.p.v. markdown). Dat raakt componenten onvermijdelijk; we vangen het af in `Img.astro` en een nieuwe `RichText.astro`.

Basis: `staging` (bijgewerkt 8 nov 2026 na rebase; de eerste versie ging uit van de verouderde `main`). Huidige stand: 43 projecten, routes `/`, `/projecten`, `/projecten/[slug]`, `/over` (uit `bureau.md`), `/contact`, `/privacy`; Interlude-transities op de `ClientRouter`; gelicenseerde fonts via `scripts/fonts.mjs` (prebuild).

Branch: `claude/lagado-sanity-integration-xyjrxm`, PR naar `staging`. Werk in fases met elk een eigen commit; na fase 4 is de site functioneel op Sanity.

---

## Fase 0 — Sanity-project (Maarten, handmatig)
- ✅ Project aangemaakt: project-id `unque637`, dataset `production`.
- Tokens: `Visual Editing (Netlify)` (Viewer) en tijdelijk `Migratie` (Editor, alleen lokaal, daarna intrekken).
- CORS: `http://localhost:4321`, `https://lagadoarchitects.netlify.app`, `https://*--lagadoarchitects.netlify.app`, `https://lagadoarchitects.com` (credentials aan).
- Netlify env: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN` (secret, alle contexts).

## Fase 1 — Dependencies & config ✅
- `npm i @sanity/astro sanity @sanity/client @sanity/image-url @sanity/preview-url-secret @astrojs/react react react-dom @astrojs/netlify astro-portabletext styled-components groq` + `@sanity/visual-editing` (zelfde major als `@sanity/astro` meebrengt). Check bij installatie compatibiliteit met Astro 7.
- `astro.config.mjs`: `sanity({ projectId, dataset, apiVersion: '2025-01-01', useCdn: false, studioBasePath: '/admin', stega: { studioUrl: '/admin' } })`, `react()`, `output: 'server'`, `adapter: netlify()`. `build.format: 'file'` en `trailingSlash: 'never'` behouden.
- Sitemap: `@astrojs/sitemap` ziet SSR-routes niet → vervangen door `src/pages/sitemap-index.xml.ts` (of `customPages` met slugs uit Sanity bij build). Voorkeur: eigen endpoint dat projecten uit Sanity haalt.
- ✅ `.env.example` + README-tabel: Sanity-variabelen staan erin, naast `FONTS_URL`/`FONTS_TOKEN`.
- `predev`/`prebuild` (`scripts/fonts.mjs`) blijven ongewijzigd; op Netlify blijven `FONTS_*` nodig.
- Caching: `netlify.toml` / response-header `Cache-Control: public, max-age=0, s-maxage=…, stale-while-revalidate` + `Netlify-CDN-Cache-Control` met cache-tag; Sanity-webhook → Netlify purge-endpoint (of korte TTL als eerste stap).

## Fase 2 — Studio-schema (`schema/`) ✅
Volgt `lagado-content/README.md` 1-op-1; Nederlandse veldnamen, titels voor Victor.

- `schema/objects/`: `seo` (standaard uit SANITY.md, maar velden `titel`/`beschrijving` houden zoals nu + `image`, `noindex`), `beeld` (Sanity `image` met hotspot + verplicht `alt` (mag leeg = decoratief, via custom validation die alleen `undefined` weigert) + `caption`), `link`, `kleur` (label + hex, validatie `^#[0-9a-f]{6}$`), `persoon`, `persItem`, `awardItem`, `downloadItem` (`label` + `bestand` als `file`), `richText` (Portable Text: normal, h3, strong/em, link — niet meer).
- `schema/blocks/`: één objecttype per bouwsteen (`hero`, `text`, `image`, `gallery`, `columns`, `quote`, `video`, `colors`, `beforeAfter`, `projectGrid`, `statement`, `team`, `list`, `cta`, `services`, `logos`, `downloads`), `name` = huidige `type`-waarde zodat `_type` direct mapt. Elk met `preview` voor een leesbare lijst in de Studio. Velden volgens `staging`:
  - `hero`: `kop` (tekst met regelafbreking), `kopWissel[]`, `subkop`, `subkopWissel[]`, `link`, `adres` (boolean), `tekst` (richText), `beelden` 0–5 (met optionele project-reference).
  - `projectGrid`: `kop`, `featured`, `slugs` → references, `filter`, `limit`, `meer` (default true), `linkNaarOverzicht`, `links[]`.
  - `statement`: `tekst`. `list`: + `zichtbaar`. `services`: + `anker`, `vormen`. `gallery`: `kolommen` 2/3.
- `schema/documents/project.ts`: alle velden uit `projectSchema` op `staging`, met groepen zoals in de README-tabel *Opbouw van een project*: **Identiteit** (`title`, `tagline`, `vraag`, `intro`), **Filters** (`type` thuiskomen/de-hort-op, `vorm[]`, `kleuren[]`, `status` af/bijna/opgetekend, `schaal`, `opgave[]`, `materialen[]`, `prijsklasse`), **Projectgegevens** (`locatie`, `omvang`, `opdrachtgeverType`, `opdrachtgever`, `bouwteam[]`, `fotografie[]`, `jaarOpdracht`, `jaarOplevering`, `programma`), **Kleur** (`accentkleur`, `kleurpalet`), **Beeld & weergave** (`hero`, `featured`, `homepageGrootte` met 7 waarden, `kaartvorm`, `volgorde`, `gerelateerd`), **Credits & pers**, **SEO**. Meerkeuzes (`vorm`, `kleuren`, `opgave`, `materialen`) als `array` van strings met `options.list` (checkboxes); labels zoals Victor ze gebruikt (teksten_v4, `src/lib/labels.ts`). Waardenlijsten uit `src/lib/schema.ts` importeren (één bron). `slug` als `slug`-veld (bron `title`). `gerelateerd` en `projectGrid.slugs` → `reference` naar `project` (max 3). `hero.project` → reference. Custom validation: `jaarOplevering` verplicht bij `status === 'af'`. `prijsklasse` met `hidden` + beschrijving "nooit tonen zonder akkoord".
- `contact.ts`: + `bio` (kop, foto, quote als richText), `stage` (kop, tekst als richText), `bedrijf.bank`. `siteSettings`: + `projecten.intro`.
- `schema/documents/page.ts` voor home/bureau/privacy (vaste IDs), `contact.ts` (singleton).
- `schema/singletons/siteSettings.ts`: huidige `settingsSchema`-velden (siteNaam, payoff, taal, url, seo-defaults, `projecten.toonPrijsfilter`, analytics). Afwijking van de standaard (`siteName` vs `siteNaam`): Nederlandse namen houden conform AGENTS.md, in README noteren. Navigatie + footer in singleton `navigatie` (zoals SANITY.md adviseert).
- `sanity.config.ts`: structureTool met singletons (siteSettings, navigatie, contact, home, bureau, privacy) + lijst Projecten (gesorteerd op `volgorde`, orderable via `@sanity/orderable-document-list` optioneel), templates/actions-filter voor singletons, `presentationTool` met `resolve`.
- NL-taal Studio: `@sanity/locale-nl-nl` als die beschikbaar is.

## Fase 3 — Migratiescript (`scripts/migrate-to-sanity.ts`) ✅
Eenmalig, idempotent (`createOrReplace` met deterministische `_id`s: `project.<slug>`, `page.home`, `siteSettings`, …).
- Omvang: 43 projecten + pagina's. `bureau.md` wordt document `page.bureau`, gerenderd op `/over` (`resolve.ts` koppelt dat). Eerst tellen hoeveel beelden het zijn (upload-tijd, Sanity-quotum).
1. Lees alle `.md` met de bestaande Zod-schema's (frontmatter parsen met `gray-matter`/`yaml`, valideren met `projectSchema` etc.) → dezelfde fouten als nu.
2. Beelden: elk `src` oplossen met dezelfde regels als `images.ts` (project → `projecten/images/<slug>/`, pagina → pad vanaf `lagado-content/`), uploaden via `client.assets.upload('image', …)`, cache op bestandspad zodat elk bestand één keer gaat. Placeholders overslaan als gewenst (vlag `--skip-placeholders`).
3. Downloads → `assets.upload('file', …)`.
4. Markdown → Portable Text met `@portabletext/markdown` / `@sanity/block-tools` (+ jsdom), voor `tekst`, `intro`, `bio`, etc.
5. Blocks: `type` → `_type`, `_key` per array-item.
6. Slugs in `gerelateerd`/`projectGrid.slugs`/`hero.beelden[].project` → `{ _type: 'reference', _ref: 'project.<slug>' }`.
7. Placeholders (`jaar: 0`, `""`) meenemen zoals ze zijn; `cleanItems`/`has()` blijven werken.
- ✅ Gedraaid op 8 nov 2026, direct naar `production` (leeg; een Editor-token kan geen extra dataset aanmaken). 40 projecten, 2 concepten als draft, 312 beelden. `npx sanity documents validate` toont alleen de bekende invulplekken (alt-teksten bij 5 placeholder-projecten, e-mail en social-links in contact, opleverjaar van de concepten).

## Fase 4 — Datalaag omzetten ✅
- `src/lib/sanity/`: `load-query.ts`, `visual-editing.ts`, `VisualEditing.tsx`, `resolve.ts` 1-op-1 uit SANITY.md; `image.ts` met `urlFor` + `imageProps()` uit `standards/IMAGES.md`.
- `src/lib/sanity/queries.ts`: GROQ per document. Projecties leveren **exact de huidige vorm** op: `"type": _type` in blocks, `"slug": slug.current`, references dereferencen naar slugs (`"gerelateerd": gerelateerd[]->slug.current`), `seo{titel, beschrijving, …}`.
- `src/lib/content.ts`: functies houden dezelfde signatuur; `getCollection/getEntry` → `loadQuery`. Defaults die Zod nu zet (`default([])`, `breedte: 'content'`, `kolommen: 3`, `homepageGrootte: 'm'`) via `coalesce()` in GROQ of door het resultaat door het bestaande Zod-schema te halen (aanrader: schema blijft de vangrail, alleen `src`/`tekst`-types aanpassen). `selectProjects`, `getNextProject`, `itemsFromPage`, `cleanItems` blijven zoals ze zijn.
- `src/lib/schema.ts`: `imageRef.src` → Sanity image object (`asset`, `hotspot`, `crop`); `tekst`-velden → Portable Text array. Waardenlijsten blijven hier (gedeeld met Studio).
- `src/content.config.ts` verwijderen.
- Stega: `stegaClean()` op alles wat logica/klasse/URL/head is — `type`, `breedte`, `beeldPositie`, `kolommen`, `soort`, `homepageGrootte`, filtervelden, `accentkleur`/`hex` (→ `hexToOklch`), `href`, `slug`, en alle SEO/JSON-LD-strings. Centraal in `content.ts` waar het kan, anders in `seo.ts`/`color.ts`.

## Fase 5 — Componenten ✅
- `src/lib/projectkleur.ts`: kaartkleur zonder sharp. `accentkleur` blijft eerst; de fallback wordt Sanity's `hero.asset->metadata.palette.dominant.background` (gratis in de asset-metadata). Contrastlogica (wit/zwart, WCAG 1.4.3) blijft. `sharp` kan dan uit de dependencies als niets anders het nog gebruikt.
- `projectBeelden()` (hover-scrub op de kaart): geeft Sanity-beelden terug i.p.v. bestandsnamen; zelfde volgorde (hero, dan blokken), max. 6. Kan ook als GROQ-projectie.
- `src/lib/images.ts`: `resolveImage(scope, image)` geeft een Sanity-beeld terug (scope niet meer nodig voor paden; signatuur vereenvoudigen). `downloadUrl()` → `asset->url` uit de query.
- `src/components/Img.astro`: van `astro:assets` naar `<img srcset>` via `imageProps()` (IMAGES.md), met dezelfde props (`sizes`, `widths`, `priority`), plus `width`/`height` uit asset-metadata (CLS) en hotspot-crop. Callers (`ProjectCard`, `NextProject`, `Hero`, `Gallery`, `Image`, `Columns`, `Team`, `Logos`, `BeforeAfter`, `Video`, `contact.astro`, `[slug].astro`) passen alleen hun `resolveImage`/`projectImage`-aanroep aan.
- `SiteMeta.astro` / `BaseLayout.astro`: `image?: ImageMetadata` → Sanity-beeld; OG-url via `urlFor(...).width(1200).height(630)`.
- Nieuwe `src/components/RichText.astro` (astro-portabletext, alleen p/h3/strong/em/a; externe links `rel="noopener"`). Vervangt de 8 `md()`/`mdInline()`-aanroepen (`Text`, `Columns`, `Services`, `Team`, `Hero`, `PageHeader`, `contact.astro`, `[slug].astro`). `src/lib/markdown.ts` + `marked` weg.
- Routes: `getStaticPaths` in `projecten/[slug].astro` → SSR (`Astro.params.slug` + `getProject`, 404 als niet gevonden). Geen `prerender = true` op contentpagina's; `404.astro` en `robots.txt.ts` mogen prerenderen.
- `BaseLayout.astro`: `<VisualEditing client:only="react" />` + reload-script (ClientRouter!) alleen als `Astro.locals.visualEditing`. Controleren dat Interlude (`src/lib/interlude/`, niet aanpassen) `data-astro-reload` respecteert; zo niet, Interlude in preview uitzetten via `src/interlude.config.ts`.
- Hero-wisseltekst (GSAP): `kopWissel`/`subkopWissel` door `stegaClean()` als ze in `data-`-attributen of JS belanden.
- `src/middleware.ts`, `src/pages/api/preview.ts`, `src/pages/api/preview/disable.ts`, `env.d.ts` (`App.Locals`) volgens SANITY.md.
- Interactieve scripts (filters, lightbox, voor/na) initialiseren al op `astro:page-load` → geen wijziging; wel controleren dat stega-tekens niet in `data-`-attributen voor filters belanden.

## Fase 6 — Opruimen & docs ✅ (behalve `lagado-content/` weghalen: na livegang)
- `lagado-content/`: markdown + beelden blijven tot na livegang als archief, daarna verwijderen (of verplaatsen naar `archive/`). `scripts/placeholders.mjs` en `npm run placeholders` weg.
- `AGENTS.md` Projectspecifiek herschrijven: Sanity is de bron, schema-volgorde wordt `schema/` → `src/lib/schema.ts` → query → component; content altijd via `loadQuery()`; stegaClean-regel; nieuw bloktype = Sanity-objecttype + query-projectie + component + case.
- `README.md` (stack, env-tabel, CMS-sectie, structuur), `lagado-content/README.md` → `schema/README.md` (contentmodel blijft gedocumenteerd), `TODO.md` (Sanity-item af; tokens intrekken, webhook), `CHANGELOG.md` regel per commit.

## Fase 7 — Terugvoeren naar `_standards` (`all-this/standards`)
Zelfde branchnaam in de standards-repo, aparte PR. Alleen wat project-onafhankelijk is; LAGADO-specifieke velden blijven in het project.
- **`SANITY-BLOCKS.md` (nieuw):** het bouwsteen-patroon als standaard: Sanity-objecttype per blok met `name` = `type`, GROQ-projectie `"type": _type`, discriminated union in `schema.ts`, `BlockRenderer` met `assertNever`, `preview` per blok. Plus een bibliotheek van de generieke blokken (`text`, `image`, `gallery`, `columns`, `quote`, `video` met consent-facade, `cta`, `downloads`, `logos`, `beforeAfter`) als kopieerbare schema + component, in `snippets/sanity-blocks/`.
- **`SANITY.md` aanvullen:** een sectie *Migratie van markdown/content collections naar Sanity* (het script als `scripts/migrate-md-to-sanity.mjs`, generiek gemaakt: deterministische `_id`s, asset-cache, markdown → Portable Text, slugs → references); *Sitemap bij `output: 'server'`*; *CDN-cache + revalidatie via Sanity-webhook op Netlify*; stega centraal in de datalaag i.p.v. per component; Zod als vangrail op GROQ-resultaten.
- **`IMAGES.md` aanvullen:** `Img.astro` die Sanity-beeld accepteert met hotspot/crop, `width`/`height` uit metadata, en verplichte-maar-lege `alt` als decoratief (validatieregel).
- **Nieuw snippet:** `RichText.astro` (Portable Text, minimale marks, externe links).
- **`AGENTS.template.md`:** regel "Nieuw bloktype of oplossing die ook elders bruikbaar is → na merge voorstel in `_standards`" + verwijzing naar `SANITY-BLOCKS.md`.
- **Besluit vastleggen:** Nederlandse veldnamen (`siteNaam`) vs. Engelse in de standaard (`siteName`). Voorstel: standaard blijft Engels voor nieuwe projecten; NL toegestaan als het model vóór Sanity al bestond, mits in `AGENTS.md` vermeld.
- `CHANGELOG.md` van standards bijwerken.

Werkwijze voor later: elk nieuw blok of elke oplossing in LAGADO krijgt in de PR-beschrijving een vinkje "kandidaat voor _standards"; bij merge maak ik daar een vervolgtaak/PR van.

---

## Kritieke bestanden
`astro.config.mjs`, `sanity.config.ts` (nieuw), `schema/**` (nieuw), `scripts/migrate-to-sanity.mjs` (nieuw), `src/lib/content.ts`, `src/lib/schema.ts`, `src/lib/images.ts`, `src/lib/sanity/*` (nieuw), `src/components/Img.astro`, `src/components/RichText.astro` (nieuw), `src/components/SiteMeta.astro`, `src/layouts/BaseLayout.astro`, `src/pages/projecten/[slug].astro`, `src/middleware.ts` (nieuw).

## Verificatie
1. `npm run check` en `npm run build` zonder fouten (assertNever en Zod vangen vergeten velden).
2. Migratie tegen `migratie-test`: aantallen documenten/assets kloppen met de `.md`-bestanden; Studio toont alle projecten met beelden en alt-teksten.
3. Visuele vergelijking: vóór migratie screenshots (Playwright, alle routes: `/`, `/projecten`, alle 43 projecten, `/over`, `/contact`, `/privacy`; ook kaartkleuren en hover-scrub) van de markdown-versie, daarna van de Sanity-versie; diff op inhoud en layout.
4. Visual Editing: de curl-tests uit SANITY.md → *Testen* (401 zonder secret, nagemaakte cookie = 0 islands, geldige cookie + iframe ≥ 1, `Cache-Control: private, no-store`), daarna de 6 stappen in de deploy preview.
5. Stega-check in Presentation: filters op `/projecten`, accentkleuren, `breedte`-klassen, links en `<head>`/JSON-LD zonder onzichtbare tekens.
6. Lighthouse/axe op deploy preview: beelden met `width`/`height`, alt aanwezig, geen nieuwe third-party requests buiten `cdn.sanity.io` (AVG: Sanity CDN is EU-verwerker? → noteren in privacyverklaring).

## Stand 8 nov 2026
- Fase 1–6 gebouwd. Vergelijking markdown-versie (`staging`) ↔ Sanity-versie: 45 routes, 0 verschillen in tekst, titels, meta-beschrijvingen en alt-teksten; kaartkleuren binnen 1% lichtheid. Visual Editing-tests uit SANITY.md → *Testen* geslaagd (401 zonder secret, nagemaakte cookie uit, geldige cookie alleen in de iframe, `private, no-store`).
- Nog te doen door Maarten: Viewer-token in Netlify, CORS-origins, Victor uitnodigen, Studio + Voorbeeld testen in de deploy preview, migratietoken intrekken, webhook voor cache purge (zie TODO.md).
- Gekozen afwijkingen: kaartkleur via sharp op een CDN-thumbnail (identiek aan vroeger) i.p.v. Sanity's `palette`; geen aparte testdataset (Editor-token kan die niet aanmaken).
