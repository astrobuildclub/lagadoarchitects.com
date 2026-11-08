# TODO — lagadoarchitects.com

Openstaande projecttaken. Afgeronde items → regel in `CHANGELOG.md` onder `[Unreleased]`, daarna hier weg.

## Setup
- [x] GitHub-repo `astrobuildclub/lagadoarchitects.com` (remote + eerste push)
- [x] Netlify-site (team All This): https://lagadoarchitects.netlify.app/
- [ ] DNS bij cloud86 koppelen (alleen A/CNAME) → `lagadoarchitects.com`
- [ ] Notion-pagina / SLA (optioneel)

## Content & ontwerp
- [ ] Figma-ontwerp verwerken (tokens + componenten)
- [ ] Victors projectcontent + echte beelden i.p.v. placeholders
- [ ] Alt-teksten invullen
- [ ] Homepage-statement (Home → tekstblok)
- [ ] Contact: e-mail, LinkedIn, BNI, architectenregister, downloads
- [ ] Prijsklasse-filter: alleen na akkoord Victor

## Vragen aan Victor (teksten_v2)
- [ ] Workhome Playhome: wat betekent "L" in de filters? Nu `schaal: huis` aangenomen
- [ ] Kleurenlijst voor het kleurfilter bevestigen (nu rood, oranje, geel, groen, blauw, paars, roze, wit, zwart, grijs)
- [ ] Filterwaarden voor alle echte projecten (type, vorm, kleuren, status, schaal, materialen)
- [ ] Hoogtepunten: links en beelden per publicatie, jaartallen
- [ ] Beelden: kaart Lagado (Gulliver's Travels), portret Victor, Cheer Up City-project, studio met view, kaart NL met projectlocaties
- [ ] Contact: definitief e-mailadres en telefoonnummer (beide nog placeholder), LinkedIn, architectenregister-url, BNI-profiel
- [ ] Footer: bankgegevens, Algemene Voorwaarden, uitsmijter/quote onderaan
- [ ] Home: wat komt er verder op de home (onder de hero)?

## Techniek (later)
- [ ] Sanity: Viewer-token als `SANITY_API_READ_TOKEN` in Netlify (Production, Deploy previews, Branch deploys) en CORS-origins toevoegen (zie README → Netlify)
- [ ] Sanity: Victor uitnodigen (rol Editor) en Studio + Voorbeeld testen in de deploy preview
- [ ] Sanity: Editor-token van de migratie intrekken zodra de migratie definitief is
- [ ] Sanity: webhook bij publiceren → Netlify cache purge (nu max. 5 min vertraging)
- [ ] `lagado-content/` en `scripts/markdown-schema.ts` weg na livegang
- [ ] Cookieloze statistiek (`PUBLIC_ANALYTICS_*`) na consent
