import { FileText, Calendar } from 'lucide-react';
import type { ArsivSayi } from '@/types';
import { sayiAdi } from '@/lib/utils';
import { uygulamaIciTiklama } from '@/lib/rotalar';

interface ArsivSayfasiProps {
  arsivSayilari: ArsivSayi[];
  /** Bir arşiv sayısının kendi sayfasını aç (içindekiler menüsüyle). */
  onSayiAc?: (sayiId: string) => void;
}

export default function ArsivSayfasi({ arsivSayilari, onSayiAc }: ArsivSayfasiProps) {
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
        {/* Başlık — filtre sayfalarıyla aynı sola yaslı görünüm */}
        <div className="mb-8 md:mb-10 border-b border-border pb-4">
          <h1 className="page-title mb-3">e-Sayılar</h1>
          <p className="text-muted-foreground max-w-2xl">
            Sekans dergisinin geçmiş sayılarına buradan ulaşabilirsiniz.
            Bir sayının kapağına tıklayarak içindekiler sayfasını açabilir,
            altındaki bağlantıdan PDF olarak indirebilirsiniz.
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
                    {/* Kapak — sayının KENDİ SAYFASINI açar ([14]).
                        Eskiden doğrudan PDF'e gidiyordu; bu yüzden bir sayının
                        içindekiler menüsüne hiçbir yerden ulaşılamıyordu.
                        PDF, aşağıdaki ayrı bağlantıda duruyor. */}
                    <a
                      href={`/sayi/${encodeURIComponent(sayi.id)}`}
                      onClick={(e) => {
                        if (!onSayiAc || !uygulamaIciTiklama(e)) return;
                        e.preventDefault();
                        onSayiAc(sayi.id);
                      }}
                      className="arsiv-kapak block aspect-[3/4] bg-muted overflow-hidden shadow-md"
                    >
                      <img
                        src={sayi.kapakGorseli}
                        alt={`${sayiAdi(sayi)} kapak`}
                        className="w-full h-full object-cover transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-sayi.jpg';
                        }}
                      />
                      {/* Hover Overlay — artık indirme değil, sayıya gidiş */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
                    </a>

                    {/* Bilgiler */}
                    <div className="mt-3 text-center">
                      {/* CMS'te girilen sayı adı AYNEN gösterilir (otomatik "Sayı" öneki yok) */}
                      <h3 className="font-serif text-lg">
                        <a
                          href={`/sayi/${encodeURIComponent(sayi.id)}`}
                          onClick={(e) => {
                            if (!onSayiAc || !uygulamaIciTiklama(e)) return;
                            e.preventDefault();
                            onSayiAc(sayi.id);
                          }}
                          className="group-hover:underline underline-offset-2"
                        >
                          {sayiAdi(sayi)}
                        </a>
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
