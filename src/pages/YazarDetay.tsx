import { useMemo } from 'react';
import { ArrowLeft, User, Calendar, BookOpen } from 'lucide-react';
import type { Yazar, AraYazi, Sayi } from '@/types';
import { Button } from '@/components/ui/button';

interface YazarDetayProps {
  yazar: Yazar;
  araYazilar: AraYazi[];
  sonSayi: Sayi;
  onBackClick: () => void;
  onAraYaziClick: (araYazi: AraYazi) => void;
  onYazarlarClick: () => void;
}

export default function YazarDetay({
  yazar,
  araYazilar,
  sonSayi,
  onBackClick,
  onAraYaziClick,
  onYazarlarClick,
}: YazarDetayProps) {
  // Yazarın ara yazıları
  const yazarinAraYazilari = useMemo(
    () => araYazilar.filter(y => y.yazar.id === yazar.id),
    [araYazilar, yazar.id]
  );

  // Yazarın dergi yazıları (sonSayi'daki)
  const yazarinDergiYazilari = useMemo(
    () => sonSayi.yazilar.filter(y => y.yazar.id === yazar.id),
    [sonSayi.yazilar, yazar.id]
  );

  // Kategorilere göre grupla
  const kategoriBazliYazilar = useMemo(() => {
    const map = new Map<string, AraYazi[]>();
    yazarinAraYazilari.forEach(y => {
      const list = map.get(y.kategori) || [];
      list.push(y);
      map.set(y.kategori, list);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [yazarinAraYazilari]);

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        {/* Geri Butonu */}
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            onClick={onBackClick}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <span className="text-muted-foreground">/</span>
          <Button
            variant="ghost"
            onClick={onYazarlarClick}
            className="text-muted-foreground hover:text-foreground"
          >
            Yazarlar
          </Button>
        </div>

        {/* Yazar Profil Kartı */}
        <div className="bg-muted/30 rounded-lg p-6 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {/* Fotoğraf */}
            {yazar.fotograf ? (
              <img
                src={yazar.fotograf}
                alt={yazar.tamAd}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-background shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg flex-shrink-0">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            )}

            {/* Bilgiler */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
                {yazar.tamAd}
              </h1>
              {yazar.biyografi && (
                <p className="text-muted-foreground leading-relaxed text-base md:text-lg mb-4">
                  {yazar.biyografi}
                </p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {yazarinAraYazilari.length + yazarinDergiYazilari.length} yazı
                </span>
                {kategoriBazliYazilar.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    {kategoriBazliYazilar.map(([kat]) => kat).slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dergi Yazıları */}
        {yazarinDergiYazilari.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-2xl font-bold mb-6 pb-3 border-b border-border">
              Dergi Yazıları
            </h2>
            <div className="space-y-4">
              {yazarinDergiYazilari.map(yazi => (
                <div
                  key={yazi.id}
                  className="p-4 bg-muted/20 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="kategori-etiket text-xs mb-1 inline-block">
                        {yazi.kategori.ad}
                      </span>
                      <h3 className="font-serif text-lg font-bold leading-snug">
                        {yazi.baslik}
                      </h3>
                      {yazi.spot && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {yazi.spot}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      Sayı {sonSayi.numara}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ara Yazılar */}
        {yazarinAraYazilari.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-bold mb-6 pb-3 border-b border-border">
              Ara Yazılar
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({yazarinAraYazilari.length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {yazarinAraYazilari.map(araYazi => (
                <article
                  key={araYazi.id}
                  onClick={() => onAraYaziClick(araYazi)}
                  className="group cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors p-3 md:p-4 rounded-lg"
                >
                  {/* Kapak */}
                  <div className="aspect-[16/10] bg-muted overflow-hidden mb-3 rounded-md">
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
                      {new Date(araYazi.yayinTarihi).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Başlık */}
                  <h3 className="text-base md:text-lg leading-tight mb-2 font-serif font-bold group-hover:text-primary transition-colors line-clamp-2">
                    {araYazi.baslik}
                  </h3>

                  {/* Spot */}
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {araYazi.spot}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Hiç yazı yoksa */}
        {yazarinAraYazilari.length === 0 && yazarinDergiYazilari.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg">Bu yazarın henüz yayımlanmış yazısı bulunmuyor.</p>
          </div>
        )}
      </div>
    </main>
  );
}
