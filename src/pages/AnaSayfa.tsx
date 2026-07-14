import SonSayiSection from '@/sections/SonSayiSection';
import AraYazilarSection from '@/sections/AraYazilarSection';
import type { Sayi, Yazi, AraYazi } from '@/types';

interface AnaSayfaProps {
  // Ana sayfada gösterilecek sayılar (normalde 1; admin panelden ek sayı işaretlenebilir).
  sayilar: Sayi[];
  araYazilar: AraYazi[];
  onYaziClick: (yazi: Yazi, sayi?: Sayi) => void;
  onSayiClick: (sayi: Sayi) => void;
  onAraYaziClick: (araYazi: AraYazi) => void;
  onTumAraYazilarClick: () => void;
}

export default function AnaSayfa({
  sayilar,
  araYazilar,
  onYaziClick,
  onSayiClick,
  onAraYaziClick,
  onTumAraYazilarClick,
}: AnaSayfaProps) {
  return (
    <main className="animate-fade-in">
      {/* Sayı Bölümleri (alt alta — çoklu sayı desteklenir) */}
      {sayilar.map((sayi) => (
        <SonSayiSection
          key={sayi.id}
          sayi={sayi}
          onYaziClick={(yazi) => onYaziClick(yazi, sayi)}
          onSayiClick={onSayiClick}
        />
      ))}

      {/* Blog Bölümü */}
      <AraYazilarSection
        araYazilar={araYazilar}
        onAraYaziClick={onAraYaziClick}
        onTumunuGorClick={onTumAraYazilarClick}
      />
    </main>
  );
}
