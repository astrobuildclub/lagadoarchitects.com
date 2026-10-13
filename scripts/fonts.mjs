// Zorgt dat de gelicenseerde webfonts in public/fonts/ staan.
// Ze staan bewust niet in git: de Dinamo-licentie verbiedt fonts in publieke repositories.
//
// Bron (in deze volgorde):
// 1. Al aanwezig in public/fonts/ → niets te doen.
// 2. FONTS_URL (+ optioneel FONTS_TOKEN) → per bestand downloaden van `${FONTS_URL}/<bestand>`.
//    Bijvoorbeeld een privé GitHub-repo via raw.githubusercontent.com met een read-only token.
// 3. Niets gevonden: lokaal een waarschuwing (fallback-fonts), op Netlify een bouwfout.
import { access, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const FILES = ['ABCArealVariable.woff2', 'ABCArealMonoVariable.woff2'];
const dir = join(import.meta.dirname, '..', 'public', 'fonts');
const { FONTS_URL, FONTS_TOKEN, NETLIFY } = process.env;

const exists = (f) => access(join(dir, f)).then(() => true, () => false);
const missing = (await Promise.all(FILES.map(async (f) => ((await exists(f)) ? null : f)))).filter(Boolean);

if (missing.length === 0) process.exit(0);

if (FONTS_URL) {
  await mkdir(dir, { recursive: true });
  for (const f of missing) {
    const res = await fetch(`${FONTS_URL.replace(/\/$/, '')}/${f}`, {
      headers: FONTS_TOKEN ? { Authorization: `Bearer ${FONTS_TOKEN}` } : {},
    });
    if (!res.ok) {
      console.error(`[fonts] ${f}: HTTP ${res.status}`);
      process.exit(1);
    }
    await writeFile(join(dir, f), Buffer.from(await res.arrayBuffer()));
    console.log(`[fonts] ${f} opgehaald`);
  }
  process.exit(0);
}

const msg = `[fonts] Ontbreekt in public/fonts/: ${missing.join(', ')}. Zet FONTS_URL (zie README).`;
if (NETLIFY) {
  console.error(msg);
  process.exit(1);
}
console.warn(`${msg} Site valt terug op systeemfonts.`);
