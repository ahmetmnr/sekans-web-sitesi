import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  // Yazı sayısı: API bootstrap'ta tüm sayıları kapsayan sayacı gönderir (yaziSayisi);
  // yoksa eldeki verilerden (blog + son sayı) hesaplanır.
  const yaziSayilari = useMemo(() => {
    const map = new Map<string, number>();
    yazarlar.forEach((y) => map.set(y.id, 0));
    araYazilar.forEach((ay) => {
      map.set(ay.yazar.id, (map.get(ay.yazar.id) ?? 0) + 1);
    });
    sonSayi.yazilar.forEach((y) => {
      map.set(y.yazar.id, (map.get(y.yazar.id) ?? 0) + 1);
    });
    return map;
  }, [yazarlar, araYazilar, sonSayi.yazilar]);

  const yaziSayisi = (yazar: Yazar) =>
    yazar.yaziSayisi ?? yaziSayilari.get(yazar.id) ?? 0;

  // Alfabetik sırala (Türkçe)
  const siraliYazarlar = useMemo(() =>
    [...yazarlar].sort((a, b) => a.tamAd.localeCompare(b.tamAd, 'tr')),
    [yazarlar]
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
            Sekans dergisine katkıda bulunan yazarlar
          </p>
        </div>

        {/* Yazarlar Grid — sade: isim + yazı sayısı */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {siraliYazarlar.map(yazar => (
            <button
              key={yazar.id}
              onClick={() => onYazarClick(yazar)}
              className="text-left group bg-muted/30 hover:bg-muted/50 transition-all rounded-lg px-4 py-4 md:px-5"
            >
              <h3 className="font-serif text-base md:text-lg leading-snug group-hover:underline underline-offset-2">
                {yazar.tamAd}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {yaziSayisi(yazar)} yazı
              </p>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
