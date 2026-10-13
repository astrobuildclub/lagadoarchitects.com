// Met build.format 'file' is Astro.url.pathname tijdens de build '/waarom.html' of '/index.html'.
// Overal dezelfde, schone vorm gebruiken: '/', '/waarom', '/wat/slug'.
export const cleanPath = (pathname: string) =>
  pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
