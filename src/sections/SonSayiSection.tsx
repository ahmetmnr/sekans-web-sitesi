import { FileText } from 'lucide-react';
import type { Sayi, Yazi } from '@/types';
import { sayiAdi } from '@/lib/utils';
import { IcindekilerSatiri } from '@/components/IcindekilerSatiri';
import { KunyePanel } from '@/components/KunyePanel';

interface SonSayiSectionProps {
  sayi: Sayi;
  onYaziClick: (yazi: Yazi) => void;
  onSayiClick: (sayi: Sayi) => void;
}

/**
 * Ana sayfadaki sayı bölümü — iki kolonlu kompakt düzen:
 *   sol  : sayı kapağı, PDF bağlantısı ve künye (masaüstünde yapışkan)
 *   sağ  : ay/yıl + sayı adı + içindekiler
 *
 * İçindekiler satırında metin SOLDA, dizin görseli SAĞDA durur: sayfanın sol
 * tarafında kapak ile küçük görseller üst üste yığılmasın.
 * Tarih yalnızca bir kez (sağ kolonun üstünde) gösterilir.
 */
export default function SonSayiSection({ sayi, onYaziClick, onSayiClick }: SonSayiSectionProps) {
  const adi = sayiAdi(sayi);
  const tarih = [sayi.ay, sayi.yil || ''].filter(Boolean).join(' ');

  return (
    <section className="son-sayi-section py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-8 lg:gap-12 items-start">
          {/* Sol Kolon — Kapak, PDF, künye */}
          <div className="lg:sticky lg:top-24 max-w-[260px] mx-auto lg:mx-0">
            <button
              onClick={() => onSayiClick(sayi)}
              className="relative group block w-full"
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
                className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>Tüm sayıyı PDF olarak indir</span>
              </a>
            )}

            {/* Künye — kapağın altında, sol kolonda, akordiyon panel içinde [7] */}
            <KunyePanel kunye={sayi.kunye} />
          </div>

          {/* Sağ Kolon — Ay/Yıl, sayı adı, içindekiler */}
          <div className="min-w-0">
            <div className="border-b border-border pb-3 mb-5 md:mb-6">
              {tarih && (
                <p className="text-sm text-muted-foreground mb-1">{tarih}</p>
              )}
              <h2 className="section-title">{adi}</h2>
            </div>

            {/* İçindekiler — düzenin tamamı IcindekilerSatiri'ndan gelir:
                kategori tam genişlikte, başlık/yazar kademeli girintili,
                dizin görselinin üstü başlık satırıyla hizalı. */}
            <ul className="space-y-5 md:space-y-6">
              {sayi.yazilar.map((yazi) => (
                <li key={yazi.id}>
                  <IcindekilerSatiri
                    yazi={yazi}
                    onClick={() => onYaziClick(yazi)}
                    baslikSinifi="text-lg md:text-xl"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
