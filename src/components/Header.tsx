import { useEffect, useRef, useState } from 'react';
import { Search, Menu, ChevronDown, Loader2, FileText, BookOpen, User } from 'lucide-react';
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
import type { AraYazi, AramaSonuclari, AramaYaziSonuc } from '@/types';

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

// Menü yapısı: children olanlar açılır menüdür. "Sayılar" dinamik (CMS verisinden) kurulur.
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

export default function Header({ onNavigate, currentPage, onYaziAc, onAraYaziAc, onYazarAc }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AramaSonuclari | null>(null);
  const [searching, setSearching] = useState(false);
  const searchSeq = useRef(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sonSayi, arsivSayilari } = useCMS();

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

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDropdownActive = (item: NavItem) =>
    item.children?.some((c) => c.page === currentPage) ?? false;

  const toplamSonuc = searchResults
    ? searchResults.yazilar.length + searchResults.araYazilar.length + searchResults.yazarlar.length
    : 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* Üst Bölüm - Logo */}
        <div className="flex items-center justify-between py-4 md:py-6">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('anasayfa')}
            className="flex flex-col items-center text-center"
          >
            <span className="sekans-logo text-3xl md:text-4xl tracking-[0.2em]">sekans</span>
            <span className="sekans-logo-sub mt-0.5">sinema kültürü dergisi</span>
          </button>

          {/* Desktop Menü */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              item.children ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`main-nav-link flex items-center gap-1 ${isDropdownActive(item) ? 'text-foreground after:w-full' : ''}`}
                    >
                      {item.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {item.children.map((c) => (
                      <DropdownMenuItem key={c.nav} onClick={() => handleNavClick(c.nav)}>
                        {c.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : item.type === 'sayilar' ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`main-nav-link flex items-center gap-1 ${currentPage === 'sonsayi' || currentPage === 'sayidetay' ? 'text-foreground after:w-full' : ''}`}
                    >
                      Sayılar
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuItem onClick={() => handleNavClick('sonsayi')}>
                      <span className="font-medium">{sonSayi.menuEtiket?.trim() ? sonSayi.menuEtiket : 'Son Sayı'}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{sonSayi.numara}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {menuSayilari.map((sayi) => (
                      <DropdownMenuItem
                        key={sayi.id}
                        className="cursor-pointer"
                        onClick={() => {
                          if (sayi.pdfUrl) {
                            window.open(sayi.pdfUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            handleNavClick('arsiv');
                          }
                        }}
                      >
                        {sayiEtiketi(sayi)}
                        <span className="ml-auto text-xs text-muted-foreground">{sayi.ay} {sayi.yil}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavClick('arsiv')}>
                      <span className="text-muted-foreground">Tüm Sayılar (Arşiv) →</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`main-nav-link ${currentPage === item.id ? 'text-foreground after:w-full' : ''}`}
                >
                  {item.label}
                </button>
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
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> Dergi Yazıları
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.yazilar.map((y) => (
                                <li key={y.id}>
                                  <button
                                    className="w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={() => { closeSearch(); onYaziAc?.(y); }}
                                  >
                                    <span className="block text-sm font-medium leading-snug">{y.baslik}</span>
                                    <span className="block text-xs text-muted-foreground mt-0.5">
                                      {y.yazarAd}
                                      {y.kategoriAd ? ` · ${y.kategoriAd}` : ''}
                                      {y.sayiNumara ? ` · Sayı ${y.sayiNumara} (${y.sayiAy} ${y.sayiYil})` : ''}
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {searchResults.araYazilar.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> Blog
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.araYazilar.map((ay) => (
                                <li key={ay.id}>
                                  <button
                                    className="w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={() => { closeSearch(); onAraYaziAc?.(ay); }}
                                  >
                                    <span className="block text-sm font-medium leading-snug">{ay.baslik}</span>
                                    <span className="block text-xs text-muted-foreground mt-0.5">
                                      {ay.yazar?.tamAd ?? ''}
                                      {ay.kategori ? ` · ${ay.kategori}` : ''}
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {searchResults.yazarlar.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" /> Yazarlar
                            </h3>
                            <ul className="divide-y divide-border/60">
                              {searchResults.yazarlar.map((yz) => (
                                <li key={yz.id}>
                                  <button
                                    className="w-full text-left py-2.5 px-2 hover:bg-muted/60 transition-colors rounded-sm"
                                    onClick={() => { closeSearch(); onYazarAc?.(yz.id); }}
                                  >
                                    <span className="block text-sm font-medium">{yz.tamAd}</span>
                                  </button>
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
                    {navItems.map((item) => (
                      item.children ? (
                        <div key={item.id}>
                          <span className="text-left text-lg font-medium py-2 border-b border-border/50 text-muted-foreground block">
                            {item.label}
                          </span>
                          <div className="pl-4 mt-2 space-y-2">
                            {item.children.map((c) => (
                              <button
                                key={c.nav}
                                onClick={() => handleNavClick(c.nav)}
                                className={`text-sm block ${currentPage === c.page ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : item.type === 'sayilar' ? (
                        <div key={item.id}>
                          <button
                            onClick={() => handleNavClick('sonsayi')}
                            className={`text-left text-lg font-medium py-2 border-b border-border/50 transition-colors w-full ${
                              currentPage === 'sonsayi'
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Sayılar
                          </button>
                          <div className="pl-4 mt-2 space-y-2">
                            <button
                              onClick={() => handleNavClick('sonsayi')}
                              className="text-sm text-muted-foreground hover:text-foreground block"
                            >
                              Son Sayı ({sonSayi.numara})
                            </button>
                            {menuSayilari.slice(0, 3).map((sayi) => (
                              <button
                                key={sayi.id}
                                onClick={() => {
                                  if (sayi.pdfUrl) {
                                    window.open(sayi.pdfUrl, '_blank', 'noopener,noreferrer');
                                  } else {
                                    handleNavClick('arsiv');
                                  }
                                  setMobileMenuOpen(false);
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground block"
                              >
                                {sayiEtiketi(sayi)}
                              </button>
                            ))}
                            <button
                              onClick={() => handleNavClick('arsiv')}
                              className="text-sm text-blue-600 hover:text-blue-800 block"
                            >
                              Tüm Sayılar →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`text-left text-lg font-medium py-2 border-b border-border/50 transition-colors ${
                            currentPage === item.id
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
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
