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
      bureau voor
    kopWissel:                         # optioneel; de eerste staat er vast, daarna harde wissel per zin
      - speelse architectuur
      - kleurrijke interieurs
      - uitdagende landschappen
      - heldere vormen
      - krachtige kleuren
      - slimme gelaagdheid
      - ruimtes die verrassen
    subkop: We ontwerpen               # optioneel
    subkopWissel:
      - van bed tot flat
      - van deur tot dorp
      - van kelder tot kap
      - van plank tot plein
      - van tegel tot tuin
      - van stoel tot stad
    link: { label: over ons, href: /over }
    beelden: []                        # 0–5 beelden, verwijzing naar projectbeeld. Uitgezet: direct het projectraster.
    #  - { project: workhome-playhome, src: 01.jpg, alt: "Woonkamer met oranje en roze wanden, de trap als sculptuur erboven en een lange eettafel" }

  # 2. Mantra: groot en vet (bron: teksten_v4).
  - type: statement
    tekst: Vorm, kleur, gelaagdheid. Ruimtes die verrassen.

  # 3. Geselecteerd werk: projecten met `featured: true`, op `volgorde`. homepageGrootte stuurt het raster.
  #    Eerst `limit` kaarten, daarna per `limit` meer via de knop "Meer projecten".
  - type: projectGrid
    kop: ""                            # leeg = geen sectietitel
    featured: true
    limit: 12
    linkNaarOverzicht: { label: Bekijk meer projecten, href: /projecten }
    links:
      - { label: Of ontdek hoe we je kunnen helpen, href: /over#diensten }

  # 4. Afsluiter
  - type: cta
    tekst: Een project in gedachten?
    label: Neem contact op
    href: /contact
---
