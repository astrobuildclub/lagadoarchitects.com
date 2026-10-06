// Met build.format 'file' is Astro.url.pathname tijdens de build '/bureau.html' of '/index.html'.
// Overal dezelfde, schone vorm gebruiken: '/', '/bureau', '/projecten/slug'.
export const cleanPath = (pathname: string) =>
  pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
