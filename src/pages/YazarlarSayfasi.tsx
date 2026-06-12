import { useMemo } from 'react';
import { ArrowLeft, User, BookOpen } from 'lucide-react';
import type { Yazar, AraYazi, Sayi } from '@/types';
import { Button } from '@/components/ui/button';

interface YazarlarSayfasiProps {
  yazarlar: Yazar[];
  araYazilar: AraYazi[];
  sonSayi: Sayi;
  onYazarClick: (yazar: Yazar) => void;
  onBackClick: () => void;
}

export default function YazarlarSayfasi({
  yazarlar,
  araYazilar,
  sonSayi,
  onYazarClick,
  onBackClick,
}: YazarlarSayfasiProps) {
  // Her yazar için yazı sayısını hesapla
  const yazarIstatistik = useMemo(() => {
    const map = new Map<string, { araYaziSayisi: number; dergiYaziSayisi: number; kategoriler: Set<string> }>();

    yazarlar.forEach(y => {
      map.set(y.id, { araYaziSayisi: 0, dergiYaziSayisi: 0, kategoriler: new Set() });
    });

    araYazilar.forEach(ay => {
      const stat = map.get(ay.yazar.id);
      if (stat) {
        stat.araYaziSayisi++;
        stat.kategoriler.add(ay.kategori);
      }
    });

    sonSayi.yazilar.forEach(y => {
      const stat = map.get(y.yazar.id);
      if (stat) {
        stat.dergiYaziSayisi++;
      }
    });

    return map;
  }, [yazarlar, araYazilar, sonSayi.yazilar]);

  // Yazı sayısına göre sırala (en çok yazanlar önce)
  const siraliYazarlar = useMemo(() =>
    [...yazarlar].sort((a, b) => {
      const statA = yazarIstatistik.get(a.id);
      const statB = yazarIstatistik.get(b.id);
      const toplamA = (statA?.araYaziSayisi || 0) + (statA?.dergiYaziSayisi || 0);
      const toplamB = (statB?.araYaziSayisi || 0) + (statB?.dergiYaziSayisi || 0);
      return toplamB - toplamA;
    }),
    [yazarlar, yazarIstatistik]
  );

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

        {/* Başlık */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="page-title mb-4">Yazarlar</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sekans dergisinin katkıda bulunan yazarları
          </p>
        </div>

        {/* Yazarlar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {siraliYazarlar.map(yazar => {
            const stat = yazarIstatistik.get(yazar.id);
            const toplamYazi = (stat?.araYaziSayisi || 0) + (stat?.dergiYaziSayisi || 0);
            const kategoriler = stat ? [...stat.kategoriler].slice(0, 2) : [];

            return (
              <button
                key={yazar.id}
                onClick={() => onYazarClick(yazar)}
                className="text-left group bg-muted/30 hover:bg-muted/50 transition-all rounded-lg p-5 md:p-6"
              >
                {/* Fotoğraf */}
                <div className="flex justify-center mb-4">
                  {yazar.fotograf ? (
                    <img
                      src={yazar.fotograf}
                      alt={yazar.tamAd}
                      className="w-20 h-20 rounded-full object-cover border-2 border-border group-hover:border-foreground/30 transition-colors"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border group-hover:border-foreground/30 transition-colors">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Ad */}
                <h3 className="font-serif text-lg font-bold text-center mb-2 group-hover:text-primary transition-colors">
                  {yazar.tamAd}
                </h3>

                {/* Biyografi kısaltması */}
                {yazar.biyografi && (
                  <p className="text-xs text-muted-foreground text-center line-clamp-2 leading-relaxed mb-3">
                    {yazar.biyografi}
                  </p>
                )}

                {/* İstatistik */}
                <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    {toplamYazi} yazı
                  </span>
                </div>

                {/* Kategoriler */}
                {kategoriler.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mt-2">
                    {kategoriler.map(kat => (
                      <span key={kat} className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                        {kat}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
