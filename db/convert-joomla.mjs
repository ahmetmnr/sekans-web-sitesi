// =============================================================================
// Sekans — Canlı Joomla veritabanından yeni şemaya dönüştürücü.
// Kaynak: Docker'daki MariaDB (sekansor_godaddy dökümü, port 13306).
// Çıktı:  db/seed.sql  (schema.sql'den SONRA phpMyAdmin'e import edilir)
//
// KULLANIM:
//   1) docker run -d --name sekans_joomla -p 13306:3306 -e MYSQL_ROOT_PASSWORD=t \
//        -e MYSQL_DATABASE=joomla mariadb:11
//   2) docker exec -i sekans_joomla mariadb -uroot -pt --force joomla \
//        < src/data/old_data/sekansor_godaddy.sql
//   3) node db/convert-joomla.mjs
//
// EŞLEME:
//   E-Sayılar (catid 27)        -> sayilar + yazilar (içindekiler tablosu ayrıştırılır;
//                                  her yazı = başlık + yazar + PDF, HTML metin yok)
//   ARA YAZILAR (42,45)         -> ara_yazilar  kategori: "Ara Yazı"
//   Yazarlarımızdan (34)        -> ara_yazilar  kategori: "Yazarlarımızdan"
//   Sinema Kitaplığı (39)       -> ara_yazilar  kategori: "Sinema Kitaplığı"
//   Duyurular (35)              -> ara_yazilar  kategori: "Duyuru"
//   Basılı Sayılar (36)         -> ara_yazilar  kategori: "Basılı Sayılar"
//   Sekans Sinema Grubu (32,33) -> ara_yazilar  kategori: "Sekans Sinema Grubu"
//   Archive (44), Alt Yazılar (43) -> ara_yazilar kategori: "Arşiv Yazıları"
//   Yazar adları (TOC + created_by_alias + teaser) -> yazarlar
// =============================================================================
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import mysql from 'mysql2/promise';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- yardımcılar -------------------------------------------------------------
const q = (v) => {
  if (v === undefined || v === null) return 'NULL';
  if (typeof v === 'number') return String(v);
  const s = String(v)
    .replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    .replace(/\n/g, '\\n').replace(/\r/g, '\\r')
    .replace(/\x00/g, '\\0').replace(/\x1a/g, '\\Z');
  return `'${s}'`;
};
const slugify = (s) =>
  s.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// mysql2 DATETIME'ı JS Date olarak döndürür; ISO YYYY-MM-DD'ye çevir.
const isoDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

const stripTags = (html) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&ccedil;/g, 'ç').replace(/&Ccedil;/g, 'Ç')
    .replace(/&ouml;/g, 'ö').replace(/&Ouml;/g, 'Ö')
    .replace(/&uuml;/g, 'ü').replace(/&Uuml;/g, 'Ü')
    .replace(/&scedil;/g, 'ş').replace(/&Scedil;/g, 'Ş')
    .replace(/&igrave;|&icirc;/g, 'î')
    .replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&hellip;/g, '...')
    .replace(/\s+/g, ' ').trim();

