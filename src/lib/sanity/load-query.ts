// Alle Sanity-content loopt via deze functie (standards/SANITY.md §3, stap 5).
// Nooit zelf `perspective`, `token` of `stega` zetten in componenten.
import type { QueryParams } from '@sanity/client';
import { sanityClient } from 'sanity:client';
import { isVisualEditing, requestQueries } from './visual-editing';

const token = import.meta.env.SANITY_API_READ_TOKEN;

export async function loadQuery<QueryResponse>({ query, params }: { query: string; params?: QueryParams }) {
  const visualEditingEnabled = isVisualEditing();

  if (visualEditingEnabled && !token) {
    throw new Error('SANITY_API_READ_TOKEN is verplicht tijdens Visual Editing.');
  }

  const perspective = visualEditingEnabled ? 'drafts' : 'published';

  // Per request één keer: getProjects() wordt door header, raster en teaser apart gevraagd.
  const cache = requestQueries();
  const key = `${perspective}:${query}:${JSON.stringify(params ?? {})}`;
  const hit = cache?.get(key) as Promise<{ data: QueryResponse; perspective: string }> | undefined;
  if (hit) return hit;

  const result = sanityClient
    .fetch<QueryResponse>(query, params ?? {}, {
      filterResponse: false,
      perspective,
      resultSourceMap: visualEditingEnabled ? 'withKeyArraySelector' : false,
      stega: visualEditingEnabled,
      ...(visualEditingEnabled ? { token } : {}),
    })
    .then(({ result }) => ({ data: result, perspective }));

  cache?.set(key, result);
  return result;
}
