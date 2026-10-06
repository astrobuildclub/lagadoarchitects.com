# Lagado — contentstructuur

Eén `.md`-bestand per pagina of project. De **frontmatter** bevat de vaste velden, `blocks:` bevat de bouwstenen in volgorde. Veldnamen zijn identiek aan het Zod-schema (Astro content collections) en later aan het Sanity-schema, zodat de overstap naar Sanity een import is en geen herschrijving.

## Mappen

```
lagado-content/
├── README.md              ← dit bestand
├── site.md                ← globaal: navigatie, footer, SEO-defaults
├── home.md
├── bureau.md
├── contact.md
├── privacy.md
├── images/                ← beeld voor pagina's (bureau/, contact/)
├── downloads/             ← PDF's (voorwaarden, procesdocument, press-kits)
└── projecten/
    ├── _template.md       ← leeg sjabloon (wordt door Astro genegeerd)
    ├── workhome-playhome.md
    ├── huis-aan-de-maas.md            ← placeholders voor raster
    ├── koffiebar-binnenweg.md
    ├── atelier-kralingen.md
    ├── speelplein-zuid.md
    ├── winkel-witte-de-with.md
    └── images/
        └── workhome-playhome/
            ├── 01.jpg
            └── 02.jpg …
```

Bestandsnaam van een project = `slug` = URL (`/projecten/workhome-playhome`).

## Regels

- **Taal:** Nederlands. Engels volgt later als aparte velden (`title_en`), niet nu.
- **Afbeeldingen:** genummerd (`01.jpg`, `02.jpg`, …) in de projectmap. Elke afbeelding in een blok heeft een `alt` (verplicht, WCAG 1.1.1), `caption` is optioneel. Decoratief beeld: `alt: ""`.
- **Verplicht / optioneel:** staat als commentaar achter elk veld. Alle *filtervelden* zijn optioneel, anders blokkeert één ontbrekende prijs de publicatie.
- **Filtervelden** gebruiken vaste waarden (zie tabel). Geen vrije tekst.
- **Teksten:** korte alinea's, één onderwerp per alinea. Lange tekst opknippen in meerdere `text`-blokken met een kop.
- **Kleur:** hex in de bestanden, in de code omgezet naar `oklch()` custom properties.
- **Geen embeds met cookies:** video's laden pas na een klik (facade), kaart is een link, geen iframe.
- **Geen contactformulier:** contact loopt via e-mail, telefoon en socials (zie `contact.md`).
- **Beeldpaden:** in een project is `src` een bestandsnaam in `projecten/images/<slug>/`. Op pagina's is `src` een pad vanaf `lagado-content/` (bv. `images/bureau/01.jpg`).
- **Downloads:** `bestand` is een pad vanaf `lagado-content/` (bv. `downloads/algemene-voorwaarden.pdf`). Per project kan `pressKit` naar een bestand verwijzen.

## Waardenlijsten

| Veld | Waarden |
|---|---|
| `type` | `binnenkant`, `buitenkant`, `beide` |
| `programma` | `woning`, `winkel`, `horeca`, `kantoor`, `publiek`, `openbare-ruimte`, `meubel` |
| `status` | `gerealiseerd`, `in-uitvoering`, `ontwerp`, `concept` |
| `opdrachtgeverType` | `prive`, `zakelijk`, `publiek` |
| `stijl` | `speels`, `serieus`, `beide` |
| `thema` | `gelaagdheid`, `vorm`, `kleur` |
| `prijsklasse` | `laag`, `midden`, `hoog` (optioneel, nooit tonen zonder akkoord) |
| `homepageGrootte` | `s`, `m`, `l` — kaartbreedte op de homepage |

## Bouwstenen (`blocks`)

| `type` | Doel | Velden |
|---|---|---|
| `text` | Kop + lopende tekst | `kop?`, `niveau?` (2/3), `tekst` |
| `image` | Eén beeld | `src`, `alt`, `caption?`, `breedte` (`content`/`popout`/`feature`/`full`) |
| `gallery` | Raster van beelden met lightbox | `images[]` (`src`, `alt`, `caption?`), `kolommen` (2/3) |
| `columns` | Beeld naast tekst, per ruimte | `kop?`, `tekst`, `image{src,alt,caption?}`, `beeldPositie` (`links`/`rechts`) |
| `quote` | Citaat of testimonial | `tekst`, `naam`, `rol?` |
| `video` | YouTube/Vimeo achter klik | `url`, `titel`, `poster?`, `caption?` |
| `colors` | Kleurpalet van het project | `kleuren[]` (`label`, `hex`) |
| `beforeAfter` | Voor/na | `voor{src,alt}`, `na{src,alt}`, `caption?` |
| `projectGrid` | Selectie projecten | `slugs[]` of `filter`, `limit?` |
| `team` | Personen | `personen[]` |
| `list` | Pers, awards | `soort` (`pers`/`awards`), `items[]` |
| `cta` | Afsluitende actie | `tekst`, `label`, `href` |
| `hero` | Opening van een pagina | `kop`, `subkop?`, `beelden[]` (`project?`, `src`, `alt`) |
| `services` | Diensten / wat we doen | `kop?`, `items[]` (`titel`, `tekst`) |
| `logos` | Klant- of perslogo's | `kop?`, `items[]` (`naam`, `logo?{src,alt}`, `href?`) |
| `downloads` | Bestanden | `kop?`, `items[]` (`label`, `bestand`) |

Nieuwe bouwsteen nodig? Eerst hier toevoegen, dan pas in code.

## Werkwijze

1. Victor levert per project het Word-sjabloon + een genummerde beeldmap (OneDrive).
2. Wij zetten dat om naar een `.md` volgens `projecten/_template.md`.
3. Astro leest de `.md`-bestanden (content collection met Zod-validatie). Bouwfouten = ontbrekend verplicht veld.
4. Zodra het model staat, importeert een script dezelfde bestanden in Sanity en neemt Sanity het over.
