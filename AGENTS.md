# AGENTS.md: lagadoarchitects.com

Instructies voor AI-agents (Claude Code, Cursor, Codex) en ontwikkelaars die aan dit project werken.
Lees eerst `README.md` voor context en `CHANGELOG.md` voor recente wijzigingen.

## Project
- Klant: LAGADO architects · Bedrijf: All This · SLA: TODO
- Stack: Astro 7.3 (server-rendered op Netlify), Sanity (project `unque637`, Studio op `/admin`), Node 22 (zie `.nvmrc`)

## Werkwijze
- Werk nooit direct op `main`. Branch vanaf `staging` → PR naar `staging` → deploy preview → merge. Naar `main` alleen gebundelde releases en hotfixes, volgens `~/Code/_standards/DEPLOY.md` (elke productiedeploy kost Netlify-credits).
- Branchnamen: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- Commit nooit `.env`-bestanden of tokens. Nieuwe variabelen: naam toevoegen aan `.env.example` en de README-tabel.
- Variabelen met `PUBLIC_` komen in de browser terecht: nooit voor tokens.
- Dev-server op de achtergrond: `npx astro dev --background` (beheer met `astro dev stop|status|logs`).

## Documentatie bijhouden (verplicht)
- Elke wijziging die je commit: voeg een regel toe onder `## [Unreleased]` in `CHANGELOG.md`.
- Bij een release (`staging → main`): zet `[Unreleased]` om naar een datumkop.
- Verandert setup, env, stack of deploy? Werk `README.md` bij.

## Conventies
- Moderne CSS: custom properties, OKLCH-kleuren, logical properties, container queries waar zinvol.
- Toegankelijkheid: WCAG 2.2 AA. Semantische HTML, focus-states, `prefers-reduced-motion` respecteren.
- AVG: geen tracking of third-party embeds zonder consent.
- Taal van UI-teksten en code-comments: Nederlands.

## Projectspecifiek
- **Sanity is de bron.** Content en beelden staan in Sanity; `lagado-content/` is het archief van vóór de overstap (bron van `npm run migrate`), niet meer van de site. Wijzig het model in deze volgorde: `schema/` (Studio) → `src/lib/schema.ts` (Zod) → `src/lib/sanity/queries.ts` → component. Veldnamen zijn Nederlands; niet hernoemen zonder reden. Waardenlijsten staan één keer, in `src/lib/waarden.ts`.
- **Eén datalaag.** Pagina's en componenten lezen content alleen via `src/lib/content.ts`, en die alleen via `loadQuery()` (`src/lib/sanity/load-query.ts`). Nooit zelf `sanityClient.fetch`, `perspective`, `token` of `stega` in componenten. Visual Editing volgens `~/Code/_standards/SANITY.md`.
- **Stega:** in de Presentation tool krijgen strings onzichtbare tekens. `normalize.ts` maakt alles schoon behalve getoonde tekst (`TOON`); `<head>`, JSON-LD en SEO via `stegaClean()`. Nieuw tekstveld dat getoond wordt: naam aan `TOON` toevoegen.
- **Beelden** zijn Sanity-beelden (`src` in `{ src, alt, caption }`), altijd via `<Img>` (srcset uit de Sanity-CDN, `src/lib/sanity/image.ts`), nooit via Astro `<Image>`. `alt` is verplicht; "Decoratief" in de Studio = `alt=""`.
- **Rich text** is Portable Text, altijd via `<RichText>`. Platte tekst (SEO, JSON-LD): `platteTekst()`.
- **Nieuw bloktype:** Sanity-objecttype in `schema/blocks/` (naam = `type`; `text` en `image` heten `textBlock`/`imageBlock`) → Zod in `schema.ts` (discriminated union op `type`) → projectie in `BLOCKS` (queries.ts) → `src/components/blocks/X.astro` → case in `BlockRenderer.astro` (de `assertNever` geeft een typefout als je die vergeet).
- **Invulplekken:** lege velden komen niet uit Sanity mee; Zod vult verplichte-maar-nog-lege velden aan met `""` (`invulplek`). Componenten tonen lege waarden niet (`cleanItems`, `has()`). Lege blokken renderen niets.
- **Pagina's:** Home (`page-home`, op `/`) en Contact zijn vast; alle andere pagina's maakt de redactie zelf aan en staan op `/<slug>` (`src/pages/[slug].astro`). Nieuwe vaste route? Zet de URL ook in `GERESERVEERD` (`schema/documents/pages.ts`). Menu en footer staan in de site-instellingen.
- **Content omzetten** na een modelwijziging: een herhaalbaar script in `scripts/sanity/<datum>-<naam>.ts` (patches op de bestaande documenten, drafts meenemen). `npm run migrate` niet meer gebruiken: die overschrijft de Studio.
- **Prijsklasse** nooit tonen zonder akkoord van Victor (Site-instellingen → Projectoverzicht → Prijsklasse tonen).
- **Geen contactformulier, geen kaart-iframe** (afspraak in het voorstel).
- **Consent:** nieuwe embed-dienst = service in `src/lib/consent.ts` (iframemanager + cookieconsent-categorie `media`). Statistiek alleen cookieloos en pas na toestemming.
- **Interactieve onderdelen** (filters, lightbox, voor/na, thema) initialiseren op `astro:page-load` vanwege de `<ClientRouter />`.
- **Transities:** laag 3b, Interlude `3f1a9ce` met `curtain-lagado` (eigen variant van `curtain` waarin header en footer meedrijven), volgens `~/Code/_standards/TRANSITIONS.md` §7. Engine in `src/lib/interlude/` en transities in `src/transitions/` niet aanpassen (worden overschreven door `add-interlude.sh`); instellingen in `src/interlude.config.ts`, kleur via `--interlude-color` in `tokens.scss`. Modale `<dialog>`s sluiten op `interlude:leave`. Geen `transition:name`/`transition:animate` op elementen: die spelen niet.
- Ontwerp volgt in Figma; houd componenten kaal en stuur stijl via tokens in `src/styles/tokens.scss` (Utopia via `utopia-core-scss`).

