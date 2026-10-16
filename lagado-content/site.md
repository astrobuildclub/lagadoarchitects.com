---
# Globale instellingen. Wordt in Sanity het singleton-document `siteSettings`.
siteNaam: LAGADO architects            # verplicht
payoff: Een serieus buro voor speelse architectuur   # verplicht
taal: nl
url: https://lagadoarchitects.com      # verplicht, zonder slash aan het eind

navigatie:                             # verplicht, max 5 items
  - { label: Wat,     href: /wat }        # alternatief: Projecten / Werk
  - { label: Waarom,  href: /waarom }     # alternatief: Bureau / Over
  - { label: Contact,   href: /contact }

footer:
  tekst: ""                            # optioneel, korte regel
  links:                               # social/extern; contactgegevens komen uit contact.md
    - { label: Instagram, href: https://www.instagram.com/lagadoarchitects }   # TODO: controleren
    - { label: LinkedIn,  href: "" }                                           # TODO: url van Victor
  privacy: /privacy                    # verplicht (AVG)

seo:
  titelPatroon: "%s — LAGADO architects"
  beschrijving: ""                     # TODO: 150 tekens, Victor/Maarten
  deelAfbeelding: { src: "", alt: "" } # optioneel, 1200×630, anders /og-default.png

projecten:
  # Ondertitel op /wat; TODO: Victor. Eerste alinea groot, de tweede kleiner op een eigen regel.
  # Link naar #verras = de knop die een willekeurige filtercombinatie kiest.
  intro: |
    Woningen, winkels, plekken om samen te komen en alles daartussen.

    Filter op wat je zoekt, of laat je [verrassen](#verras).
  toonPrijsfilter: false               # prijsklasse nooit tonen zonder akkoord van Victor

# Statistiek: cookieloos script, alleen actief als PUBLIC_ANALYTICS_* in .env staat
# én de bezoeker de categorie 'analytics' accepteert (zie src/lib/consent.ts).
analytics: cookieless
---
