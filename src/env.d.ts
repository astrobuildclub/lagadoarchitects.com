/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  /** Server-only (Viewer), voor Visual Editing. */
  readonly SANITY_API_READ_TOKEN?: string;
}

declare namespace App {
  interface Locals {
    /** Visual Editing aan: geldige preview-cookie én in de iframe van de Presentation tool. */
    visualEditing: boolean;
  }
}
