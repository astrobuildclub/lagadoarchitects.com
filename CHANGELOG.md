# Changelog

Alle noemenswaardige wijzigingen aan dit project. Nieuwste bovenaan.
Format gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/).

Categorieën: **Toegevoegd**, **Gewijzigd**, **Opgelost**, **Verwijderd**, **Beveiliging**, **Onderhoud**.

## [Unreleased]

### Toegevoegd
- /wat: weergave Raster of Lijst (knoppen rechts in de filterbalk, keuze onthouden per bezoeker). In de lijst één rij per project zonder beeld; met een muis hangt het projectbeeld bij hover aan de cursor (GSAP `quickTo`, `src/scripts/hover-follow.ts`, zonder naloop bij reduced motion).
- Projectdetail: kruimelpad Home › Wat (ook in de JSON-LD), meer ruimte boven de titel. Titel en tagline schuiven per woord van onder in (`words-in.ts`).
- Projectdetail: de vraag kleurt woord voor woord in terwijl je scrollt (`src/scripts/ink-in.ts`); zonder JS of met reduced motion staat hij gewoon in kleur.
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
- Projectoverzicht (/wat) op featurebreedte (`.wrapper`, max 78rem). Filters opgebouwd als het factsheet: één rij per groep met het label in mono in een vaste kolom, opties als kale tekst (actief = onderstreept) met per optie het aantal projecten dat overblijft (0 = uitgeschakeld). Kleuren staan direct in de rij met swatch, zonder dropdown. Actieregel: Tot op de mm links, Wis filters ernaast (alleen als er iets aan staat), Raster/Lijst rechts. Het aantal projecten staat klein boven de lijst. "Verras me" is nu het woord "verrassen" in de intro (link naar `#verras` in `site.md`, wordt een knop met underline). Op mobiel dezelfde rijen in de overlay.
- Titelanimatie op projectdetail start pas als de paginatransitie klaar is (`interlude:idle`).
- Hero-kop altijd op drie regels, op elke schermbreedte: "Wij zijn een serieus / buro voor speelse / architectuur". De breuk na "serieus" staat in `home.md` (nieuwe regel in `kop`), het laatste wisselwoord krijgt een eigen regel, en de kop krimpt mee met de breedte (`cqi`). Zo past ook "sportieve landschappen".
- Header en footer lopen over de volle breedte van de viewport (`.wrapper--full`).
- Volgend project sluit direct aan op de footer (geen ruimte of lijn ertussen). Label en titel schuiven per woord van onder in zodra het blok in beeld komt (GSAP, `src/scripts/words-in.ts`, zelfde beweging als de hero; niets bij reduced motion).
- Projectmodel strakgetrokken: alle projectbestanden en `_template.md` in dezelfde volgorde (identiteit, filters, projectgegevens, kleur, beeld, credits). `oppervlakte` heet nu `omvang`, `opdrachtgeverType` `prive` heet nu `particulier`, `functie` is vervallen (de vraag vervangt hem). Fotografie staat in het factsheet in plaats van onderaan bij de credits.
- Hero-kop op mobiel (< 36rem) altijd op drie regels: "Wij zijn een serieus buro / voor speelse / architectuur". Max 20ch, laatste wisselwoord op een eigen regel, en op smalle schermen krimpt de kop mee (`cqi`) zodat de eerste regel past.
- Paginatransitie: eigen variant `curtain-lagado`, waarin header en footer meedrijven met de content. Bij `curtain` bleef de header stilstaan terwijl de pagina eronder wegschoof.
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
