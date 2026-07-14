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
  icerik: string;
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
