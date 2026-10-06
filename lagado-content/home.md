---
# HOME — concept. Inhoud wordt door Maarten uitgewerkt, structuur staat vast.
title: Home                            # verplicht (alleen voor <title>, niet getoond)
seo:
  titel: ""                            # optioneel, anders title
  beschrijving: ""

blocks:
  # 1. Hero: payoff + beeldraster. Eerste beeld laadt eager (LCP).
  - type: hero
    kop: Een serieus buro voor speelse architectuur   # verplicht
    subkop: ""                         # optioneel
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
    linkNaarOverzicht: { label: Alle projecten, href: /projecten }

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
