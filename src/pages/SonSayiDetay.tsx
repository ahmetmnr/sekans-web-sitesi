import { ArrowLeft, FileText, Calendar, Users } from 'lucide-react';
import type { Sayi, Yazi } from '@/types';
import { Button } from '@/components/ui/button';

interface SonSayiDetayProps {
  sayi: Sayi;
  onYaziClick: (yazi: Yazi) => void;
  onBackClick: () => void;
}

export default function SonSayiDetay({ sayi, onYaziClick, onBackClick }: SonSayiDetayProps) {
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

        {/* Sayı Başlığı */}
        <div className="text-center mb-10 md:mb-12">
          <h1 className="page-title mb-4">{sayi.tamBaslik}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {sayi.ay} {sayi.yil}
            </span>
          </div>
        </div>

        {/* Kapak ve Bilgiler Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 mb-12 md:mb-16">
          {/* Sol - Kapak */}
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-muted overflow-hidden shadow-lg">
              <img
                src={sayi.kapakGorseli}
                alt={`Sekans ${sayi.numara} Kapak`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder-sayi.jpg';
                }}
              />
            </div>
            
            {/* PDF İndirme */}
            <a
              href={sayi.pdfUrl}
              className="btn-sekans-outline w-full mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="w-4 h-4 mr-2" />
              Tüm Sayıyı İndir (PDF)
            </a>
          </div>

          {/* Sağ - Künye ve Önsöz */}
          <div className="lg:col-span-2 space-y-8">
            {/* Künye */}
            {sayi.kunye && (
              <div className="bg-muted/50 p-6 md:p-8">
                <h2 className="section-title mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Künye
                </h2>
                <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                  {sayi.kunye}
                </div>
              </div>
            )}

            {/* Önsöz */}
            {sayi.onsoz && (
              <div>
                <h2 className="section-title mb-4">Editörden</h2>
                <p className="content-text italic border-l-2 border-border pl-4">
                  {sayi.onsoz}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* İçindekiler */}
        <div className="border-t border-border pt-10 md:pt-12">
          <h2 className="section-title mb-8 text-center">İçindekiler</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {sayi.yazilar.map((yazi) => (
              <article
                key={yazi.id}
                onClick={() => onYaziClick(yazi)}
                className="group cursor-pointer p-4 md:p-6 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <span className="kategori-etiket block mb-2">
                    {yazi.kategori.ad}
                  </span>
                  <h3 className="text-lg md:text-xl font-serif leading-snug mb-2 group-hover:underline underline-offset-4">
                    {yazi.baslik}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {yazi.yazar.tamAd}
                  </p>

                  {/* Spot */}
                  {yazi.spot && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {yazi.spot}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
