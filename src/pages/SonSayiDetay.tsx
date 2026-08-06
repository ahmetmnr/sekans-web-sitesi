import { ArrowLeft, FileText } from 'lucide-react';
import type { Sayi, Yazi } from '@/types';
import { Button } from '@/components/ui/button';
import { sayiAdi } from '@/lib/utils';
import { IcindekilerSatiri } from '@/components/IcindekilerSatiri';
import { KunyePanel } from '@/components/KunyePanel';

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

            {/* Künye — kapağın altında, akordiyon panel içinde [7] */}
            <KunyePanel kunye={sayi.kunye} sayiAdi={adi} editorAd={sayi.editorAd} />
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

            {/* İçindekiler — ana sayfayla AYNI düzen (IcindekilerSatiri).
                Farkı: burada spot da görünür. Spot sol kolonda kalır; dizin
                görselini sarmaz ve altına akmaz [6]. */}
            <ul className="space-y-6 md:space-y-7">
              {sayi.yazilar.map((yazi) => (
                <li key={yazi.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <IcindekilerSatiri
                    yazi={yazi}
                    onClick={() => onYaziClick(yazi)}
                    spotGoster
                    baslikSinifi="ic-baslik-buyuk"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
