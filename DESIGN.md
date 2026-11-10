# DESIGN.md: LAGADO architects

Het ontwerp van lagadoarchitects.com in één document: merk, woordmerk, raster, kleur, typografie, ruimte, vorm en beweging. Voor ontwerpers, ontwikkelaars en AI-agents.

- **Live weergave:** `/brand` (lokaal `http://localhost:4321/brand`), met de tokens zoals de browser ze uitrekent. Niet geïndexeerd.
- **Bron van de waarden:** `src/styles/tokens.scss`. Staat er hier iets anders dan in de tokens, dan kloppen de tokens en moet dit document bij.
- **Figma:** bestand *Lagado* (`fcTv7ShkVxeaTZByDFhl2F`), met het blokkenalfabet op de pagina "Alfabet A–Z · 5×5".

Status: kleur, typografie, ruimte en vorm staan op de site. Het kinetische woordmerk is een **verkenning, niet goedgekeurd**; op de site staat nog het woordmerk uit `src/components/Logo.astro`.

---

## 1. Merk in het kort

Lagado ontwerpt woningen en verbouwingen. De vormtaal komt uit het werk zelf: **recht, schuin en afgerond**. Een gevel, een dakvlak, een boog. Dezelfde drie ingrepen keren terug in het woordmerk, in de projectkaarten en in de dienstentegels.

Referenties: potloodschetsen op stippenpapier, de letterspecimens van Studio Feixen Fonts (gekleurde tegels, dikke vormen). De site zelf blijft rustig en neutraal: de projecten en hun beelden zijn het onderwerp, de vorm en kleur zijn de stem.

## 2. Principes

1. **Het raster is de basis.** Letters en vormen liggen op een vast raster; ingrepen gebeuren op rasterpunten, niet op gevoel.
2. **Drie ingrepen, niet meer.** Recht, schuin, afgerond. Geen cirkels, geen vrije curves, geen perspectief.
3. **Rustige buitenkant, beweging binnenin.** Buitenvormen veranderen weinig; gaten schuiven hoger, lager en scheef.
4. **Klein is eenkleurig.** Kleine maten, de header en functionele elementen zijn altijd één kleur.
5. **Toegankelijk is niet onderhandelbaar.** WCAG 2.2 AA, `prefers-reduced-motion` gerespecteerd, alles bedienbaar met het toetsenbord.

## 3. Raster en vorm

### Het raster

Elke letter van het woordmerk staat op **5 × 5 blokken**. Een letter is één vorm: een buitencontour plus eventueel gaten, met elk hoekpunt op een rasterpunt (0 tot en met 5). De basis van elke letter is het blokkenalfabet uit Figma (`ALFABET` in `src/lib/brand/raster.ts`).

### De drie ingrepen

| Ingreep | Notatie | Wat er gebeurt |
|---|---|---|
| Recht | `3,1` | Hoekpunt op het raster, rechte hoek. |
| Schuin | `0,0s` | De hoek wordt één blok afgesneden. `s.5` = een half blok. |
| Afgerond | `0,0r` | Afgeronde hoek, straal één blok. `r.5` = een half blok (voor gaten). |
| Beweging | `2,2 3,1` | Een hoekpunt schuift naar een ander rasterpunt: een gat wordt hoger, lager of scheef. |

Een vorm noteer je als een lijst contouren: eerst de buitenvorm, dan de gaten.

```ts
// A, afgerond: bovenhoeken rond, en daarom ook het gat rond.
vorm: ['0,0r 5,0r 5,5 3,5 3,4 2,4 2,5 0,5', '2,1r.5 3,1r.5 3,3 2,3']
```

### In de interface

Dezelfde drie ingrepen zitten in `src/styles/vorm.css`:

- `data-vorm`: `recht` (afgeronde hoeken, `--space-s`), `rond` (pil), `schuin` (parallellogram, `--vorm-schuin`).
- `data-kaartvorm` (homeraster): `ovaal`, `afgerond`, `zacht`, `recht`, `schuin`.

Gebruik `--vorm-radius` en `--vorm-clip` op het vlak; geen eigen `border-radius` of `clip-path` per component.

