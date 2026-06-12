import { ArrowLeft, Trophy, Calendar, FileText, Award, Star, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YarismaSayfasiProps {
  yarismasi: {
    baslik: string;
    aciklama: string;
    gecmisKazananlar: {
      yil: number;
      birinci: string;
      ikinci: string;
    }[];
  };
  onBackClick: () => void;
}

export default function YarismaSayfasi({ yarismasi, onBackClick }: YarismaSayfasiProps) {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="page-title mb-4">{yarismasi.baslik}</h1>
        </div>

        {/* Açıklama */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="content-text"
            dangerouslySetInnerHTML={{ __html: `<p>${formatIcerik(yarismasi.aciklama)}</p>` }}
          />
        </div>

        {/* Önemli Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-muted/50 p-6 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-1">Başvuru Tarihleri</h3>
            <p className="text-sm text-muted-foreground">
              Her yıl Mart-Nisan aylarında
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-1">Kategoriler</h3>
            <p className="text-sm text-muted-foreground">
              Film Eleştirisi ve Film Çözümlemesi
            </p>
          </div>
          
          <div className="bg-muted/50 p-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-1">Ödüller</h3>
            <p className="text-sm text-muted-foreground">
              Para ödülü ve dergide yayınlanma
            </p>
          </div>
        </div>

        {/* Geçmiş Kazananlar */}
        <div className="border-t border-border pt-10 md:pt-12">
          <h2 className="section-title mb-8 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Geçmiş Kazananlar
          </h2>

          <div className="space-y-6">
            {yarismasi.gecmisKazananlar.map((kazanan) => (
              <div 
                key={kazanan.yil}
                className="bg-muted/30 p-4 md:p-6"
              >
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {kazanan.yil}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </span>
                    <p className="text-sm">{kazanan.birinci}</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </span>
                    <p className="text-sm">{kazanan.ikinci}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Başvuru Bilgisi */}
        <div className="mt-12 bg-foreground text-background p-6 md:p-8 text-center">
          <h3 className="text-xl font-medium mb-3">Başvuru Yapmak İster Misiniz?</h3>
          <p className="text-background/70 mb-4">
            Yarışma başvuruları her yıl Mart ayında açılır. 
            Güncel duyurular için bizi takip edin.
          </p>
          <a 
            href="mailto:info@sekans.org"
            className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 hover:no-underline"
          >
            <Mail className="w-4 h-4" />
            info@sekans.org
          </a>
        </div>
      </div>
    </main>
  );
}
