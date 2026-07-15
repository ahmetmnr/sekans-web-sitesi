// Sekans API istemcisi — tüm HTTP/URL/CSRF mantığının tek kaynağı.
// Aynı origin (frontend + /api aynı cPanel alan adında) => credentials:'include'.
// CSRF token bellekte tutulur (localStorage'a ASLA yazılmaz), POST/PUT/DELETE'e eklenir.

import type {
  Sayi, ArsivSayi, AraYazi, Yazar, Kategori, Yazi, SayiDurum, Kullanici, EditorOzet,
  AramaSonuclari, IndeksGiris, StatikSayfaIcerik, MenuOgesi, AnasayfaBlok, FiltreSayfa,
  IndeksKategoriAyar,
} from '@/types';

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';

// ---- CSRF token (bellekte) -------------------------------------------------
let csrfToken: string | null = null;
export function setCsrfToken(t: string | null): void {
  csrfToken = t;
}
export function getCsrfToken(): string | null {
  return csrfToken;
}

// ---- Hata tipi -------------------------------------------------------------
export class ApiError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// 401 olduğunda AuthContext'in oturumu düşürebilmesi için olay yayını.
type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();
export function onUnauthorized(fn: UnauthorizedListener): () => void {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
}

interface Envelope<T> {
  ok: boolean;
  data: T;
  error: { code: string; message: string; fields?: Record<string, string> } | null;
  meta?: unknown;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts?: { rawBody?: BodyInit; isForm?: boolean }
): Promise<{ data: T; meta?: unknown }> {
  const headers: Record<string, string> = {};
  // cache:'no-store' => tarayıcı/CDN bayat yanıt döndürmesin. Aksi halde yeni
  // kaydedilen içerik sayfa yenilenince (bayat /bootstrap) kaybolmuş görünebilir.
  const init: RequestInit = { method, credentials: 'include', headers, cache: 'no-store' };

  if (method !== 'GET' && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  if (opts?.rawBody !== undefined) {
    init.body = opts.rawBody; // FormData: Content-Type'ı tarayıcı ayarlasın
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError(0, 'NETWORK', 'Sunucuya bağlanılamadı.');
  }

  // 204 No Content
  if (res.status === 204) {
    return { data: undefined as T };
  }

  let json: Envelope<T> | null = null;
  const text = await res.text();
  try {
    json = text ? (JSON.parse(text) as Envelope<T>) : null;
  } catch {
    // API HTML döndürdüyse (örn. .htaccess yanlışsa) bu dalda yakalanır.
    throw new ApiError(res.status, 'BAD_RESPONSE',
      'Sunucudan beklenmeyen yanıt (JSON değil). /api yönlendirmesini kontrol edin.');
  }

  if (!res.ok || (json && json.ok === false)) {
    const err = json?.error;
    if (res.status === 401) {
      unauthorizedListeners.forEach((fn) => fn());
    }
    throw new ApiError(
      res.status,
      err?.code ?? 'ERROR',
      err?.message ?? `Hata: ${res.status}`,
      err?.fields
    );
  }

  return { data: (json as Envelope<T>).data, meta: (json as Envelope<T>).meta };
}

const get = <T>(path: string) => request<T>('GET', path).then((r) => r.data);
const getWithMeta = <T>(path: string) => request<T>('GET', path);
const post = <T>(path: string, body?: unknown) => request<T>('POST', path, body).then((r) => r.data);
const put = <T>(path: string, body?: unknown) => request<T>('PUT', path, body).then((r) => r.data);
const del = <T>(path: string) => request<T>('DELETE', path).then((r) => r.data);

// ---- Tipler ----------------------------------------------------------------
export interface YarismaBilgi {
  baslik: string;
  aciklama: string;
  basvuruTarihleri?: string; // bilgi kartı: "Her yıl Mart-Nisan aylarında"
  kategoriMetni?: string;    // bilgi kartı: "Film Eleştirisi ve Film Çözümlemesi"
  odulMetni?: string;        // bilgi kartı: "Para ödülü ve dergide yayınlanma"
  basvuruEmail?: string;     // başvuru CTA e-posta adresi
  gecmisKazananlar: { yil: number; birinci: string; ikinci: string }[];
}
export interface HakkimizdaIcerik {
  baslik: string;
  icerik: string;
  iletisim: {
    email: string;
    adres: string;
    sosyal: { twitter: string; instagram: string; facebook: string };
  };
}
export interface BootstrapData {
  sonSayi: Sayi | null;
  anasayfaSayilari?: Sayi[]; // ana sayfada gösterilecek sayılar (yayındaki + admin seçimi)
  arsivSayilari: ArsivSayi[];
  araYazilar: AraYazi[];
  yazarlar: Yazar[];
  kategoriler: Kategori[];
  menu?: MenuOgesi[];             // dinamik üst menü (boş/eksikse Header sabit menüye düşer)
  anasayfaBloklar?: AnasayfaBlok[]; // ana sayfa panelleri (boş/eksikse AnaSayfa sabit düzene düşer)
  yarismasiBilgi: YarismaBilgi;
  hakkimizdaIcerik: HakkimizdaIcerik;
}
export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'editor';
  name: string;
}

