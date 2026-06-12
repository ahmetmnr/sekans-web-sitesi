import { FileText, Calendar, Download } from 'lucide-react';
import type { ArsivSayi } from '@/types';

interface ArsivSayfasiProps {
  arsivSayilari: ArsivSayi[];
}

export default function ArsivSayfasi({ arsivSayilari }: ArsivSayfasiProps) {
  // Yıllara göre grupla
  const yillaraGore = arsivSayilari.reduce((acc, sayi) => {
    if (!acc[sayi.yil]) {
      acc[sayi.yil] = [];
    }
    acc[sayi.yil].push(sayi);
    return acc;
  }, {} as Record<number, ArsivSayi[]>);

  const yillar = Object.keys(yillaraGore).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Başlık */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="page-title mb-4">Arşiv</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sekans dergisinin geçmiş sayılarına buradan ulaşabilirsiniz. 
            Her sayının kapağına tıklayarak PDF olarak indirebilirsiniz.
          </p>
        </div>

        {/* Yıllara Göre Gruplar */}
        <div className="space-y-12 md:space-y-16">
          {yillar.map((yil) => (
            <section key={yil}>
              {/* Yıl Başlığı */}
              <h2 className="text-2xl md:text-3xl font-serif mb-6 md:mb-8 pb-2 border-b border-border">
                {yil}
              </h2>

              {/* Sayılar Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {yillaraGore[Number(yil)].map((sayi) => (
                  <article key={sayi.id} className="group">
                    {/* Kapak */}
                    <a
                      href={sayi.pdfUrl}
                      className="arsiv-kapak block aspect-[3/4] bg-muted overflow-hidden shadow-md"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={sayi.kapakGorseli}
                        alt={`Sekans ${sayi.numara} Kapak`}
                        className="w-full h-full object-cover transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-sayi.jpg';
                        }}
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
                        <Download className="w-8 h-8 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                      </div>
                    </a>

                    {/* Bilgiler */}
                    <div className="mt-3 text-center">
                      <h3 className="font-serif text-lg group-hover:underline underline-offset-2">
                        Sayı {sayi.numara}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {sayi.ay}
                      </p>
                      <a
                        href={sayi.pdfUrl}
                        className="pdf-link mt-2 inline-flex text-xs"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>PDF İndir</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Navigasyon - Eski Sayılar */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Daha eski sayılar için arşiv çalışmalarımız devam etmektedir.
          </p>
        </div>
      </div>
    </main>
  );
}
