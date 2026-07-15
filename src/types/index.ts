// Sekans Dergisi - Tip Tanımları

export interface Yazar {
  id: string;
  ad: string;
  soyad: string;
  tamAd: string;
  fotograf?: string;
  biyografi?: string;
  yaziSayisi?: number; // toplam yazı sayısı (dergi + blog) — bootstrap'ta hesaplanır
}

export interface Kategori {
  id: string;
  ad: string;
  slug: string;
}

export interface Yazi {
  id: string;
  baslik: string;
  spot?: string;
  icerik?: string;
  yazar: Yazar;
  kategori: Kategori;
  sayiId: string;
  sayi?: Sayi;
  siraNo: number;
  pdfUrl?: string;
  kapakGorseli?: string;
  yayinTarihi?: string;
}

// Sayı yaşam döngüsü: taslak (hazırlanıyor) -> yayinda (canlı) -> arsiv (geçmiş)
export type SayiDurum = 'taslak' | 'yayinda' | 'arsiv';

export interface Sayi {
  id: string;
  numara: string; // e27, e26, etc.
  ay: string;
  yil: number;
  tamBaslik: string; // "Temmuz 2025 | Sayı e27"
  menuEtiket?: string | null;  // "Sayılar" menüsünde görünen özel ad (ör. "Lynch Sayısı")
  menuGoster?: boolean;        // "Sayılar" menüsünde listelensin mi
  anasayfaGoster?: boolean;    // ana sayfada yayındaki sayıya EK olarak göster
  kapakGorseli: string;
  pdfUrl: string;
  kunye?: string;
  onsoz?: string;
  durum?: SayiDurum;        // yaşam döngüsü durumu
  editorId?: string | null; // sorumlu editör (kullanıcı id) — yalnızca etiket
  editorAd?: string | null; // sorumlu editör adı (JOIN'den)
  yazilar: Yazi[];
  yayinTarihi: string;
}

export interface AraYazi {
  id: string;
  baslik: string;
  spot: string;
  icerik: string;
  yazar: Yazar;
  kategori: string;
  kapakGorseli?: string;
  yayinTarihi: string;
  slug: string;
}

export interface Etkinlik {
  id: string;
  baslik: string;
  icerik: string;
  tarih: string;
  yer?: string;
  gorsel?: string;
}

export interface Yarismaci {
  id: string;
  ad: string;
  soyad: string;
  yil: number;
  odul?: string;
  yaziBasligi?: string;
  yaziUrl?: string;
}

export interface ArsivSayi {
  id: string;
  numara: string;
  ay: string;
  yil: number;
  kapakGorseli: string;
  pdfUrl: string;
  yayinTarihi: string;
  menuEtiket?: string | null;  // "Sayılar" menüsünde görünen özel ad
  menuGoster?: boolean;        // "Sayılar" menüsünde listelensin mi
  anasayfaGoster?: boolean;    // ana sayfada yayındaki sayıya EK olarak göster
}

// Sekans İndeks girişi: dergi yazısı veya blog yazısının hafif dökümü.
export interface IndeksGiris {
  tip: 'dergi' | 'blog';
  id: string;
  baslik: string;
  yazarAd: string;
  kategoriAd: string;
  sayiId: string | null;
  sayiNumara: string | null;
  sayiAy: string | null;
  sayiYil: number | null;
  yayinTarihi: string;
  pdfUrl?: string | null;
}

// Arama sonucu: dergi yazısı satırı (hafif).
export interface AramaYaziSonuc {
  id: string;
  baslik: string;
  spot?: string | null;
  yazarAd: string;
  kategoriAd: string;
  sayiId: string;
  sayiNumara: string;
  sayiAy: string;
  sayiYil: number;
  pdfUrl?: string | null;
}

export interface AramaSonuclari {
  yazilar: AramaYaziSonuc[];
  araYazilar: AraYazi[];
  yazarlar: Yazar[];
}

// Admin panelden düzenlenebilir statik sayfa (ör. Sekans Yazı Standartları).
export interface StatikSayfaIcerik {
  slug: string;
  baslik: string;
  kisaAciklama?: string;
  icerik: string;
  seoBaslik?: string;
  seoAciklama?: string;
  yayinDurumu?: 'taslak' | 'yayinda';
  sira?: number;
}

// Dinamik üst menü — admin panelden yönetilir (bağlantı türü + hedef).
//  dahili         : yerleşik site sayfası (hedef = pageId: anasayfa, yazarlar, ...)
//  grup           : yalnızca açılır menü başlığı (hedef yok; alt öğeleri açar)
//  sabit_sayfa    : statik sayfa (hedef = slug)
//  kategori       : kategori adına göre filtrelenmiş liste (hedef = kategori adı)
//  filtre_liste   : admin tanımlı filtre sayfası (hedef = slug — Faz 4)
//  dergi_sayisi   : belirli bir dergi sayısı (hedef = sayı code)
//  dergi_sayilari : "Sayılar" özel dinamik düğümü (sayıları otomatik listeler)
//  harici_link    : haricî bağlantı (hedef = URL)
export type MenuTur =
  | 'dahili'
  | 'grup'
  | 'sabit_sayfa'
  | 'kategori'
  | 'filtre_liste'
  | 'dergi_sayisi'
  | 'dergi_sayilari'
  | 'harici_link';

export interface MenuOgesi {
  id: string;
  parentId: string | null;
  gorunenBaslik: string;       // kullanıcıya görünen ad
  sistemBaslik: string | null; // sistemin ürettiği ad ("Sayı özel")
  tur: MenuTur;
  hedef: string | null;        // pageId | slug | kategori adı | URL | sayı code
  sira: number;
  aktif: boolean;
  otomatik: boolean;           // sistem tarafından otomatik eklendi mi
  yeniSekme: boolean;          // haricî bağlantı yeni sekmede açılsın mı
  children: MenuOgesi[];
}

// Ana sayfa paneli — admin panelden yönetilir (hangi paneller, sıra, başlık).
//  sayilar  : ana sayfada gösterilecek dergi sayısı bölüm(ler)i
//  blog     : "Blog" (ara yazılar) paneli
//  kategori : belirli bir kategorinin yazılarını gösteren panel
export type AnasayfaBlokTip = 'sayilar' | 'blog' | 'kategori';

export interface AnasayfaBlok {
  id: string;
  tip: AnasayfaBlokTip;
  baslik: string;             // panel başlığı (düzenlenebilir; boş olabilir)
  sira: number;
  aktif: boolean;
  ayar: { kategori?: string; adet?: number };
}

// CMS kullanıcı hesabı (panelde yönetilir). Parola asla taşınmaz.
export interface Kullanici {
  id: string;
  username: string;
  role: 'admin' | 'editor';
  name: string;
  email?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
}

// Sorumlu editör atama açılır menüsü için hafif kullanıcı bilgisi.
export interface EditorOzet {
  id: string;
  name: string;
  role: 'admin' | 'editor';
}
