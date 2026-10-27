---
# HOME — concept. Inhoud wordt door Maarten uitgewerkt, structuur staat vast.
title: Home                            # verplicht (alleen voor <title>, niet getoond)
seo:
  titel: ""                            # optioneel, anders title
  beschrijving: ""

blocks:
  # 1. Intro (Figma): vier kolommen klein. Kop en subkop met wisselende woorden, adres, herkomst van de naam.
  - type: hero
    kop: Wij zijn een serieus bureau voor  # verplicht; het wisselwoord staat op een eigen regel
    kopWissel:                         # optioneel; de eerste staat er vast, daarna wissel per zin
      - speelse architectuur
      - kleurrijke interieurs
      - uitdagende landschappen
      - heldere vormen
      - krachtige kleuren
      - slimme gelaagdheid
      - ruimtes die verrassen
    subkop: We ontwerpen               # optioneel
    subkopWissel:
      - van nok tot fundering
      - van bed tot flat
      - van deur tot dorp
      - van kelder tot kap
      - van plank tot plein
      - van tegel tot tuin
      - van stoel tot stad
    adres: false                       # Figma (447:2103): alleen kop en subkop; adres en tekst staan in de footer
    beelden: []                        # 0–5 beelden; uitgezet: direct het projectraster.

  # 2. Geselecteerd werk: projecten met `featured: true`, op `volgorde`. Per project kiest
  #    `kaartvorm` de vorm. Vast aantal: `limit` kaarten in de vaste indeling uit Figma (halve kaart midden boven).
  - type: projectGrid
    kop: ""                            # leeg = geen sectietitel
    featured: true
    limit: 8
    meer: false                        # vast aantal, geen "Meer projecten"
    linkNaarOverzicht: { label: alle projecten, href: /projecten }
    links:
      - { label: over, href: /over }

  # 3. Afsluiter
  - type: cta
    tekst: Een project in gedachten?
    label: Neem contact op
    href: /contact
---
