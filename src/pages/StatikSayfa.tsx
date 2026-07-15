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

  // SEO: sayfa yüklenince başlık + meta açıklamasını ayarla, ayrılırken geri al.
  useEffect(() => {
    if (!sayfa) return;
    const oncekiBaslik = document.title;
    document.title = (sayfa.seoBaslik?.trim() || sayfa.baslik || 'Sekans') + ' — Sekans';

    const aciklama = sayfa.seoAciklama?.trim() || sayfa.kisaAciklama?.trim() || '';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const metaVardi = !!meta;
    const oncekiAciklama = meta?.getAttribute('content') ?? null;
    if (aciklama) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', aciklama);
    }
    return () => {
      document.title = oncekiBaslik;
      if (meta) {
        if (!metaVardi) meta.remove();
        else if (oncekiAciklama !== null) meta.setAttribute('content', oncekiAciklama);
      }
    };
  }, [sayfa]);

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
              {sayfa?.kisaAciklama?.trim() && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{sayfa.kisaAciklama}</p>
              )}
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
