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
    adres: true                        # adres uit contact.md als derde kolom
    tekst: |                           # optioneel, vierde kolom (bron: teksten_v4, voorheen de uitsmijter in de footer)
      LAGADO is een verwijzing naar The Grand Academy of Lagado uit Gulliver’s Travels. Daar
      werkte een architect die probeerde om huizen te bouwen, beginnend bij de nok en eindigend
      met de fundering. Onze naam is een ode aan deze onbevangen, creatieve en optimistische
      houding. Net als hij zoeken we naar onverwachte ruimtelijke oplossingen en denken we
      altijd in mogelijkheden.
    beelden: []                        # 0–5 beelden; uitgezet: direct het projectraster.

  # 2. Geselecteerd werk: projecten met `featured: true`, op `volgorde`. Per project kiest
  #    `homepageGrootte` de maat en `kaartvorm` de vorm. Eerst `limit` kaarten, daarna "Meer projecten".
  - type: projectGrid
    kop: ""                            # leeg = geen sectietitel
    featured: true
    limit: 12
    linkNaarOverzicht: { label: alle projecten, href: /projecten }
    links:
      - { label: over, href: /over }

  # 3. Afsluiter
  - type: cta
    tekst: Een project in gedachten?
    label: Neem contact op
    href: /contact
---
