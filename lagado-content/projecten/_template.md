---
# PROJECT — sjabloon. Kopieer naar projecten/<slug>.md
# Verplicht = zonder dit geen publicatie. Optioneel = mag leeg.

# ── Identiteit ─────────────────────────────────────────────
title: ""                              # verplicht
tagline: ""                            # verplicht, 1 zin (kaartje + hero)
intro: |                               # verplicht, 2–4 zinnen
  ""

# ── Feitenblok ─────────────────────────────────────────────
type: thuiskomen                       # verplicht: thuiskomen (particulier) | de-hort-op (publiek)
programma: woning                      # verplicht: zie README
functie: ""                            # optioneel, korte tekst
oppervlakte: 0                         # optioneel, m²
locatie: { plaats: "", wijk: "" }      # plaats verplicht, wijk optioneel
status: af                             # verplicht: af (gerealiseerd) | bijna (in ontwikkeling) | opgetekend (gepubliceerd)
jaarOpdracht: 0                        # optioneel
jaarOplevering: 0                      # optioneel, verplicht als status = af
opdrachtgeverType: prive               # optioneel: prive | zakelijk | publiek
opdrachtgever: ""                      # optioneel, naam of "privé"

# ── Filters (optioneel; type en status staan hierboven) ────
vorm: []                               # recht | rond | schuin (meerdere mogelijk)
kleuren: []                            # hoofdkleur(en), zie README (meerdere mogelijk)
schaal: null                           # stoel | kamer | huis | stad
materialen: []                         # hout | steen | beton | glas | tegels | metaal (meerdere mogelijk)
prijsklasse: null                      # laag | midden | hoog — niet tonen zonder akkoord

# ── Kleur ──────────────────────────────────────────────────
accentkleur: ""                        # optioneel, hex. Gebruikt voor typografie en details op de pagina
kleurpalet: []                         # [{ label, hex }] — voedt het `colors`-blok

# ── Beeld & weergave ───────────────────────────────────────
hero: { src: 01.jpg, alt: "" }         # verplicht, alt verplicht
featured: false                        # op home/uitgelicht
homepageGrootte: m                     # s | m | l — alleen op de homepage-kaart
volgorde: 0                            # handmatige sortering, laag = eerst
gerelateerd: []                        # slugs, max 3

# ── Credits ────────────────────────────────────────────────
credits:                               # optioneel, [{ rol, personen:[{ naam, url? }] }]
  - rol: Ontwerpteam
    personen: [{ naam: "" }]

fotografie:                            # optioneel
  - { naam: "", url: "" }

# ── Pers & awards (per project) ────────────────────────────
pers: []                               # [{ jaar, medium, titel, url }]
awards: []                             # [{ jaar, naam, resultaat }]
pressKit: ""                           # optioneel, pad naar zip/pdf in downloads/

seo:
  titel: ""
  beschrijving: ""

# ── Verhaal: bouwstenen in volgorde ────────────────────────
# Toegestane types: zie README. Beeld = bestandsnaam in images/<slug>/
blocks:
  - type: text
    kop: ""
    niveau: 2
    tekst: |
      ""

  - type: image
    src: 02.jpg
    alt: ""
    caption: ""
    breedte: feature

  - type: columns
    kop: ""
    tekst: |
      ""
    image: { src: 03.jpg, alt: "", caption: "" }
    beeldPositie: rechts

  - type: gallery
    kolommen: 3
    images:
      - { src: 04.jpg, alt: "", caption: "" }

  - type: colors
    kleuren: []

  # Optioneel: video achter klik (AVG)
  # - type: video
  #   url: ""
  #   titel: ""
  #   caption: ""

  # Optioneel: citaat / testimonial
  # - type: quote
  #   tekst: ""
  #   naam: ""
  #   rol: ""
---
