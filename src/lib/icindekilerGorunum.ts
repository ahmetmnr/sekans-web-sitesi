/**
 * İÇİNDEKİLER GÖRÜNÜM AYARLARI — tek kaynak.
 *
 * Neden var: sekiz revizyon turunun büyük kısmı punto/renk/kalınlık/girinti
 * ayarıydı. Her biri kod değişikliği + derleme + dağıtım demekti. "Kategori
 * puntosu bir kademe büyüsün" için bu döngüyü çevirmek anlamsız; bu ayarlar
 * artık yönetim panelinden yapılır.
 *
 * KURAL: her metin öğesinin AYNI üç kontrolü vardır — punto, renk, kalınlık.
 * Öğeye özgü ek ayarlar (kategori satırında harf aralığı, dizin görselinde
 * genişlik, girintilerde kademe) bunların üstüne eklenir.
 *
 * KADEMELİ, serbest DEĞİL. Her ayarın 3-5 hazır kademesi vardır; aradaki
 * değerler girilemez. Sebebi:
 *   • Her kademe masaüstü ve mobilde denenmiştir; bozuk sonuç üretilemez.
 *   • Yazı editöründeki stil ölçeğiyle aynı mantık (punto stile bağlıdır,
 *     serbest değildir) — site genelinde tutarlılık korunur.
 *   • Okunmaz kontrast ya da taşan başlık üretmek mümkün olmaz.
 *
 * Değerler CSS DEĞİŞKENİ olarak :root'a yazılır; index.css'teki .ic-* kuralları
 * bunları okur. Böylece hem site hem de paneldeki canlı önizleme AYNI sayıları
 * kullanır — önizlemede görülen, yayında çıkanla birebir aynıdır.
 *
 * Punto değerleri MOBİL tabandır. Masaüstünde (>=768px) index.css sabit bir
 * çarpanla büyütür; böylece tek ayar iki ekranı birden yönetir ve bugünkü
 * duyarlı davranış korunur.
 */

export type PuntoKademe = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RenkKademe = 'soluk' | 'koyu' | 'siyah';
export type KalinlikKademe = 'ince' | 'normal' | 'yari' | 'kalin';
export type GenislikKademe = 'kucuk' | 'orta' | 'buyuk';
export type GirintiKademe = 'yok' | 'az' | 'orta' | 'cok';
export type AralikKademe = 'dar' | 'normal' | 'genis';

export interface IcindekilerGorunum {
  // Kategori satırı
  kategoriPunto: PuntoKademe;
  kategoriRenk: RenkKademe;
  kategoriKalinlik: KalinlikKademe;
  kategoriAralik: AralikKademe;
  // Yazı başlığı
  baslikPunto: PuntoKademe;
  baslikRenk: RenkKademe;
  baslikKalinlik: KalinlikKademe;
  // Yazar adı
  yazarPunto: PuntoKademe;
  yazarRenk: RenkKademe;
  yazarKalinlik: KalinlikKademe;
  // Spot (yalnızca sayı sayfasında)
  spotPunto: PuntoKademe;
  spotRenk: RenkKademe;
  spotKalinlik: KalinlikKademe;
  // Düzen
  gorselGenislik: GenislikKademe;
  girinti: GirintiKademe;
}

/** Bugünkü görünüm. Hiçbir ayar yapılmazsa site aynen böyle kalır. */
export const VARSAYILAN_GORUNUM: IcindekilerGorunum = {
  kategoriPunto: 'sm',
  kategoriRenk: 'soluk',
  kategoriKalinlik: 'normal',
  kategoriAralik: 'normal',
  baslikPunto: 'md',
  baslikRenk: 'siyah',
  baslikKalinlik: 'yari',
  yazarPunto: 'md',
  yazarRenk: 'siyah',
  yazarKalinlik: 'ince',
  spotPunto: 'md',
  spotRenk: 'soluk',
  spotKalinlik: 'ince',
  gorselGenislik: 'orta',
  girinti: 'orta',
};

/* --------------------------------------------------------------------------
   KADEME TABLOLARI — kademe -> (CSS değeri, panelde görünen ad)
   -------------------------------------------------------------------------- */

export type KademeTablosu = Record<string, { deger: string; ad: string }>;

/** Kategori satırı puntosu (mobil taban). Varsayılan 0.75rem = bugünkü. */
export const KATEGORI_PUNTO: KademeTablosu = {
  xs: { deger: '0.6875rem', ad: 'Çok küçük' },
  sm: { deger: '0.75rem', ad: 'Küçük' },
  md: { deger: '0.8125rem', ad: 'Orta' },
  lg: { deger: '0.875rem', ad: 'Büyük' },
  xl: { deger: '0.9375rem', ad: 'Çok büyük' },
};

