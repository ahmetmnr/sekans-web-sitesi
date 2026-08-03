/**
 * SİTE ADRESLERİ (URL yönlendirme).
 *
 * Sorun ([12] ve [13]): site bugüne kadar tek adres üzerinden çalışıyordu.
 * Hangi sayfada olursanız olun tarayıcının adresi "/" idi. Bunun iki görünür
 * sonucu vardı:
 *
 *   • Menüdeki bir öğeye sağ tıklayıp "yeni sekmede aç" denemiyordu — çünkü
 *     öğeler bağlantı (<a href>) değil, düğmeydi; gidilecek bir adres yoktu.
 *   • Geri tuşu tutarsız davranıyordu ve sayfa yenilenince hep ana sayfaya
 *     dönülüyordu.
 *
 * Bu modül, uygulamanın sayfa durumu ile gerçek bir adres arasındaki iki yönlü
 * dönüşümü tanımlar. Sunucu tarafı zaten hazır: hem nginx (try_files) hem de
 * Apache (.htaccess) bilinmeyen yolları index.html'e düşürüyor, dolayısıyla
 * adresler doğrudan açıldığında da çalışır.
 *
 * Adres şeması:
 *   /                        ana sayfa
 *   /sayi/e29                bir dergi sayısının içindekiler sayfası
 *   /yazi/e29-01             dergi yazısı
 *   /arsiv                   arşiv
 *   /blog                    blog listesi        (?kategori=… ön filtre)
 *   /blog/bir-yazi-slug      blog yazısı
 *   /bolum/duyurular         özel bölüm listeleri
 *   /yazarlar                yazarlar
 *   /yazar/yz-003            yazar sayfası
 *   /indeks                  Sekans İndeks
 *   /sayfa/yazi-standartlari admin tanımlı statik sayfa
 *   /liste/…                 admin tanımlı filtre listesi
 *   /hakkimizda /iletisim /yarisma
 *   /cms                     yönetim paneli
 */

/** Adresten çözülen ham hedef. Sayfanın verisi App tarafında yüklenir. */
export interface RotaHedefi {
  page: string;
  /** Kayıt kimliği (sayı kodu, yazı kodu, yazar kodu). */
  id?: string;
  /** Slug (blog yazısı, statik sayfa, filtre sayfası). */
  slug?: string;
  /** Blog listesinde ön seçili kategori (?kategori=…). */
  kategori?: string;
  /** İletişim formunda ön dolu konu (?konu=…). */
  konu?: string;
}

/** Özel bölüm sayfaları — /bolum/{id} altında toplanır. */
export const BOLUM_SAYFALARI = [
  'yazarlarimizdan',
  'sinemakitapligi',
  'basilisayilar',
  'duyurular',
  'textsinenglish',
] as const;

/** Ek parametre almayan, adı adresiyle birebir aynı olan sayfalar. */
const DUZ_SAYFALAR = [
  'arsiv',
  'yazarlar',
  'hakkimizda',
  'iletisim',
  'yarisma',
  'indeks',
  'cms',
] as const;

/** Uygulama durumundan tarayıcı adresi üret. */
export function durumdanYol(durum: {
  page: string;
  selectedYazi?: { id: string } | null;
  selectedSayi?: { id: string } | null;
  selectedYazar?: { id: string } | null;
  selectedAraYazi?: { slug: string } | null;
  blogKategori?: string;
  statikSlug?: string;
  filtreSlug?: string;
}): string {
  const { page } = durum;

  if (page === 'anasayfa') return '/';
  if ((DUZ_SAYFALAR as readonly string[]).includes(page)) return `/${page}`;
  if ((BOLUM_SAYFALARI as readonly string[]).includes(page)) return `/bolum/${page}`;

  switch (page) {
    case 'sonsayi':
      return durum.selectedSayi?.id ? `/sayi/${enc(durum.selectedSayi.id)}` : '/sayi';
    case 'yazidetay':
      return durum.selectedYazi?.id ? `/yazi/${enc(durum.selectedYazi.id)}` : '/';
    case 'yazardetay':
      return durum.selectedYazar?.id ? `/yazar/${enc(durum.selectedYazar.id)}` : '/yazarlar';
    case 'arayazidetay':
      return durum.selectedAraYazi?.slug ? `/blog/${enc(durum.selectedAraYazi.slug)}` : '/blog';
    case 'arayazilar':
      return durum.blogKategori?.trim()
        ? `/blog?kategori=${encodeURIComponent(durum.blogKategori)}`
        : '/blog';
    case 'yazistandartlari':
      return '/sayfa/yazi-standartlari';
    case 'statik':
      return durum.statikSlug ? `/sayfa/${enc(durum.statikSlug)}` : '/';
    case 'filtre':
      return durum.filtreSlug ? `/liste/${enc(durum.filtreSlug)}` : '/';
    default:
      return '/';
  }
}

