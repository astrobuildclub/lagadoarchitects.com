// Eenmalig (11 nov 2026): Contact krijgt het template van Over (bouwstenen). De vaste velden worden blokken:
//   bio (kop, foto, quote) → Beeld naast tekst (beeld links)
//   tekst                  → Tekst
//   (gegevens)             → Contactgegevens
//   stage (kop, tekst)     → Tekst met kop
//   kaart.statischBeeld    → Beeld (feature)
// De oude velden blijven staan: de productiesite (main) leest ze tot de release. Gepubliceerd en concept.
// Herhaalbaar: een Contact-document dat al bouwstenen heeft wordt overgeslagen.
//
//   npx tsx --env-file-if-exists=.env scripts/sanity/2026-11-11-contact-blokken.ts [--dry-run]
import { randomUUID } from 'node:crypto';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'unque637',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

type Rich = unknown[] | undefined;
type Contact = {
  _id: string;
  blocks?: unknown[];
  tekst?: Rich;
  bio?: { kop?: string; foto?: Record<string, unknown>; quote?: Rich };
  stage?: { kop?: string; tekst?: Rich };
  kaart?: { statischBeeld?: Record<string, unknown> };
};

const dryRun = process.argv.includes('--dry-run');
const key = () => randomUUID().replace(/-/g, '').slice(0, 12);
const heeft = (r: Rich) => Array.isArray(r) && r.length > 0;

function blokken(c: Contact) {
  const uit: Record<string, unknown>[] = [];
  if (c.bio && (c.bio.kop || c.bio.foto || heeft(c.bio.quote)))
    uit.push({ _key: key(), _type: 'columns', image: c.bio.foto, beeldPositie: 'links', kop: c.bio.kop, tekst: c.bio.quote, kolommen: false });
  if (heeft(c.tekst)) uit.push({ _key: key(), _type: 'textBlock', niveau: 2, tekst: c.tekst });
  uit.push({ _key: key(), _type: 'contactgegevens' });
  if (c.stage && (c.stage.kop || heeft(c.stage.tekst))) uit.push({ _key: key(), _type: 'textBlock', kop: c.stage.kop, niveau: 2, tekst: c.stage.tekst });
  if (c.kaart?.statischBeeld) uit.push({ _key: key(), _type: 'imageBlock', beeld: c.kaart.statischBeeld, breedte: 'feature' });
  // Lege velden niet meesturen.
  return uit.map((b) => Object.fromEntries(Object.entries(b).filter(([, v]) => v !== undefined)));
}

async function main() {
  const docs = await client.fetch<Contact[]>(`*[_id in ["contact", "drafts.contact"]]`, {}, { perspective: 'raw' });
  const tx = client.transaction();
  let aantal = 0;
  for (const doc of docs) {
    if (doc.blocks?.length) {
      console.log(`${doc._id}: heeft al bouwstenen, overgeslagen.`);
      continue;
    }
    const nieuw = blokken(doc);
    console.log(`${doc._id}: ${nieuw.map((b) => b._type).join(' → ')}`);
    tx.patch(doc._id, (p) => p.set({ blocks: nieuw }));
    aantal++;
  }

  if (!aantal) console.log('Niets te doen.');
  else if (dryRun) console.log(`${aantal} document(en) om te zetten (dry run).`);
  else {
    await tx.commit();
    console.log(`Klaar: ${aantal} document(en) omgezet.`);
  }
}

main();
