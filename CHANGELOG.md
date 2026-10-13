# Changelog

Alle noemenswaardige wijzigingen aan dit project. Nieuwste bovenaan.
Format gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/).

Categorieën: **Toegevoegd**, **Gewijzigd**, **Opgelost**, **Verwijderd**, **Beveiliging**, **Onderhoud**.

## [Unreleased]

### Toegevoegd
- Hero met wisselende woorden na kop en subkop (`kopWissel`, `subkopWissel`, `link`): per woord gemaskeerd schuiven met GSAP, loopt per woord om, hoogte gereserveerd, pauzeknop (WCAG 2.2.2), stil bij reduced motion.
  Kop en subkop zonder `text-wrap: balance`/`pretty`.
- Projectfilters volgens Victor (teksten_v2): Type, Vorm, Kleur (met swatches) en "Verras me" direct; Status, Schaal, Materiaal onder "Tot op de mm".
- Scaffold Astro 7.3 (statisch, Node 22) met content collections op `lagado-content/` en Zod-schema volgens het contentmodel.
- Pagina's: home, projecten (overzicht met filters in de URL), projectdetail (feiten, credits, pers/awards, press-kit, volgend project), bureau, contact, privacy, 404.
- Bouwstenen: hero, text, image, gallery (lightbox), columns, quote, video, colors, beforeAfter, projectGrid, team, list, cta, services, logos, downloads.
- Cookie-consent (vanilla-cookieconsent v3 + iframemanager, NL, gebundeld) met video's pas na toestemming en optionele cookieloze statistiek.
- SEO: meta/OG, canonical, JSON-LD (ArchitectureFirm, CreativeWork, breadcrumbs), sitemap, robots.txt.
- Design-tokens (OKLCH, Utopia fluid type/space), breakout-grid, dark mode, view transitions.
- `scripts/placeholders.mjs` voor placeholder-beelden; README, AGENTS, netlify.toml, .nvmrc.
- Vijf placeholder-projecten + veld `homepageGrootte` (`s` / `m` / `l`) voor het homepage-raster.
- Fonts: Instrument Sans (variable) en DM Mono (specs/meta), self-hosted via Fontsource.
- `utopia-core-scss` + Sass: type- en spaceschaal in `tokens.scss` (360→2560, tweakbaar).

### Gewijzigd
- Menu Wat / Waarom / Contact; URL's `/projecten` → `/wat`, `/bureau` → `/waarom`.
- Contentmodel: `type` (thuiskomen / de hort op), `status` (af / bijna / opgetekend), nieuw `vorm`, `kleuren`, `schaal`, `materialen`; alle projecten omgezet.
- Teksten Home, Waarom en Contact uit "LAGADO website 2026 teksten_v2".
- Content: `over.md` → `bureau.md`; navigatie Projecten / Bureau / Contact; contactformulier verwijderd en contactgegevens aangevuld uit Victors teksten (postcode, telefoon, architectenregister, BNI); nieuwe blokken `services`, `logos`, `downloads` en projectveld `pressKit`; `privacy.md` toegevoegd.
- Hero: meer ruimte boven de titel (`--space-4xl`).
- Dark mode volgt standaard `prefers-color-scheme`; toggle cyclus system → light → dark.

### Verwijderd
- Projectvelden `stijl`, `themas`, `doelgroep` en de oude waarden van `type`/`status`.
- Handmatige `tokens.css` (vervangen door `tokens.scss` + `utopia-core-scss`).

### Onderhoud
- `.gitignore` aangescherpt (`.env.*`, `.netlify`, `.claude/`, …); `TODO.md` toegevoegd.
- GitHub-repo `astrobuildclub/lagadoarchitects.com` aangemaakt; scaffold op `feat/scaffold`.
- Netlify (All This) gekoppeld: https://lagadoarchitects.netlify.app/
- README afgestemd op `~/Code/_standards/README.template.md`; GitHub About ingevuld.