// Joomla göreli yollarını mutlaklaştır: src="images/... -> src="/images/...
const absolutize = (html) =>
  (html || '')
    .replace(/(src|href)="images\//g, '$1="/images/')
    .replace(/(src|href)="docs\//g, '$1="/docs/')
    // ölü blob: img'lerini at
    .replace(/<img[^>]+src="blob:[^"]*"[^>]*\/?>/g, '');

const TR_AYLAR = {
  'ocak': 1, 'şubat': 2, 'subat': 2, 'mart': 3, 'nisan': 4, 'mayıs': 5, 'mayis': 5,
  'haziran': 6, 'temmuz': 7, 'ağustos': 8, 'agustos': 8, 'eylül': 9, 'eylul': 9,
  'ekim': 10, 'kasım': 11, 'kasim': 11, 'aralık': 12, 'aralik': 12,
};
const ayBuyukHarf = (ay) => ay.charAt(0).toLocaleUpperCase('tr-TR') + ay.slice(1).toLocaleLowerCase('tr-TR');

// "MART 2026 | Sayı e28" ve TERS biçim "Odak: David Lynch | Şubat 2026" başlıklarını çöz
function parseSayiTitle(title) {
  const t = stripTags(title);
  let ayRaw, yil, rest;
  let m = t.match(/^([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})\s*\|\s*(.*)$/);
  if (m) {
    [, ayRaw, , rest] = m;
    yil = parseInt(m[2], 10);
  } else {
    // ters biçim: "X | AY YYYY"
    m = t.match(/^(.*)\|\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(\d{4})\s*$/);
    if (!m) return null;
    rest = m[1].trim();
    ayRaw = m[2];
    yil = parseInt(m[3], 10);
  }
  const ay = ayBuyukHarf(ayRaw);
  const num = rest.match(/Sayı\s+(e\d+)/i);
  return {
    ay, yil,
    numara: num ? num[1].toLowerCase() : rest, // özel sayılarda ("Odak: David Lynch") metin
    tamBaslik: `${ay} ${yil} | ${rest}`,
    ayNo: TR_AYLAR[ayRaw.toLocaleLowerCase('tr-TR')] || 1,
  };
}

// Türkçe lowercase'in yabancı isimlerde yarattığı hasarı onar (I->ı sorunu)
const KELIME_ONARIM = {
  'davıd': 'David', 'campıon': 'Campion', 'vıdeo': 'Video',
  'cronenberg': 'Cronenberg', 'kuır': 'Kuir',
};

// Başlık büyük/küçük normalize: "ELEŞTİRİ" -> "Eleştiri", "SİNEMA VE MİMARLIK" -> "Sinema ve Mimarlık"
function kategoriNormalize(s) {
  const kucukKal = new Set(['ve', 'ile', 'bir', 'da', 'de']);
  return stripTags(s)
    .toLocaleLowerCase('tr-TR')
    .split(' ')
    .filter(Boolean)
    .map((w, i) => {
      if (KELIME_ONARIM[w]) return KELIME_ONARIM[w];
      if (i > 0 && kucukKal.has(w)) return w;
      // tire sonrası da büyüt: sine-anlatı -> Sine-Anlatı
      return w.split('-').map((p) => p ? p.charAt(0).toLocaleUpperCase('tr-TR') + p.slice(1) : p).join('-');
    })
    .join(' ');
}

// Aynı kategorinin yazım varyantlarını tek isme indirger.
const KATEGORI_ALIAS = {
  'kuramyorum': 'Kuram / Yorum',
  '50yasinda': '50 Yaşında',
  '100yasinda': '100 Yaşında',
  'aninostalji': 'Anı / Nostalji',
  'kisa': 'Kısa Film',
  'tur': 'Tür Sineması',
};
function kategoriKanonik(ad) {
  const key = slugify(ad).replace(/-/g, '');
  return KATEGORI_ALIAS[key] || ad;
}

// --- İçindekiler tablosu ayrıştırıcı -----------------------------------------
// Desen (tüm yıllarda ortak): 11pt = bölüm başlığı; 10pt+<strong> = yazı başlığı
// (PDF bağlantısı aynı satırda); sonraki 9-10pt strong'suz kısa satır = yazar.
const SKIP_HEADERS = /KAPAK|KÜNYE|İÇİNDEKİLER|ICINDEKILER|ÖNSÖZ|ONSOZ|DUYURU|SUNUŞ/i;

function parseIssueHtml(html) {
  const out = { kapak: null, tamPdf: null, yazilar: [] };

  // Kapak: blob olmayan ilk <img>
  for (const m of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    if (!m[1].startsWith('blob:')) { out.kapak = m[1]; break; }
  }
  // Tam PDF: "Tüm sayıyı" metninden sonraki ilk .pdf href
  const tamIdx = html.search(/Tüm sayıyı/i);
  if (tamIdx >= 0) {
    const after = html.slice(tamIdx);
    const pdfM = after.match(/href="([^"]+\.pdf[^"]*)"/i);
    if (pdfM) out.tamPdf = pdfM[1];
  }

  // Satırları gez
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  let currentKategori = null;
  let lastYazi = null;

  for (const row of rows) {
    const text = stripTags(row);
    if (!text) { lastYazi = null; continue; }
    const pdfM = row.match(/href="([^"]+\.pdf[^"]*)"/i);
    const is11 = /font-size:\s*11pt/.test(row);
    const hasStrong = /<strong/.test(row);

    if (is11 && !hasStrong) {
      // bölüm başlığı (KAPAK/İÇİNDEKİLER/ÖNSÖZ gibi özel satırlar atlanır)
      if (!SKIP_HEADERS.test(text)) currentKategori = kategoriNormalize(text);
      lastYazi = null;
      continue;
    }
    if (hasStrong && pdfM) {
      // yazı başlığı + PDF. Başlık birden çok <strong> bloğuna yayılabilir.
      const strongParts = [...row.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/g)].map((m) => stripTags(m[1]));
      const baslik = strongParts.join(' ').replace(/\s+/g, ' ').trim() || text;
      // Aynı hücrede yazar olabilir (Lynch özel sayısı): strong blokları çıkar, kalan metin yazar.
      const kalan = stripTags(row.replace(/<strong[^>]*>[\s\S]*?<\/strong>/g, '').replace(/href="[^"]*"/g, ''))
        .replace(/\b(PDF|HTML)\b/g, '').trim();
      const ayniSatirYazar = kalan.length > 2 && kalan.length < 90 ? kalan : null;
      lastYazi = { baslik, kategori: currentKategori, pdf: pdfM[1], yazar: ayniSatirYazar };
      out.yazilar.push(lastYazi);
      if (ayniSatirYazar) lastYazi = null; // yazar bulundu, sonraki satıra bakma
      continue;
    }
    if (lastYazi && !hasStrong && !is11 && !pdfM && text.length > 2 && text.length < 90) {
      // yazar satırı
      lastYazi.yazar = text;
      lastYazi = null;
    }
  }
  return out;
}

// "Geoffrey Nowell-Smith / Çeviren: X" -> ana yazar adı
const yazarTemizle = (s) => stripTags(s).split(/\s*\/\s*Çeviren/i)[0].split(/\s*\/\s*Cev/i)[0].trim();

// --- ana akış ----------------------------------------------------------------
const conn = await mysql.createConnection({
  host: '127.0.0.1', port: 13306, user: 'root', password: 't', database: 'joomla',
  charset: 'utf8mb4',
});

const [contentRows] = await conn.execute(
  `SELECT id, title, alias, catid, state, introtext, \`fulltext\` AS fulltextRaw,
          created, created_by_alias, images
   FROM az8hb_content WHERE state = 1`
);
await conn.end();

const byCat = (ids) => contentRows.filter((r) => ids.includes(r.catid));

// ---------- 1) Yazar kayıt defteri ----------
const yazarMap = new Map(); // tam ad -> {id, ad, soyad}
let yazarSeq = 0;
function yazarEkle(tamAdRaw) {
  const tamAd = yazarTemizle(tamAdRaw || '');
  if (!tamAd || tamAd.length < 3) return null;
  if (yazarMap.has(tamAd)) return yazarMap.get(tamAd);
  const parts = tamAd.split(/\s+/);
  const soyad = parts.length > 1 ? parts[parts.length - 1] : '';
  const ad = parts.length > 1 ? parts.slice(0, -1).join(' ') : tamAd;
  const y = { id: ++yazarSeq, ad, soyad, tamAd };
  yazarMap.set(tamAd, y);
  return y;
}
const SEKANS_YAZAR = yazarEkle('Sekans Dergi'); // yazarı bilinmeyenler için

// ---------- 2) Kategori kayıt defteri ----------
const katMap = new Map(); // ad -> id
let katSeq = 0;
function katEkle(adRaw) {
  if (!adRaw) return null;
  const ad = kategoriKanonik(adRaw);
  if (katMap.has(ad)) return katMap.get(ad);
  const id = ++katSeq;
  katMap.set(ad, id);
  return id;
}

// ---------- 3) Sayılar (E-Sayılar catid=27) ----------
const issueRows = byCat([27])
  .filter((r) => !/son-sayi/.test(r.alias)) // e28'in "son sayı" kopyası -> atla (340 kalır)
  .map((r) => ({ row: r, meta: parseSayiTitle(r.title) }))
  .filter((x) => x.meta);

// numara'ya göre tekille (en son created kazanır)
const issueByNum = new Map();
for (const x of issueRows) {
  const k = x.meta.numara;
  if (!issueByNum.has(k) || new Date(x.row.created) > new Date(issueByNum.get(k).row.created)) {
    issueByNum.set(k, x);
  }
}
const issues = [...issueByNum.values()]
  .map((x) => ({ ...x, tarih: `${x.meta.yil}-${String(x.meta.ayNo).padStart(2, '0')}-01` }))
  .sort((a, b) => a.tarih.localeCompare(b.tarih));

// en yeni sayı aktif
const currentIssue = issues[issues.length - 1];

let sayiSeq = 0, yaziSeq = 0;
const sayilarOut = [];
const yazilarOut = [];
const issueStats = [];

for (const iss of issues) {
  const sid = ++sayiSeq;
  const parsed = parseIssueHtml(iss.row.introtext);
  const code = /^e\d+$/.test(iss.meta.numara) ? iss.meta.numara : slugify(iss.meta.tamBaslik);
  const isCurrent = iss === currentIssue ? 1 : 0;
  sayilarOut.push({
    id: sid, code,
    numara: /^e\d+$/.test(iss.meta.numara) ? iss.meta.numara : 'özel',
    ay: iss.meta.ay, yil: iss.meta.yil, tamBaslik: iss.meta.tamBaslik,
    kapak: parsed.kapak ? (parsed.kapak.startsWith('/') ? parsed.kapak : '/' + parsed.kapak) : '',
    pdf: parsed.tamPdf || '', isCurrent, tarih: iss.tarih,
  });
  let sira = 0;
  for (const yz of parsed.yazilar) {
    const yzId = ++yaziSeq;
    const yazar = yazarEkle(yz.yazar) || SEKANS_YAZAR;
    // kategori başlığı olmayan sayılarda (örn. Odak özel sayısı) 'Yazı' fallback'i
    const katId = katEkle(yz.kategori || 'Yazı');
    yazilarOut.push({
      id: yzId, code: `${code}-${String(++sira).padStart(2, '0')}`,
      slug: slugify(yz.baslik).slice(0, 180) + '-' + yzId,
      baslik: yz.baslik, yazarId: yazar.id, katId, sayiId: sid, sira,
      pdf: yz.pdf.startsWith('/') ? yz.pdf : '/' + yz.pdf, tarih: iss.tarih,
    });
  }
  issueStats.push(`${code}: ${sira} yazı${isCurrent ? ' (AKTİF)' : ''}`);
}

// ---------- 4) Ara yazılar + yeni bölümler ----------
const SECTION_MAP = [
  { catids: [42, 45], kategori: 'Ara Yazı' },
  { catids: [34],     kategori: 'Yazarlarımızdan' },
  { catids: [39],     kategori: 'Sinema Kitaplığı' },
  { catids: [35],     kategori: 'Duyuru' },
  { catids: [36],     kategori: 'Basılı Sayılar' },
  { catids: [32, 33], kategori: 'Sekans Sinema Grubu' },
  { catids: [43, 44], kategori: 'Arşiv Yazıları' },
];

// "--baslik" kart kopyaları: alias -> yazar adı çıkarımı için indeks
const teaserByAlias = new Map();
for (const r of byCat([42, 45])) {
  if (/bask?lik|başlık/i.test(r.title)) {
    const target = r.alias.replace(/-bask?lik$/i, '').replace(/-başlık$/i, '');
    const strongM = r.introtext.match(/<strong[^>]*>([\s\S]*?)<\/strong>/);
    if (strongM) teaserByAlias.set(target, stripTags(strongM[1]));
  }
}

let araSeq = 0;
const araOut = [];
const usedSlugs = new Set();
const sectionStats = new Map();

for (const sec of SECTION_MAP) {
  let count = 0;
  for (const r of byCat(sec.catids)) {
    if (/--\s*bask?lik|--\s*başlık/i.test(r.title)) continue; // kart kopyası
    const id = ++araSeq;
    const icerikHtml = absolutize((r.introtext || '') + (r.fulltextRaw || ''));
    // yazar: created_by_alias > teaser eşleşmesi > Sekans
    const yazarAdi = r.created_by_alias?.trim() || teaserByAlias.get(r.alias) || '';
    const yazar = yazarEkle(yazarAdi) || SEKANS_YAZAR;
    // kapak: images JSON'daki image_intro > içerikteki ilk img
    let kapak = null;
    try {
      const imgs = JSON.parse(r.images || '{}');
      kapak = imgs.image_intro || imgs.image_fulltext || null;
    } catch { /* yoksay */ }
    if (!kapak) kapak = icerikHtml.match(/<img[^>]+src="([^"]+)"/)?.[1] || null;
    if (kapak && !kapak.startsWith('/') && !kapak.startsWith('http')) kapak = '/' + kapak;
    // spot: ilk paragraf metni
    const pM = icerikHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const spot = pM ? stripTags(pM[1]).slice(0, 220) : '';

    let slug = slugify(stripTags(r.title)).slice(0, 180) || `yazi-${id}`;
    while (usedSlugs.has(slug)) slug = `${slug}-${id}`;
    usedSlugs.add(slug);

    araOut.push({
      id, code: `ay-j${r.id}`, slug,
      baslik: stripTags(r.title), spot, icerik: icerikHtml,
      yazarId: yazar.id, katAd: sec.kategori, katId: katEkle(sec.kategori),
      kapak, tarih: isoDate(r.created),
    });
    count++;
  }
  sectionStats.set(sec.kategori, count);
}

// ---------- 5) seed.sql üret ----------
const out = [];
out.push('-- Generated by db/convert-joomla.mjs — CANLI Joomla verisinden. schema.sql sonrasi import edin.');
out.push('SET NAMES utf8mb4;');
out.push('SET FOREIGN_KEY_CHECKS = 0;');
out.push('START TRANSACTION;');
out.push('');

out.push('-- yazarlar');
for (const y of yazarMap.values()) {
  const slug = slugify(y.tamAd) || `yazar-${y.id}`;
  out.push(
    `INSERT INTO yazarlar (id, code, ad, soyad, tam_ad, slug, fotograf, biyografi) VALUES ` +
    `(${y.id}, ${q(String(y.id))}, ${q(y.ad)}, ${q(y.soyad)}, ${q(y.tamAd)}, ${q(slug + '-' + y.id)}, NULL, NULL);`
  );
}
out.push('');

out.push('-- kategoriler');
for (const [ad, id] of katMap.entries()) {
  out.push(
    `INSERT INTO kategoriler (id, code, ad, slug, sira_no) VALUES ` +
    `(${id}, ${q(String(id))}, ${q(ad)}, ${q(slugify(ad) || 'kat-' + id)}, ${id});`
  );
}
out.push('');

out.push('-- sayilar');
for (const s of sayilarOut) {
  out.push(
    `INSERT INTO sayilar (id, code, numara, ay, yil, tam_baslik, kapak_gorseli, pdf_url, kunye, onsoz, is_current, yayin_tarihi) VALUES ` +
    `(${s.id}, ${q(s.code)}, ${q(s.numara)}, ${q(s.ay)}, ${s.yil}, ${q(s.tamBaslik)}, ${q(s.kapak)}, ${q(s.pdf)}, NULL, NULL, ${s.isCurrent}, ${q(s.tarih)});`
  );
}
out.push('');

out.push('-- yazilar (sayi icindekiler: baslik + yazar + PDF)');
for (const y of yazilarOut) {
  out.push(
    `INSERT INTO yazilar (id, code, slug, baslik, spot, icerik, yazar_id, kategori_id, sayi_id, sira_no, pdf_url, kapak_gorseli, yayin_tarihi) VALUES ` +
    `(${y.id}, ${q(y.code)}, ${q(y.slug)}, ${q(y.baslik)}, NULL, NULL, ${y.yazarId}, ${y.katId ?? 'NULL'}, ${y.sayiId}, ${y.sira}, ${q(y.pdf)}, NULL, ${q(y.tarih)});`
  );
}
out.push('');

out.push('-- ara_yazilar (Ara Yazi + Yazarlarimizdan + Sinema Kitapligi + Duyuru + Basili Sayilar + ...)');
for (const a of araOut) {
  out.push(
    `INSERT INTO ara_yazilar (id, code, slug, baslik, spot, icerik, yazar_id, kategori_id, kategori_ad, kapak_gorseli, yayin_tarihi) VALUES ` +
    `(${a.id}, ${q(a.code)}, ${q(a.slug)}, ${q(a.baslik)}, ${q(a.spot)}, ${q(a.icerik)}, ` +
    `${a.yazarId}, ${a.katId}, ${q(a.katAd)}, ${q(a.kapak)}, ${q(a.tarih)});`
  );
}
out.push('');

// Yarışma + Hakkımızda: canlı sitede yapılandırılmış karşılığı yok; mevcut metinler korunur.
out.push('-- yarisma_bilgi / hakkimizda (varsayilan metinler — CMS uzerinden duzenlenebilir)');
out.push(`INSERT INTO yarisma_bilgi (id, baslik, aciklama) VALUES (1, 'Film Eleştirisi ve Film Çözümlemesi Yarışması', 'Sekans Sinema Grubu tarafından düzenlenen yarışma hakkında güncel bilgi için Duyurular bölümüne bakınız.') ON DUPLICATE KEY UPDATE baslik = VALUES(baslik), aciklama = VALUES(aciklama);`);
out.push(`INSERT INTO hakkimizda (id, baslik, icerik, iletisim_email, iletisim_adres, sosyal_twitter, sosyal_instagram, sosyal_facebook) VALUES (1, 'Sekans Sinema Grubu', 'Sekans Sinema Grubu, sinema kültürünü yaymayı ve sinema üzerine eleştirel düşünceyi geliştirmeyi amaçlayan bir kolektiftir.', 'info@sekans.org', 'Ankara, Türkiye', '', '', '') ON DUPLICATE KEY UPDATE baslik = VALUES(baslik);`);
out.push('');
out.push(`INSERT INTO ayarlar (anahtar, deger) VALUES ('openai_model', 'gpt-4o-mini') ON DUPLICATE KEY UPDATE deger = VALUES(deger);`);
out.push('');
out.push('COMMIT;');
out.push('SET FOREIGN_KEY_CHECKS = 1;');
out.push('');

writeFileSync(resolve(__dirname, 'seed.sql'), out.join('\n'), 'utf8');

// ---------- rapor ----------
console.log('=== SAYILAR ===');
issueStats.forEach((s) => console.log('  ' + s));
console.log(`Toplam: ${sayilarOut.length} sayı, ${yazilarOut.length} yazı`);
console.log('=== BÖLÜMLER (ara_yazilar) ===');
for (const [k, v] of sectionStats.entries()) console.log(`  ${k}: ${v}`);
console.log(`Toplam ara_yazilar: ${araOut.length}`);
console.log(`Yazarlar: ${yazarMap.size}, Kategoriler: ${katMap.size}`);
console.log('db/seed.sql yazıldı.');
