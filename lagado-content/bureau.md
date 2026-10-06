---
# BUREAU — verhaal, naam, team, pers & awards.
title: Bureau                           # verplicht
intro: |                               # verplicht, 1–2 zinnen, groot getoond
  Wij zijn een serieus buro voor speelse architectuur. We maken leefomgevingen
  die sociale interactie bevorderen en uitnodigen tot divers gebruik.
seo:
  titel: ""
  beschrijving: ""

blocks:
  - type: text
    kop: Wat we doen
    niveau: 2
    tekst: |
      LAGADO architects maakt projecten die bijdragen aan de stedelijke
      leefomgeving, zoals woningbouwprojecten, winkels, restaurants, woningen
      en interieurs. Ook hebben we straatmeubilair en publieke toiletten
      ontworpen.

  - type: text
    kop: Onze naam
    niveau: 2
    tekst: |
      Onze naam verwijst naar een onbevangen houding ten aanzien van ons vak.
      Die delen we met de architect van de Grand Academy of Lagado uit
      Gulliver's Travels, die een huis probeerde te bouwen beginnend bij de nok
      en eindigend bij de fundering.

  - type: services
    kop: Diensten
    items:                             # TODO: Victor, architectuur en interieur apart benoemen
      - { titel: Architectuur, tekst: "TODO" }
      - { titel: Interieur,    tekst: "TODO" }

  - type: image
    src: images/bureau/01.jpg            # TODO: team- of kantoorfoto
    alt: ""
    caption: ""
    breedte: feature

  - type: team
    kop: Team
    personen:
      - naam: Victor Verhagen
        rol: Architect – Co-founder – Creative Director
        foto: { src: images/bureau/victor.jpg, alt: "" }   # alt verplicht
        bio: |
          TODO: 2–3 zinnen in Victors eigen toon.
        linkedin: ""                   # optioneel
      # Overige teamleden: toevoegen zodra Victor ze aanlevert.

  - type: list
    soort: awards
    kop: Awards & nominaties
    items:
      - { jaar: 0000, naam: "", resultaat: winnaar, project: "" }   # resultaat: winnaar | genomineerd | finalist

  - type: list
    soort: pers
    kop: Pers & publicaties
    items:
      - { jaar: 0000, medium: "", titel: "", url: "", project: "" } # project = slug, optioneel

  - type: logos
    kop: Opdrachtgevers
    items: []                          # [{ naam, logo: { src, alt }, href }] — logo's leveren we los aan

  - type: cta
    tekst: Een project in gedachten?
    label: Neem contact op
    href: /contact
---
