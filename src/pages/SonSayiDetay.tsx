import { ArrowLeft, FileText } from 'lucide-react';
import type { Sayi, Yazi } from '@/types';
import { Button } from '@/components/ui/button';
import { sayiAdi, yazarAdlari } from '@/lib/utils';
import { GORSEL_ORAN_SINIFI } from '@/lib/gorselStandardi';

interface SonSayiDetayProps {
  sayi: Sayi;
  onYaziClick: (yazi: Yazi) => void;
  onBackClick: () => void;
}

/**
 * Sayı ana sayfası — ana sayfadaki sayı bölümüyle AYNI iki kolonlu düzen:
 *   sol : kapak, PDF bağlantısı, künye (masaüstünde yapışkan)
 *   sağ : ay/yıl + sayı adı + önsöz + içindekiler
 *
 * Farkı: burada her yazının SPOTU da görünür. Dizin görseli satırın sağına
 * yaslanır; kategori/başlık/yazar solunda durur, spot ise metnin devamı olarak
 * görselin altından tam genişliğe yayılır (float sarmalaması).
 */
export default function SonSayiDetay({ sayi, onYaziClick, onBackClick }: SonSayiDetayProps) {
  const adi = sayiAdi(sayi);
  const tarih = [sayi.ay, sayi.yil || ''].filter(Boolean).join(' ');

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr] gap-8 lg:gap-12 items-start">
          {/* Sol Kolon — Kapak, PDF, künye */}
          <div className="lg:sticky lg:top-24 max-w-[280px] mx-auto lg:mx-0 w-full">
            <div className="aspect-[3/4] bg-muted overflow-hidden shadow-lg">
              <img
                src={sayi.kapakGorseli}
                alt={`${adi} kapak`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-sayi.jpg';
                }}
              />
            </div>

            {sayi.pdfUrl && (
              <a
                href={sayi.pdfUrl}
                className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Tüm sayıyı PDF olarak indir</span>
              </a>
            )}

            {/* Künye — kapağın altında */}
            {sayi.kunye?.trim() && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                  {sayi.kunye}
                </p>
              </div>
            )}
          </div>

          {/* Sağ Kolon — Sayı adı, önsöz, içindekiler */}
          <div className="min-w-0">
            <div className="border-b border-border pb-3 mb-6">
              {tarih && <p className="text-sm text-muted-foreground mb-1">{tarih}</p>}
              <h1 className="section-title">{adi}</h1>
            </div>

            {/* Önsöz (Editörden) */}
            {sayi.onsoz?.trim() && (
              <div className="mb-8">
                <p className="content-text italic border-l-2 border-border pl-4 whitespace-pre-line">
                  {sayi.onsoz}
                </p>
              </div>
            )}

            <ul className="space-y-6 md:space-y-7">
              {sayi.yazilar.map((yazi) => {
                // Dizin görseli yoksa kapak görselinin küçültülmüş hali kullanılır.
                const kucukGorsel = yazi.dizinGorseli?.trim() || yazi.kapakGorseli?.trim() || '';
                return (
                  <li key={yazi.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <article
                      onClick={() => onYaziClick(yazi)}
                      className="group cursor-pointer"
                    >
                      {/* Dizin görseli sağa yaslanır; metin etrafını sarar */}
                      {kucukGorsel && (
                        <div
                          className={`float-right ml-4 mb-2 w-32 md:w-44 flex-shrink-0 bg-muted overflow-hidden ${GORSEL_ORAN_SINIFI}`}
                        >
                          <img
                            src={kucukGorsel}
                            alt={yazi.baslik}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const kutu = (e.target as HTMLImageElement).parentElement;
                              if (kutu) kutu.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <span className="kategori-etiket block mb-1">
                        {yazi.kategori?.ad ?? ''}
                      </span>
                      <h3 className="yazi-baslik text-lg md:text-xl leading-snug group-hover:underline underline-offset-4">
                        {yazi.baslik}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {yazarAdlari(yazi)}
                      </p>

                      {yazi.spot && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-justify">
                          {yazi.spot}
                        </p>
                      )}

                      {yazi.pdfUrl && (
                        <a
                          href={yazi.pdfUrl}
                          className="pdf-link mt-2 inline-flex"
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      )}

                      <div className="clear-both" />
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
