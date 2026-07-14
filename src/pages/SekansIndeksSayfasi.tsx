import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import type { AramaYaziSonuc, IndeksGiris } from '@/types';

interface SekansIndeksSayfasiProps {
  onDergiYaziClick: (sonuc: AramaYaziSonuc) => void;
  onBlogYaziClick: (araYaziId: string) => void;
  onBackClick: () => void;
}

const TUMU = '__tumu__';

/**
 * Sekans İndeks — yayımlanmış tüm içeriğin (dergi yazıları + blog) kategorilere
 * göre dökümü. Soldaki menüden kategori seçilince o kategorideki bütün yazılar listelenir.
 */
export default function SekansIndeksSayfasi({
  onDergiYaziClick,
  onBlogYaziClick,
  onBackClick,
}: SekansIndeksSayfasiProps) {
  const { kategoriler } = useCMS();
  const [girisler, setGirisler] = useState<IndeksGiris[] | null>(null);
  const [hata, setHata] = useState(false);
  const [aktifKategori, setAktifKategori] = useState<string>(TUMU);

  useEffect(() => {
    let iptal = false;
    api.indeks()
      .then((d) => { if (!iptal) setGirisler(d.girisler ?? []); })
      .catch(() => { if (!iptal) setHata(true); });
    return () => { iptal = true; };
  }, []);

  // Kategori listesi: CMS'teki sıra korunur; listede olmayanlar sona alfabetik eklenir.
  const kategoriListesi = useMemo(() => {
    if (!girisler) return [];
    const sayilar = new Map<string, number>();
    girisler.forEach((g) => {
      const ad = g.kategoriAd || 'Diğer';
      sayilar.set(ad, (sayilar.get(ad) ?? 0) + 1);
    });
    const bilinen = kategoriler.map((k) => k.ad).filter((ad) => sayilar.has(ad));
    const kalan = [...sayilar.keys()]
      .filter((ad) => !bilinen.includes(ad))
      .sort((a, b) => a.localeCompare(b, 'tr'));
    return [...bilinen, ...kalan].map((ad) => ({ ad, adet: sayilar.get(ad) ?? 0 }));
  }, [girisler, kategoriler]);

  const seciliGirisler = useMemo(() => {
    if (!girisler) return [];
    const liste = aktifKategori === TUMU
      ? girisler
      : girisler.filter((g) => (g.kategoriAd || 'Diğer') === aktifKategori);
    // Tarihe göre yeni -> eski (tarihi olmayanlar sona)
    return [...liste].sort((a, b) => (b.yayinTarihi || '').localeCompare(a.yayinTarihi || ''));
  }, [girisler, aktifKategori]);

  // "Tümü" görünümünde kategori başlıklarıyla gruplu döküm
  const grupluGirisler = useMemo(() => {
    if (aktifKategori !== TUMU) return null;
    const gruplar = new Map<string, IndeksGiris[]>();
    seciliGirisler.forEach((g) => {
      const ad = g.kategoriAd || 'Diğer';
      if (!gruplar.has(ad)) gruplar.set(ad, []);
      gruplar.get(ad)!.push(g);
    });
    return kategoriListesi
      .map(({ ad }) => ({ ad, girisler: gruplar.get(ad) ?? [] }))
      .filter((g) => g.girisler.length > 0);
  }, [aktifKategori, seciliGirisler, kategoriListesi]);

  const kaynakEtiketi = (g: IndeksGiris) =>
    g.tip === 'dergi'
      ? `Sayı ${g.sayiNumara}${g.sayiAy ? ` · ${g.sayiAy} ${g.sayiYil}` : ''}`
      : 'Blog';

  const handleGirisClick = (g: IndeksGiris) => {
    if (g.tip === 'dergi') {
      onDergiYaziClick({
        id: g.id,
        baslik: g.baslik,
        yazarAd: g.yazarAd,
        kategoriAd: g.kategoriAd,
        sayiId: g.sayiId ?? '',
        sayiNumara: g.sayiNumara ?? '',
        sayiAy: g.sayiAy ?? '',
        sayiYil: g.sayiYil ?? 0,
        pdfUrl: g.pdfUrl,
      });
    } else {
      onBlogYaziClick(g.id);
    }
  };

  const girisSatiri = (g: IndeksGiris) => (
    <li key={`${g.tip}-${g.id}`}>
      <button
        onClick={() => handleGirisClick(g)}
        className="w-full text-left py-3 group flex items-baseline justify-between gap-4 border-b border-border/50 hover:bg-muted/40 transition-colors px-2 -mx-2"
      >
        <span className="min-w-0">
          <span className="block font-serif text-base md:text-lg leading-snug group-hover:underline underline-offset-2">
            {g.baslik}
          </span>
          <span className="block text-xs text-muted-foreground mt-1">
            {g.yazarAd}
            {g.yazarAd ? ' · ' : ''}
            {kaynakEtiketi(g)}
          </span>
        </span>
        {g.pdfUrl && (
          <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" />
        )}
      </button>
    </li>
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
          Ana Sayfa
        </Button>

        {/* Başlık */}
        <div className="mb-8 md:mb-10 border-b border-border pb-4">
          <h1 className="page-title mb-3">Sekans İndeks</h1>
          <p className="text-muted-foreground max-w-2xl">
            Sekans'ta yayımlanmış bütün yazıların kategorilere göre dökümü.
            Soldaki menüden bir kategori seçerek o kategorideki tüm yazılara ulaşabilirsiniz.
          </p>
        </div>

        {hata ? (
          <p className="text-muted-foreground py-16 text-center">İndeks yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
        ) : !girisler ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 lg:gap-12">
            {/* Kategori menüsü — mobilde açılır liste */}
            <div className="lg:hidden">
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={aktifKategori}
                onChange={(e) => setAktifKategori(e.target.value)}
              >
                <option value={TUMU}>Tüm kategoriler ({girisler.length})</option>
                {kategoriListesi.map((k) => (
                  <option key={k.ad} value={k.ad}>{k.ad} ({k.adet})</option>
                ))}
              </select>
            </div>

            {/* Kategori menüsü — masaüstünde sol sütun */}
            <aside className="hidden lg:block">
              <nav className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                <button
                  onClick={() => setAktifKategori(TUMU)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-sm transition-colors flex items-center justify-between gap-2 ${
                    aktifKategori === TUMU
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span>Tümü</span>
                  <span className="text-xs opacity-60">{girisler.length}</span>
                </button>
                <div className="mt-2 space-y-0.5">
                  {kategoriListesi.map((k) => (
                    <button
                      key={k.ad}
                      onClick={() => setAktifKategori(k.ad)}
                      className={`w-full text-left text-sm py-1.5 px-2 rounded-sm transition-colors flex items-center justify-between gap-2 ${
                        aktifKategori === k.ad
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <span className="truncate">{k.ad}</span>
                      <span className="text-xs opacity-60 flex-shrink-0">{k.adet}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </aside>

            {/* Döküm */}
            <div className="min-w-0">
              {aktifKategori === TUMU && grupluGirisler ? (
                <div className="space-y-10">
                  {grupluGirisler.map((grup) => (
                    <section key={grup.ad}>
                      <h2 className="section-title mb-3 pb-2 border-b border-border flex items-baseline justify-between gap-4">
                        <span>{grup.ad}</span>
                        <span className="text-xs font-normal text-muted-foreground">{grup.girisler.length} yazı</span>
                      </h2>
                      <ul>{grup.girisler.map(girisSatiri)}</ul>
                    </section>
                  ))}
                </div>
              ) : (
                <section>
                  <h2 className="section-title mb-3 pb-2 border-b border-border flex items-baseline justify-between gap-4">
                    <span>{aktifKategori}</span>
                    <span className="text-xs font-normal text-muted-foreground">{seciliGirisler.length} yazı</span>
                  </h2>
                  {seciliGirisler.length > 0 ? (
                    <ul>{seciliGirisler.map(girisSatiri)}</ul>
                  ) : (
                    <p className="text-muted-foreground py-8">Bu kategoride yazı bulunamadı.</p>
                  )}
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
