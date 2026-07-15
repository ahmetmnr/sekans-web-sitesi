import SonSayiSection from '@/sections/SonSayiSection';
import AraYazilarSection from '@/sections/AraYazilarSection';
import type { Sayi, Yazi, AraYazi, AnasayfaBlok } from '@/types';
import { araYaziKategorileri } from '@/lib/utils';

interface AnaSayfaProps {
  // Ana sayfada gösterilecek sayılar (normalde 1; admin panelden ek sayı işaretlenebilir).
  sayilar: Sayi[];
  blogAraYazilar: AraYazi[];   // "Blog" paneli (özel bölümler hariç)
  tumAraYazilar: AraYazi[];    // 'kategori' panelleri için tüm ara yazılar
  bloklar: AnasayfaBlok[];     // ana sayfa panelleri (boşsa sabit düzene düşer)
  onYaziClick: (yazi: Yazi, sayi?: Sayi) => void;
  onSayiClick: (sayi: Sayi) => void;
  onAraYaziClick: (araYazi: AraYazi) => void;
  onTumAraYazilarClick: () => void;
  onKategoriTumClick?: (kategori: string) => void;
}

export default function AnaSayfa({
  sayilar,
  blogAraYazilar,
  tumAraYazilar,
  bloklar,
  onYaziClick,
  onSayiClick,
  onAraYaziClick,
  onTumAraYazilarClick,
  onKategoriTumClick,
}: AnaSayfaProps) {
  // Sayı bölüm(ler)i — birden fazla sayı alt alta gösterilebilir.
  const sayiBolumleri = (baslik?: string) => (
    <>
      {baslik?.trim() && (
        <div className="container mx-auto px-4 md:px-6 pt-8 md:pt-12">
          <div className="border-b border-border pb-4">
            <h2 className="section-title">{baslik}</h2>
          </div>
        </div>
      )}
      {sayilar.map((sayi) => (
        <SonSayiSection
          key={sayi.id}
          sayi={sayi}
          onYaziClick={(yazi) => onYaziClick(yazi, sayi)}
          onSayiClick={onSayiClick}
        />
      ))}
    </>
  );

  // Fallback: bloklar tanımlı değilse mevcut düzen (sayılar + Blog).
  if (!bloklar || bloklar.length === 0) {
    return (
      <main className="animate-fade-in">
        {sayiBolumleri()}
        <AraYazilarSection
          araYazilar={blogAraYazilar}
          onAraYaziClick={onAraYaziClick}
          onTumunuGorClick={onTumAraYazilarClick}
        />
      </main>
    );
  }

  // Blok tabanlı düzen — admin panelden yönetilen panelleri sırayla render et.
  return (
    <main className="animate-fade-in">
      {bloklar.map((blok) => {
        if (blok.tip === 'sayilar') {
          return <div key={blok.id}>{sayiBolumleri(blok.baslik)}</div>;
        }
        if (blok.tip === 'blog') {
          return (
            <AraYazilarSection
              key={blok.id}
              araYazilar={blogAraYazilar}
              onAraYaziClick={onAraYaziClick}
              onTumunuGorClick={onTumAraYazilarClick}
              baslik={blok.baslik?.trim() ? blok.baslik : 'Blog'}
              adet={blok.ayar?.adet ?? 6}
            />
          );
        }
        // tip === 'kategori'
        const kategori = blok.ayar?.kategori ?? '';
        const liste = kategori ? tumAraYazilar.filter((y) => araYaziKategorileri(y).includes(kategori)) : [];
        return (
          <AraYazilarSection
            key={blok.id}
            araYazilar={liste}
            onAraYaziClick={onAraYaziClick}
            onTumunuGorClick={kategori && onKategoriTumClick ? () => onKategoriTumClick(kategori) : undefined}
            baslik={blok.baslik?.trim() ? blok.baslik : kategori}
            adet={blok.ayar?.adet ?? 6}
          />
        );
      })}
    </main>
  );
}
