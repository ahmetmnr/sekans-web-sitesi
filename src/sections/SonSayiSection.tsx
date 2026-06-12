import { useRef } from 'react';
import { FileText, ChevronUp, ChevronDown } from 'lucide-react';
import type { Sayi, Yazi } from '@/types';

interface SonSayiSectionProps {
  sayi: Sayi;
  onYaziClick: (yazi: Yazi) => void;
  onSayiClick: (sayi: Sayi) => void;
}

export default function SonSayiSection({ sayi, onYaziClick, onSayiClick }: SonSayiSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: -100, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
    }
  };

  return (
    <section className="son-sayi-section py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Sayı Başlığı */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-xl font-medium tracking-wide text-foreground/80">
            {sayi.tamBaslik}
          </h2>
        </div>

        {/* İçerik Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Sol Taraf - Kapak Görseli */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onSayiClick(sayi)}
              className="relative group w-full max-w-md"
            >
              <div className="aspect-[3/4] bg-muted overflow-hidden shadow-lg transition-transform duration-500 group-hover:shadow-xl">
                <img
                  src={sayi.kapakGorseli}
                  alt={`Sekans ${sayi.numara} Kapak`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder-sayi.jpg';
                  }}
                />
              </div>
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300" />
            </button>
            
            {/* PDF İndirme Linki */}
            <a 
              href={sayi.pdfUrl}
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="w-4 h-4" />
              <span>Tüm sayıyı PDF olarak indirmek için tıklayınız</span>
            </a>
          </div>

          {/* Sağ Taraf - Yazı Listesi (Akan Menü) */}
          <div className="relative">
            {/* Yukarı Scroll Butonu */}
            <button
              onClick={scrollUp}
              className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 p-1.5 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
              aria-label="Yukarı kaydır"
            >
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Scrollable Yazı Listesi */}
            <div 
              ref={scrollRef}
              className="yazi-listesi-scroll h-[500px] md:h-[600px] overflow-y-auto pr-4 py-6"
            >
              <div className="space-y-6">
                {sayi.yazilar.map((yazi, index) => (
                  <button
                    key={yazi.id}
                    onClick={() => onYaziClick(yazi)}
                    className="yazi-kart w-full text-left group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Sıra Numarası */}
                      <span className="flex-shrink-0 w-6 text-xs text-muted-foreground font-medium">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      
                      {/* Yazı İçeriği */}
                      <div className="flex-1 min-w-0">
                        {/* Kategori */}
                        <span className="kategori-etiket block mb-1">
                          {yazi.kategori.ad}
                        </span>
                        
                        {/* Başlık */}
                        <h3 className="yazi-baslik text-lg md:text-xl leading-snug line-clamp-3">
                          {yazi.baslik}
                        </h3>
                        
                        {/* Yazar */}
                        <p className="mt-2 text-sm text-muted-foreground">
                          {yazi.yazar.tamAd}
                        </p>
                        
                        {/* PDF Linki */}
                        {yazi.pdfUrl && (
                          <a
                            href={yazi.pdfUrl}
                            className="pdf-link mt-2 inline-flex"
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Ayırıcı Çizgi */}
                    {index < sayi.yazilar.length - 1 && (
                      <div className="mt-6 border-b border-border/50" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aşağı Scroll Butonu */}
            <button
              onClick={scrollDown}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-10 p-1.5 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-background transition-colors"
              aria-label="Aşağı kaydır"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
