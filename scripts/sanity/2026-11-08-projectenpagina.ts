// Eenmalig (8 nov 2026): intro en prijsfilter van /projecten stonden in de site-instellingen (tab Projecten).
// Nu een eigen pagina onder Pagina's: document `projecten` (type projectenPagina), met SEO.
// Herhaalbaar: maakt het document alleen aan als het nog niet bestaat; haalt het oude veld weg.
//
//   npx tsx --env-file-if-exists=.env scripts/sanity/2026-11-08-projectenpagina.ts [--dry-run]
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const dryRun = process.argv.includes('--dry-run');
const { oud, bestaat, metVeld } = await client.fetch<{
  oud: { intro?: unknown[]; toonPrijsfilter?: boolean } | null;
  bestaat: boolean;
  metVeld: string[];
}>(
  `{
    "oud": *[_id == "siteSettings"][0].projecten,
    "bestaat": defined(*[_id == "projecten"][0]._id),
    "metVeld": *[_id in ["siteSettings", "drafts.siteSettings"] && defined(projecten)]._id
  }`,
  {},
  { perspective: 'raw' },
);

const tx = client.transaction();
if (!bestaat) {
  console.log(`Aanmaken: projecten (intro: ${oud?.intro?.length ?? 0} blokken, prijsfilter: ${oud?.toonPrijsfilter ?? false})`);
  tx.createIfNotExists({
    _id: 'projecten',
    _type: 'projectenPagina',
    title: 'Projecten',
    ...(oud?.intro && { intro: oud.intro }),
    toonPrijsfilter: oud?.toonPrijsfilter ?? false,
  });
}
for (const id of metVeld) {
  console.log(`Veld projecten weghalen uit ${id}`);
  tx.patch(id, (p) => p.unset(['projecten']));
}

if (bestaat && !metVeld.length) console.log('Niets te doen.');
else if (!dryRun) {
  await tx.commit();
  console.log('Klaar.');
}
