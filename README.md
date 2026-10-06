# lagadoarchitects.com

> Nieuwe website voor LAGADO architects (Rotterdam): portfolio, bureau en contact — "een serieus buro voor speelse architectuur".

| | |
|---|---|
| **Klant** | LAGADO architects (Victor Verhagen) |
| **Bedrijf** | All This |
| **Status** | WIP: scaffold v1 live op Netlify, ontwerp volgt |
| **SLA** | TODO (optioneel, zie voorstel) |
| **Live** | TODO — domein bij cloud86 (alleen DNS); tijdelijk [lagadoarchitects.netlify.app](https://lagadoarchitects.netlify.app/) |
| **Netlify** | team All This, site `lagadoarchitects` → [lagadoarchitects.netlify.app](https://lagadoarchitects.netlify.app/) |
| **CMS** | Geen: content in `lagado-content/` (.md). Sanity volgt later. |
| **Repo** | [github.com/astrobuildclub/lagadoarchitects.com](https://github.com/astrobuildclub/lagadoarchitects.com) |
| **Notion** | TODO |

## Stack

- Astro 7.3 · Node 22 (`.nvmrc`) · static
- Styling: CSS + SCSS-tokens via `utopia-core-scss` (OKLCH, fluid type/space, cascade layers). Fonts: Instrument Sans + DM Mono (self-hosted). Geen Tailwind.
- Animatie: geen (alleen view transitions via `<ClientRouter />`)
- Consent: `vanilla-cookieconsent` v3 + `@orestbida/iframemanager` (gebundeld, geen CDN) · Hosting: Netlify

## Lokaal starten

```bash
nvm use
npm install
npm run placeholders   # placeholder-beelden voor wat nog niet is aangeleverd
cp .env.example .env   # optioneel, alleen voor statistiek
npm run dev            # http://localhost:4321
```

Overige scripts: `npm run build`, `npm run preview`, `npm run check`.

### Environment-variabelen

| Naam | Waarvoor | Waar te vinden |
|---|---|---|
| `PUBLIC_ANALYTICS_SRC` | Script-URL van cookieloze statistiek (Plausible/Umami). Leeg = uit. | Account van de statistiekdienst |
| `PUBLIC_ANALYTICS_DOMAIN` | `data-domain` voor dat script | Idem |

Waarden staan nooit in git. Productiewaarden: Netlify → Site configuration → Environment variables (let op deploy contexts).

## Structuur

```
lagado-content/      Content (.md) + beelden + downloads. Zie lagado-content/README.md
scripts/             placeholders.mjs (overschrijft nooit bestaand beeld)
src/
  content.config.ts  Content collections (glob op lagado-content/)
  components/        Layout, projectkaarten, BlockRenderer.astro
  components/blocks/ Eén component per bloktype
  layouts/           BaseLayout.astro
  lib/               schema, content (enige datalaag), images, seo, consent, …
  pages/             Routes
  styles/            tokens.scss (Utopia), layout, base, reset
public/              favicon, og-default
TODO.md              Openstaande projecttaken
```

## Content en CMS

- **Nu:** content in `lagado-content/`. Victor levert Word-sjabloon + beeldmap; wij zetten om naar `projecten/<slug>.md` volgens `_template.md`. Bouwfout = ontbrekend verplicht veld of beeld.
- **Contentmodel:** `lagado-content/README.md` is leidend; `src/lib/schema.ts` volgt 1-op-1.
- **Pagina's:** Home, Projecten (filters), Project, Bureau, Contact (geen formulier), Privacy.
- **Bouwstenen:** hero, text, image, gallery, columns, quote, video, colors, beforeAfter, projectGrid, team, list, cta, services, logos, downloads.
- **Straks Sanity:**zelfde veldnamen; alleen `src/lib/content.ts` (en `images.ts`) wisselt.

## Privacy, toegankelijkheid en SEO

- Geen tracking zonder toestemming. Video's (YouTube nocookie, Vimeo `dnt=1`) laden pas na klik/akkoord; geen externe thumbnails.
- Cookie-instellingen in footer en op `/privacy`.
- Doel: WCAG 2.2 AA (semantiek, focus, `prefers-reduced-motion`).
- SEO: titel + beschrijving, canonical, Open Graph/Twitter, JSON-LD (`ArchitectureFirm`, `CreativeWork` + breadcrumbs), sitemap, `robots.txt`.

## Deploy

- `main` → productie (Netlify) · pull requests → deploy preview
- Werkwijze: branch → PR → preview checken → merge
- Node 22 via `.nvmrc` + `NODE_VERSION` in `netlify.toml`

## Bekende issues en afspraken

- Beelden zijn placeholders; alt-teksten grotendeels leeg.
- E-mail, LinkedIn, BNI, architectenregister-link en downloads ontbreken nog.
- Prijsklasse nooit tonen zonder akkoord Victor (`projecten.toonPrijsfilter` in `site.md`).
- Filters pas vanaf meer dan één waarde per groep.
- Visueel ontwerp volgt in Figma; scaffold is bewust kaal.
- Victors invuldocument gebruikt andere waardenlijsten; leidend is `lagado-content/README.md`.
- Lokaal: `.claude/launch.json` gebruikt poort 4322 als 4321 bezet is.

---

Eigenaar: All This · Wat er gedaan is: zie [`CHANGELOG.md`](CHANGELOG.md) · Werkafspraken: [`AGENTS.md`](AGENTS.md)
