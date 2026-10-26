// Met build.format 'file' is Astro.url.pathname tijdens de build '/over.html' of '/index.html'.
// Overal dezelfde, schone vorm gebruiken: '/', '/over', '/projecten/slug'.
export const cleanPath = (pathname: string) =>
  pathname.replace(/\.html$/, '').replace(/\/index$/, '/').replace(/(.)\/$/, '$1') || '/';
