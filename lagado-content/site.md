---
# Globale instellingen. Wordt in Sanity het singleton-document `siteSettings`.
siteNaam: LAGADO architects            # verplicht
payoff: Een serieus buro voor speelse architectuur   # verplicht
taal: nl
url: https://lagadoarchitects.com      # verplicht, zonder slash aan het eind

navigatie:                             # verplicht, max 5 items
  - { label: Projecten, href: /projecten }
  - { label: Over,      href: /over }        # content in bureau.md
  - { label: Contact,   href: /contact }

footer:
  tekst: ""                            # optioneel, korte regel
  links:                               # social/extern; contactgegevens komen uit contact.md
    - { label: Instagram, href: https://www.instagram.com/lagadoarchitects }   # TODO: controleren
    - { label: LinkedIn,  href: "" }                                           # TODO: url van Victor
  privacy: /privacy                    # verplicht (AVG)
  # Uitsmijter onderaan de footer (teksten_v4). TODO: beeld "kaart van Lagado" (beeld: { src, alt }).
  uitsmijter:
    kop: Onze naam, een open houding
    tekst: |
      LAGADO is een verwijzing naar The Grand Academy of Lagado uit Gulliver’s Travels. Daar
      werkte een architect die probeerde om huizen te bouwen, beginnend bij de nok en eindigend
      met de fundering. Onze naam is een ode aan deze onbevangen, creatieve en optimistische
      houding. Net als hij zoeken we naar onverwachte ruimtelijke oplossingen en denken we
      altijd in mogelijkheden.

seo:
  titelPatroon: "%s — LAGADO architects"
  beschrijving: ""                     # TODO: 150 tekens, Victor/Maarten
  deelAfbeelding: { src: "", alt: "" } # optioneel, 1200×630, anders /og-default.png

projecten:
  # Ondertitel op /projecten (teksten_v4). Eerste alinea groot, een tweede alinea kleiner.
  # Een link naar #verras wordt ook een "Verras me"-knop; de dobbelsteen staat al bij de filters.
  intro: |
    Ontdek ons werk op vorm, kleur of laat je verrassen.
  toonPrijsfilter: false               # prijsklasse nooit tonen zonder akkoord van Victor

# Statistiek: cookieloos script, alleen actief als PUBLIC_ANALYTICS_* in .env staat
# én de bezoeker de categorie 'analytics' accepteert (zie src/lib/consent.ts).
analytics: cookieless
---
