import { ArrowLeft, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HakkimizdaSayfasiProps {
  hakkimizda: {
    baslik: string;
    icerik: string;
    iletisim: {
      email: string;
      adres: string;
      sosyal: {
        twitter: string;
        instagram: string;
        facebook: string;
      };
    };
  };
  onBackClick: () => void;
}

export default function HakkimizdaSayfasi({ hakkimizda, onBackClick }: HakkimizdaSayfasiProps) {
  // Markdown benzeri içeriği HTML'e dönüştür
  const formatIcerik = (icerik: string) => {
    return icerik
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>

        {/* Başlık */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="page-title mb-4">{hakkimizda.baslik}</h1>
        </div>

        {/* İçerik */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="content-text"
            dangerouslySetInnerHTML={{ __html: `<p>${formatIcerik(hakkimizda.icerik)}</p>` }}
          />
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-muted/50 p-6 md:p-8 mt-12">
          <h2 className="section-title mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            İletişim
          </h2>
          
          <div className="space-y-4">
            <a
              href={`mailto:${hakkimizda.iletisim.email}`}
              className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>{hakkimizda.iletisim.email}</span>
            </a>
            
            <div className="flex items-center gap-3 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span>{hakkimizda.iletisim.adres}</span>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Sosyal Medya
            </h3>
            <div className="flex flex-wrap gap-4">
              <a
                href={hakkimizda.iletisim.sosyal.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Twitter
              </a>
              <a
                href={hakkimizda.iletisim.sosyal.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
              <a
                href={hakkimizda.iletisim.sosyal.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
