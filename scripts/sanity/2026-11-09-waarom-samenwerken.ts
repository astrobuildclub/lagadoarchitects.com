// Eenmalig (9 nov 2026): op Over wordt het tekstblok "Waarom samenwerken?" een blok *Beeld naast tekst*
// (Figma): eerste alinea = intro, de rest = tekst in twee kolommen, beeld links. Het beeld voegt de redactie toe.
// Gepubliceerd en concept. Herhaalbaar: een blok dat al `columns` is, wordt overgeslagen.
//
//   npx tsx --env-file-if-exists=.env scripts/sanity/2026-11-09-waarom-samenwerken.ts [--dry-run]
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const KOP = 'Waarom samenwerken?';
type Blok = { _key: string; _type: string; kop?: string; tekst?: { _type: string }[] };
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const docs = await client.fetch<{ _id: string; blocks: Blok[] }[]>(
    `*[_id in ["page-bureau", "drafts.page-bureau"]]{ _id, blocks }`,
    {},
    { perspective: 'raw' },
  );

  const tx = client.transaction();
  let aantal = 0;
  for (const doc of docs) {
    const blok = doc.blocks.find((b) => b._type === 'textBlock' && b.kop?.trim() === KOP);
    if (!blok) continue;
    const [intro, ...rest] = blok.tekst ?? [];
    console.log(`${doc._id}: tekstblok ${blok._key} → Beeld naast tekst (intro 1 alinea, tekst ${rest.length})`);
    aantal++;
    tx.patch(doc._id, (p) =>
      p.set({
        [`blocks[_key=="${blok._key}"]`]: {
          _key: blok._key,
          _type: 'columns',
          kop: blok.kop,
          ...(intro && { intro: [intro] }),
          ...(rest.length && { tekst: rest }),
          kolommen: rest.length > 1,
          beeldPositie: 'links',
        },
      }),
    );
  }

  if (!aantal) console.log('Niets te doen.');
  else if (dryRun) console.log(`${aantal} om te zetten (dry run).`);
  else {
    await tx.commit();
    console.log(`Klaar: ${aantal} omgezet.`);
  }
}

main();
