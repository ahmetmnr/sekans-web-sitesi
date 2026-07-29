import { useRef } from 'react';
import { FileText, ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { Yazi, Sayi, Yazar } from '@/types';
import { useFootnotes } from '@/hooks/useFootnotes';
import ReadingIndicator from '@/components/ReadingIndicator';
import PaylasimKutusu from '@/components/PaylasimKutusu';
import { sayiAdi, yaziYazarlari, yazarAdlari } from '@/lib/utils';
import { GORSEL_ORAN_SINIFI } from '@/lib/gorselStandardi';
import { ZenginMetin } from '@/components/ZenginMetin';
import { duzMetin } from '@/lib/zenginMetin';

interface YaziDetayProps {
  yazi: Yazi;
  sayi: Sayi;
  oncekiYazi?: Yazi;
  sonrakiYazi?: Yazi;
  onBackClick: () => void;
  onSayiClick: (sayi: Sayi) => void;
  onOncekiYazi?: () => void;
  onSonrakiYazi?: () => void;
  onYazarClick?: (yazar: Yazar) => void;
  onYaziClick?: (yazi: Yazi) => void;
}

/**
 * e-Sayı yazı detayı — sadeleştirilmiş düzen:
 *   - üstte "Geri Dön" YOK, başlık altında yazar/tarih satırı YOK
 *   - sağ kolon: yazar kartı (yalnız foto + ad) -> sayı içindekiler -> paylaşım
 *   - yazar kartı ve içindekiler sayfayla birlikte yukarı gider; paylaşım kutusu
 *     onlardan sonra sabitlenir ve yazı bitince sabitlenmeyi bırakır (aside,
 *     içerik yüksekliğine kadar uzar; sticky o kutunun içinde çalışır).
 */
export default function YaziDetay({
  yazi,
  sayi,
  oncekiYazi,
  sonrakiYazi,
  onSayiClick,
  onOncekiYazi,
  onSonrakiYazi,
  onYazarClick,
  onYaziClick,
}: YaziDetayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useFootnotes(contentRef, [yazi.icerik]);

  // Sayıdaki tüm yazılar (içindekiler için)
  const tumYazilar = sayi.yazilar;
  const sayiBaslik = sayiAdi(sayi);
  const yazarlar = yaziYazarlari(yazi);

  return (
    <main className="animate-fade-in py-8 md:py-12">
      {/* Okuma İlerleme Göstergesi */}
      <ReadingIndicator contentRef={contentRef} contentDep={yazi.icerik} />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Kapak Görseli — dizin görseliyle AYNI oranda (2:1). Editör isterse
            üst bantta gösterilmesini kapatabilir (kapakUstte). */}
        {yazi.kapakGorseli && yazi.kapakUstte !== false && (
          <div className={`${GORSEL_ORAN_SINIFI} bg-muted overflow-hidden mb-8`}>
            <img
              src={yazi.kapakGorseli}
              alt={duzMetin(yazi.baslik)}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Başlık — yazar/tarih satırı kaldırıldı (yazar sağ kartta) */}
        <header className="mb-8 pb-6 border-b border-border">
          <button
            onClick={() => onSayiClick(sayi)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <span>{sayiBaslik}</span>
          </button>

          <span className="kategori-etiket block mb-3">
            {yazi.kategori?.ad ?? ''}
          </span>

          <ZenginMetin
            as="h1"
            html={yazi.baslik}
            className="block text-3xl md:text-4xl lg:text-5xl font-serif leading-tight"
          />
        </header>

        {/* Spot */}
        {yazi.spot && (
          <ZenginMetin
            as="p"
            html={yazi.spot}
            className="text-xl text-muted-foreground italic leading-relaxed mb-8 border-l-2 border-border pl-4"
          />
        )}

        {/* Ana Layout: İçerik | Sağ Kolon (sol paylaşım bandı kaldırıldı) */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* İçerik */}
          <article ref={contentRef} className="prose prose-lg max-w-none flex-1 min-w-0 cms-content-preview">
            {yazi.icerik ? (
              <div
                className="content-text"
                dangerouslySetInnerHTML={{ __html: yazi.icerik }}
              />
            ) : (
              <div className="bg-muted/50 p-8 md:p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Bu yazının tam metni PDF formatında mevcuttur.
                </p>
                {yazi.pdfUrl && (
                  <a
                    href={yazi.pdfUrl}
                    className="btn-sekans-primary inline-flex"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF Olarak Oku
                  </a>
                )}
              </div>
            )}
            <div className="clear-both" />
          </article>

          {/* Sağ Kolon — yazar kartı, sayı içeriği, paylaşım (sırayla) */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            {/* Yazar(lar): yalnızca profil görseli ve ad. Çok yazarlı yazıda
                her yazar alt alta listelenir. */}
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

            {/* Sayı içeriği menüsü — başlık: sayının adı (ör. "Sekans e28") */}
            {tumYazilar.length > 1 && (
              <div className="bg-muted/30 rounded-lg p-5">
                <button
                  onClick={() => onSayiClick(sayi)}
                  className="font-serif font-bold text-sm mb-4 hover:underline underline-offset-2"
                >
                  {sayiBaslik}
                </button>
                <div className="space-y-0.5">
                  {tumYazilar.map((item) => {
                    const isActive = item.id === yazi.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => !isActive && onYaziClick?.(item)}
                        className={`block w-full text-left px-3 py-2.5 rounded transition-colors ${
                          isActive
                            ? 'bg-foreground/5 border-l-2 border-foreground'
                            : 'border-l-2 border-transparent hover:bg-muted/60 opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div className="min-w-0">
                          <ZenginMetin
                            as="p"
                            html={item.baslik}
                            className={`text-sm leading-snug line-clamp-2 ${
                              isActive
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground'
                            }`}
                          />
                          <p className={`text-[11px] mt-0.5 ${
                            isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'
                          }`}>
                            {yazarAdlari(item)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paylaşım — yukarıdakiler geçildikten sonra sabitlenir, yazı bitince bırakır */}
            <PaylasimKutusu baslik={duzMetin(yazi.baslik)} className="lg:sticky lg:top-24" />
          </aside>
        </div>

        {/* Önceki/Sonraki Yazılar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onOncekiYazi && oncekiYazi ? (
              <button
                onClick={onOncekiYazi}
                className="text-left p-4 bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <ChevronLeft className="w-4 h-4" />
                  Önceki Yazı
                </span>
                <ZenginMetin
                  as="h4"
                  html={oncekiYazi.baslik}
                  className="block font-serif text-lg group-hover:underline underline-offset-2 line-clamp-2"
                />
              </button>
            ) : (
              <div />
            )}
            {onSonrakiYazi && sonrakiYazi ? (
              <button
                onClick={onSonrakiYazi}
                className="text-right p-4 bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <span className="flex items-center justify-end gap-2 text-xs text-muted-foreground mb-2">
                  Sonraki Yazı
                  <ChevronRight className="w-4 h-4" />
                </span>
                <ZenginMetin
                  as="h4"
                  html={sonrakiYazi.baslik}
                  className="block font-serif text-lg group-hover:underline underline-offset-2 line-clamp-2"
                />
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
