# lagadoarchitects.com

> Nieuwe website voor LAGADO architects (Rotterdam): portfolio, bureau en contact — "een serieus bureau voor speelse architectuur".

| | |
|---|---|
| **Klant** | LAGADO architects (Victor Verhagen) |
| **Bedrijf** | All This |
| **Status** | WIP: scaffold v1 live op Netlify, ontwerp volgt |
| **SLA** | TODO (optioneel, zie voorstel) |
| **Live** | TODO — domein bij cloud86 (alleen DNS); tijdelijk [lagadoarchitects.netlify.app](https://lagadoarchitects.netlify.app/) |
| **Netlify** | team All This, site `lagadoarchitects` → [lagadoarchitects.netlify.app](https://lagadoarchitects.netlify.app/) |
| **CMS** | Sanity, project `unque637`, dataset `production`. Studio op [`/admin`](https://lagadoarchitects.netlify.app/admin), met live preview (Presentation). Plan en stand: `docs/sanity-plan.md`. |
| **Repo** | [github.com/astrobuildclub/lagadoarchitects.com](https://github.com/astrobuildclub/lagadoarchitects.com) |
| **Notion** | TODO |

## Stack

- Astro 7.3 · Node 22 (`.nvmrc`) · server-rendered (`@astrojs/netlify`) achter Netlify's CDN-cache (5 min, zie `src/middleware.ts`)
- Sanity (`@sanity/astro`, `sanity` v6): schema's in `schema/`, Studio-config in `sanity.config.ts`
- Styling: CSS + SCSS-tokens via `utopia-core-scss` (OKLCH, fluid type/space, cascade layers). Fonts: ABC Areal + ABC Areal Mono (variabel, self-hosted, niet in git; zie [Fonts](#fonts)). Geen Tailwind.
- Animatie: GSAP (gebundeld, alleen core) voor de wisseltekst in de hero (`src/scripts/rotating-text.ts`) en paginatransities met Interlude (`curtain`) op `<ClientRouter />`
- Consent: `vanilla-cookieconsent` v3 + `@orestbida/iframemanager` (gebundeld, geen CDN) · Hosting: Netlify

## Lokaal starten

```bash
nvm use
npm install
# fonts: zet de twee woff2's in public/fonts/ (zie Fonts hieronder)
cp .env.example .env   # alleen als je nog geen .env hebt: fonts, Sanity
npm run dev            # http://localhost:4321
```

Overige scripts: `npm run build`, `npm run preview`, `npm run check`.

Migratie naar Sanity (eenmalig, herhaalbaar): `npm run migrate -- --dry-run` en daarna `npm run migrate`. Vraagt `SANITY_API_WRITE_TOKEN` (Editor) in `.env`.

### Environment-variabelen

| Naam | Waarvoor | Waar te vinden |
|---|---|---|
| `FONTS_URL` | Map-URL waar `scripts/fonts.mjs` de woff2's ophaalt als `public/fonts/` leeg is (Netlify): `https://raw.githubusercontent.com/All-This/fonts/main/abc-areal` | Privé-repo `All-This/fonts` |
| `FONTS_TOKEN` | Fine-grained GitHub-token, alleen `All-This/fonts`, Contents: Read-only. Geheim, nooit `PUBLIC_`. Verloopt: tijdig vernieuwen. | GitHub → Settings → Developer settings → Fine-grained tokens |
| `PUBLIC_SANITY_PROJECT_ID` | Sanity-project | sanity.io/manage → project |
| `PUBLIC_SANITY_DATASET` | Dataset (`production`) | Idem |
| `SANITY_API_READ_TOKEN` | Server-only token (Viewer) voor Visual Editing; zonder token werkt de site, alleen de preview niet | sanity.io/manage → API → Tokens |
| `SANITY_API_WRITE_TOKEN` | Alleen lokaal (Editor), voor het migratiescript; daarna intrekken | Idem |

Waarden staan nooit in git. Productiewaarden: Netlify → Site configuration → Environment variables (let op deploy contexts).

## Fonts

ABC Areal by [ABC Dinamo](https://abcdinamo.com/typefaces/areal), gratis licentie. Credit staat in de footer.
De licentie (§10) verbiedt fonts in publieke repositories, en deze repo is publiek. Daarom:

- `public/fonts/` staat in `.gitignore`. Nodig: `ABCArealVariable.woff2` en `ABCArealMonoVariable.woff2`.
- `scripts/fonts.mjs` draait vóór `dev` en `build`. Ontbreken de bestanden, dan haalt het ze op via `FONTS_URL` (+ `FONTS_TOKEN`).
  Het script leest ook `.env`. Lokaal zonder fonts: waarschuwing en systeemfonts. Op Netlify: bouwfout.
- Bron: privé-repo [`All-This/fonts`](https://github.com/All-This/fonts) (map `abc-areal/`). Lokaal kun je ze daar ook uit kopiëren, of uit Dropbox All This → Resources/Fonts.
- Tokens: `--font-sans`, `--font-mono`, `--font-darkmode` (Areal-as `DRKM`, staat op 1 in dark mode).

## Structuur

```
lagado-content/      Archief van de markdown-content van vóór Sanity (bron van npm run migrate)
                     (input/ = brondocumenten van de klant, niet in git)
schema/              Sanity-schema's: objects/, blocks/, documents/ (waardenlijsten uit src/lib/waarden.ts)
scripts/             fonts.mjs, migrate-to-sanity.ts (+ markdown-schema.ts, bevroren)
src/
  components/        Layout, projectkaarten, BlockRenderer.astro
  components/blocks/ Eén component per bloktype
  layouts/           BaseLayout.astro
  lib/               schema, content (enige datalaag), images, seo, consent, …
  pages/             Routes (/projecten, /over, /contact …)
  scripts/           Client-side scripts (rotating-text.ts)
  styles/            tokens.scss (Utopia), layout, base, reset
public/              favicon, og-default
TODO.md              Openstaande projecttaken
```

## Content en CMS

- **Beheer:** Victor werkt in de Studio op `/admin` (inloggen met zijn Sanity-account). "Voorbeeld" toont de site met drafts; publiceren staat binnen ~5 minuten live (CDN-cache).
- **Contentmodel:** `schema/` (Studio) is leidend; `src/lib/schema.ts` (Zod) controleert bij elk request wat de queries (`src/lib/sanity/queries.ts`) opleveren. Uitleg per veld: `lagado-content/README.md` (nog geldig voor betekenis en waardenlijsten).
- **Beelden:** in Sanity, geleverd via de Sanity-CDN met `srcset` (`<Img>`). Hotspot in de Studio bepaalt de uitsnede.
- **Verborgen projecten:** een draft die nooit is gepubliceerd (bv. Tasgram, Tommy Jeans).
- **Pagina's:** Home, Projecten (`/projecten`, met filters; intro, prijsfilter en SEO in het document *Projecten* onder Pagina's), Project (`/projecten/<slug>`), Contact (geen formulier) en pagina's uit Sanity op `/<slug>` (`src/pages/[slug].astro`): Over, Privacy en wat er bij komt. Template *Bouwstenen* of *Tekst* (één lopende tekst met koppen, zoals Privacy).
- **Menu en footer:** in de Site-instellingen (tabs Menu en Footer). Footer = vier kolommen, de eerste twee breed; een link naar `#cookies` wordt de knop Cookie-instellingen.
- **Bouwstenen:** hero, text, image, gallery, columns, quote, video, colors, beforeAfter, projectGrid, team, list, cta, services, logos, downloads.

## Privacy, toegankelijkheid en SEO

- Geen banner vooraf. Video's (YouTube nocookie, Vimeo `dnt=1`) laden pas na klik/akkoord op de video zelf; geen externe thumbnails.
- Statistiek: Site-instellingen → Statistiek. Umami of Plausible (cookieloos, geen toestemming nodig), of Google Analytics (pas na toestemming, dan wel een banner). Noem de dienst in de privacyverklaring.
- Cookie-instellingen in footer en op `/privacy`.
- Doel: WCAG 2.2 AA (semantiek, focus, `prefers-reduced-motion`).
- SEO: titel + beschrijving, canonical, Open Graph/Twitter, JSON-LD (`ArchitectureFirm` en `WebSite` op elke pagina, `CreativeWork` + breadcrumbs per project), sitemap, `robots.txt` (AI-training en AI-zoekmachines uit te zetten in Site-instellingen → SEO; pagina's met *Verbergen voor zoekmachines* dicht voor AI-crawlers), `llms.txt` (intro in Site-instellingen → SEO).

## Deploy

### Branches

| Branch | Deploy | URL |
|---|---|---|
| `main` | Productie | https://lagadoarchitects.netlify.app |
| `staging` | Branch deploy (goedgekeurde features, nog niet live) | https://staging--lagadoarchitects.netlify.app |
| PR's | Deploy preview | link in de PR |

Features gaan via een PR naar `staging`. Naar `main` alleen gebundelde releases (PR `staging → main`) en hotfixes. Commits met alleen documentatie (`*.md` in de root, `.github/`) starten geen build. Content-wijzigingen in Sanity hebben geen build nodig. Zie `~/Code/_standards/DEPLOY.md`.

### Netlify

- Node 22 via `.nvmrc` + `NODE_VERSION` in `netlify.toml`
- Env: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN` (secret, ook voor Deploy previews), `FONTS_URL`, `FONTS_TOKEN`
- Sanity CORS-origins (met credentials): `http://localhost:4321`, `https://lagadoarchitects.netlify.app`, `https://*--lagadoarchitects.netlify.app`, `https://lagadoarchitects.com`

## Bekende issues en afspraken

- Alt-teksten deels leeg (de Studio markeert ze rood).
- E-mail, LinkedIn, BNI, architectenregister-link en downloads ontbreken nog.
- Prijsklasse nooit tonen zonder akkoord Victor (Site-instellingen → Projectoverzicht).
- Filters pas vanaf meer dan één waarde per groep.
- Visueel ontwerp volgt in Figma; scaffold is bewust kaal.
- Victors invuldocument gebruikt andere waardenlijsten; leidend is `src/lib/waarden.ts`.
- Lokaal: `.claude/launch.json` gebruikt poort 4322 als 4321 bezet is.

---

Eigenaar: All This · Wat er gedaan is: zie [`CHANGELOG.md`](CHANGELOG.md) · Werkafspraken: [`AGENTS.md`](AGENTS.md)
