// Alle schema-types voor de Studio.
import { blockTypes } from './blocks';
import { contact, page, siteSettings } from './documents/pages';
import { project } from './documents/project';
import { objects } from './objects';

export const schemaTypes = [...objects, ...blockTypes, project, page, contact, siteSettings];

/** Documenten met één vaste ID: niet aanmaken, dupliceren of verwijderen in de Studio. */
export const SINGLETONS = {
  siteSettings: { type: 'siteSettings', title: 'Site-instellingen' },
  'page-home': { type: 'page', title: 'Home' },
  contact: { type: 'contact', title: 'Contact' },
} as const;