// ---- API yüzeyi ------------------------------------------------------------
export const api = {
  // İlk yükleme
  bootstrap: () => get<BootstrapData>('/bootstrap'),

  // Auth
  auth: {
    me: () => get<{ authenticated: boolean; user: AuthUser | null; csrfToken: string | null }>('/auth/me'),
    login: (username: string, password: string) =>
      post<{ user: AuthUser; csrfToken: string }>('/auth/login', { username, password }),
    logout: () => post<{ loggedOut: boolean }>('/auth/logout'),
  },

  // Sayı (yayında/canlı — geriye dönük uyum)
  sonSayi: {
    get: () => get<Sayi>('/sayi/current'),
    update: (patch: Partial<Sayi>) => put<Sayi>('/sayi/current', patch),
    publish: () => post<ArsivSayi>('/sayi/publish'),
  },

  // Sayılar (yaşam döngüsü — CMS): taslak + yayında sayıları yazılarıyla yönet.
  sayilar: {
    listCms: () => get<Sayi[]>('/cms/sayilar'),
    create: (s: Partial<Sayi> & { editorId?: string | null }) => post<Sayi>('/sayi', s),
    update: (id: string, patch: Partial<Sayi> & { editorId?: string | null }) =>
      put<Sayi>(`/sayi/${encodeURIComponent(id)}`, patch),
    setDurum: (id: string, durum: SayiDurum) =>
      put<Sayi>(`/sayi/${encodeURIComponent(id)}/durum`, { durum }),
    remove: (id: string) => del<{ deleted: string }>(`/sayi/${encodeURIComponent(id)}`),
  },

  // Editör özet listesi (sorumlu editör atama açılır menüsü)
  editorler: {
    list: () => get<EditorOzet[]>('/editorler'),
  },

  // Kullanıcılar (admin)
  kullanicilar: {
    list: () => get<Kullanici[]>('/kullanicilar'),
    create: (k: { username: string; password: string; name: string; role: 'admin' | 'editor'; email?: string }) =>
      post<Kullanici>('/kullanici', k),
    update: (id: string, patch: Partial<{ name: string; email: string; role: 'admin' | 'editor'; isActive: boolean; password: string }>) =>
      put<Kullanici>(`/kullanici/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/kullanici/${encodeURIComponent(id)}`),
  },

  // Arşiv
  arsiv: {
    list: () => get<ArsivSayi[]>('/arsiv'),
    create: (s: Partial<ArsivSayi>) => post<ArsivSayi>('/arsiv', s),
    update: (id: string, patch: Partial<ArsivSayi>) => put<ArsivSayi>(`/arsiv/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/arsiv/${encodeURIComponent(id)}`),
  },

  // Yazı (sayı içi)
  yazi: {
    get: (id: string) => get<Yazi>(`/yazi/${encodeURIComponent(id)}`),
    create: (y: Partial<Yazi> & { yazarId?: string; kategoriId?: string; sayiId?: string }) =>
      post<Yazi>('/yazi', y),
    update: (id: string, patch: Partial<Yazi> & { yazarId?: string; kategoriId?: string; sayiId?: string }) =>
      put<Yazi>(`/yazi/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/yazi/${encodeURIComponent(id)}`),
  },

  // Ara yazı (blog)
  araYazi: {
    list: (params?: { page?: number; limit?: number; kategori?: string; yazar?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.kategori) qs.set('kategori', params.kategori);
      if (params?.yazar) qs.set('yazar', params.yazar);
      if (params?.q) qs.set('q', params.q);
      const s = qs.toString();
      return getWithMeta<AraYazi[]>(`/arayazi${s ? `?${s}` : ''}`);
    },
    getBySlug: (slug: string) => get<AraYazi>(`/arayazi/slug/${encodeURIComponent(slug)}`),
    get: (id: string) => get<AraYazi>(`/arayazi/${encodeURIComponent(id)}`),
    create: (a: Partial<AraYazi> & { yazarId?: string }) => post<AraYazi>('/arayazi', a),
    update: (id: string, patch: Partial<AraYazi> & { yazarId?: string }) =>
      put<AraYazi>(`/arayazi/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/arayazi/${encodeURIComponent(id)}`),
  },

  // Yazar
  yazar: {
    list: () => get<Yazar[]>('/yazarlar'),
    create: (y: Partial<Yazar>) => post<Yazar>('/yazar', y),
    update: (id: string, patch: Partial<Yazar>) => put<Yazar>(`/yazar/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/yazar/${encodeURIComponent(id)}`),
  },

  // Kategori
  kategori: {
    list: () => get<Kategori[]>('/kategoriler'),
    create: (k: Partial<Kategori>) => post<Kategori>('/kategori', k),
    update: (id: string, patch: Partial<Kategori>) => put<Kategori>(`/kategori/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/kategori/${encodeURIComponent(id)}`),
  },

  // Yarışma / Hakkımızda
  yarisma: {
    get: () => get<YarismaBilgi>('/yarisma'),
    update: (b: YarismaBilgi) => put<YarismaBilgi>('/yarisma', b),
  },
  hakkimizda: {
    get: () => get<HakkimizdaIcerik>('/hakkimizda'),
    update: (b: HakkimizdaIcerik) => put<HakkimizdaIcerik>('/hakkimizda', b),
  },

  // Statik sayfalar (ör. yazi-standartlari) — admin panelden düzenlenir/oluşturulur
  sayfa: {
    get: (slug: string) => get<StatikSayfaIcerik>(`/sayfa/${encodeURIComponent(slug)}`),
    listCms: () => get<{ sayfalar: StatikSayfaIcerik[] }>('/cms/sayfalar').then((r) => r.sayfalar),
    create: (b: Partial<StatikSayfaIcerik> & { baslik: string }) => post<StatikSayfaIcerik>('/sayfa', b),
    update: (slug: string, b: Partial<StatikSayfaIcerik> & { baslik: string; icerik: string }) =>
      put<StatikSayfaIcerik>(`/sayfa/${encodeURIComponent(slug)}`, b),
    remove: (slug: string) => del<{ deleted: string }>(`/sayfa/${encodeURIComponent(slug)}`),
  },

  // Dinamik üst menü
  menu: {
    // Herkese açık ağaç (yalnızca aktif öğeler) — Header normalde bootstrap'tan alır.
    getPublic: () => get<{ menu: MenuOgesi[] }>('/menu').then((r) => r.menu),
    // CMS düzenleme: tüm öğeler (pasifler dahil).
    listCms: () => get<{ menu: MenuOgesi[] }>('/cms/menu').then((r) => r.menu),
    create: (m: Partial<MenuOgesi>) => post<MenuOgesi>('/menu', m),
    update: (id: string, patch: Partial<MenuOgesi>) => put<MenuOgesi>(`/menu/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/menu/${encodeURIComponent(id)}`),
    reorder: (siralar: { id: string; sira: number }[]) =>
      put<{ menu: MenuOgesi[] }>('/menu-sirala', { siralar }).then((r) => r.menu),
  },

  // Filtre listeleme sayfaları
  filtre: {
    get: (slug: string) => get<FiltreSayfa>(`/filtre/${encodeURIComponent(slug)}`),
    listCms: () => get<{ filtreler: FiltreSayfa[] }>('/cms/filtreler').then((r) => r.filtreler),
    create: (f: Partial<FiltreSayfa>) => post<FiltreSayfa>('/filtre', f),
    update: (id: string, patch: Partial<FiltreSayfa>) => put<FiltreSayfa>(`/filtre/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/filtre/${encodeURIComponent(id)}`),
  },

  // Ana sayfa blokları (paneller)
  anasayfaBlok: {
    listCms: () => get<{ bloklar: AnasayfaBlok[] }>('/cms/anasayfa-bloklar').then((r) => r.bloklar),
    create: (b: Partial<AnasayfaBlok>) => post<AnasayfaBlok>('/anasayfa-blok', b),
    update: (id: string, patch: Partial<AnasayfaBlok>) => put<AnasayfaBlok>(`/anasayfa-blok/${encodeURIComponent(id)}`, patch),
    remove: (id: string) => del<{ deleted: string }>(`/anasayfa-blok/${encodeURIComponent(id)}`),
    reorder: (siralar: { id: string; sira: number }[]) =>
      put<{ bloklar: AnasayfaBlok[] }>('/anasayfa-blok-sirala', { siralar }).then((r) => r.bloklar),
  },

  // Site içi arama
  arama: (q: string) => get<AramaSonuclari>(`/arama?q=${encodeURIComponent(q)}`),

  // Sekans İndeks (tüm yayımlanmış içerik dökümü + kategori ayarı)
  indeks: () => get<{ girisler: IndeksGiris[]; kategoriAyar: IndeksKategoriAyar[] }>('/indeks'),

  // Sekans İndeks kategori ayarı (admin: sıra + görünürlük)
  indeksKategoriler: {
    listCms: () => get<{ kategoriler: IndeksKategoriAyar[] }>('/cms/indeks-kategoriler').then((r) => r.kategoriler),
    update: (kategoriler: IndeksKategoriAyar[]) =>
      put<{ kategoriler: IndeksKategoriAyar[] }>('/indeks-kategoriler', { kategoriler }).then((r) => r.kategoriler),
  },

  // Yükleme
  uploadFile: (file: File, kind: 'image' | 'pdf' | 'foto') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('kind', kind);
    return request<{ url: string }>('POST', '/upload', undefined, { rawBody: fd, isForm: true }).then((r) => r.data);
  },

  // AI
  ai: {
    status: () => get<{ configured: boolean; model: string }>('/ai/status'),
    edit: (icerik: string, islem: string, ekTalimat?: string) =>
      post<{ content: string }>('/ai/edit', { icerik, islem, ekTalimat }),
  },

  // Admin
  admin: {
    export: () => get<unknown>('/export'),
    import: (data: unknown) => post<{ imported: boolean }>('/import', data),
    reset: () => post<{ reset: boolean }>('/reset'),
  },
};
