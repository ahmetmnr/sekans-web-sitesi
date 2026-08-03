import { useEffect, useRef, useState } from 'react';
import { Search, Menu, ChevronDown, Loader2, FileText, BookOpen, User, Folder, Newspaper } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import type { AraYazi, AramaSonuclari, AramaYaziSonuc, MenuOgesi } from '@/types';
import { ZenginMetin } from '@/components/ZenginMetin';
import { SekansMarkasi } from '@/components/SekansMarkasi';
import { navKodundanYol, uygulamaIciTiklama } from '@/lib/rotalar';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  // Arama sonuçlarından detay açma
  onYaziAc?: (sonuc: AramaYaziSonuc) => void;
  onAraYaziAc?: (araYazi: AraYazi) => void;
  onYazarAc?: (yazarId: string) => void;
}

interface NavChild {
  nav: string;   // onNavigate'e gönderilen kimlik
  page: string;  // aktiflik kontrolü için sayfa kimliği
  label: string;
}

interface NavItem {
  id: string;
  label: string;
  type?: 'sayilar';
  children?: NavChild[];
}

// FALLBACK menü: menuler tablosu (dinamik menü) henüz yoksa / boşsa kullanılır.
// Dinamik menü geldiğinde bu yapı yerine CMS'ten yönetilen ağaç render edilir.
const navItems: NavItem[] = [
  { id: 'anasayfa', label: 'Ana Sayfa' },
  {
    id: 'hakkimizda-menu', label: 'Hakkımızda', children: [
      { nav: 'hakkimizda', page: 'hakkimizda', label: 'Sekans Sinema Grubu' },
      { nav: 'yazistandartlari', page: 'yazistandartlari', label: 'Sekans Yazı Standartları' },
      { nav: 'duyurular', page: 'duyurular', label: 'Duyurular' },
    ],
  },
  { id: 'sonsayi', label: 'Sayılar', type: 'sayilar' },
  { id: 'yarisma', label: 'Yarışma' },
  {
    id: 'yazilar-menu', label: 'Yazılar', children: [
      { nav: 'indeks', page: 'indeks', label: 'Sekans İndeks' },
      { nav: 'arayazilar-arayazi', page: 'arayazilar', label: 'Ara Yazılar' },
      { nav: 'sinemakitapligi', page: 'sinemakitapligi', label: 'Sinema Kitaplığı' },
      { nav: 'textsinenglish', page: 'textsinenglish', label: 'Texts in English' },
    ],
  },
  { id: 'yazarlar', label: 'Yazarlar' },
  {
    id: 'arsiv-menu', label: 'Arşiv', children: [
      { nav: 'arsiv', page: 'arsiv', label: 'e-Sayılar' },
      { nav: 'basilisayilar', page: 'basilisayilar', label: 'Basılı Sayılar' },
    ],
  },
  { id: 'iletisim', label: 'İletişim' },
];

// Menüde en fazla bu kadar arşiv sayısı listelenir (admin panelden aç/kapat).
const MENU_SAYI_LIMIT = 8;

// Birleşik render modeli — hem dinamik menüden hem sabit fallback'ten üretilir.
//
// `href`: menü öğesinin gerçek adresi. Öğeler <a href> olarak basıldığı için
// sağ tık → "yeni sekmede aç" ve orta tık çalışır ([12]). Sade sol tıkta
// uygulama içi geçiş yapılır, sayfa yeniden yüklenmez.
type NavChildR = { key: string; label: string; href: string; onClick: () => void; activePage?: string };
type NavEntry =
  | { kind: 'leaf'; key: string; label: string; href: string; onClick: () => void; activePage?: string }
  | { kind: 'group'; key: string; label: string; activePages: string[]; children: NavChildR[] }
  | { kind: 'sayilar'; key: string; label: string };

