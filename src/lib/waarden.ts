// Waardenlijsten van het contentmodel. Eén bron voor de site (Zod in schema.ts) en de Studio (schema/).
// Geen imports: dit bestand moet ook in de Studio-bundel en de Sanity CLI werken.
// Filters op /projecten (Victors eigen woorden, zie README).
export const TYPE = ['thuiskomen', 'de-hort-op'] as const;
export const VORM = ['recht', 'rond', 'schuin'] as const;
export const KLEUR = ['rood', 'oranje', 'geel', 'groen', 'blauw', 'paars', 'roze', 'wit', 'zwart', 'grijs'] as const;
export const STATUS = ['af', 'bijna', 'opgetekend'] as const;
export const SCHAAL = ['stoel', 'kamer', 'huis', 'plein'] as const;
export const OPGAVE = ['interieur', 'verbouw', 'nieuwbouw', 'landschap'] as const;
export const MATERIAAL = ['hout', 'steen', 'beton', 'glas', 'tegels', 'metaal'] as const;

export const PROGRAMMA = ['woning', 'winkel', 'horeca', 'kantoor', 'publiek', 'openbare-ruimte', 'meubel'] as const;
export const OPDRACHTGEVER_TYPE = ['particulier', 'zakelijk', 'publiek'] as const;
export const PRIJSKLASSE = ['laag', 'midden', 'hoog'] as const;
export const BREEDTE = ['content', 'popout', 'feature', 'full'] as const;
/** Kaarthoogte op de homepage (projectGrid): hoog, toren en groot beslaan 2 rijen, de rest 1 (Figma 447:2103). */
export const HOMEPAGE_GROOTTE = ['mini', 'klein', 'hoog', 'toren', 'breed', 'groot', 'lang'] as const;
/** Vorm van de kaart in het homeraster; leeg = afgeleid van de eerste `vorm`. */
export const KAARTVORM = ['ovaal', 'afgerond', 'zacht', 'recht', 'schuin'] as const;
export const RESULTAAT = ['winnaar', 'genomineerd', 'finalist'] as const;
