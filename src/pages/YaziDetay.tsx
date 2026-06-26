import { useRef } from 'react';
import { ArrowLeft, FileText, BookOpen, Calendar, User, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import type { Yazi, Sayi, Yazar } from '@/types';
import { Button } from '@/components/ui/button';
import { useFootnotes } from '@/hooks/useFootnotes';
import ReadingIndicator from '@/components/ReadingIndicator';

// Sosyal medya SVG ikonları
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
    </svg>
  );
}

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

export default function YaziDetay({
  yazi,
  sayi,
  oncekiYazi,
  sonrakiYazi,
  onBackClick,
  onSayiClick,
  onOncekiYazi,
  onSonrakiYazi,
  onYazarClick,
  onYaziClick,
}: YaziDetayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useFootnotes(contentRef, [yazi.icerik]);


  // Paylaşım URL'i
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(yazi.baslik);

  // Sayıdaki tüm yazılar (içindekiler için)
  const tumYazilar = sayi.yazilar;

  return (
    <main className="animate-fade-in py-8 md:py-12">
      {/* Okuma İlerleme Göstergesi */}
      <ReadingIndicator contentRef={contentRef} contentDep={yazi.icerik} />

      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>

        {/* Kapak Görseli */}
        {yazi.kapakGorseli && (
          <div className="aspect-[21/9] md:aspect-[3/1] bg-muted overflow-hidden mb-8">
            <img
              src={yazi.kapakGorseli}
              alt={yazi.baslik}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Başlık ve Meta Bilgiler */}
        <header className="mb-8 pb-6 border-b border-border">
          {/* Sayı Bilgisi */}
          <button
            onClick={() => onSayiClick(sayi)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <BookOpen className="w-4 h-4" />
            <span>Sekans {sayi.numara} | {sayi.ay} {sayi.yil}</span>
          </button>

          {/* Kategori */}
          <span className="kategori-etiket block mb-3">
            {yazi.kategori?.ad ?? ''}
          </span>

          {/* Başlık */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif leading-tight mb-4">
            {yazi.baslik}
          </h1>

          {/* Yazar ve Tarih */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <button
              onClick={() => onYazarClick?.(yazi.yazar)}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors hover:underline underline-offset-2"
            >
              <User className="w-4 h-4" />
              {yazi.yazar.tamAd}
            </button>
            {yazi.yayinTarihi && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(yazi.yayinTarihi).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </header>

        {/* Spot */}
        {yazi.spot && (
          <p className="text-xl text-muted-foreground italic leading-relaxed mb-8 border-l-2 border-border pl-4">
            {yazi.spot}
          </p>
        )}

        {/* Ana Layout: Sosyal Medya | İçerik | Yazar Kolon */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sol: Sosyal Medya Paylaş (sticky) */}
          <div className="hidden lg:block lg:w-12 flex-shrink-0">
            <div className="sticky top-24 flex flex-col items-center gap-3">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">
                <Share2 className="w-3.5 h-3.5 mx-auto" />
              </span>
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted/60 hover:bg-foreground hover:text-background flex items-center justify-center transition-colors"
                title="X'te Paylaş"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted/60 hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-colors"
                title="LinkedIn'de Paylaş"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted/60 hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp'ta Paylaş"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href={`https://www.instagram.com/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-muted/60 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white flex items-center justify-center transition-colors"
                title="Instagram'da Paylaş"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Orta: İçerik */}
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

            {/* Mobil sosyal medya paylaş */}
            <div className="lg:hidden mt-8 pt-6 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Paylaş
              </p>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-foreground hover:text-background flex items-center justify-center transition-colors"
                >
                  <TwitterIcon className="w-4.5 h-4.5" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-[#0A66C2] hover:text-white flex items-center justify-center transition-colors"
                >
                  <LinkedInIcon className="w-4.5 h-4.5" />
                </a>
                <a
                  href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors"
                >
                  <WhatsAppIcon className="w-4.5 h-4.5" />
                </a>
                <a
                  href={`https://www.instagram.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white flex items-center justify-center transition-colors"
                >
                  <InstagramIcon className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </article>

          {/* Sağ: Yazar Kolon */}
          <aside className="lg:w-64 flex-shrink-0 self-start lg:sticky lg:top-24">
            <div className="space-y-6">
              {/* Yazar Bilgisi */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div className="text-center">
                  {yazi.yazar.fotograf ? (
                    <img
                      src={yazi.yazar.fotograf}
                      alt={yazi.yazar.tamAd}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto border-2 border-border">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => onYazarClick?.(yazi.yazar)}
                    className="font-serif font-bold text-lg hover:text-primary transition-colors hover:underline underline-offset-2"
                  >
                    {yazi.yazar.tamAd}
                  </button>
                </div>
                {yazi.yazar.biyografi && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {yazi.yazar.biyografi}
                  </p>
                )}
                <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground">
                  <button
                    onClick={() => onSayiClick(sayi)}
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Sekans {sayi.numara}
                  </button>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-muted rounded text-xs font-medium">
                      {yazi.kategori?.ad ?? ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* İçindekiler */}
              {tumYazilar.length > 1 && (
                <div className="bg-muted/30 rounded-lg p-5">
                  <h4 className="font-serif font-bold text-sm mb-4">
                    İçindekiler
                  </h4>
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
                            <p className={`text-sm leading-snug line-clamp-2 ${
                              isActive
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground'
                            }`}>
                              {item.baslik}
                            </p>
                            <p className={`text-[11px] mt-0.5 ${
                              isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'
                            }`}>
                              {item.yazar.tamAd}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
                <h4 className="font-serif text-lg group-hover:underline underline-offset-2 line-clamp-2">
                  {oncekiYazi.baslik}
                </h4>
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
                <h4 className="font-serif text-lg group-hover:underline underline-offset-2 line-clamp-2">
                  {sonrakiYazi.baslik}
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
