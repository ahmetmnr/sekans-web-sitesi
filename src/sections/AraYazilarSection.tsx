import { ArrowRight } from 'lucide-react';
import type { AraYazi } from '@/types';

interface AraYazilarSectionProps {
  araYazilar: AraYazi[];
  onAraYaziClick: (araYazi: AraYazi) => void;
  onTumunuGorClick?: () => void;   // verilmezse "Tümünü Gör" gizlenir
  baslik?: string;                 // panel başlığı (varsayılan "Blog")
  adet?: number;                   // gösterilecek yazı sayısı (varsayılan 6)
}

export default function AraYazilarSection({
  araYazilar,
  onAraYaziClick,
  onTumunuGorClick,
  baslik = 'Blog',
  adet = 6,
}: AraYazilarSectionProps) {
  // İlk `adet` ara yazıyı göster
  const sonAraYazilar = araYazilar.slice(0, Math.max(1, adet));

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Başlık ve "Tümünü Gör" Linki */}
        <div className="flex items-center justify-between mb-8 md:mb-10 border-b border-border pb-4">
          <h2 className="section-title">{baslik}</h2>
          {onTumunuGorClick && (
            <button
              onClick={onTumunuGorClick}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sonAraYazilar.map((araYazi) => (
            <article
              key={araYazi.id}
              onClick={() => onAraYaziClick(araYazi)}
              className="ara-yazi-kart group cursor-pointer"
            >
              {/* Kapak Görseli */}
              <div className="aspect-[16/10] bg-muted overflow-hidden mb-4">
                <img
                  src={araYazi.kapakGorseli || '/images/default-cover.svg'}
                  alt={araYazi.baslik}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/default-cover.svg';
                  }}
                />
              </div>

              {/* Kategori ve Tarih */}
              <div className="flex items-center gap-3 mb-2">
                <span className="kategori-etiket">{araYazi.kategori}</span>
                <span className="text-xs text-muted-foreground">
                  {araYazi.tarihEtiketi?.trim()
                    ? araYazi.tarihEtiketi
                    : new Date(araYazi.yayinTarihi).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </span>
              </div>

              {/* Başlık */}
              <h3 className="ara-yazi-baslik text-xl md:text-2xl leading-tight mb-3 font-serif">
                {araYazi.baslik}
              </h3>

              {/* Spot */}
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {araYazi.spot}
              </p>

              {/* Yazar */}
              <p className="mt-3 text-sm font-medium text-foreground/80">
                {araYazi.yazar.tamAd}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