/** Tarayıcı adresinden ham hedefi çöz. Tanınmayan adres ana sayfaya düşer. */
export function yoldanHedef(pathname: string, search = ''): RotaHedefi {
  const parcalar = pathname.split('/').filter(Boolean).map(dec);
  const sorgu = new URLSearchParams(search);

  if (parcalar.length === 0) return { page: 'anasayfa' };

  const [ilk, ikinci] = parcalar;

  if ((DUZ_SAYFALAR as readonly string[]).includes(ilk)) {
    if (ilk === 'iletisim') return { page: 'iletisim', konu: sorgu.get('konu') ?? undefined };
    return { page: ilk };
  }

  switch (ilk) {
    case 'sayi':
      // Kod verilmemişse yayındaki sayı gösterilir.
      return { page: 'sonsayi', id: ikinci };
    case 'yazi':
      return ikinci ? { page: 'yazidetay', id: ikinci } : { page: 'anasayfa' };
    case 'yazar':
      return ikinci ? { page: 'yazardetay', id: ikinci } : { page: 'yazarlar' };
    case 'blog':
      return ikinci
        ? { page: 'arayazidetay', slug: ikinci }
        : { page: 'arayazilar', kategori: sorgu.get('kategori') ?? undefined };
    case 'bolum':
      return (BOLUM_SAYFALARI as readonly string[]).includes(ikinci)
        ? { page: ikinci }
        : { page: 'anasayfa' };
    case 'sayfa':
      if (!ikinci) return { page: 'anasayfa' };
      // "Sekans Yazı Standartları" yerleşik menü öğesi olarak da açılabiliyor;
      // aynı adres her iki yoldan da aynı sayfayı versin.
      return ikinci === 'yazi-standartlari'
        ? { page: 'yazistandartlari' }
        : { page: 'statik', slug: ikinci };
    case 'liste':
      return ikinci ? { page: 'filtre', slug: ikinci } : { page: 'anasayfa' };
    default:
      return { page: 'anasayfa' };
  }
}

/**
 * Menü öğesinin (onNavigate'e gönderilen kod) karşılığı olan adres.
 *
 * Başlık ve menü bağlantıları gerçek <a href> olabilsin diye gerekir: sağ tık
 * → "yeni sekmede aç" ancak bir adres varsa çalışır.
 */
export function navKodundanYol(pageId: string): string {
  if (pageId.startsWith('statik:')) {
    const slug = pageId.slice('statik:'.length);
    return slug === 'yazi-standartlari' ? '/sayfa/yazi-standartlari' : `/sayfa/${enc(slug)}`;
  }
  if (pageId.startsWith('kategori:')) {
    return `/blog?kategori=${encodeURIComponent(pageId.slice('kategori:'.length))}`;
  }
  if (pageId.startsWith('filtre:')) return `/liste/${enc(pageId.slice('filtre:'.length))}`;
  if (pageId.startsWith('sayi:')) return `/sayi/${enc(pageId.slice('sayi:'.length))}`;
  if (pageId === 'arayazilar-arayazi') return `/blog?kategori=${encodeURIComponent('Ara Yazı')}`;
  if (pageId === 'sonsayi') return '/sayi';
  if (pageId === 'arayazilar') return '/blog';
  if (pageId === 'yazistandartlari') return '/sayfa/yazi-standartlari';
  if (pageId === 'anasayfa') return '/';
  if ((BOLUM_SAYFALARI as readonly string[]).includes(pageId)) return `/bolum/${pageId}`;
  if ((DUZ_SAYFALAR as readonly string[]).includes(pageId)) return `/${pageId}`;
  return '/';
}

/**
 * Bağlantı tıklaması uygulama içinde mi ele alınmalı?
 *
 * Ctrl/Cmd/Shift/orta tık ile açılan bağlantılar tarayıcıya BIRAKILIR — yeni
 * sekmede açma bu sayede çalışır. Yalnızca sade sol tık engellenip uygulama
 * içi geçişe çevrilir.
 */
export function uygulamaIciTiklama(e: React.MouseEvent): boolean {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
}

const enc = (s: string) => encodeURIComponent(s);
const dec = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
