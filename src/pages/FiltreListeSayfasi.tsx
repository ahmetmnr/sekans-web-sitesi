import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, User, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AraYazi, FiltreSayfa } from '@/types';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { araYaziKategorileri } from '@/lib/utils';

interface FiltreListeSayfasiProps {
  slug: string;
  araYazilar: AraYazi[];          // tüm ara yazılar (client tarafında filtrelenir)
  onAraYaziClick: (araYazi: AraYazi) => void;
  onBackClick: () => void;
}

/**
 * Admin tanımlı filtre listeleme sayfası. Ayarları /api/filtre/{slug}'dan çeker;
 * içerik client tarafında kategoriye göre süzülür, sıralanır ve sayfalanır.
 */
export default function FiltreListeSayfasi({ slug, araYazilar, onAraYaziClick, onBackClick }: FiltreListeSayfasiProps) {
  const [config, setConfig] = useState<FiltreSayfa | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [bulunamadi, setBulunamadi] = useState(false);
  const [sayfa, setSayfa] = useState(1);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    setBulunamadi(false);
    setSayfa(1);
    api.filtre.get(slug)
      .then((d) => { if (!iptal) setConfig(d); })
      .catch(() => { if (!iptal) { setConfig(null); setBulunamadi(true); } })
      .finally(() => { if (!iptal) setYukleniyor(false); });
    return () => { iptal = true; };
  }, [slug]);

  // Filtrele + sırala
  const tumFiltreli = useMemo(() => {
    if (!config) return [];
    const list = config.kategori
      ? araYazilar.filter((y) => araYaziKategorileri(y).includes(config.kategori))
      : araYazilar;
    const sorted = [...list];
    if (config.siralama === 'eski') {
      sorted.sort((a, b) => (a.yayinTarihi || '').localeCompare(b.yayinTarihi || ''));
    } else if (config.siralama === 'alfabetik') {
      sorted.sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr'));
    } else {
      sorted.sort((a, b) => (b.yayinTarihi || '').localeCompare(a.yayinTarihi || ''));
    }
    return sorted;
  }, [config, araYazilar]);

  const sayfaBasina = config?.sayfaBasina && config.sayfaBasina > 0 ? config.sayfaBasina : 12;
  const toplamSayfa = Math.max(1, Math.ceil(tumFiltreli.length / sayfaBasina));
  const gecerliSayfa = Math.min(sayfa, toplamSayfa);
  const gorunen = tumFiltreli.slice((gecerliSayfa - 1) * sayfaBasina, gecerliSayfa * sayfaBasina);

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  if (yukleniyor) {
    return (
      <main className="animate-fade-in py-16 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
      </main>
    );
  }

  if (bulunamadi || !config) {
    return (
      <main className="animate-fade-in py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Button variant="ghost" onClick={onBackClick} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Ana Sayfa
          </Button>
          <p className="text-muted-foreground py-16 text-center">Sayfa bulunamadı.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Geri Butonu */}
        <Button variant="ghost" onClick={onBackClick} className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Ana Sayfa
        </Button>

        {/* Başlık */}
        <div className="mb-8 md:mb-10 border-b border-border pb-4">
          <h1 className="page-title mb-3">{config.baslik}</h1>
          {config.aciklama && <p className="text-muted-foreground max-w-2xl">{config.aciklama}</p>}
        </div>

        {/* Yazılar Grid */}
        {gorunen.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {gorunen.map((araYazi) => (
                <article
                  key={araYazi.id}
                  onClick={() => onAraYaziClick(araYazi)}
                  className="ara-yazi-kart group cursor-pointer"
                >
                  {config.kapakGoster && (
                    <div className="aspect-[16/10] bg-muted overflow-hidden mb-4">
                      <img
                        src={araYazi.kapakGorseli || '/images/default-cover.svg'}
                        alt={araYazi.baslik}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-cover.svg'; }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-2">
                    <span className="kategori-etiket">{araYazi.kategori}</span>
                    {config.yazarTarihGoster && araYazi.yayinTarihi && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(araYazi.yayinTarihi)}
                      </span>
                    )}
                  </div>

                  <h3 className="ara-yazi-baslik text-xl md:text-2xl leading-tight mb-3 font-serif">
                    {araYazi.baslik}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {araYazi.spot}
                  </p>

                  {config.yazarTarihGoster && (
                    <div className="flex items-center gap-2 mt-3">
                      {araYazi.yazar?.fotograf ? (
                        <img src={araYazi.yazar.fotograf} alt={araYazi.yazar.tamAd} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground/80">{araYazi.yazar?.tamAd ?? ''}</span>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Sayfalama */}
            {toplamSayfa > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={gecerliSayfa <= 1}
                  onClick={() => { setSayfa(gecerliSayfa - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Önceki
                </Button>
                <span className="text-sm text-muted-foreground px-2">{gecerliSayfa} / {toplamSayfa}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={gecerliSayfa >= toplamSayfa}
                  onClick={() => { setSayfa(gecerliSayfa + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  Sonraki <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Bu sayfada henüz içerik yok.</p>
          </div>
        )}
      </div>
    </main>
  );
}