/** Yazı başlığı puntosu (mobil taban). Varsayılan 1.125rem = bugünkü. */
export const BASLIK_PUNTO: KademeTablosu = {
  xs: { deger: '0.9375rem', ad: 'Çok küçük' },
  sm: { deger: '1rem', ad: 'Küçük' },
  md: { deger: '1.125rem', ad: 'Orta' },
  lg: { deger: '1.25rem', ad: 'Büyük' },
  xl: { deger: '1.375rem', ad: 'Çok büyük' },
};

/** Yazar adı puntosu. Varsayılan 0.875rem = bugünkü. */
export const YAZAR_PUNTO: KademeTablosu = {
  xs: { deger: '0.75rem', ad: 'Çok küçük' },
  sm: { deger: '0.8125rem', ad: 'Küçük' },
  md: { deger: '0.875rem', ad: 'Orta' },
  lg: { deger: '0.9375rem', ad: 'Büyük' },
  xl: { deger: '1rem', ad: 'Çok büyük' },
};

/** Spot puntosu (yalnızca sayı sayfasında görünür). */
export const SPOT_PUNTO: KademeTablosu = {
  xs: { deger: '0.75rem', ad: 'Çok küçük' },
  sm: { deger: '0.8125rem', ad: 'Küçük' },
  md: { deger: '0.875rem', ad: 'Orta' },
  lg: { deger: '0.9375rem', ad: 'Büyük' },
  xl: { deger: '1rem', ad: 'Çok büyük' },
};

/** Metin renkleri — tema değişkenlerine bağlı, kontrast garanti. */
export const RENK: KademeTablosu = {
  soluk: { deger: 'hsl(var(--muted-foreground))', ad: 'Soluk gri' },
  koyu: { deger: '#4b5563', ad: 'Koyu gri' },
  siyah: { deger: 'hsl(var(--foreground))', ad: 'Siyah' },
};

/**
 * Kalınlık. Cormorant Garamond'un hem düz hem İTALİK kademeleri yüklü
 * olduğu için italik kısımlar (film adları) da gerçek dosyadan gelir;
 * tarayıcı taklidi yapılmaz.
 */
export const KALINLIK: KademeTablosu = {
  ince: { deger: '400', ad: 'İnce' },
  normal: { deger: '500', ad: 'Normal' },
  yari: { deger: '600', ad: 'Yarı kalın' },
  kalin: { deger: '700', ad: 'Kalın' },
};

/** Kategori satırında harf aralığı. */
export const ARALIK: KademeTablosu = {
  dar: { deger: '0.025em', ad: 'Dar' },
  normal: { deger: '0.05em', ad: 'Normal' },
  genis: { deger: '0.1em', ad: 'Geniş' },
};

/** Dizin görseli kolon genişliği (mobil taban). Oran 2:1 sabit kalır. */
export const GORSEL_GENISLIK: KademeTablosu = {
  kucuk: { deger: '7rem', ad: 'Küçük' },
  orta: { deger: '8rem', ad: 'Orta' },
  buyuk: { deger: '9rem', ad: 'Büyük' },
};

/**
 * Girinti birimi. Başlık 1 birim, yazar adı 2 birim içeriden yazılır
 * (kademeli girinti — [4] maddesindeki "adım adım içeri" kuralı).
 */
export const GIRINTI: KademeTablosu = {
  yok: { deger: '0rem', ad: 'Yok (hizalı)' },
  az: { deger: '0.5rem', ad: 'Az' },
  orta: { deger: '0.75rem', ad: 'Orta' },
  cok: { deger: '1.125rem', ad: 'Çok' },
};

/* --------------------------------------------------------------------------
   PANEL ALANLARI — bölüm bölüm, her metin öğesinde aynı üç kontrol
   -------------------------------------------------------------------------- */

export interface AyarAlani {
  alan: keyof IcindekilerGorunum;
  etiket: string;
  tablo: KademeTablosu;
}
export interface AyarBolumu {
  bolum: string;
  aciklama: string;
  alanlar: AyarAlani[];
}

