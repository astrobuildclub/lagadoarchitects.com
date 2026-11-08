// Eenmalig (9 nov 2026): het blok *Pers of awards* heeft nu zelf een kop en intro (rechterkolom, Figma-persblok).
// Staat er direct vóór een persblok zonder kop een tekstblok met een kop, dan gaan kop en tekst het persblok in
// en verdwijnt het tekstblok. Geldt voor alle pagina's en projecten, gepubliceerd en concept.
// Herhaalbaar: een persblok met een kop wordt overgeslagen.
//
//   npx tsx --env-file-if-exists=.env scripts/sanity/2026-11-09-persblok-intro.ts [--dry-run]
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

type Blok = { _key: string; _type: string; kop?: string; tekst?: unknown[] };
const dryRun = process.argv.includes('--dry-run');

async function main() {
  const docs = await client.fetch<{ _id: string; blocks: Blok[] }[]>(
    `*[count(blocks[_type == "list"]) > 0]{ _id, blocks }`,
    {},
    { perspective: 'raw' },
  );

  const tx = client.transaction();
  let aantal = 0;
  for (const doc of docs) {
    doc.blocks.forEach((blok, i) => {
      const vorige = doc.blocks[i - 1];
      if (blok._type !== 'list' || blok.kop || vorige?._type !== 'textBlock' || !vorige.kop) return;
      console.log(`${doc._id}: "${vorige.kop}" (tekstblok ${vorige._key}) → persblok ${blok._key}`);
      aantal++;
      tx.patch(doc._id, (p) =>
        p
          .set({ [`blocks[_key=="${blok._key}"].kop`]: vorige.kop, ...(vorige.tekst?.length && { [`blocks[_key=="${blok._key}"].intro`]: vorige.tekst }) })
          .unset([`blocks[_key=="${vorige._key}"]`]),
      );
    });
  }

  if (!aantal) console.log('Niets te doen.');
  else if (dryRun) console.log(`${aantal} te verplaatsen (dry run).`);
  else {
    await tx.commit();
    console.log(`Klaar: ${aantal} verplaatst.`);
  }
}

main();
