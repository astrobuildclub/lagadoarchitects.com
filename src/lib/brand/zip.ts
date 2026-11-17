/*
 * Minimale ZIP (alleen opslaan, geen compressie) voor de downloads in de woordmerk-editor. SVG's zijn klein,
 * dus compressie levert weinig op; zo is er geen extra pakket nodig. Opbouw volgens de ZIP-specificatie
 * (APPNOTE): per bestand een local header met de data, daarna de central directory en het eindrecord.
 */
const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(data: Uint8Array) {
  let c = 0xffffffff;
  for (const b of data) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Bestanden (naam → tekst) als ZIP-blob. */
export function zip(bestanden: Record<string, string>): Blob {
  const enc = new TextEncoder();
  const delen: Uint8Array[] = [];
  const centraal: Uint8Array[] = [];
  let offset = 0;

  for (const [naam, tekst] of Object.entries(bestanden)) {
    const n = enc.encode(naam);
    const data = enc.encode(tekst);
    const crc = crc32(data);

    const lokaal = new DataView(new ArrayBuffer(30));
    lokaal.setUint32(0, 0x04034b50, true);
    lokaal.setUint16(4, 20, true); // versie nodig
    lokaal.setUint16(6, 0x0800, true); // namen in UTF-8
    lokaal.setUint32(14, crc, true);
    lokaal.setUint32(18, data.length, true);
    lokaal.setUint32(22, data.length, true);
    lokaal.setUint16(26, n.length, true);
    delen.push(new Uint8Array(lokaal.buffer), n, data);

    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, n.length, true);
    c.setUint32(42, offset, true);
    centraal.push(new Uint8Array(c.buffer), n);

    offset += 30 + n.length + data.length;
  }

  const grootte = centraal.reduce((t, d) => t + d.length, 0);
  const eind = new DataView(new ArrayBuffer(22));
  eind.setUint32(0, 0x06054b50, true);
  eind.setUint16(8, Object.keys(bestanden).length, true);
  eind.setUint16(10, Object.keys(bestanden).length, true);
  eind.setUint32(12, grootte, true);
  eind.setUint32(16, offset, true);

  return new Blob([...delen, ...centraal, new Uint8Array(eind.buffer)] as BlobPart[], { type: 'application/zip' });
}