## 4. Woordmerk

> Verkenning. Zie de open punten in §10.

### Opbouw

- Zes letters, elk 5 × 5 blokken (10 × 10 eenheden in SVG), **één blok tussenruimte**. Los woordmerk: viewBox `0 0 70 10`.
- Tegelversie: tegels van 7 × 7 blokken (14 eenheden), letter met één blok marge. viewBox `0 0 84 14`.
- Standen en de lus per letter staan in `src/lib/brand/woordmerk.json`; `wordmark.ts` leest dat in en `raster.ts` maakt er SVG-paden en de animatie van.
- Bewerken kan in de editor op `/brand/editor`: punten slepen, hoeken schuin of rond, frames met ease en duur. Exporteren geeft een nieuwe `woordmerk.json`.

| Letter | Standen |
|---|---|
| L | recht → kleine trap → grote trap → kleine trap → schuin: een trap die doorloopt. Rechtsboven blijft altijd leeg. |
| A (1) | recht → scheef gat → afgerond met rond gat |
| G | recht → schuin → afgerond |
| A (2) | afgeschuind → scheef gat → afgerond. Ander ritme dan de eerste A: korter gat, langere benen. |
| D | recht → schuin met scheef gat → afgerond met rond gat → gat hoog |
| O | recht → schuin met scheef gat → afgerond, gat hoog → afgerond, gat laag |

### Regels

- De L blijft altijd een L: rechtsboven is leeg.
- Is de bovenkant van de A afgerond, dan is het gat ook afgerond.
- De twee A's hebben verschillende standen en een ander ritme.
- Geen isometrische of perspectiefversie (geprobeerd, afgewezen).

### Varianten

| Variant | Gebruik | Component |
|---|---|---|
| Tegels, geanimeerd | Hoofdversie: hero, presentaties | `<Wordmark variant="tiles" />` |
| Losse letters, geanimeerd | Groot, op een rustig vlak | `<Wordmark variant="animated" />` |
| Statisch | Waar beweging stoort, en bij reduced motion | `<Wordmark variant="static" />` |
| Hover | Stilstaand; bij hover of focus rolt elke letter naar zijn tweede stand | `<Wordmark variant="hover" />` |
| Preloader | Omgekeerd op een vlak, met voortgangsbalk | `<Wordmark invert mono />` |

`<WordmarkDefs />` staat één keer per pagina (de SVG-definities).

### Formaten

448, 280, 168, 112 en 84 px breed. **112 px en kleiner: altijd één kleur** (`mono`). 84 px is de kleinste maat. In de header: 112 px, één kleur.

### Kleur

- Zwart-wit volgt het thema (`--color-fg` op `--color-bg`).
- In kleur: per letter een eigen kleur, met een aparte reeks voor licht en donker (zie §5). Tegels: zie de tegelcombinaties.

### Beweging

- SMIL-morph op het `d`-attribuut, geen JavaScript. De frames worden vooraf uitgerekend (`animatie()` in `raster.ts`, ongeveer elke 30 ms, `calcMode="linear"`): per hoekpunt schuiven positie en afronding samen, zodat gaten en hoeken onderweg geen deukjes krijgen.
- Snappy: korte morphs (0,2–0,4 s), lange rust. Per overgang een eigen ease: `snap` (0.85 0 0.15 1) voor de buitenvorm, `uit` (0.16 1 0.3 1) voor opbouwen en afronden, `val` (0.55 0 1 0.45) voor inzakken, `veer` (0.34 1.56 0.64 1) voor gaten en landingen. De veer schiet iets door, wat met keySplines niet kan.
- Elke lus duurt 6 s (`DUUR`), zodat de letters onderling verschoven blijven. De L: treden schieten trapsgewijs omhoog, zakken in (bovenste eerst) tot een L die even nawipt, daarna schuin. Ritme via een negatieve `begin`: L 0, A −0,35, G −0,7, A −2,2, D −1,05, O −1,4 s.
- Morphen werkt alleen als elke stand van een letter evenveel contouren en hoekpunten heeft. `paden()` controleert dat en geeft anders een fout. Dubbele punten zijn toegestaan om het aantal gelijk te houden.

