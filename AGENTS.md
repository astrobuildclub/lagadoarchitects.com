# AGENTS.md: lagadoarchitects.com

Instructies voor AI-agents (Claude Code, Cursor, Codex) en ontwikkelaars die aan dit project werken.
Lees eerst `README.md` voor context en `CHANGELOG.md` voor recente wijzigingen.

## Project
- Klant: LAGADO architects · Bedrijf: All This · SLA: TODO
- Stack: Astro 7.3, geen CMS (Sanity volgt), Node 22 (zie `.nvmrc`)

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
- **Content is de bron.** Alles staat in `lagado-content/`. Wijzig het model in deze volgorde: `lagado-content/README.md` → `src/lib/schema.ts` → component. Veldnamen zijn Nederlands en worden later 1-op-1 Sanity-velden; niet hernoemen zonder reden.
- **Eén datalaag.** Pagina's en componenten lezen content alleen via `src/lib/content.ts`. Geen `getCollection` elders: bij de overstap naar Sanity wisselt alleen die laag.
- **Beelden** staan in `lagado-content/` en worden via `src/lib/images.ts` opgelost (projecten: bestandsnaam in `projecten/images/<slug>/`; pagina's: pad vanaf `lagado-content/`). Ontbrekend bestand = bouwfout. `alt` is verplicht, `""` = decoratief.
- **Nieuw bloktype:** README-tabel → schema (discriminated union op `type`) → `src/components/blocks/X.astro` → case in `BlockRenderer.astro` (de `assertNever` geeft een typefout als je die vergeet).
- **Placeholders** in de content (`jaar: 0000`, lege strings) zijn invulplekken voor Victor; componenten tonen ze niet (`cleanItems`, `has()`). Lege blokken renderen niets.
- **Prijsklasse** nooit tonen zonder akkoord van Victor (`projecten.toonPrijsfilter` in `site.md`).
- **Geen contactformulier, geen kaart-iframe** (afspraak in het voorstel).
- **Consent:** nieuwe embed-dienst = service in `src/lib/consent.ts` (iframemanager + cookieconsent-categorie `media`). Statistiek alleen cookieloos en pas na toestemming.
- **Glob-patronen** in `src/content.config.ts`: sluit bestanden uit met een negatie (`['*.md', '!_*.md']`), niet met `[!_]*.md`. Dat laatste werkt bij de build maar breekt de hot reload in dev.
- **Interactieve onderdelen** (filters, lightbox, voor/na, thema) initialiseren op `astro:page-load` vanwege de `<ClientRouter />`.
- Ontwerp volgt in Figma; houd componenten kaal en stuur stijl via tokens in `src/styles/tokens.scss` (Utopia via `utopia-core-scss`).