export default function Header({ onNavigate, currentPage, onYaziAc, onAraYaziAc, onYazarAc }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AramaSonuclari | null>(null);
  const [searching, setSearching] = useState(false);
  const searchSeq = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sonSayi, arsivSayilari, menu } = useCMS();

  // Menüde görünecek arşiv sayıları (admin panelden aç/kapat + özel etiket).
  const menuSayilari = arsivSayilari
    .filter((s) => s.menuGoster !== false)
    .slice(0, MENU_SAYI_LIMIT);
  const sayiEtiketi = (s: { menuEtiket?: string | null; numara: string }) =>
    s.menuEtiket?.trim() ? s.menuEtiket : `Sayı ${s.numara}`;

  // Canlı arama: 300ms gecikmeli, en az 2 karakter.
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    const seq = ++searchSeq.current;
    const timer = setTimeout(() => {
      api.arama(q)
        .then((res) => {
          if (searchSeq.current === seq) setSearchResults(res);
        })
        .catch(() => {
          if (searchSeq.current === seq) setSearchResults({ yazilar: [], araYazilar: [], yazarlar: [] });
        })
        .finally(() => {
          if (searchSeq.current === seq) setSearching(false);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
  };

  /**
   * Menü bağlantısı tıklaması.
   *
   * Ctrl/Cmd/Shift/orta tık tarayıcıya BIRAKILIR — "yeni sekmede aç" bu sayede
   * çalışır ([12]). Sade sol tıkta sayfa yeniden yüklenmesin diye varsayılan
   * davranış engellenip uygulama içi geçiş yapılır.
   */
  const menuBaglantiTikla = (e: React.MouseEvent, git: () => void) => {
    if (!uygulamaIciTiklama(e)) return;
    e.preventDefault();
    git();
  };

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Belirli bir dergi sayısını aç: KENDİ SAYFASI (içindekiler menüsüyle).
  //
  // Eskiden PDF'i yeni sekmede açıyorduk; bu yüzden "Sayılar > e28" denince
  // sayfa yerine PDF geliyordu. Artık sayı sayfasına gidilir; PDF'e o sayfadaki
  // "Tüm sayıyı PDF olarak indir" bağlantısından ulaşılır.
  const sayiAc = (code: string) => handleNavClick(`sayi:${code}`);

  // Dinamik menü öğesini onNavigate hedef koduna çevir (App.handleNavigate çözer).
  const menuHedefNav = (item: MenuOgesi): string => {
    switch (item.tur) {
      case 'sabit_sayfa':  return item.hedef ? `statik:${item.hedef}` : 'anasayfa';
      case 'kategori':     return item.hedef ? `kategori:${item.hedef}` : 'arayazilar';
      case 'filtre_liste': return item.hedef ? `filtre:${item.hedef}` : 'arayazilar';
      case 'dahili':       return item.hedef ?? 'anasayfa';
      default:             return 'anasayfa';
    }
  };

  // Dinamik menü öğesinin gerçek ADRESİ (<a href> için).
  // Haricî bağlantılar kendi adreslerini kullanır; dergi sayısı /sayi/{code}.
  const menuHedefYol = (item: MenuOgesi): string => {
    if (item.tur === 'harici_link') return item.hedef ?? '#';
    if (item.tur === 'dergi_sayisi') return item.hedef ? navKodundanYol(`sayi:${item.hedef}`) : '/arsiv';
    return navKodundanYol(menuHedefNav(item));
  };

  // Aktiflik vurgusu için sayfa kimliği (dinamik öğeden en iyi tahmin).
  const menuActivePage = (item: MenuOgesi): string | undefined => {
    if (item.tur === 'dahili') return item.hedef === 'arayazilar-arayazi' ? 'arayazilar' : (item.hedef ?? undefined);
    if (item.tur === 'sabit_sayfa') return 'statik';
    return undefined;
  };

  // Dinamik menü öğesi tıklama: haricî/dergi_sayisi doğrudan; diğerleri onNavigate.
  const menuTikla = (item: MenuOgesi) => {
    if (item.tur === 'harici_link') {
      if (item.hedef) {
        if (item.yeniSekme) window.open(item.hedef, '_blank', 'noopener,noreferrer');
        else window.location.assign(item.hedef);
      }
      setMobileMenuOpen(false);
      return;
    }
    if (item.tur === 'dergi_sayisi') {
      if (item.hedef) sayiAc(item.hedef);
      setMobileMenuOpen(false);
      return;
    }
    handleNavClick(menuHedefNav(item));
  };

  // Render modelini dinamik menüden kur (yalnızca aktif öğeler).
  const buildFromMenu = (items: MenuOgesi[]): NavEntry[] =>
    items.filter((i) => i.aktif).map((item): NavEntry => {
      if (item.tur === 'dergi_sayilari') {
        return { kind: 'sayilar', key: item.id, label: item.gorunenBaslik };
      }
      const kids = (item.children ?? []).filter((c) => c.aktif);
      if (item.tur === 'grup' || kids.length > 0) {
        return {
          kind: 'group',
          key: item.id,
          label: item.gorunenBaslik,
          activePages: kids.map(menuActivePage).filter((p): p is string => !!p),
          children: kids.map((c) => ({
            key: c.id,
            label: c.gorunenBaslik,
            href: menuHedefYol(c),
            onClick: () => menuTikla(c),
            activePage: menuActivePage(c),
          })),
        };
      }
      return {
        kind: 'leaf',
        key: item.id,
        label: item.gorunenBaslik,
        href: menuHedefYol(item),
        onClick: () => menuTikla(item),
        activePage: menuActivePage(item),
      };
    });

  // Render modelini sabit fallback'ten kur (menuler tablosu yoksa).
  const buildFromStatic = (): NavEntry[] =>
    navItems.map((item): NavEntry => {
      if (item.type === 'sayilar') return { kind: 'sayilar', key: item.id, label: item.label };
      if (item.children) {
        return {
          kind: 'group',
          key: item.id,
          label: item.label,
          activePages: item.children.map((c) => c.page),
          children: item.children.map((c) => ({
            key: c.nav,
            label: c.label,
            href: navKodundanYol(c.nav),
            onClick: () => handleNavClick(c.nav),
            activePage: c.page,
          })),
        };
      }
      return {
        kind: 'leaf',
        key: item.id,
        label: item.label,
        href: navKodundanYol(item.id),
        onClick: () => handleNavClick(item.id),
        activePage: item.id,
      };
    });

  const entries: NavEntry[] = menu.length > 0 ? buildFromMenu(menu) : buildFromStatic();

  const isSayilarActive = currentPage === 'sonsayi' || currentPage === 'sayidetay';

  const toplamSonuc = searchResults
    ? searchResults.yazilar.length + searchResults.araYazilar.length + searchResults.yazarlar.length
      + (searchResults.sayfalar?.length ?? 0) + (searchResults.kategoriler?.length ?? 0) + (searchResults.sayilar?.length ?? 0)
    : 0;

  // Arama sonucundan sayfa/kategori/sayı aç.
  const aramaNav = (target: string) => { closeSearch(); onNavigate(target); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Üst Bölüm - Logo */}
        <div className="flex items-center justify-between py-4 md:py-6">
          {/* Logo — otomatik çeviriye karşı korumalı (bkz. SekansMarkasi) */}
          <SekansMarkasi onClick={() => handleNavClick('anasayfa')} />

          {/* Desktop Menü */}
          <nav className="hidden lg:flex items-center gap-8">
            {entries.map((entry) => (
              entry.kind === 'group' ? (
                <DropdownMenu key={entry.key}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`main-nav-link flex items-center gap-1 ${entry.activePages.includes(currentPage) ? 'text-foreground after:w-full' : ''}`}
                    >
                      {entry.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {entry.children.map((c) => (
                      <DropdownMenuItem key={c.key} asChild>
                        <a href={c.href} onClick={(e) => menuBaglantiTikla(e, c.onClick)}>
                          {c.label}
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : entry.kind === 'sayilar' ? (
                <DropdownMenu key={entry.key}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`main-nav-link flex items-center gap-1 ${isSayilarActive ? 'text-foreground after:w-full' : ''}`}
                    >
                      {entry.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuItem asChild>
                      <a
                        href={navKodundanYol(`sayi:${sonSayi.id}`)}
                        onClick={(e) => menuBaglantiTikla(e, () => handleNavClick('sonsayi'))}
                      >
                        <span className="font-medium">{sonSayi.menuEtiket?.trim() ? sonSayi.menuEtiket : 'Son Sayı'}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{sonSayi.numara}</span>
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {menuSayilari.map((sayi) => (
                      <DropdownMenuItem key={sayi.id} className="cursor-pointer" asChild>
                        <a
                          href={navKodundanYol(`sayi:${sayi.id}`)}
                          onClick={(e) => menuBaglantiTikla(e, () => sayiAc(sayi.id))}
                        >
                          {sayiEtiketi(sayi)}
                          <span className="ml-auto text-xs text-muted-foreground">{sayi.ay} {sayi.yil}</span>
                        </a>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/arsiv" onClick={(e) => menuBaglantiTikla(e, () => handleNavClick('arsiv'))}>
                        <span className="text-muted-foreground">Tüm Sayılar (Arşiv) →</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a
                  key={entry.key}
                  href={entry.href}
                  onClick={(e) => menuBaglantiTikla(e, entry.onClick)}
                  className={`main-nav-link ${entry.activePage && currentPage === entry.activePage ? 'text-foreground after:w-full' : ''}`}
                >
                  {entry.label}
                </a>
              )
            ))}
          </nav>

          {/* Sağ Taraf - Arama ve Mobil Menü */}
          <div className="flex items-center gap-3">
            {/* Arama */}
            <Dialog open={searchOpen} onOpenChange={(open) => { if (!open) { closeSearch(); } else { setSearchOpen(true); } }}>
              <DialogTrigger asChild>
                <button
                  className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Ara"
                >
                  <Search className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Arama</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Yazı, yazar veya konu ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Sonuçlar */}
                  <div className="mt-4 max-h-[55vh] overflow-y-auto">
                    {searchQuery.trim().length < 2 ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        Aramak için en az 2 karakter yazın.
                      </p>
                    ) : searchResults && toplamSonuc === 0 && !searching ? (
                      <p className="text-sm text-muted-foreground py-6 text-center">
                        “{searchQuery.trim()}” için sonuç bulunamadı.
                      </p>
                    ) : searchResults ? (
                      <div className="space-y-5">
                        {searchResults.yazilar.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> DERGİ YAZILARI
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.yazilar.map((y) => (
                                <li key={y.id}>
                                  <a
                                    href={`/yazi/${encodeURIComponent(y.id)}`}
                                    className="block w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={(e) => menuBaglantiTikla(e, () => { closeSearch(); onYaziAc?.(y); })}
                                  >
                                    <ZenginMetin html={y.baslik} className="block text-sm font-medium leading-snug" />
                                    <span className="block text-xs text-muted-foreground mt-0.5">
                                      {y.yazarAd}
                                      {y.kategoriAd ? ` · ${y.kategoriAd}` : ''}
                                      {y.sayiNumara ? ` · Sayı ${y.sayiNumara} (${y.sayiAy} ${y.sayiYil})` : ''}
                                    </span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {searchResults.araYazilar.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> BLOG
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.araYazilar.map((ay) => (
                                <li key={ay.id}>
                                  <a
                                    href={`/blog/${encodeURIComponent(ay.slug)}`}
                                    className="block w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={(e) => menuBaglantiTikla(e, () => { closeSearch(); onAraYaziAc?.(ay); })}
                                  >
                                    <ZenginMetin html={ay.baslik} className="block text-sm font-medium leading-snug" />
                                    <span className="block text-xs text-muted-foreground mt-0.5">
                                      {ay.yazar?.tamAd ?? ''}
                                      {ay.kategori ? ` · ${ay.kategori}` : ''}
                                    </span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {searchResults.yazarlar.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" /> YAZARLAR
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.yazarlar.map((yz) => (
                                <li key={yz.id}>
                                  <a
                                    href={`/yazar/${encodeURIComponent(yz.id)}`}
                                    className="block w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={(e) => menuBaglantiTikla(e, () => { closeSearch(); onYazarAc?.(yz.id); })}
                                  >
                                    <span className="block text-sm font-medium">{yz.tamAd}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(searchResults.sayilar?.length ?? 0) > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <Newspaper className="w-3.5 h-3.5" /> DERGİ SAYILARI
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.sayilar!.map((s) => (
                                <li key={s.id}>
                                  <a
                                    href={navKodundanYol(`sayi:${s.id}`)}
                                    className="block w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={(e) => menuBaglantiTikla(e, () => aramaNav(`sayi:${s.id}`))}
                                  >
                                    <span className="block text-sm font-medium">{s.menuEtiket?.trim() ? s.menuEtiket : (s.tamBaslik || `Sayı ${s.numara}`)}</span>
                                    <span className="block text-xs text-muted-foreground mt-0.5">{s.ay} {s.yil}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(searchResults.kategoriler?.length ?? 0) > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <Folder className="w-3.5 h-3.5" /> KATEGORİLER
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.kategoriler!.map((k) => (
                                <li key={k.slug || k.ad}>
                                  <a
                                    href={navKodundanYol(`kategori:${k.ad}`)}
                                    className="block w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={(e) => menuBaglantiTikla(e, () => aramaNav(`kategori:${k.ad}`))}
                                  >
                                    <span className="block text-sm font-medium">{k.ad}</span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(searchResults.sayfalar?.length ?? 0) > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> SAYFALAR
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.sayfalar!.map((sf) => (
                                <li key={sf.slug}>
                                  <a
                                    href={navKodundanYol(`statik:${sf.slug}`)}
                                    className="block w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={(e) => menuBaglantiTikla(e, () => aramaNav(`statik:${sf.slug}`))}
                                  >
                                    <span className="block text-sm font-medium">{sf.baslik}</span>
                                    {sf.kisaAciklama ? <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-1">{sf.kisaAciklama}</span> : null}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Mobil Menü */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Menü"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] overflow-y-auto">
                <div className="flex flex-col gap-6 mt-8">
                  <nav className="flex flex-col gap-4">
                    {entries.map((entry) => (
                      entry.kind === 'group' ? (
                        <div key={entry.key}>
                          <span className="text-left text-lg font-medium py-2 border-b border-border/50 text-muted-foreground block">
                            {entry.label}
                          </span>
                          <div className="pl-4 mt-2 space-y-2">
                            {entry.children.map((c) => (
                              <a
                                key={c.key}
                                href={c.href}
                                onClick={(e) => menuBaglantiTikla(e, c.onClick)}
                                className={`text-sm block ${c.activePage && currentPage === c.activePage ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                {c.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : entry.kind === 'sayilar' ? (
                        <div key={entry.key}>
                          <a
                            href="/sayi"
                            onClick={(e) => menuBaglantiTikla(e, () => handleNavClick('sonsayi'))}
                            className={`block text-left text-lg font-medium py-2 border-b border-border/50 transition-colors w-full ${
                              currentPage === 'sonsayi'
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {entry.label}
                          </a>
                          <div className="pl-4 mt-2 space-y-2">
                            <a
                              href={navKodundanYol(`sayi:${sonSayi.id}`)}
                              onClick={(e) => menuBaglantiTikla(e, () => handleNavClick('sonsayi'))}
                              className="text-sm text-muted-foreground hover:text-foreground block"
                            >
                              Son Sayı ({sonSayi.numara})
                            </a>
                            {menuSayilari.slice(0, 3).map((sayi) => (
                              <a
                                key={sayi.id}
                                href={navKodundanYol(`sayi:${sayi.id}`)}
                                onClick={(e) => menuBaglantiTikla(e, () => { sayiAc(sayi.id); setMobileMenuOpen(false); })}
                                className="text-sm text-muted-foreground hover:text-foreground block"
                              >
                                {sayiEtiketi(sayi)}
                              </a>
                            ))}
                            <a
                              href="/arsiv"
                              onClick={(e) => menuBaglantiTikla(e, () => handleNavClick('arsiv'))}
                              className="text-sm text-blue-600 hover:text-blue-800 block"
                            >
                              Tüm Sayılar →
                            </a>
                          </div>
                        </div>
                      ) : (
                        <a
                          key={entry.key}
                          href={entry.href}
                          onClick={(e) => menuBaglantiTikla(e, entry.onClick)}
                          className={`block text-left text-lg font-medium py-2 border-b border-border/50 transition-colors ${
                            entry.activePage && currentPage === entry.activePage
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {entry.label}
                        </a>
                      )
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