### Toegankelijkheid

- Logo: `role="img"` met `aria-label="LAGADO"`; decoratieve kopieën `aria-hidden`.
- `prefers-reduced-motion`: het woordmerk staat stil in de eerste stand.
- De animatie loopt langer dan 5 seconden en heeft daarom een pauzeknop nodig waar hij op de site komt (WCAG 2.2.2). Op `/brand`: `data-wm-pauze` op de wortel.

## 5. Kleur

Alle kleuren in **OKLCH**. Licht en donker via `prefers-color-scheme`, met een handmatige keuze via `data-theme` op `<html>` (opgeslagen als `theme` in localStorage).

### Rollen (site)

| Token | Rol |
|---|---|
| `--color-bg` | Achtergrond |
| `--color-surface` | Vlak (iets afwijkend van de achtergrond) |
| `--color-fg` | Tekst |
| `--color-muted` | Secundaire tekst, bijschriften |
| `--color-line` | Lijnen en scheidingen |
| `--color-accent` / `--color-on-accent` | Accent en tekst daarop |
| `--color-ink` / `--color-on-ink` | Header en footer: omgekeerd ten opzichte van de pagina |
| `--color-focus` | Focusring (standaard het accent) |
| `--accent` | Accent per pagina: projecten zetten hier hun eigen kleur |

Projectpagina's met een eigen accent krijgen een focusring met minstens 3:1 contrast: in licht hooguit L 50%, in donker minstens L 75% (`base.css`).

### Palet van het woordmerk (verkenning)

| Naam | OKLCH | Hex | Op wit | Op zwart |
|---|---|---|---|---|
| Geel | `oklch(88.58% 0.158 95.71)` | `#F9D84A` | 1,40 | 14,95 |
| Rood | `oklch(63.37% 0.2004 34.06)` | `#EA4C28` | 3,78 | 5,56 |
| Groen | `oklch(68.61% 0.1164 159.26)` | `#50B080` | 2,67 | 7,86 |
| Roze | `oklch(80.21% 0.1106 340.69)` | `#EFA2D4` | 1,95 | 10,79 |
| Blauw | `oklch(51.51% 0.2539 272.56)` | `#4244F5` | 6,22 | 3,38 |

- **Geel en roze halen op wit geen tekstcontrast**: daar alleen decoratief (vlakken, tegels), nooit voor tekst of iconen.
- Letterkleuren op licht: rood, groen, blauw, roze, rood, blauw. Op donker: geel, groen, roze, rood, geel, roze.
- Tegels (tegel / letter): geel/rood, zwart/groen, roze/zwart, rood/wit, blauw/geel, zwart/roze. In donker krijgen de zwarte tegels een lijn in `--color-line`.
- Afgewezen: een aards palet uit de projectfoto's (olijf, terracotta, mauve).

Het palet staat nog niet in `tokens.scss`; het leeft op `/brand` als `--wm-*`. Bij goedkeuring verhuist het naar de tokens.

## 6. Typografie

- **ABC Areal** (`--font-sans`) voor alles; **ABC Areal Mono** (`--font-mono`) voor code en technische details. Variabel: gewicht 400–700, schuin 0–12° (slant-as), DRKM 0–1.
- **Cursief is de slant-as** (`font-style: oblique 12deg`), nooit een gesynthetiseerde schuine letter.
- **DRKM** maakt letters iets dunner voor licht op donker. Het thema zet `--font-darkmode` vanzelf.
- Schaal: Utopia, vloeiend van 16 px (scherm 360 px, verhouding 1,2) tot 18 px (scherm 2560 px, verhouding 1,333). Tokens `--step--3` tot en met `--step-8`.

| Gebruik | Token | Verder |
|---|---|---|
| Paginatitel (`h1`) | `--step-5` | gewicht 600, letterspatiëring −0,03em |
| `h2` | `--step-3` | gewicht 600 |
| `h3` | `--step-1` | gewicht 600 |
| Lopende tekst | `--step-0` | `--leading-normal` (1,55), max. `--measure` (65ch) |
| Bijschrift, meta | `--step--1` | `--color-muted` |

