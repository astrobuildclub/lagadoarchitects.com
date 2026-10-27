# Lagado — contentstructuur

Eén `.md`-bestand per pagina of project. De **frontmatter** bevat de vaste velden, `blocks:` bevat de bouwstenen in volgorde. Veldnamen zijn identiek aan het Zod-schema (Astro content collections) en later aan het Sanity-schema, zodat de overstap naar Sanity een import is en geen herschrijving.

## Mappen

```
lagado-content/
├── README.md              ← dit bestand
├── site.md                ← globaal: navigatie, footer, SEO-defaults, projectoverzicht (intro, prijsfilter)
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
- **Hero met wisseltekst:** `kopWissel` en `subkopWissel` zijn de woorden die na `kop` / `subkop` wisselen. De eerste is wat er staat zonder animatie (reduced motion, geen JS). Een nieuwe regel in `kop` (YAML `|-`) is een vaste regelafbreking; het laatste wisselwoord van de kop staat altijd op een eigen regel.
- **Verplicht / optioneel:** staat als commentaar achter elk veld. Alle *filtervelden* zijn optioneel, anders blokkeert één ontbrekende prijs de publicatie.
- **Filtervelden** gebruiken vaste waarden (zie tabel). Geen vrije tekst.
- **Teksten:** korte alinea's, één onderwerp per alinea. Lange tekst opknippen in meerdere `text`-blokken met een kop.
- **Kleur:** hex in de bestanden, in de code omgezet naar `oklch()` custom properties.
- **Geen embeds met cookies:** video's laden pas na een klik (facade), kaart is een link, geen iframe.
- **Geen contactformulier:** contact loopt via e-mail, telefoon en socials (zie `contact.md`).
- **Beeldpaden:** in een project is `src` een bestandsnaam in `projecten/images/<slug>/`. Op pagina's is `src` een pad vanaf `lagado-content/` (bv. `images/bureau/01.jpg`).
- **Downloads:** `bestand` is een pad vanaf `lagado-content/` (bv. `downloads/algemene-voorwaarden.pdf`). Per project kan `pressKit` naar een bestand verwijzen.

## Opbouw van een project

Elk projectbestand heeft dezelfde volgorde als `projecten/_template.md`. Houd die aan, ook bij placeholders: een leeg veld blijft staan (`""`, `[]`, `null`, `0`) zodat Victor ziet wat er nog in moet.

| Groep | Velden | Waar op de pagina |
|---|---|---|
| Identiteit | `title`, `tagline`, `vraag`, `intro` | Hero (titel, tagline), daaronder de **vraag** groot, dan de intro |
| Filters | `vorm`, `kleuren`, `type`, `schaal`, `status`, `opgave`, `materialen`, `prijsklasse` | Factsheet, eerste helft. Elke filterwaarde linkt naar `/projecten` met dat filter aan; materiaal is gewone tekst. Prijsklasse nooit |
| Projectgegevens | `locatie`, `omvang`, `opdrachtgeverType`, `opdrachtgever`, `bouwteam`, `fotografie`, `jaarOpdracht`, `jaarOplevering`, `programma` | Factsheet, tweede helft. `programma` alleen op de projectkaart |
| Kleur | `accentkleur`, `kleurpalet` | Accentkleur van de pagina en kleur van de projectkaart, `colors`-blok |
| Beeld & weergave | `hero`, `featured`, `homepageGrootte`, `kaartvorm`, `volgorde`, `gerelateerd` | Hero-beeld, homepage (`featured`), sortering |
| Credits, pers & awards | `credits`, `pers`, `awards`, `pressKit` | Onderaan de pagina |
| | `seo`, `blocks` | Zoekmachines; het verhaal |

**Projectkaart** (home en /projecten): een vlak in de projectkleur, in de vorm van het project, met bestemming · jaar en titel.
- **Vorm:** de eerste waarde van `vorm`: `recht` = afgeronde hoeken, `rond` = cirkel of pil, `schuin` = parallellogram. Zonder vorm: `recht`.
- **Kleur:** `accentkleur` als die is ingevuld, anders de bepalende kleur uit het hero-beeld (bij de build). Tekst wit of zwart, op contrast.
- **Bovenregel:** bestemming (`type`) · `jaarOplevering`, anders `jaarOpdracht` (bv. "Thuiskomen · 2024").
- **Beelden:** hover toont de foto; horizontaal bewegen scrubt door de hero en de beelden uit de blokken (max. 6). Op mobiel verschijnt de foto als de kaart in beeld is, met een kleurbalk (bestemming · jaar, titel).

**Factsheet** (labels zoals Victor ze gebruikt, teksten_v4): Vorm · Kleur · Bestemming · Schaal · Gebouwd · Opgave, dan Materiaal · Locatie · Omvang · Opdrachtgever · Bouwteam · Fotograaf · Jaar. Lege velden worden weggelaten.

- **Vraag:** de ontwerpvraag in één zin, als trigger voor bezoekers om hun eigen vraag in te herkennen ("Hoe maak je een uitgesproken woning in een nieuwbouwcasco?"). Vervangt de oude velden programma/functie in het factsheet.
- **Omvang:** getal in m² (heette eerder `oppervlakte`).
- **Opdrachtgever:** naam als die er is, anders het label van `opdrachtgeverType` (bv. "Particulier").
- **Jaar:** `jaarOpdracht`–`jaarOplevering` (bv. 2016–2020), of één van beide.
- **Bouwteam en fotografie:** lijst van `{ naam, url? }`. Overige rollen (ontwerpteam, adviseurs) in `credits`.

## Waardenlijsten

| Veld | Waarden |
|---|---|
| `type` (Bestemming) | `thuiskomen` (woningen), `de-hort-op` (publieke projecten) |
| `vorm` | `recht` (rechthoekig), `rond` (curves), `schuin` (schuine lijnen) — meerdere mogelijk |
| `kleuren` | `rood`, `oranje`, `geel`, `groen`, `blauw`, `paars`, `roze`, `wit`, `zwart`, `grijs` — hoofdkleur(en), meerdere mogelijk |
| `status` (Gebouwd) | `af` (gerealiseerd), `bijna` (in ontwikkeling), `opgetekend` (label: "Papieren werkelijkheid": concept, nooit gebouwd) |
| `schaal` | `stoel`, `kamer`, `huis`, `plein` (van klein naar groot; heette eerder `stad`) |
| `opgave` | `interieur`, `verbouw`, `nieuwbouw`, `landschap` — meerdere mogelijk |
| `materialen` | `hout`, `steen`, `beton`, `glas`, `tegels`, `metaal` — hoofdmateriaal/-materialen, meerdere mogelijk (factsheet, geen filter meer) |
| `programma` | `woning`, `winkel`, `horeca`, `kantoor`, `publiek`, `openbare-ruimte`, `meubel` (alleen op de projectkaart, geen filter) |
| `opdrachtgeverType` | `particulier`, `zakelijk`, `publiek` |
| `prijsklasse` | `laag`, `midden`, `hoog` (optioneel, nooit tonen zonder akkoord) |
| `homepageGrootte` | Hoogte in het homeraster (3 kolommen, alle kaarten even breed): `hoog`, `toren`, `groot` = 2 rijen; `mini`, `klein`, `breed`, `lang` = 1 rij. Met `meer: false` (home) geldt een vaste indeling uit Figma (per 8 kaarten: de halve kaart midden boven) en telt dit veld niet. |
| `kaartvorm` | Optioneel, alleen op de home: `ovaal`, `afgerond`, `zacht`, `recht`, `schuin`. Leeg = uit de eerste `vorm` (`rond` → ovaal, `recht` → zacht, `schuin` → schuin) |

## Filters op /projecten

Volgens teksten_v4, onder "Ontdek ons werk op vorm, kleur of laat je verrassen." Direct zichtbaar: **Vorm**, **Kleur** en **Verras me** (dobbelsteen: willekeurige filtercombinatie, altijd minstens één project). Onder "Verfijn tot op de millimeter" (uitklap): **Bestemming**, **Schaal**, **Gebouwd**, **Opgave**. Binnen een groep = of, tussen groepen = en. Een groep met maar één waarde in de projecten wordt niet getoond.

## Bouwstenen (`blocks`)

| `type` | Doel | Velden |
|---|---|---|
| `text` | Kop + lopende tekst | `kop?`, `niveau?` (2/3), `tekst` |
| `image` | Eén beeld | `src`, `alt`, `caption?`, `breedte` (`content`/`popout`/`feature`/`full`) |
| `gallery` | Raster van beelden met lightbox | `images[]` (`src`, `alt`, `caption?`), `kolommen` (2/3; mobiel altijd 2) |
| `columns` | Beeld naast tekst, per ruimte | `kop?`, `tekst`, `image{src,alt,caption?}`, `beeldPositie` (`links`/`rechts`) |
| `quote` | Citaat of testimonial | `tekst`, `naam`, `rol?` |
| `video` | YouTube/Vimeo achter klik | `url`, `titel`, `poster?`, `caption?` |
| `colors` | Kleurpalet van het project | `kleuren[]` (`label`, `hex`) |
| `beforeAfter` | Voor/na | `voor{src,alt}`, `na{src,alt}`, `caption?` |
| `projectGrid` | Selectie projecten | `featured?`, `slugs[]` of `filter`, `limit?` (eerst zichtbaar; de rest per `limit` via "Meer projecten"), `meer?` (`false` = vast aantal: alleen `limit` kaarten in de vaste indeling uit Figma, geen knop), `linkNaarOverzicht?`, `links[]?` |
| `statement` | Mantra: één grote, vette zin | `tekst` |
| `team` | Personen | `personen[]` |
| `list` | Pers, awards, prijzenkast | `soort` (`pers`/`awards`), `items[]`, `zichtbaar?` (rest achter "Toon alles") |
| `cta` | Afsluitende actie | `tekst`, `label`, `href` |
| `hero` | Opening van een pagina, kolommen klein naast elkaar | `kop`, `kopWissel?[]`, `subkop?`, `subkopWissel?[]`, `link?{label,href}`, `adres?` (adres uit contact.md als kolom), `tekst?` (markdown, laatste kolom), `beelden[]` (0–5; `project?`, `src`, `alt`) |
| `services` | Diensten / principes | `kop?`, `anker?` (bv. `diensten` → `/over#diensten`), `vormen?` (tegels in de drie projectvormen), `items[]` (`titel`, `tekst`) |
| `logos` | Klant- of perslogo's | `kop?`, `items[]` (`naam`, `logo?{src,alt}`, `href?`) |
| `downloads` | Bestanden | `kop?`, `items[]` (`label`, `bestand`) |

Nieuwe bouwsteen nodig? Eerst hier toevoegen, dan pas in code.

## Werkwijze

1. Victor levert per project het Word-sjabloon + een genummerde beeldmap (OneDrive).
2. Wij zetten dat om naar een `.md` volgens `projecten/_template.md`.
3. Astro leest de `.md`-bestanden (content collection met Zod-validatie). Bouwfouten = ontbrekend verplicht veld.
4. Zodra het model staat, importeert een script dezelfde bestanden in Sanity en neemt Sanity het over.
