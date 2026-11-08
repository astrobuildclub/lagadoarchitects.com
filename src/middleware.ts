// Visual Editing per request (standards/SANITY.md §3, stap 4) en CDN-caching voor bezoekers.
import { defineMiddleware } from 'astro:middleware';
import { PREVIEW_COOKIE, isValidPreviewCookie, runWithVisualEditing } from './lib/sanity/visual-editing';

/**
 * Bezoekers: Netlify's CDN bewaart een pagina 5 minuten en serveert daarna nog een dag de oude versie
 * terwijl hij op de achtergrond een nieuwe haalt. Een publicatie in Sanity staat dus binnen ~5 minuten online
 * (sneller met de webhook uit docs/sanity-plan.md). De browser cachet zelf niet.
 */
const CDN_CACHE = 'public, durable, s-maxage=300, stale-while-revalidate=86400';

export const onRequest = defineMiddleware(async (context, next) => {
  // Geprerenderde routes (404, robots.txt) en de build: geen request-headers, geen preview.
  if (context.isPrerendered) return next();

  // De ondertekende cookie is de beveiliging; Sec-Fetch-Dest beperkt het tot de iframe van de Presentation tool.
  const hasPreviewCookie = isValidPreviewCookie(context.cookies.get(PREVIEW_COOKIE)?.value);
  const inIframe = context.request.headers.get('sec-fetch-dest') === 'iframe';
  const visualEditing = hasPreviewCookie && inIframe;
  context.locals.visualEditing = visualEditing;

  // Zo kan loadQuery() de status lezen zonder dat elke pagina of component hem moet doorgeven.
  const response = await runWithVisualEditing(visualEditing, next);

  const pad = context.url.pathname;
  const isPagina = (response.headers.get('content-type') ?? '').startsWith('text/html');
  const isStudio = pad === '/admin' || pad.startsWith('/admin/');
  const isApi = pad.startsWith('/api/');

  // Met preview-cookie nooit cachen (ook geen prefetch die later als navigatie wordt hergebruikt).
  if (hasPreviewCookie) {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Vary', 'Cookie, Sec-Fetch-Dest');
  } else if (isPagina && !isStudio && !isApi && response.status === 200 && !response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    response.headers.set('Netlify-CDN-Cache-Control', CDN_CACHE);
    // Een bezoeker met een (oude) preview-cookie krijgt nooit de gecachte versie van een ander, en andersom.
    response.headers.set('Netlify-Vary', 'cookie=sanity-preview');
  }

  return response;
});
