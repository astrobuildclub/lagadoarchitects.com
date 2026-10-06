// Maakt neutrale placeholder-jpg's voor beelden die nog niet zijn aangeleverd.
// Bestaande bestanden worden nooit overschreven: echt beeld van Victor blijft staan.
// Gebruik: npm run placeholders
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = new URL('../lagado-content/', import.meta.url).pathname;

const projectHeroes = [
  'workhome-playhome',
  'huis-aan-de-maas',
  'koffiebar-binnenweg',
  'atelier-kralingen',
  'speelplein-zuid',
  'winkel-witte-de-with',
];

/** [pad vanaf lagado-content, breedte, hoogte] */
const files = [
  ...Array.from({ length: 9 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    const portrait = [4, 5, 8].includes(i + 1);
    return [`projecten/images/workhome-playhome/${n}.jpg`, portrait ? 1600 : 2400, portrait ? 2000 : 1600];
  }),
  ...projectHeroes
    .filter((slug) => slug !== 'workhome-playhome')
    .map((slug) => [`projecten/images/${slug}/01.jpg`, 2400, 1600]),
  ['images/bureau/01.jpg', 2400, 1350],
  ['images/bureau/victor.jpg', 1200, 1500],
];

const svg = (w, h, label) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <rect width="100%" height="100%" fill="#d9d6d0"/>
  <path d="M0 0L${w} ${h}M${w} 0L0 ${h}" stroke="#c4c0b8" stroke-width="4"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, sans-serif" font-size="${Math.round(w / 24)}" fill="#6b675f">${label}</text>
</svg>`;

let made = 0;
for (const [rel, w, h] of files) {
  const out = join(root, rel);
  if (existsSync(out)) continue;
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(svg(w, h, `${rel.split('/').slice(-2).join('/')} · ${w}×${h}`)))
    .jpeg({ quality: 70 })
    .toFile(out);
  made++;
}
console.log(`placeholders: ${made} nieuw, ${files.length - made} bestonden al`);
