# lagadoarchitects.com

> Nieuwe website voor LAGADO architects (Rotterdam), "een serieus buro voor speelse architectuur": portfolio, bureau en contact.

| | |
|---|---|
| **Klant** | LAGADO architects (Victor Verhagen) |
| **Bedrijf** | All This |
| **Status** | WIP: scaffold v1, ontwerp volgt |
| **SLA** | TODO (optioneel, zie voorstel) |
| **Live** | TODO (domein bij cloud86, alleen DNS-wijziging) |
| **Netlify** | TODO: team All This, site nog niet aangemaakt |
| **CMS** | Nog geen: content in `lagado-content/` (.md). Sanity volgt later. |
| **Repo** | [github.com/astrobuildclub/lagadoarchitects.com](https://github.com/astrobuildclub/lagadoarchitects.com) |
| **Notion** | TODO |

## Stack

- Astro 7.3 · Node 22 (`.nvmrc`) · statische output
- Styling: CSS + SCSS-tokens via `utopia-core-scss` (OKLCH, fluid type/space, cascade layers). Fonts: Instrument Sans + DM Mono (self-hosted). Geen Tailwind.
- Animatie: geen (alleen view transitions via `<ClientRouter />`)
- Consent: `vanilla-cookieconsent` v3 + `@orestbida/iframemanager` (gebundeld, geen CDN)
- Hosting: Netlify (static)

## Lokaal starten

```bash
nvm use
npm install
npm run placeholders   # placeholder-beelden voor wat nog niet is aangeleverd
cp .env.example .env   # optioneel, alleen voor statistiek
npm run dev            # http://localhost:4321
```

Overige scripts: `npm run build`, `npm run preview`, `npm run check` (types + Astro-diagnostiek).

### Environment-variabelen

| Naam | Waarvoor | Waar te vinden |
|---|---|---|
| `PUBLIC_ANALYTICS_SRC` | Script-URL van cookieloze statistiek (Plausible/Umami). Leeg = uit. | Account van de statistiekdienst |
| `PUBLIC_ANALYTICS_DOMAIN` | `data-domain` voor dat script | Idem |

Waarden staan nooit in git. Productiewaarden staan in Netlify → Site configuration → Environment variables.

## Structuur

```
lagado-content/      Content (.md, frontmatter-only) + beelden + downloads. Zie lagado-content/README.md
scripts/             placeholders.mjs: maakt ontbrekende beelden aan (overschrijft nooit)
src/
  content.config.ts  Content collections (glob op lagado-content/)
  lib/               schema.ts (Zod-model), content.ts (enige datalaag), images.ts, seo.ts, consent.ts, …
  components/        Layout-onderdelen, projectcomponenten, BlockRenderer.astro
  components/blocks/ Eén component per bloktype
  layouts/           BaseLayout.astro (meta, header, footer, consent, thema)
  pages/             /, /projecten, /projecten/[slug], /bureau, /contact, /privacy, 404, robots.txt
  styles/            tokens.scss (Utopia), layout.css (breakout-grid), base.css, reset.css
public/              favicon.svg, og-default.png (placeholder)
TODO.md              Openstaande projecttaken
```

## Content en CMS

- **Nu:** alle content staat in `lagado-content/`. Victor levert per project een Word-sjabloon + beeldmap aan; wij zetten dat om naar `projecten/<slug>.md` volgens `_template.md`. Bouwfout = ontbrekend verplicht veld of beeld.
- **Contentmodel:** `lagado-content/README.md` is leidend (velden, waardenlijsten, bouwstenen). `src/lib/schema.ts` volgt die 1-op-1.
- **Pagina's:** Home, Projecten (overzicht met filters), Project (detail), Bureau, Contact (geen formulier), Privacy.
- **Bouwstenen:** hero, text, image, gallery (lightbox), columns, quote, video (pas na toestemming), colors, beforeAfter, projectGrid, team, list (pers/awards), cta, services, logos, downloads.
- **Straks Sanity:** dezelfde veldnamen worden Sanity-schema's; een script importeert de .md-bestanden. Alleen `src/lib/content.ts` (en `images.ts`) hoeft dan te wisselen.

## Privacy, SEO

- Geen tracking zonder toestemming. Video's (YouTube via youtube-nocookie, Vimeo met `dnt=1`) laden pas na een klik of akkoord; er worden ook geen externe thumbnails opgehaald.
- "Cookie-instellingen" staat in de footer en op `/privacy`.
- SEO: titelpatroon + beschrijving (pagina → site), canonical, Open Graph/Twitter, JSON-LD (`ArchitectureFirm` op home, `CreativeWork` + breadcrumbs per project), `sitemap-index.xml`, `robots.txt`.

## Deploy

- `main` → productie (Netlify), pull requests → deploy preview
- Werkwijze: branch → PR → preview checken → merge

## Bekende issues en afspraken

- Beelden zijn placeholders; alt-teksten zijn grotendeels nog leeg (`TODO` in de content).
- E-mailadres, LinkedIn, BNI-profiel, architectenregister-link en downloads (voorwaarden, procesdocument) ontbreken nog.
- Prijsklasse wordt nooit getoond zonder akkoord van Victor (`projecten.toonPrijsfilter` in `site.md`).
- Filters verschijnen pas als een filtergroep meer dan één waarde heeft (dus vanaf het tweede project).
- Het visuele ontwerp volgt in Figma; deze versie is bewust kaal.
- Het invul-document voor Victor ("Content invullen") gebruikt andere waardenlijsten (status Concrete/Paper/Air, prijs €–€€€€, grootte S–XL, stijl 1–5, vaste doelgroepen). Besluit: de waardenlijsten in `lagado-content/README.md` zijn leidend; bij het omzetten van Victors input mappen we naar die waarden.
- Lokaal draait AstroStudioStarter soms op poort 4321; `.claude/launch.json` gebruikt daarom 4322.

## Contact

Eigenaar: Maarten Mieras (All This) · Zie `CHANGELOG.md` voor wat er gedaan is.
