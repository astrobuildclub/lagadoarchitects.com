# Changelog

Alle noemenswaardige wijzigingen aan dit project. Nieuwste bovenaan.
Format gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/).

Categorieën: **Toegevoegd**, **Gewijzigd**, **Opgelost**, **Verwijderd**, **Beveiliging**, **Onderhoud**.

## [Unreleased]

### Toegevoegd
- Projectdetail: factsheet in twee helften. Eerst de filtereigenschappen (Type, Vorm, Kleur met swatch, Status, Schaal, Materiaal), elke waarde linkt naar `/wat` met dat filter aan; daarna Locatie, Omvang, Opdrachtgever, Bouwteam, Fotograaf, Jaar.
- Veld `vraag`: de ontwerpvraag van een project, groot in de accentkleur boven de intro.
- Velden `bouwteam` (in het factsheet) en een sectie "Opbouw van een project" in `lagado-content/README.md`.
- Projectoverzicht (/wat): titel staat links op één lijn met logo en filters, met een ondertitel uit `site.md` (`projecten.intro`, concepttekst, TODO: Victor). Leeg = geen ondertitel.
- Projectfilters als chips. Kleur zit in een dropdown met swatches (sluit met Escape of door ernaast te klikken, op mobiel in de flow), "Tot op de mm" heeft een pijltje. Opties die tot 0 projecten leiden worden uitgeschakeld (facetten), dus je komt nooit op een leeg resultaat uit. Op mobiel staan de filters in een schermvullende overlay (`<dialog>`) achter de knop "Filters (n)", met onderaan "Toon n projecten"; "Verras me", "Wis filters" en het aantal staan altijd buiten het paneel.
- Paginatransities met [Interlude](https://github.com/codrops/interlude) (`curtain`: een vlak in `--color-fg` schuift van onder over de pagina en onthult de volgende; omgekeerd bij terug). Laag 3b uit `_standards/TRANSITIONS.md`, geplaatst met `scripts/add-interlude.sh`. Lightbox sluit bij navigeren.
- Fonts: ABC Areal en ABC Areal Mono (variabel, by ABC Dinamo) met credit in de footer. Bestanden niet in git (licentie: geen publieke repo); `scripts/fonts.mjs` haalt ze op via `FONTS_URL` uit de privé-repo `All-This/fonts` (leest ook `.env`). Dark mode zet de `DRKM`-as aan.
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

### Opgelost
- Typefouten in het script van `ThemeToggle.astro` (`astro check` is weer schoon): `theme` getypeerd, knop als `HTMLButtonElement` opgevraagd.
- Netlify secrets scanning: `FONTS_URL` uitgezonderd (`SECRETS_SCAN_OMIT_KEYS`), de build faalde omdat de URL in de README staat.

### Gewijzigd
- Projectmodel strakgetrokken: alle projectbestanden en `_template.md` in dezelfde volgorde (identiteit, filters, projectgegevens, kleur, beeld, credits). `oppervlakte` heet nu `omvang`, `opdrachtgeverType` `prive` heet nu `particulier`, `functie` is vervallen (de vraag vervangt hem). Fotografie staat in het factsheet in plaats van onderaan bij de credits.
- Kleurfilter: dropdown toont kleuren onder elkaar als lijst (swatch, label, vinkje bij actief) in plaats van chips, rechts uitgelijnd onder de chip. Aantallen op "Kleur" en "Filters" in ABC Areal Mono, zodat de chip niet per cijfer van breedte verspringt.
- Header: woordmerk LAGADO als inline SVG (`Logo.astro`) in de accentkleur. Nieuwe accentkleuren (licht: blauwpaars, donker: oranje). Koppen iets strakker gespatieerd, hero-kop op mobiel `--step-4`. Huis aan de Maas groot (`l`) op de homepage.
- Instrument Sans en DM Mono (Fontsource) vervangen door ABC Areal; Fontsource-pakketten verwijderd.
- Menu Wat / Waarom / Contact; URL's `/projecten` → `/wat`, `/bureau` → `/waarom`.
- Contentmodel: `type` (thuiskomen / de hort op), `status` (af / bijna / opgetekend), nieuw `vorm`, `kleuren`, `schaal`, `materialen`; alle projecten omgezet.
- Teksten Home, Waarom en Contact uit "LAGADO website 2026 teksten_v2".
- Deploy-workflow volgens `_standards/DEPLOY.md`: features via PR naar `staging` (branch deploy op `staging--lagadoarchitects.netlify.app`), gebundelde releases naar `main`. Branch protection op `staging`.
- `netlify.toml`: geen build bij commits met alleen documentatie (`*.md` in de root, `.github/`). Markdown-content in `lagado-content/` start wel een build.
- Content: `over.md` → `bureau.md`; navigatie Projecten / Bureau / Contact; contactformulier verwijderd en contactgegevens aangevuld uit Victors teksten (postcode, telefoon, architectenregister, BNI); nieuwe blokken `services`, `logos`, `downloads` en projectveld `pressKit`; `privacy.md` toegevoegd.
- Hero: meer ruimte boven de titel (`--space-4xl`).
- Dark mode volgt standaard `prefers-color-scheme`; toggle cyclus system → light → dark.

### Verwijderd
- Projectvelden `stijl`, `themas`, `doelgroep` en de oude waarden van `type`/`status`.
- Handmatige `tokens.css` (vervangen door `tokens.scss` + `utopia-core-scss`).

### Onderhoud
- `.github/dependabot.yml`: wekelijkse updates naar `staging`, gegroepeerd (Astro, minor/patch).
- `.gitignore` aangescherpt (`.env.*`, `.netlify`, `.claude/`, …); `TODO.md` toegevoegd.
- GitHub-repo `astrobuildclub/lagadoarchitects.com` aangemaakt; scaffold op `feat/scaffold`.
- Netlify (All This) gekoppeld: https://lagadoarchitects.netlify.app/
- README afgestemd op `~/Code/_standards/README.template.md`; GitHub About ingevuld.
