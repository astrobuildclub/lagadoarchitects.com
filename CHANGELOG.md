# Changelog

Alle noemenswaardige wijzigingen aan dit project. Nieuwste bovenaan.
Format gebaseerd op [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/).

Categorieën: **Toegevoegd**, **Gewijzigd**, **Opgelost**, **Verwijderd**, **Beveiliging**, **Onderhoud**.

## [Unreleased]

### Gewijzigd
- Homepage volgens Figma (Home, 447:2103). Intro als twee brede kolommen in step-3 (wisselwoord vet); adres en de Gulliver-tekst staan in de footer. Projectraster met een vast aantal kaarten (`projectGrid.meer: false`, `limit: 8`): 3 kolommen (2 op tablet, 1 op mobiel), gap `--tile-gap` (space-m), kaarten 1 of 2 rijen hoog (`homepageGrootte`); de site maakt het raster sluitend. Kaart: de foto vult de kaart (radius xs), daarop de kaartvorm in de projectkleur met type • jaar en titel. Hover/focus (touch: in beeld) keert het om: de kaart krijgt de kleur, de foto krimpt via `clip-path` tot de vorm. Knoppen onder het raster in step-1, afsluiter als inktpil met de vraag in step-3.
- /projecten, rasterweergave (Figma 462:8670): staande kaarten met de foto (3:4) in de kaartvorm en de tekst eronder (titel step-3), padding l, gap l, radius xs. Standaard zonder vlak in de tekstkleur van de pagina; hover/focus (touch: in beeld) geeft de projectkleur met zwart of wit op contrast. 1 kolom, oplopend tot 5 vanaf 140rem.
- Header (Figma 447:2104): in de paginakleuren, woordmerk met "architects", menu en thema als even brede grijze pill-knoppen over de rechterhelft; huidige pagina en hover omgekeerd.
- Compacte footer (Figma 449:6819): dunne lijn, klein woordmerk met payoff, vijf kolommen (herkomst van de naam over twee, adres, bedrijfsgegevens, links). Tekst in `site.md` → `footer.tekst`.
- Kaartvorm `recht` heeft nu een ronding van 12px (space-xs), zoals in Figma.
- Home: vaste indeling uit Figma (per 8 kaarten, de halve kaart midden boven) in plaats van `homepageGrootte`; kaarttekst een stap groter (meta step-0, titel step-2). Hover toont geen scrubbalk meer maar elke seconde het volgende beeld, hard en vanaf het eerste (niet bij reduced motion). De themaknop in het menu rekt niet mee.

