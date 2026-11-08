// Eenmalig (8 nov 2026): `analytics` in de site-instellingen was een vaste tekst ("cookieless"),
// het script stond in PUBLIC_ANALYTICS_*. Nu kies je de dienst in de Studio (Site-instellingen → Statistiek).
// Herhaalbaar: zet alleen iets als het veld nog de oude vorm heeft.
//
//   npx tsx --env-file-if-exists=.env scripts/sanity/2026-11-08-statistiek.ts [--dry-run]
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const ids: string[] = await client.fetch(`*[_id in ["siteSettings", "drafts.siteSettings"] && !(analytics.dienst in ["geen", "umami", "plausible", "google"])]._id`, {}, { perspective: 'raw' });
console.log(ids.length ? `Omzetten: ${ids.join(', ')}` : 'Niets te doen.');
if (ids.length && !process.argv.includes('--dry-run')) {
  const tx = client.transaction();
  for (const id of ids) tx.patch(id, (p) => p.set({ analytics: { dienst: 'geen' } }));
  await tx.commit();
  console.log('Klaar.');
}
