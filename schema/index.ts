// Alle schema-types voor de Studio.
import { blockTypes } from './blocks';
import { contact, navigatie, page, siteSettings } from './documents/pages';
import { project } from './documents/project';
import { objects } from './objects';

export const schemaTypes = [...objects, ...blockTypes, project, page, contact, siteSettings, navigatie];

/** Documenten met één vaste ID: niet aanmaken, dupliceren of verwijderen in de Studio. */
export const SINGLETONS = {
  siteSettings: { type: 'siteSettings', title: 'Site-instellingen' },
  navigatie: { type: 'navigatie', title: 'Navigatie en footer' },
  'page.home': { type: 'page', title: 'Home' },
  'page.bureau': { type: 'page', title: 'Over' },
  'page.privacy': { type: 'page', title: 'Privacy' },
  contact: { type: 'contact', title: 'Contact' },
} as const;