### Toegevoegd
- 301-redirects voor de 213 URL's van de oude WordPress-site (uit `wp-sitemap.xml`): projecten naar hun nieuwe pagina, nieuwsberichten naar het bijbehorende project of anders `/over`, categorieën naar `/projecten`. Tritents, Orange Core House en Cheer Up City staan niet op de nieuwe site en gaan naar `/projecten`.
- Homepage volgens Figma (Home 01A, desktop en mobiel). Intro als vier kleine kolommen (kop en subkop met wisselwoorden, adres, herkomst van de naam; hero-velden `adres` en `tekst`). Projectraster zonder gap over de volle breedte, rijhoogte 128px (360) tot 256px (1512), 4 kolommen en vanaf 60rem 6. Knoppen "alle projecten" en "over" als grijze pillen, afsluiter met een kleine link.
- Breed scherm (vanaf 110rem, ±1760px): homeraster 12 kolommen met dezelfde spans (tegels half zo breed; helften en derden blijven mogelijk), /projecten 4 kaarten per rij.
- /projecten, rasterweergave: zelfde vlakken als de home (kaartvorm, typografie, geen gap), alle kaarten even groot (2 per rij, vanaf 60rem 3). De pagina loopt van gutter tot gutter. De lijstweergave blijft zoals hij was.
- `homepageGrootte` `mini` (1×1) en `lang` (4×1); veld `kaartvorm` (`ovaal`, `afgerond`, `zacht`, `recht`, `schuin`), leeg = uit `vorm`. Bright Light, Wooden House Deventer, Easehouse, Chinny en Concrete Dunes staan op maat en vorm uit Figma.
- Header als donkere balk met het nieuwe (voorlopige) woordmerk; op mobiel klappen de links uit achter "menu".
- Footer als donker vlak met het woordmerk over de volle breedte en vier kolommen (naam, adres, bedrijfsgegevens, privacy/cookies/credits). De Gulliver-uitsmijter staat nu in de intro op de home.
- Teksten volgens Victors teksten_v4 (leidend). Over: prijzenkast "Onze hoogste punten" (6 zichtbaar, rest uitklapbaar), "Waarom samenwerken?", zes dienstentegels in de projectvormen (`/over#diensten`) met CTA, "Speels in ontwerp. Serieus in realisatie." en "De fundering onder ons werk" met de Deelder-quote. Contact: bio van Victor met portret, uitgebreide CTA en stage-oproep. Footer: uitsmijter "Onze naam, een open houding" (Gulliver) en bankregel.
- Bloktype `statement` (mantra "Vorm, kleur, gelaagdheid. Ruimtes die verrassen." op de home); `list.zichtbaar`, `services.anker` en `services.vormen`, `projectGrid.links`.
- Veld en filter `opgave` (interieur / verbouw / nieuwbouw / landschap), ingevuld voor alle projecten.
- Gedeelde vormstijlen in `src/styles/vorm.css` (`data-vorm` → `--vorm-radius`, `--vorm-clip`) voor kaarten, hover-beeld en dienstentegels.
- 33 projecten uit de Dropbox-map (Concrete en Paper) met 277 beelden (max. 2400 px) en alt-teksten. Gegevens en teksten van de huidige site en de tekstbestanden in Dropbox, vertaald naar het Nederlands; per bestand een TODO voor Victor. Tasgram en Tommy Jeans staan als concept (`_*.md`, niet gebouwd) tot er een opleverjaar is. Overgeslagen: mappen zonder beelden (Tritents, Witte Panden, Heemraadssingel Hills, Sponge 3, Unstable, Temporadical, Insane terrain, Gateway House, Dissolving Landscape) en GoSidewalkSurfing (alleen een archieffoto van derden).
- Project Bright Light (gegevens van de huidige site, 17 foto's van Loes van Duijvendijk met alt-teksten, uitgelicht op home als groot). Intro is een concept; vraag, verhaal, materialen en omvang nog van Victor.
- Workhome Playhome: echte foto's (12, uit de Dropbox-map) in plaats van placeholders, met alt-teksten.
- Projectkaart in de vorm van het project (eerste `vorm`: `recht` = afgeronde hoeken, `rond` = cirkel/pil, `schuin` = parallellogram) als vlak in de projectkleur, met jaar (oplevering, anders opdracht) en titel. Kleur: `accentkleur`, anders bij de build de bepalende kleur uit het hero-beeld (`src/lib/projectkleur.ts`, sharp); tekst wit of zwart op contrast.
- Projectkaart met muis: hover toont de foto, horizontaal bewegen scrubt door de hero en de beelden uit de blokken (max. 6, pas geladen bij de eerste hover). Touch: foto zodra de kaart midden in beeld staat, met een kleurbalk voor type, jaar en titel; bij reduced motion direct de foto (`src/scripts/project-card.ts`).
- Home: "Meer projecten" toont de volgende `limit` uitgelichte projecten en zet de focus op de eerste nieuwe kaart.
- /wat, lijstweergave: het beeld aan de muis krijgt de vorm van het project.
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
- Beeldviewer (gallery-lightbox): alle beelden stonden tegelijk in beeld, de nog niet geladen als kapot beeld met alt-tekst (`display: grid` overschreef `hidden`). Nu één beeld tegelijk, het vorige en volgende worden vooraf geladen, de pagina scrolt niet mee en de knoppen zijn grijze pillen.
- /wat, lijstweergave: de vorm (parallellogram) sneed de projecttitel af.
- Home: "Meer projecten" bleef zichtbaar na het laatste project (`.button` overschreef `hidden`).
- Kaartkleur werd in dev niet ververst na het vervangen van een foto.
- Typefouten in het script van `ThemeToggle.astro` (`astro check` is weer schoon): `theme` getypeerd, knop als `HTMLButtonElement` opgevraagd.
- Netlify secrets scanning: `FONTS_URL` uitgezonderd (`SECRETS_SCAN_OMIT_KEYS`), de build faalde omdat de URL in de README staat.

### Gewijzigd
- /projecten, filters: "Verras me" is geen eigen kolom meer maar staat rechts in de actieregel (naast "Verfijn", op mobiel naast "Filters") en in de overlay onder "Toon n projecten", met een nieuw dobbelsteen-icoon. Bij hover of focus speelt de Lottie-animatie "hover-pinch" (`lottie-web`, lichte SVG-speler, pas geladen bij de eerste hover; `src/scripts/verras-dobbelsteen.ts`); zonder JS of met reduced motion het statische icoon. Vanaf 64rem een kolom per filtergroep, ook dicht. De lijn onder de actieregel staat er op desktop alleen als "Verfijn" open is.
- /projecten, filters: vanaf 64rem ook met "Verfijn" open uitgevuld over de volle breedte, alle groepen even breed. Het aantal loopt direct achter een lang label ("Papieren werkelijkheid 12") in plaats van als losse kolom.
- Header en footer omgekeerd t.o.v. het thema: licht thema = donker vlak, donker thema = licht vlak (`--color-ink`, `--color-on-ink`, DRKM-as volgt mee). Logo (20px hoog) en menu (step-0) kleiner, balk lager.
- "Een serieus bureau voor speelse architectuur" (was "buro") in kop, payoff, paginatitel en footer, volgens teksten_v4.
- Zijruimte (`--gutter`) is nu `--space-s-3xl`: 16px op mobiel, ±64px op 1512, 108px op 2560; geldt voor header, raster en footer. Nieuwe spacestap `--space-5xl`, kleur `--color-ink`.
- CTA-blok: grote vraag met een kleine link in plaats van een omlijnd blok met knop.
- Paginatitels (h1) en het mantra krijgen dezelfde letterafstand als de hero-kop (-0.03em).
- Home: het grote herobeeld staat uit (`beelden: []`, hero mag nu zonder beeld); het projectraster loopt over de volle paginabreedte (gutter tot gutter), toont 12 projecten en heeft 16 uitgelichte projecten. Nieuwe kaartmaat `toren` (2×3) voor meer variatie in hoogte.
- Hero: wisselwoorden niet meer in de accentkleur maar met een dikke onderstreping (0,07em, met gaten bij staarten). Projecttitel niet meer in de accentkleur.
- Menu Projecten / Over / Contact: `/wat` → `/projecten`, `/waarom` → `/over` (301-redirects in `netlify.toml`). De content van Over staat nog in `bureau.md`.
- Hero: timing per regel via data-attributen (`data-hold`, `data-uit`, `data-leeg`, `data-in`, `data-fade`). Kop: 5 s staan, woord voor woord weg (0,5 s per woord), 2 s leeg, nieuwe woorden met 1 s per woord en een fade van 0,3 s. Subkop: idem, maar 0,125 s per woord weg, 0,75 s leeg en 0,25 s per woord erin. Nieuwe woorden worden onzichtbaar aangemaakt, zodat ze niet vooraf flitsen; nieuwe wisselwoorden en subkop-reeks volgens v4.
- Filters: direct zichtbaar Vorm, Kleur en Verras me (dobbelsteen); onder "Verfijn tot op de millimeter" Bestemming, Schaal, Gebouwd en Opgave. Materiaal is geen filter meer (wel in het factsheet). Schaal `stad` heet nu `plein`; `opgetekend` heet "Papieren werkelijkheid".
- Projectkaart: bovenregel is bestemming · jaar (bv. "Thuiskomen · 2024").
- Home: "Bekijk meer projecten" en "Of ontdek hoe we je kunnen helpen" onder het raster; het lege pers-blok is weg.
- De vijf testprojecten staan niet meer op de home (`featured: false`).
- Home: geen sectietitel boven het projectraster; "Meer projecten" en "Alle projecten" staan met meer ruimte erboven naast elkaar, elk de halve breedte (onder elkaar op mobiel).
- Projectkaart: alle titels even groot; scrubben wisselt de beelden hard (alleen het tonen van de foto fadet).
- Home: het projectraster toont projecten met `featured: true` (op `volgorde`) in plaats van een lijst `slugs`.
- `homepageGrootte` is nu `klein` (2×1), `hoog` (2×2), `breed` (3×1) of `groot` (3×2): kolommen × rijen in een raster van 6 vierkante kolommen met `grid-auto-flow: dense` (4 kolommen op tablet, alles vol breed op mobiel).
- /wat, raster: kaarten tonen alleen jaar en titel; tagline en plaats/programma alleen nog in de lijstweergave.
- /wat: Materiaal (uitgeklapt onder "Tot op de mm") is twee rastersporen breed met de opties in twee kolommen als dat past (`columns: 2 5rem`). In de mobiele overlay blijven het rijen.
- /wat: kleurfilter compact, alleen swatches zonder zichtbaar label. Naam en aantal staan in de tooltip en voor screenreaders (visually-hidden); aan = ring om de swatch, bij 0 projecten vervaagd. Kleur neemt nu één kolom in.
- /wat: met "Tot op de mm" dicht verdelen Type, Vorm en Kleur de volle containerbreedte en staan de kleuren in drie rijtjes; uitgeklapt weer zes kolommen met kleuren in twee rijtjes.
- /wat: filters als kolommen in plaats van rijen. Per groep het label erboven (mono, `--step--2`) en de opties onder elkaar; Kleur beslaat twee kolommen met de kleuren in twee rijtjes. Uitgeklapt lopen Status, Schaal en Materiaal in hetzelfde raster door (vanaf ±1000px alles op één rij). In de mobiele overlay blijven het rijen.
- Paginakop: de eerste alinea van een intro is groot, volgende alinea's kleiner op een eigen regel. Op /wat staat "Filter op wat je zoekt, of laat je verrassen." zo klein onder de grote zin (`site.md`, `projecten.intro`).
- /wat: aantal projecten en Raster/Lijst op één regel boven de lijst, in dezelfde typografie (de weergaveknoppen staan niet meer in de actieregel). De intro onder "Wat" loopt over de volle containerbreedte (`PageHeader` prop `breed`).
- Ruimte boven de eerste kop overal gelijk: één token `--page-top` (`--space-4xl`) voor hero, paginakop (Wat, Waarom, Contact, Privacy, 404) en projectkop. De paginakop had eerder `--space-xl`.
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
