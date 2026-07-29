import { useState, useMemo } from 'react';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import type { AraYazi } from '@/types';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/context/CMSContext';
import { araYaziKategorileri, yazarAdlari } from '@/lib/utils';
import { ZenginMetin } from '@/components/ZenginMetin';
import { duzMetin } from '@/lib/zenginMetin';

interface AraYazilarSayfasiProps {
  araYazilar: AraYazi[];
  onAraYaziClick: (araYazi: AraYazi) => void;
  onBackClick: () => void;
  baslik?: string;          // verilmezse CMS > Sayfa Metinleri > Blog kullanılır
  aciklama?: string;
  geriBaslik?: string;      // geri butonu metni (varsayılan "Ana Sayfa")
  initialKategori?: string; // sayfa açılışında ön-seçili kategori filtresi
}

export default function AraYazilarSayfasi({
  araYazilar,
  onAraYaziClick,
  onBackClick,
  baslik,
  aciklama,
  geriBaslik = 'Ana Sayfa',
  initialKategori,
}: AraYazilarSayfasiProps) {
  const { sayfaMetinleri, kategoriler: tanimliKategoriler } = useCMS();
  const [activeKategori, setActiveKategori] = useState<string | null>(initialKategori ?? null);

  // Blog başlık/açıklaması CMS'ten gelir; bölüm sayfaları kendi metnini geçer.
  const sayfaBaslik = baslik ?? (sayfaMetinleri.blog.baslik || 'Blog');
  const sayfaAciklama = aciklama ?? sayfaMetinleri.blog.aciklama;

  // Blog sekmesi kapatılmış kategoriler (CMS > Kategoriler > "Blog sekmesi").
  const gizliKategoriler = useMemo(
    () => new Set(tanimliKategoriler.filter((k) => k.blogGoster === false).map((k) => k.ad)),
    [tanimliKategoriler]
  );

  // Sekmeler: içerikte geçen kategoriler (çoklu kategori dahil), gizliler hariç.
  const kategoriler = useMemo(() => {
    const set = new Set<string>();
    araYazilar.forEach((y) => araYaziKategorileri(y).forEach((k) => {
      if (k && !gizliKategoriler.has(k)) set.add(k);
    }));
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [araYazilar, gizliKategoriler]);

  // Filtreleme (çoklu kategori: yazı, kategorilerinden herhangi biriyle eşleşir)
  const filteredYazilar = useMemo(() =>
    activeKategori
      ? araYazilar.filter(y => araYaziKategorileri(y).includes(activeKategori))
      : araYazilar,
    [araYazilar, activeKategori]
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

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
          {geriBaslik}
        </Button>

        {/* Başlık */}
        <div className="mb-8 md:mb-10 border-b border-border pb-4">
          <h1 className="page-title mb-3">{sayfaBaslik}</h1>
          {sayfaAciklama?.trim() && (
            <p className="text-muted-foreground max-w-2xl">{sayfaAciklama}</p>
          )}
        </div>

        {/* Kategori Filtreleri */}
        {kategoriler.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveKategori(null)}
              className={`px-3.5 py-1.5 text-sm rounded-sm transition-colors ${
                !activeKategori
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Tümü
            </button>
            {kategoriler.map((kat) => (
              <button
                key={kat}
                onClick={() => setActiveKategori(activeKategori === kat ? null : kat)}
                className={`px-3.5 py-1.5 text-sm rounded-sm transition-colors ${
                  activeKategori === kat
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {kat}
              </button>
            ))}
          </div>
        )}

        {/* Sonuç sayısı */}
        {activeKategori && (
          <p className="text-sm text-muted-foreground mb-6">
            {filteredYazilar.length} yazı bulundu
          </p>
        )}

        {/* Yazılar Grid */}
        {filteredYazilar.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredYazilar.map((araYazi) => (
              <article
                key={araYazi.id}
                onClick={() => onAraYaziClick(araYazi)}
                className="ara-yazi-kart group cursor-pointer"
              >
                {/* Kapak Görseli */}
                <div className="aspect-[16/10] bg-muted overflow-hidden mb-4">
                  <img
                    src={araYazi.kapakGorseli || '/images/default-cover.svg'}
                    alt={duzMetin(araYazi.baslik)}
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
                    {araYazi.tarihEtiketi?.trim() ? araYazi.tarihEtiketi : formatDate(araYazi.yayinTarihi)}
                  </span>
                </div>

                {/* Başlık */}
                <ZenginMetin
                  as="h3"
                  html={araYazi.baslik}
                  className="block ara-yazi-baslik text-xl md:text-2xl leading-tight mb-3 font-serif"
                />

                {/* Spot */}
                <ZenginMetin
                  as="p"
                  html={araYazi.spot}
                  className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
                />

                {/* Yazar */}
                <div className="flex items-center gap-2 mt-3">
                  {araYazi.yazar.fotograf ? (
                    <img
                      src={araYazi.yazar.fotograf}
                      alt={araYazi.yazar.tamAd}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground/80">
                    {yazarAdlari(araYazi)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              Bu kategoride yazı bulunamadı.
            </p>
            <button
              onClick={() => setActiveKategori(null)}
              className="mt-4 text-sm text-foreground underline underline-offset-4"
            >
              Tüm yazıları göster
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
