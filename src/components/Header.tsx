import { useState } from 'react';
import { Search, Menu, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCMS } from '@/context/CMSContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const navItems = [
  { id: 'anasayfa', label: 'Ana Sayfa' },
  { id: 'hakkimizda', label: 'Hakkımızda' },
  { id: 'sonsayi', label: 'Son Sayı', type: 'dropdown' },
  { id: 'yarisma', label: 'Yarışma' },
  { id: 'arayazilar', label: 'Yazılar', type: 'bolumler' },
  { id: 'yazarlar', label: 'Yazarlar' },
  { id: 'arsiv', label: 'Arşiv' },
  { id: 'iletisim', label: 'İletişim' },
];

// Canlı siteden taşınan bölümler ("Yazılar" menüsü altında)
const bolumItems = [
  { id: 'arayazilar', label: 'Ara Yazılar' },
  { id: 'yazarlarimizdan', label: 'Yazarlarımızdan' },
  { id: 'sinemakitapligi', label: 'Sinema Kitaplığı' },
  { id: 'basilisayilar', label: 'Basılı Sayılar' },
  { id: 'duyurular', label: 'Duyurular' },
];

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sonSayi, arsivSayilari } = useCMS();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Arama fonksiyonu - şimdilik sadece konsola yazdırıyor
    console.log('Arama:', searchQuery);
  };

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
              item.type === 'bolumler' ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`main-nav-link flex items-center gap-1 ${bolumItems.some((b) => b.id === currentPage) ? 'text-foreground after:w-full' : ''}`}
                    >
                      {item.label}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    {bolumItems.map((b) => (
                      <DropdownMenuItem key={b.id} onClick={() => handleNavClick(b.id)}>
                        {b.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : item.type === 'dropdown' ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`main-nav-link flex items-center gap-1 ${currentPage === item.id || currentPage === 'sayidetay' ? 'text-foreground after:w-full' : ''}`}
                    >
                      Sayılar
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56">
                    <DropdownMenuItem onClick={() => handleNavClick('sonsayi')}>
                      <span className="font-medium">Son Sayı</span>
                      <span className="ml-auto text-xs text-muted-foreground">{sonSayi.numara}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {arsivSayilari.slice(0, 5).map((sayi) => (
                      <DropdownMenuItem
                        key={sayi.id}
                        onClick={() => handleNavClick(`sayi-${sayi.id}`)}
                      >
                        Sayı {sayi.numara}
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
            {/* Arama Butonu */}
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                  aria-label="Ara"
                >
                  <Search className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif text-2xl">Arama</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="mt-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Yazı, yazar veya konu ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="btn-sekans-primary">
                      Ara
                    </Button>
                  </div>
                </form>
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
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <div className="flex flex-col gap-6 mt-8">
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      item.type === 'bolumler' ? (
                        <div key={item.id}>
                          <span className="text-left text-lg font-medium py-2 border-b border-border/50 text-muted-foreground block">
                            {item.label}
                          </span>
                          <div className="pl-4 mt-2 space-y-2">
                            {bolumItems.map((b) => (
                              <button
                                key={b.id}
                                onClick={() => handleNavClick(b.id)}
                                className={`text-sm block ${currentPage === b.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : item.type === 'dropdown' ? (
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
                            {arsivSayilari.slice(0, 3).map((sayi) => (
                              <button
                                key={sayi.id}
                                onClick={() => handleNavClick(`sayi-${sayi.id}`)}
                                className="text-sm text-muted-foreground hover:text-foreground block"
                              >
                                Sayı {sayi.numara}
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