export const AYAR_BOLUMLERI: AyarBolumu[] = [
  {
    bolum: 'Kategori satırı',
    aciklama: 'Yazı başlığının üstündeki “DOSYA: …” satırı.',
    alanlar: [
      { alan: 'kategoriPunto', etiket: 'Punto', tablo: KATEGORI_PUNTO },
      { alan: 'kategoriRenk', etiket: 'Renk', tablo: RENK },
      { alan: 'kategoriKalinlik', etiket: 'Kalınlık', tablo: KALINLIK },
      { alan: 'kategoriAralik', etiket: 'Harf aralığı', tablo: ARALIK },
    ],
  },
  {
    bolum: 'Yazı başlığı',
    aciklama: 'İçindekilerdeki yazı adı. Film adlarının italiği bundan etkilenmez.',
    alanlar: [
      { alan: 'baslikPunto', etiket: 'Punto', tablo: BASLIK_PUNTO },
      { alan: 'baslikRenk', etiket: 'Renk', tablo: RENK },
      { alan: 'baslikKalinlik', etiket: 'Kalınlık', tablo: KALINLIK },
    ],
  },
  {
    bolum: 'Yazar adı',
    aciklama: 'Başlığın altındaki yazar satırı.',
    alanlar: [
      { alan: 'yazarPunto', etiket: 'Punto', tablo: YAZAR_PUNTO },
      { alan: 'yazarRenk', etiket: 'Renk', tablo: RENK },
      { alan: 'yazarKalinlik', etiket: 'Kalınlık', tablo: KALINLIK },
    ],
  },
  {
    bolum: 'Spot',
    aciklama: 'Yalnızca sayı sayfasındaki içindekilerde görünür.',
    alanlar: [
      { alan: 'spotPunto', etiket: 'Punto', tablo: SPOT_PUNTO },
      { alan: 'spotRenk', etiket: 'Renk', tablo: RENK },
      { alan: 'spotKalinlik', etiket: 'Kalınlık', tablo: KALINLIK },
    ],
  },
  {
    bolum: 'Düzen',
    aciklama: 'Dizin görselinin genişliği ve girinti kademesi.',
    alanlar: [
      { alan: 'gorselGenislik', etiket: 'Dizin görseli genişliği', tablo: GORSEL_GENISLIK },
      { alan: 'girinti', etiket: 'Girinti miktarı', tablo: GIRINTI },
    ],
  },
];

/** Alan -> kademe tablosu (doğrulama ve panel için tek arama noktası). */
const ALAN_TABLOSU: Record<keyof IcindekilerGorunum, KademeTablosu> = {
  kategoriPunto: KATEGORI_PUNTO,
  kategoriRenk: RENK,
  kategoriKalinlik: KALINLIK,
  kategoriAralik: ARALIK,
  baslikPunto: BASLIK_PUNTO,
  baslikRenk: RENK,
  baslikKalinlik: KALINLIK,
  yazarPunto: YAZAR_PUNTO,
  yazarRenk: RENK,
  yazarKalinlik: KALINLIK,
  spotPunto: SPOT_PUNTO,
  spotRenk: RENK,
  spotKalinlik: KALINLIK,
  gorselGenislik: GORSEL_GENISLIK,
  girinti: GIRINTI,
};

/**
 * Ayarları CSS değişkenlerine çevir.
 *
 * Site açılışında :root'a, panelde ise önizleme kutusuna uygulanır — ikisi de
 * aynı işlevi kullandığı için önizleme yayınla birebir aynıdır.
 */
export function gorunumDegiskenleri(g: IcindekilerGorunum): Record<string, string> {
  const d = (alan: keyof IcindekilerGorunum) => ALAN_TABLOSU[alan][g[alan]].deger;
  return {
    '--ic-kategori-punto': d('kategoriPunto'),
    '--ic-kategori-renk': d('kategoriRenk'),
    '--ic-kategori-kalinlik': d('kategoriKalinlik'),
    '--ic-kategori-aralik': d('kategoriAralik'),
    '--ic-baslik-punto': d('baslikPunto'),
    '--ic-baslik-renk': d('baslikRenk'),
    '--ic-baslik-kalinlik': d('baslikKalinlik'),
    '--ic-yazar-punto': d('yazarPunto'),
    '--ic-yazar-renk': d('yazarRenk'),
    '--ic-yazar-kalinlik': d('yazarKalinlik'),
    '--ic-spot-punto': d('spotPunto'),
    '--ic-spot-renk': d('spotRenk'),
    '--ic-spot-kalinlik': d('spotKalinlik'),
    '--ic-gorsel-genislik': d('gorselGenislik'),
    '--ic-girinti': d('girinti'),
  };
}

/** Değişkenleri belgenin köküne uygula (site açılışı / ayar kaydı sonrası). */
export function gorunumuUygula(g: IcindekilerGorunum): void {
  if (typeof document === 'undefined') return;
  const kok = document.documentElement;
  for (const [ad, deger] of Object.entries(gorunumDegiskenleri(g))) {
    kok.style.setProperty(ad, deger);
  }
}

/**
 * Sunucudan gelen (ya da eski/eksik) veriyi güvenli hâle getir.
 * Tanınmayan kademe varsayılana düşer — bozuk ayar siteyi bozmaz.
 */
export function gorunumuDogrula(ham: unknown): IcindekilerGorunum {
  const g = (ham && typeof ham === 'object' ? ham : {}) as Record<string, unknown>;
  const cikti = { ...VARSAYILAN_GORUNUM };
  for (const anahtar of Object.keys(VARSAYILAN_GORUNUM) as (keyof IcindekilerGorunum)[]) {
    const deger = g[anahtar];
    if (typeof deger === 'string' && deger in ALAN_TABLOSU[anahtar]) {
      // Kademe adları tablo anahtarlarıyla sınırlı; tip güvenliği burada kurulur.
      (cikti as Record<string, string>)[anahtar] = deger;
    }
  }
  return cikti;
}
