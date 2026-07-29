import { useRef } from 'react';
import { ArrowLeft, User, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AraYazi, Yazar } from '@/types';
import { Button } from '@/components/ui/button';
import { useFootnotes } from '@/hooks/useFootnotes';
import ReadingIndicator from '@/components/ReadingIndicator';
import PaylasimKutusu from '@/components/PaylasimKutusu';
import { araYaziKategorileri, yaziYazarlari, yazarAdlari } from '@/lib/utils';
import { GORSEL_ORAN_SINIFI } from '@/lib/gorselStandardi';

interface AraYaziDetayProps {
  araYazi: AraYazi;
  oncekiAraYazi?: AraYazi;
  sonrakiAraYazi?: AraYazi;
  tumAraYazilar?: AraYazi[];
  /** "Geri Dön" butonunun etiketi — geldiğin sayfanın adı (ör. "Blog", "Ana Sayfa"). */
  geriBaslik?: string;
  onBackClick: () => void;
  onOncekiAraYazi?: () => void;
  onSonrakiAraYazi?: () => void;
  onAraYaziClick?: (araYazi: AraYazi) => void;
  onYazarClick?: (yazar: Yazar) => void;
}

/**
 * Ara yazı detayı — e-Sayı yazılarıyla aynı sade düzen:
 *   - üstteki büyük kapak görseli YOK, tarih ve kategori etiketi YOK
 *   - sağ kolon: yazar kartı (yalnız foto + ad) -> yazarın diğer yazıları -> paylaşım
 *   - yazar kartı sayfayla birlikte yukarı gider; paylaşım kutusu ondan sonra
 *     sabitlenir ve yazı bitince sabitlenmeyi bırakır.
 */
export default function AraYaziDetay({
  araYazi,
  oncekiAraYazi,
  sonrakiAraYazi,
  tumAraYazilar = [],
  geriBaslik = 'Ara Yazılar',
  onBackClick,
  onOncekiAraYazi,
  onSonrakiAraYazi,
  onAraYaziClick,
  onYazarClick,
}: AraYaziDetayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useFootnotes(contentRef, [araYazi.icerik]);

  // Benzer yazılar - ortak kategoriden, mevcut yazı hariç, max 3
  const kendiKategorileri = araYaziKategorileri(araYazi);
  const benzerYazilar = tumAraYazilar
    .filter(y => y.id !== araYazi.id && araYaziKategorileri(y).some(k => kendiKategorileri.includes(k)))
    .slice(0, 3);

  const yazarlar = yaziYazarlari(araYazi);

  // Yazarın diğer yazıları - aynı yazar, mevcut yazı hariç, max 4
  const yazarinDigerYazilari = tumAraYazilar
    .filter(y => y.yazar?.tamAd === araYazi.yazar?.tamAd && y.id !== araYazi.id)
    .slice(0, 4);

  return (
    <main className="animate-fade-in py-8 md:py-12">
      {/* Okuma İlerleme Göstergesi */}
      <ReadingIndicator contentRef={contentRef} contentDep={araYazi.icerik} />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {geriBaslik}
        </Button>

        {/* Kapak Görseli — yazı yazılarıyla aynı oranda (2:1). Editör isterse
            üst bantta gösterilmesini kapatabilir (kapakUstte). */}
        {araYazi.kapakGorseli && araYazi.kapakUstte !== false && (
          <div className={`${GORSEL_ORAN_SINIFI} bg-muted overflow-hidden mb-8`}>
            <img
              src={araYazi.kapakGorseli}
              alt={araYazi.baslik}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Başlık — kategori etiketi ve tarih satırı kaldırıldı */}
        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-tight">
            {araYazi.baslik}
          </h1>
        </header>

        {/* Spot */}
        {araYazi.spot && (
          <p className="text-xl text-muted-foreground italic leading-relaxed mb-8 border-l-2 border-border pl-4">
            {araYazi.spot}
          </p>
        )}

        {/* Ana Layout: İçerik | Sağ Kolon (sol paylaşım bandı kaldırıldı) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* İçerik */}
          <article ref={contentRef} className="prose prose-lg max-w-none flex-1 min-w-0 cms-content-preview">
            <div
              className="content-text"
              dangerouslySetInnerHTML={{ __html: araYazi.icerik.replace(/\n/g, '<br/>') }}
            />
            <div className="clear-both" />
          </article>

          {/* Sağ Kolon */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Yazar(lar): yalnızca profil fotoğrafı ve ad */}
            {yazarlar.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-6 space-y-6">
                {yazarlar.map((yzr) => (
                  <div key={yzr.id} className="text-center">
                    {yzr.fotograf ? (
                      <img
                        src={yzr.fotograf}
                        alt={yzr.tamAd}
                        className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto border-2 border-border">
                        <User className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => onYazarClick?.(yzr)}
                      className="block w-full mt-4 font-serif font-bold text-lg hover:text-primary transition-colors hover:underline underline-offset-2"
                    >
                      {yzr.tamAd}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Yazarın Diğer Yazıları */}
            {yazarinDigerYazilari.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-5">
                <h4 className="font-serif font-bold text-sm mb-3">
                  Yazarın Diğer Yazıları
                </h4>
                <div className="space-y-3">
                  {yazarinDigerYazilari.map(yazi => (
                    <button
                      key={yazi.id}
                      onClick={() => onAraYaziClick?.(yazi)}
                      className="block w-full text-left group"
                    >
                      <p className="text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {yazi.baslik}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Paylaşım — yukarıdakiler geçildikten sonra sabitlenir */}
            <PaylasimKutusu baslik={araYazi.baslik} className="lg:sticky lg:top-24" />
          </aside>
        </div>

        {/* Benzer Yazılar */}
        {benzerYazilar.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-serif text-xl font-bold mb-6">Benzer Yazılar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benzerYazilar.map(yazi => (
                <button
                  key={yazi.id}
                  onClick={() => onAraYaziClick?.(yazi)}
                  className="text-left group bg-muted/20 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={yazi.kapakGorseli || '/images/default-cover.svg'}
                      alt={yazi.baslik}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-cover.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {yazi.kategori}
                    </span>
                    <h4 className="font-serif text-base font-bold mt-1 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {yazi.baslik}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {yazi.spot}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <span>{yazarAdlari(yazi)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Önceki/Sonraki Ara Yazılar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onOncekiAraYazi && oncekiAraYazi ? (
              <button
                onClick={onOncekiAraYazi}
                className="text-left p-4 bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <ChevronLeft className="w-4 h-4" />
                  Önceki Yazı
                </span>
                <h4 className="font-serif text-lg group-hover:underline underline-offset-2 line-clamp-2">
                  {oncekiAraYazi.baslik}
                </h4>
              </button>
            ) : (
              <div />
            )}
            {onSonrakiAraYazi && sonrakiAraYazi ? (
              <button
                onClick={onSonrakiAraYazi}
                className="text-right p-4 bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-2">
                  Sonraki Yazı
                  <ChevronRight className="w-4 h-4" />
                </span>
                <h4 className="font-serif text-lg group-hover:underline underline-offset-2 line-clamp-2">
                  {sonrakiAraYazi.baslik}
                </h4>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