Koppen: `--leading-tight` (1,1), letterspatiëring −0,03ch.

## 7. Ruimte en layout

- **Ruimteschaal** (Utopia, 16→18 px): `--space-4xs` tot en met `--space-5xl`, plus paren die sterker meegroeien (`--space-s-l`, `--space-xl-3xl` enzovoort). Gebruik altijd een token, geen losse px.
- **Breakout-grid** (`layout.css`): `full ┃ feature ┃ popout ┃ content ┃ popout ┃ feature ┃ full`. Kinderen van `.layout` staan in `content`; met `.popout`, `.feature` of `.full` breken ze uit. Het `breedte`-veld van blokken in Sanity mapt hierop.
- `--gutter` (16 px op mobiel, ongeveer 64 px op 1512, 108 px op 2560), `--content-width` 42rem, `--page-top` 30svh, `--tile-gap` `--space-m`.
- Verticaal ritme tussen blokken: `.flow` met `--flow-space` (standaard `--space-xl-3xl`).
- Logical properties (`inline-size`, `margin-block`), container queries waar een component zelf moet schalen.

## 8. Beweging

- Interface: `--duration` 200 ms, `--ease` `cubic-bezier(0.2, 0, 0, 1)`. Bij reduced motion wordt `--duration` 0.
- Woordmerk: eases `snap`, `uit`, `val` en `veer` (zie §4). Hover: `cubic-bezier(0.7, 0, 0.3, 1)`: snel weg, rustig aan.
- Paginatransities: Interlude met `curtain-lagado` (header en footer drijven mee); kleur via `--interlude-color`. Zie `~/Code/_standards/TRANSITIONS.md` §7. Geen `transition:name` of `transition:animate` op elementen.
- Woorden die inschuiven: `data-words-in` (`src/scripts/words-in.ts`), alleen zonder reduced motion.

## 9. Beeld

- Beelden komen uit Sanity en lopen altijd via `<Img>` (srcset uit de Sanity-CDN).
- `alt` is verplicht; "Decoratief" in de Studio wordt `alt=""`.
- Fotografie van projecten draagt de site: geen stockbeeld, geen illustraties die met de foto's concurreren.

## 10. Niet doen

- Geen isometrische of perspectiefversie van het woordmerk.
- Geen cirkels of volledig ronde letters: alleen afgeronde hoeken.
- Geel of roze niet voor tekst op wit.
- Geen kleur onder 112 px en niet in de header.
- Geen losse px-waarden of hexkleuren in componenten: tokens.
- Geen eigen `border-radius`/`clip-path` voor vormen: `data-vorm`.
- Geen contactformulier en geen kaart-iframe (afspraak in het voorstel).
- Geen tracking of embeds zonder toestemming (zie `src/lib/consent.ts`).

## 11. Beslislog en open punten

**Besloten**

- Woordmerk op een raster van 5 × 5, als vormen met hoekpunten op het raster (niet als losse blokjes). Basis: het blokkenalfabet uit Figma.
- Aards palet afgewezen.
- Isometrische versie afgewezen.

**Open**

- Alle standen op het raster zijn nieuw en nog niet beoordeeld (vooral de lopende L-trap en de schuine L).
- De D-vleugel past niet op het raster; vervangen door een D met hoog gat. Akkoord?
- Gaten zijn één blok breed, een rond gat heeft een straal van een half blok. Genoeg, of moet het raster fijner (10 × 10)?
- Schetsvormen (gevel-G, deur-D, poort-O): naar het raster vertalen of laten vallen.
- Zwarte tegels in donker met kleur: nu met een lijn in `--color-line`.
- Palet naar `tokens.scss` zodra het woordmerk is goedgekeurd.
- Wanneer en waar het kinetische woordmerk het huidige logo vervangt, inclusief pauzeknop.
- Eventueel `/brand` als subdomein (`brand.lagadoarchitects.com`, rewrite in Netlify).
