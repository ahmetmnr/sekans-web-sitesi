import { Mail, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground text-background py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Logo ve Açıklama */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="sekans-logo text-2xl tracking-[0.2em] text-background">sekans</span>
              <span className="sekans-logo-sub block mt-1 text-background/70">sinema kültürü dergisi</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed max-w-md">
              Sekans Sinema Grubu, 2005 yılından bu yana sinema kültürünü yaymayı 
              ve sinema üzerine eleştirel düşünceyi geliştirmeyi amaçlayan bir kolektiftir.
            </p>
            
            {/* İletişim Bilgileri */}
            <div className="mt-6 space-y-2">
              <a 
                href="mailto:info@sekans.org"
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>info@sekans.org</span>
              </a>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Hızlı Linkler
            </h3>
            <nav className="space-y-2">
              {[
                { id: 'anasayfa', label: 'Ana Sayfa' },
                { id: 'sonsayi', label: 'Son Sayı' },
                { id: 'indeks', label: 'Sekans İndeks' },
                { id: 'arayazilar', label: 'Blog' },
                { id: 'sinemakitapligi', label: 'Sinema Kitaplığı' },
                { id: 'textsinenglish', label: 'Texts in English' },
                { id: 'duyurular', label: 'Duyurular' },
                { id: 'arsiv', label: 'Arşiv' },
                { id: 'yarisma', label: 'Yarışma' },
                { id: 'hakkimizda', label: 'Hakkımızda' },
                { id: 'iletisim', label: 'İletişim' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="block text-sm text-background/70 hover:text-background transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Sosyal Medya */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Sosyal Medya
            </h3>
            <div className="space-y-2">
              <a
                href="https://twitter.com/sekansdergi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <span>Twitter</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://instagram.com/sekansdergi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <span>Instagram</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://facebook.com/sekansdergi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-background/70 hover:text-background transition-colors"
              >
                <span>Facebook</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="mt-12 pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-background/50">
              © {new Date().getFullYear()} Sekans Sinema Grubu. Tüm hakları saklıdır.
            </p>
            <p className="text-xs text-background/50">
              Yılda iki kez yayınlanır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
