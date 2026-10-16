---
# HOME — concept. Inhoud wordt door Maarten uitgewerkt, structuur staat vast.
title: Home                            # verplicht (alleen voor <title>, niet getoond)
seo:
  titel: ""                            # optioneel, anders title
  beschrijving: ""

blocks:
  # 1. Hero: payoff met wisselende woorden + beeldraster. Eerste beeld laadt eager (LCP).
  - type: hero
    kop: |-                            # verplicht; een nieuwe regel hier = nieuwe regel op de site
      Wij zijn een serieus
      buro voor
    kopWissel:                         # optioneel; de eerste staat er zonder animatie
      - speelse architectuur
      - spannende interieurs
      - sportieve landschappen
    subkop: We ontwerpen               # optioneel
    subkopWissel:
      - van nok tot fundering          # het idee achter onze naam
      - van bed tot flat
      - van deur tot dorp
      - van kelder tot kap
      - van neut tot nok
      - van plank tot plein
      - van tegel tot tuin
    link: { label: over ons, href: /waarom }
    beelden:                           # 1–5 beelden, verwijzing naar projectbeeld
      - { project: workhome-playhome, src: 01.jpg, alt: "" }   # alt verplicht

  # 2. Statement: één korte alinea over hoe Lagado werkt.
  - type: text
    kop: ""
    tekst: |
      TODO: 2–3 zinnen. Bron: "We maken leefomgevingen die sociale interactie
      bevorderen en uitnodigen tot divers gebruik."

  # 3. Geselecteerd werk: handmatig gekozen; homepageGrootte (s/m/l) stuurt het raster.
  - type: projectGrid
    kop: Geselecteerd werk
    slugs:
      - workhome-playhome
      - huis-aan-de-maas
      - koffiebar-binnenweg
      - atelier-kralingen
      - speelplein-zuid
      - winkel-witte-de-with
    limit: 6
    linkNaarOverzicht: { label: Alle projecten, href: /wat }

  # 4. Pers & awards: logo's of namen, geen lange lijst.
  - type: list
    soort: pers
    kop: Gepubliceerd in
    toonUit: bureau                    # haalt de laatste 5 pers-items uit bureau.md
    limit: 5

  # 5. Afsluiter
  - type: cta
    tekst: Een project in gedachten?
    label: Neem contact op
    href: /contact
---
