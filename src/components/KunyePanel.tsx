import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { temizKunyeMetni, kunyeDuzMi, zenginMetinBos } from '@/lib/zenginMetin';

/* ---------------------------------------------------------------------------
   SAYI KÜNYESİ — akordiyon (collapsible) panel. Müşteri maddesi [7].

   Neden kapalı başlıyor: künye uzun bir bloktur ve sol kolonu kalabalıklaştırıp
   sayfayı harf yığınına çeviriyordu. Bakmak isteyen açar. (allmusic.com'daki
   "Moods and Themes" paneli örnek alındı — ama ayırıcı banda özel arka plan
   rengi KONMADI, minimalist duruyor.)

   Panel, sayı kapağının ALTINDA kendi bloğunda aşağı doğru açılır; sağ tarafa
   taşmaz (sol kolonun genişliğiyle sınırlıdır — kapsayıcı zaten o kolondur).

   Metin iki yana yaslıdır ve paragraflar arasında fazladan satır boşluğu
   bırakılmaz.

   Geriye dönük uyum: künye eskiden düz metindi ("\n" ile satırlanmış). Etiket
   içermeyen değerler `whitespace-pre-line` ile eskisi gibi basılır; editör
   künyeyi CMS'te bir kez düzenleyince biçimli (italikli) HTML'e geçer.
   --------------------------------------------------------------------------- */

interface KunyePanelProps {
  kunye?: string | null;
  /** Panel başlığı — varsayılan "Sayı künyesi". */
  baslik?: string;
}

export function KunyePanel({ kunye, baslik = 'Sayı künyesi' }: KunyePanelProps) {
  const [acik, setAcik] = useState(false);

  if (!kunye?.trim() || zenginMetinBos(kunye)) return null;

  const duz = kunyeDuzMi(kunye);

  return (
    <div className="mt-4 border-t border-border">
      <button
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-expanded={acik}
        className="w-full flex items-center justify-between gap-2 py-3 text-left text-sm text-foreground/80 hover:text-foreground transition-colors"
      >
        <span>{baslik}</span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${acik ? 'rotate-180' : ''}`}
        />
      </button>

      {acik && (
        <div className="kunye-metni pb-4 text-xs leading-relaxed text-muted-foreground text-justify">
          {duz ? (
            <p className="whitespace-pre-line">{kunye}</p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: temizKunyeMetni(kunye) }} />
          )}
        </div>
      )}
    </div>
  );
}

export default KunyePanel;
