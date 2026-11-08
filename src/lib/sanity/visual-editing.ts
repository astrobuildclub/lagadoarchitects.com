// Visual Editing staat per request aan, niet per build (standards/SANITY.md §3).
// De cookie wordt gezet door /api/preview, dat alleen de Presentation tool in de Studio
// kan aanroepen (met een geldig preview-secret).
import { AsyncLocalStorage } from 'node:async_hooks';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const PREVIEW_COOKIE = 'sanity-preview';
export const PREVIEW_MAX_AGE = 60 * 60 * 12; // 12 uur, in seconden

interface RequestStore {
  visualEditing: boolean;
  /** Queries van dit request: één keer ophalen, ook als meerdere componenten ze vragen. */
  queries: Map<string, Promise<unknown>>;
}

const storage = new AsyncLocalStorage<RequestStore>();

export function runWithVisualEditing<T>(visualEditing: boolean, fn: () => T) {
  return storage.run({ visualEditing, queries: new Map() }, fn);
}

export function isVisualEditing() {
  return storage.getStore()?.visualEditing ?? false;
}

export function requestQueries() {
  return storage.getStore()?.queries;
}

// De cookie-waarde is `<verloopt>.<handtekening>`, ondertekend met de server-only read token.
// Zonder token kan niemand een geldige cookie maken; een zelfgezette `sanity-preview=true` werkt dus niet.
function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(`${PREVIEW_COOKIE}:${payload}`).digest('base64url');
}

export function createPreviewCookieValue(secret: string) {
  const expires = String(Date.now() + PREVIEW_MAX_AGE * 1000);
  return `${expires}.${sign(expires, secret)}`;
}

export function isValidPreviewCookie(value: string | undefined) {
  const secret = import.meta.env.SANITY_API_READ_TOKEN;
  if (!value || !secret) return false;

  const [expires, signature] = value.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;

  const expected = Buffer.from(sign(expires, secret));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
