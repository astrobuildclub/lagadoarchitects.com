// Herbruikbare objecttypes. Veldnamen = src/lib/schema.ts.
import { defineArrayMember, defineField, defineType } from 'sanity';
import { RESULTAAT } from '../../src/lib/waarden';
import { opties } from '../helpers';

/**
 * Beeld met verplichte alt-tekst (WCAG 1.1.1). Een leeg tekstveld bestaat niet in Sanity,
 * daarom `decoratief`: aan = `alt=""` op de site.
 */
export const beeld = defineType({
  name: 'beeld',
  title: 'Beeld',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alt-tekst',
      description: 'Wat staat er op het beeld? Voor wie het niet kan zien.',
      type: 'string',
      hidden: ({ parent }) => !!parent?.decoratief,
      validation: (r) =>
        r.custom((alt, ctx) => {
          const parent = ctx.parent as { decoratief?: boolean; asset?: unknown } | undefined;
          if (!parent?.asset || parent.decoratief) return true;
          return alt?.trim() ? true : 'Vul een alt-tekst in, of zet "Decoratief" aan';
        }),
    }),
    defineField({
      name: 'decoratief',
      title: 'Decoratief',
      description: 'Alleen sfeer, geen informatie: wordt overgeslagen door schermlezers.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'caption', title: 'Onderschrift', type: 'string' }),
  ],
});

/** Korte opgemaakte tekst: alinea's, vet, cursief, links en lijstjes. Niet meer. */
export const richText = defineType({
  name: 'richText',
  title: 'Tekst',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Alinea', value: 'normal' }],
      lists: [
        { title: 'Opsomming', value: 'bullet' },
        { title: 'Genummerd', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Vet', value: 'strong' },
          { title: 'Cursief', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                description: 'Volledige URL, intern pad (/contact) of mailto:',
                type: 'string',
                validation: (r) => r.required(),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});

/** Lopende tekst van een tekstpagina (Privacy): als `richText`, plus koppen. */
export const richTextPagina = defineType({
  name: 'richTextPagina',
  title: 'Tekst met koppen',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Alinea', value: 'normal' },
        { title: 'Kop 2', value: 'h2' },
        { title: 'Kop 3', value: 'h3' },
      ],
      lists: [
        { title: 'Opsomming', value: 'bullet' },
        { title: 'Genummerd', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Vet', value: 'strong' },
          { title: 'Cursief', value: 'em' },
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [defineField({ name: 'href', title: 'URL', type: 'string', validation: (r) => r.required() })],
          }),
        ],
      },
    }),
  ],
});

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'href',
      title: 'URL',
      description: 'Volledige URL, intern pad (/projecten) of mailto:',
      type: 'string',
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'href' } },
});

export const kleur = defineType({
  name: 'kleur',
  title: 'Kleur',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'hex',
      title: 'Hex',
      description: 'Bv. #1f4fd1',
      type: 'string',
      validation: (r) => r.regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, { name: 'hex' }).warning('Gebruik een hexwaarde, bv. #1f4fd1'),
    }),
  ],
  preview: { select: { title: 'label', subtitle: 'hex' } },
});

export const persoon = defineType({
  name: 'persoon',
  title: 'Persoon of bedrijf',
  type: 'object',
  fields: [
    defineField({ name: 'naam', title: 'Naam', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'url', title: 'Website', type: 'url' }),
  ],
  preview: { select: { title: 'naam', subtitle: 'url' } },
});

const projectRef = defineField({
  name: 'project',
  title: 'Project',
  description: 'Optioneel: linkt naar het project.',
  type: 'reference',
  to: [{ type: 'project' }],
});

export const persItem = defineType({
  name: 'persItem',
  title: 'Publicatie',
  type: 'object',
  fields: [
    defineField({ name: 'jaar', title: 'Jaar', type: 'number' }),
    defineField({ name: 'medium', title: 'Medium', type: 'string' }),
    defineField({ name: 'titel', title: 'Titel', type: 'string' }),
    defineField({ name: 'url', title: 'URL', type: 'url' }),
    projectRef,
  ],
  preview: { select: { title: 'titel', medium: 'medium', jaar: 'jaar' }, prepare: ({ title, medium, jaar }) => ({ title: title || medium || 'Publicatie', subtitle: [medium, jaar].filter(Boolean).join(' · ') }) },
});

export const awardItem = defineType({
  name: 'awardItem',
  title: 'Award',
  type: 'object',
  fields: [
    defineField({ name: 'jaar', title: 'Jaar', type: 'number' }),
    defineField({ name: 'naam', title: 'Naam', type: 'string' }),
    defineField({ name: 'resultaat', title: 'Resultaat', type: 'string', options: { list: opties(RESULTAAT), layout: 'radio', direction: 'horizontal' } }),
    projectRef,
  ],
  preview: { select: { title: 'naam', subtitle: 'jaar' } },
});

/** Item in een list-blok: pers- én award-velden; welke getoond worden hangt af van `soort`. */
export const listItem = defineType({
  name: 'listItem',
  title: 'Item',
  type: 'object',
  fields: [
    defineField({ name: 'jaar', title: 'Jaar', type: 'number' }),
    defineField({ name: 'naam', title: 'Naam (awards)', type: 'string' }),
    defineField({ name: 'resultaat', title: 'Resultaat (awards)', type: 'string', options: { list: opties(RESULTAAT) } }),
    defineField({ name: 'medium', title: 'Medium (pers)', type: 'string' }),
    defineField({ name: 'titel', title: 'Titel (pers)', type: 'string' }),
    defineField({ name: 'url', title: 'URL', type: 'url' }),
    projectRef,
  ],
  preview: {
    select: { naam: 'naam', titel: 'titel', medium: 'medium', jaar: 'jaar' },
    prepare: ({ naam, titel, medium, jaar }) => ({ title: titel || naam || medium || 'Item', subtitle: [medium, jaar].filter(Boolean).join(' · ') }),
  },
});

export const downloadItem = defineType({
  name: 'downloadItem',
  title: 'Download',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'bestand', title: 'Bestand', type: 'file', validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'label', subtitle: 'bestand.asset.originalFilename' } },
});

/** SEO per document met een eigen URL (standards/SANITY.md §2, Nederlandse veldnamen). */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'titel',
      title: 'Titel',
      description: 'Leeg = paginatitel.',
      type: 'string',
      validation: (r) => r.max(60).warning('Zoekmachines tonen ongeveer 60 tekens'),
    }),
    defineField({
      name: 'beschrijving',
      title: 'Beschrijving',
      description: 'Leeg = intro van de pagina of de standaardbeschrijving.',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(160).warning('Zoekmachines tonen ongeveer 155 tekens'),
    }),
    defineField({
      name: 'noindex',
      title: 'Verbergen voor zoekmachines',
      description: 'Ook uit de sitemap.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});

export const objects = [beeld, richText, richTextPagina, link, kleur, persoon, persItem, awardItem, listItem, downloadItem, seo];
