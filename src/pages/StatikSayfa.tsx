import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { StatikSayfaIcerik } from '@/types';

interface StatikSayfaProps {
  slug: string;               // ör. 'yazi-standartlari'
  varsayilanBaslik?: string;  // içerik yüklenene kadar / bulunamazsa gösterilecek başlık
  onBackClick: () => void;
}

/** Admin panelden düzenlenebilir statik sayfa (ör. Sekans Yazı Standartları). */
export default function StatikSayfa({ slug, varsayilanBaslik = '', onBackClick }: StatikSayfaProps) {
  const [sayfa, setSayfa] = useState<StatikSayfaIcerik | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let iptal = false;
    setYukleniyor(true);
    api.sayfa.get(slug)
      .then((d) => { if (!iptal) setSayfa(d); })
      .catch(() => { if (!iptal) setSayfa(null); })
      .finally(() => { if (!iptal) setYukleniyor(false); });
    return () => { iptal = true; };
  }, [slug]);

  // Markdown benzeri içeriği HTML'e dönüştür (Hakkımızda sayfasıyla aynı biçim)
  const formatIcerik = (icerik: string) => {
    return icerik
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <main className="animate-fade-in py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        {/* Geri Butonu */}
        <Button
          variant="ghost"
          onClick={onBackClick}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </Button>

        {yukleniyor ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : (
          <>
            {/* Başlık */}
            <div className="text-center mb-10 md:mb-12">
              <h1 className="page-title mb-4">{sayfa?.baslik || varsayilanBaslik}</h1>
            </div>

            {/* İçerik */}
            {sayfa?.icerik ? (
              <div className="prose prose-lg max-w-none mb-12">
                <div
                  className="content-text"
                  dangerouslySetInnerHTML={{ __html: `<p>${formatIcerik(sayfa.icerik)}</p>` }}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Bu sayfanın içeriği henüz hazırlanıyor.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
