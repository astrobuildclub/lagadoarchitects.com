---
# PROJECT — sjabloon. Kopieer naar projecten/<slug>.md
# Verplicht = zonder dit geen publicatie. Optioneel = mag leeg.

# ── Identiteit ─────────────────────────────────────────────
title: ""                              # verplicht
tagline: ""                            # verplicht, 1 zin (kaartje + hero)
vraag: ""                              # optioneel, de ontwerpvraag in 1 zin. Staat groot boven de projecttekst
intro: |                               # verplicht, 2–4 zinnen
  ""

# ── Filters (volgorde zoals op /wat, ook in het factsheet) ─
type: thuiskomen                       # verplicht: thuiskomen (particulier) | de-hort-op (publiek)
vorm: []                               # recht | rond | schuin (meerdere mogelijk)
kleuren: []                            # hoofdkleur(en), zie README (meerdere mogelijk)
status: af                             # verplicht: af (gerealiseerd) | bijna (in ontwikkeling) | opgetekend (gepubliceerd)
schaal: null                           # stoel | kamer | huis | plein
materialen: []                         # hout | steen | beton | glas | tegels | metaal (meerdere mogelijk)
opgave: []                               # interieur | verbouw | nieuwbouw | landschap (meerdere mogelijk)
prijsklasse: null                      # laag | midden | hoog — niet tonen zonder akkoord

# ── Projectgegevens (factsheet) ────────────────────────────
locatie: { plaats: "", wijk: "" }      # plaats verplicht, wijk optioneel
omvang: 0                              # optioneel, m²
opdrachtgeverType: particulier         # optioneel: particulier | zakelijk | publiek
opdrachtgever: ""                      # optioneel, naam. Leeg = het type wordt getoond
bouwteam: []                           # optioneel, [{ naam, url? }]
fotografie: []                         # optioneel, [{ naam, url? }]
jaarOpdracht: 0                        # optioneel
jaarOplevering: 0                      # optioneel, verplicht als status = af
programma: woning                      # verplicht: zie README (op de projectkaart, niet in het factsheet)

# ── Kleur ──────────────────────────────────────────────────
accentkleur: ""                        # optioneel, hex. Pagina-accent en kaartkleur; leeg = kleur uit het hero-beeld
kleurpalet: []                         # [{ label, hex }] — voedt het `colors`-blok

# ── Beeld & weergave ───────────────────────────────────────
hero: { src: 01.jpg, alt: "" }         # verplicht, alt verplicht
featured: false                        # op home/uitgelicht
homepageGrootte: klein                 # 1 rij: mini | klein | breed | lang · 2 rijen: hoog | toren | groot — alleen op de homepage
kaartvorm:                             # optioneel: ovaal | afgerond | zacht | recht | schuin — leeg = uit `vorm` (rond → ovaal, recht → zacht, schuin → schuin)
volgorde: 0                            # handmatige sortering, laag = eerst
gerelateerd: []                        # slugs, max 3

# ── Credits, pers & awards (onderaan de pagina) ────────────
credits:                               # optioneel, [{ rol, personen:[{ naam, url? }] }]
  - rol: Ontwerpteam
    personen: [{ naam: "" }]
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
