import SonSayiSection from '@/sections/SonSayiSection';
import AraYazilarSection from '@/sections/AraYazilarSection';
import type { Sayi, Yazi, AraYazi } from '@/types';

interface AnaSayfaProps {
  sonSayi: Sayi;
  araYazilar: AraYazi[];
  onYaziClick: (yazi: Yazi) => void;
  onSayiClick: (sayi: Sayi) => void;
  onAraYaziClick: (araYazi: AraYazi) => void;
  onTumAraYazilarClick: () => void;
}

export default function AnaSayfa({
  sonSayi,
  araYazilar,
  onYaziClick,
  onSayiClick,
  onAraYaziClick,
  onTumAraYazilarClick,
}: AnaSayfaProps) {
  return (
    <main className="animate-fade-in">
      {/* Son Sayı Bölümü */}
      <SonSayiSection
        sayi={sonSayi}
        onYaziClick={onYaziClick}
        onSayiClick={onSayiClick}
      />

      {/* Ara Yazılar Bölümü */}
      <AraYazilarSection
        araYazilar={araYazilar}
        onAraYaziClick={onAraYaziClick}
        onTumunuGorClick={onTumAraYazilarClick}
      />
    </main>
  );
}
