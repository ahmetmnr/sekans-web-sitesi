// seed.sql'in referans verdiği /docs ve /images dosyalarının diskte (public/) varlığını doğrular.
import { readFileSync, existsSync } from 'node:fs';

const seed = readFileSync('db/seed.sql', 'utf8');
const set = new Set();
// SQL içinde kaçışlı (\") ve düz (') tırnaklı src/href yolları
for (const m of seed.matchAll(/(?:src|href)=\\?"(\/(?:docs|images)\/[^"\\]+)"?/g)) set.add(m[1]);
for (const m of seed.matchAll(/'(\/(?:docs|images)\/[^']+\.(?:pdf|jpg|jpeg|png|gif|webp))'/gi)) set.add(m[1]);

let ok = 0;
const miss = [];
for (const p of set) {
  const dec = decodeURIComponent(p.split('?')[0].split('#')[0]);
  if (existsSync('public' + dec)) ok++;
  else miss.push(dec);
}
console.log(`Toplam benzersiz referans: ${set.size} | bulunan: ${ok} | EKSİK: ${miss.length}`);
miss.slice(0, 20).forEach((p) => console.log('  eksik: ' + p));
if (miss.length > 20) console.log(`  ... ve ${miss.length - 20} tane daha`);
