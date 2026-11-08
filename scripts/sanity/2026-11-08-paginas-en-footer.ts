// Eenmalig (8 nov 2026): content naar de nieuwe structuur.
// - Menu en footer van het document `navigatie` naar de site-instellingen; footer als vier kolommen.
// - Over en Privacy krijgen een URL (slug) en template; Privacy wordt een tekstpagina.
// - Het document `navigatie` (en zijn draft) verdwijnt.
// Herhaalbaar: draait niets dubbel als het al gedaan is.
//
//   npx tsx --env-file-if-exists=.env scripts/sanity/2026-11-08-paginas-en-footer.ts [--dry-run]
import { createHash } from 'node:crypto';
import { createClient } from '@sanity/client';

const DRY = process.argv.includes('--dry-run');
const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const key = (...p: (string | number)[]) => createHash('sha1').update(p.join('/')).digest('hex').slice(0, 12);

type Regel = string | { tekst: string; href: string };

/** Eén alinea met regels (Shift+Enter in de Studio = "\n"), links als markDefs. */
function kolom(naam: string, regels: Regel[]) {
  const markDefs: { _key: string; _type: 'link'; href: string }[] = [];
  const children = regels.flatMap((r, i) => {
    const tekst = (typeof r === 'string' ? r : r.tekst) + (i < regels.length - 1 ? '\n' : '');
    const marks: string[] = [];
    if (typeof r !== 'string') {
      const k = key(naam, 'mark', i);
      markDefs.push({ _key: k, _type: 'link', href: r.href });
      marks.push(k);
    }
    // De regelafbreking los, zodat de link alleen het woord omvat.
    const [woord, nl] = tekst.endsWith('\n') ? [tekst.slice(0, -1), '\n'] : [tekst, ''];
    return [
      { _type: 'span', _key: key(naam, i), text: woord, marks },
      ...(nl ? [{ _type: 'span', _key: key(naam, i, 'nl'), text: nl, marks: [] }] : []),
    ];
  });
  return {
    _type: 'footerKolom',
    _key: key('footer', naam),
    tekst: [{ _type: 'block', _key: key(naam, 'blok'), style: 'normal', markDefs, children }],
  };
}

/** Tekstblokken (kop + tekst) → één Portable Text met koppen. */
function alsTekstpagina(blocks: Record<string, unknown>[] = []) {
  return blocks.flatMap((b, i) => {
    if (b._type !== 'textBlock') return [];
    const kop = b.kop as string | undefined;
    const kopBlok = kop
      ? [{ _type: 'block', _key: key('privacy', i, 'kop'), style: b.niveau === 3 ? 'h3' : 'h2', markDefs: [], children: [{ _type: 'span', _key: key('privacy', i, 'kop', 0), text: kop, marks: [] }] }]
      : [];
    return [...kopBlok, ...((b.tekst as Record<string, unknown>[]) ?? [])];
  });
}

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) throw new Error('SANITY_API_WRITE_TOKEN ontbreekt (rol Editor).');
  const d = await client.fetch(
    `{
      "nav": *[_id == "navigatie"][0], "navDraft": *[_id == "drafts.navigatie"][0],
      "instellingen": *[_id == "siteSettings"][0], "contact": *[_id == "contact"][0],
      "paginas": *[_id in ["page-bureau", "drafts.page-bureau", "page-privacy", "drafts.page-privacy"]]
    }`,
    {},
    { perspective: 'raw' },
  );

  const tx = client.transaction();
  const log: string[] = [];

  // 1. Menu en footer naar de site-instellingen (draft van navigatie gaat voor: die is het nieuwst).
  const nav = d.navDraft ?? d.nav;
  if (nav && !d.instellingen?.footer?.kolommen) {
    const c = d.contact ?? {};
    const tel = c.telefoon ? `tel:${c.telefoon.replace('(0)', '').replace(/[^\d+]/g, '')}` : undefined;
    const extern = [...(nav.footer?.links ?? []), ...(c.social ?? [])].filter(
      (l: { href?: string }, i: number, all: { href?: string }[]) => l.href && all.findIndex((x) => x.href === l.href) === i,
    );
    const kolommen = [
      kolom('herkomst', [nav.footer?.tekst ?? '']),
      kolom('adres', [c.adres?.naam, c.adres?.straat, [c.adres?.postcode, c.adres?.plaats].filter(Boolean).join(' '), tel && { tekst: c.telefoon, href: tel }, c.email && { tekst: c.email, href: `mailto:${c.email}` }].filter(Boolean)),
      kolom('bedrijf', [c.bedrijf?.kvk && `KVK: ${c.bedrijf.kvk}`, c.bedrijf?.btw && `BTW: ${c.bedrijf.btw}`, c.bedrijf?.architectenregister && `Architectenregister: ${c.bedrijf.architectenregister}`, c.bedrijf?.bank && `Bank: ${c.bedrijf.bank}`].filter(Boolean)),
      kolom('links', [
        { tekst: 'Privacy', href: nav.footer?.privacy || '/privacy' },
        { tekst: 'Cookie-instellingen', href: '#cookies' },
        ...extern.map((l: { label: string; href: string }) => ({ tekst: l.label, href: l.href })),
        { tekst: 'Areal by ABC Dinamo', href: 'https://abcdinamo.com/typefaces/areal' },
        { tekst: 'allthis.digital', href: 'https://allthis.digital' },
      ]),
    ];
    tx.patch('siteSettings', (p) => p.set({ navigatie: nav.navigatie, footer: { kolommen } }));
    log.push('siteSettings: menu en footer (4 kolommen)');
  }

  // 2. Over en Privacy: URL en template. Ook hun drafts, anders verliezen die het bij publiceren.
  for (const p of d.paginas as Record<string, unknown>[]) {
    const id = p._id as string;
    const isPrivacy = id.endsWith('page-privacy');
    if ((p.slug as { current?: string } | undefined)?.current) continue;
    tx.patch(id, (patch) => {
      const basis = patch.set({ slug: { _type: 'slug', current: isPrivacy ? 'privacy' : 'over' }, template: isPrivacy ? 'tekst' : 'blokken' });
      return isPrivacy ? basis.set({ inhoud: alsTekstpagina(p.blocks as Record<string, unknown>[]), cookieKnop: true }).unset(['blocks']) : basis;
    });
    log.push(`${id}: slug + template${isPrivacy ? ' (tekst, blokken → inhoud)' : ''}`);
  }

  // 3. Het oude navigatie-document weg.
  for (const id of ['navigatie', 'drafts.navigatie']) {
    if ((id === 'navigatie' ? d.nav : d.navDraft)) {
      tx.delete(id);
      log.push(`${id}: verwijderd`);
    }
  }

  console.log(log.length ? log.join('\n') : 'Niets te doen: al omgezet.');
  if (!DRY && log.length) await tx.commit();
  console.log(DRY ? '[dry-run] niets opgeslagen' : 'Klaar.');
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
