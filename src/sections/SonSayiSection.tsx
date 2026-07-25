import { FileText } from 'lucide-react';
import type { Sayi, Yazi } from '@/types';
import { sayiAdi } from '@/lib/utils';

interface SonSayiSectionProps {
  sayi: Sayi;
  onYaziClick: (yazi: Yazi) => void;
  onSayiClick: (sayi: Sayi) => void;
}

/**
 * Sayı ana sayfası bölümü — iki kolonlu kompakt düzen:
 *   sol  : sayı kapağı (masaüstünde yapışkan)
 *   sağ  : ay/yıl + sayı adı + içindekiler (kategori, başlık, yazar, küçük görsel)
 * Tarih yalnızca bir kez (sağ kolonun üstünde) gösterilir. Bu düzen "Son Sayı"nın
 * yanı sıra siteye aktarılacak eski sayılar için de kullanılır.
 */
export default function SonSayiSection({ sayi, onYaziClick, onSayiClick }: SonSayiSectionProps) {
  const adi = sayiAdi(sayi);
  const tarih = [sayi.ay, sayi.yil || ''].filter(Boolean).join(' ');

  return (
    <section className="son-sayi-section py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-8 lg:gap-12 items-start">
          {/* Sol Kolon — Kapak */}
          <div className="lg:sticky lg:top-24">
            <button
              onClick={() => onSayiClick(sayi)}
              className="relative group block w-full max-w-[260px] mx-auto lg:mx-0"
            >
              <div className="aspect-[3/4] bg-muted overflow-hidden shadow-lg transition-shadow duration-500 group-hover:shadow-xl">
                <img
                  src={sayi.kapakGorseli}
                  alt={`${adi} kapak`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-sayi.jpg';
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
            </button>

            {sayi.pdfUrl && (
              <a
                href={sayi.pdfUrl}
                className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors max-w-[260px] mx-auto lg:mx-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Tüm sayıyı PDF olarak indir</span>
              </a>
            )}
          </div>

          {/* Sağ Kolon — Ay/Yıl, sayı adı, içindekiler */}
          <div className="min-w-0">
            <div className="border-b border-border pb-3 mb-5 md:mb-6">
              {tarih && (
                <p className="text-sm text-muted-foreground mb-1">{tarih}</p>
              )}
              <h2 className="section-title">{adi}</h2>
            </div>

            <ul className="space-y-5 md:space-y-6">
              {sayi.yazilar.map((yazi) => (
                <li key={yazi.id}>
                  <button
                    onClick={() => onYaziClick(yazi)}
                    className="yazi-kart w-full text-left group flex items-start gap-4"
                  >
                    {/* Küçük görsel */}
                    <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-muted overflow-hidden">
                      <img
                        src={yazi.kapakGorseli || sayi.kapakGorseli || '/images/default-cover.svg'}
                        alt={yazi.baslik}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/default-cover.svg';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="kategori-etiket block mb-1">
                        {yazi.kategori?.ad ?? ''}
                      </span>
                      <h3 className="yazi-baslik text-base md:text-lg leading-snug line-clamp-3">
                        {yazi.baslik}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {yazi.yazar?.tamAd ?? ''}
                      </p>
                      {yazi.pdfUrl && (
                        <a
                          href={yazi.pdfUrl}
                          className="pdf-link mt-1.5 inline-flex"
                          onClick={(e) => e.stopPropagation()}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
