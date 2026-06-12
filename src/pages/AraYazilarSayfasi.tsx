import { useState, useMemo } from 'react';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import type { AraYazi } from '@/types';
import { Button } from '@/components/ui/button';

interface AraYazilarSayfasiProps {
  araYazilar: AraYazi[];
  onAraYaziClick: (araYazi: AraYazi) => void;
  onBackClick: () => void;
  baslik?: string;
  aciklama?: string;
}

export default function AraYazilarSayfasi({
  araYazilar,
  onAraYaziClick,
  onBackClick,
  baslik = 'Ara Yazılar',
  aciklama = 'Sekans dergisinin rutin sayılarından ayrı olarak yayınlanan, güncel sinema yazıları ve derinlemesine analizler.',
}: AraYazilarSayfasiProps) {
  const [activeKategori, setActiveKategori] = useState<string | null>(null);

  // Kategoriler
  const kategoriler = useMemo(() =>
    [...new Set(araYazilar.map(y => y.kategori))].sort(),
    [araYazilar]
  );

  // Filtreleme
  const filteredYazilar = useMemo(() =>
    activeKategori
      ? araYazilar.filter(y => y.kategori === activeKategori)
      : araYazilar,
    [araYazilar, activeKategori]
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

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
          Ana Sayfa
        </Button>

        {/* Başlık */}
        <div className="mb-8 md:mb-10 border-b border-border pb-4">
          <h1 className="page-title mb-3">{baslik}</h1>
          <p className="text-muted-foreground max-w-2xl">{aciklama}</p>
        </div>

        {/* Kategori Filtreleri */}
        {kategoriler.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveKategori(null)}
              className={`px-3.5 py-1.5 text-sm rounded-sm transition-colors ${
                !activeKategori
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Tümü
            </button>
            {kategoriler.map((kat) => (
              <button
                key={kat}
                onClick={() => setActiveKategori(activeKategori === kat ? null : kat)}
                className={`px-3.5 py-1.5 text-sm rounded-sm transition-colors ${
                  activeKategori === kat
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        )}

        {/* Sonuç sayısı */}
        {activeKategori && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredYazilar.length} yazı bulundu
          </p>
        )}

        {/* Yazılar Grid */}
        {filteredYazilar.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredYazilar.map((araYazi) => (
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
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(araYazi.yayinTarihi)}
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
                <div className="flex items-center gap-2 mt-3">
                  {araYazi.yazar.fotograf ? (
                    <img
                      src={araYazi.yazar.fotograf}
                      alt={araYazi.yazar.tamAd}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground/80">
                    {araYazi.yazar.tamAd}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Bu kategoride yazı bulunamadı.
            </p>
            <button
              onClick={() => setActiveKategori(null)}
              className="mt-4 text-sm text-foreground underline underline-offset-4"
            >
              Tüm yazıları göster
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
