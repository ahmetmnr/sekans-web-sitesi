import { FileText } from 'lucide-react';
import type { Yazi } from '@/types';
import { trBuyuk, yazarAdlari } from '@/lib/utils';
import { GORSEL_ORAN_SINIFI } from '@/lib/gorselStandardi';
import { ZenginMetin } from '@/components/ZenginMetin';
import { duzMetin } from '@/lib/zenginMetin';
import { uygulamaIciTiklama } from '@/lib/rotalar';

/* ---------------------------------------------------------------------------
   İÇİNDEKİLER SATIRI — ana sayfa ve sayı sayfası için TEK düzen kaynağı.

   Izgara (grid) iki kolonludur:  [ metin | dizin görseli ]

       ┌─────────────────────────────────────────────────────────┐
       │ DOSYA: SİNEMANIN POLİTİKASI - POLİTİKANIN SİNEMASI      │  ← satır 1
       ├──────────────────────────────────────────┬──────────────┤
       │   Zor Zamanlarda Toplumsal Mücadeleye…   │  ┌────────┐  │  ← satır 2
       │     Alper Şen                            │  │ görsel │  │
       │   (spot — sayı sayfasında)               │  └────────┘  │
       └──────────────────────────────────────────┴──────────────┘

   Buradan çıkan davranışlar (müşteri maddeleri [1] [4] [5] [6]):

   • [5] Dizin görseli SATIR 2'de başlar; üst sınırı KATEGORİ satırıyla değil
     YAZI BAŞLIĞI satırıyla eşlenir. Telefonda kategori adı görsele takılmaz.

   • Kategori satırı iki kolonu da kaplar (col-span-2), yani sağ tarafı
     serbesttir ve kendi satırında düz gider — görsel bloğuna tabi DEĞİLDİR.

   • [4] Başlık ve yazar adı kategoriye göre ADIM ADIM içeriden yazılır:
     kategori 0, başlık 1 kademe, yazar 2 kademe. Girintiler ızgaranın
     kolonuna değil sabit padding'e bağlı olduğu için kategori satırı GİZLİ
     olsa bile aynı hizada kalır ([1] kararı).

   • [1] Kategori gizliyken satır tamamen yok sayılır (render edilmez), üstte
     boşluk bırakmaz.

   • [6] Spot metni SOL kolonda kalır; görselin altına akmaz, görseli sarmaz.
     Eski float düzeni kaldırıldı.
   --------------------------------------------------------------------------- */

/** Girinti kademeleri — "adım adım içeri" (eski sitedeki anlayış). */
const BASLIK_GIRINTI = 'pl-3 md:pl-4';
const YAZAR_GIRINTI = 'pl-6 md:pl-8';

/** Dizin görseli genişliği. 150→200 büyütmesi ([4]); oran 2:1 sabit kalır. */
const GORSEL_GENISLIK = 'w-36 md:w-48';

interface IcindekilerSatiriProps {
  yazi: Yazi;
  onClick: () => void;
  /** Spot gösterilsin mi (sayı sayfasında evet, ana sayfada hayır). */
  spotGoster?: boolean;
  /** Başlık punto sınıfı — sayı sayfasında bir kademe büyük. */
  baslikSinifi?: string;
}

export function IcindekilerSatiri({
  yazi,
  onClick,
  spotGoster = false,
  baslikSinifi = 'text-lg md:text-xl',
}: IcindekilerSatiriProps) {
  // Dizin görseli yoksa kapak görselinin küçültülmüş hali kullanılır; ikisi de
  // yoksa görsel kolonu hiç açılmaz (sayı kapağı satırlarda tekrar etmesin).
  const kucukGorsel = yazi.dizinGorseli?.trim() || yazi.kapakGorseli?.trim() || '';
  const kategoriAdi = yazi.kategori?.ad ?? '';
  // [1] Editör bu yazıda kategori satırını kapatmış olabilir.
  const kategoriGorunur = yazi.kategoriGoster !== false && kategoriAdi !== '';

  return (
    // Satırın tamamı tıklanabilir. <button> DEĞİL: içinde PDF bağlantısı
    // (<a>) var, buton içine bağlantı koymak geçersiz HTML'dir ve tarayıcılar
    // bunu tutarsız ele alıyordu. Klavye erişimi elle sağlanır.
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="yazi-kart group cursor-pointer grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 md:gap-x-6"
    >
      {/* Satır 1 — kategori. İki kolonu da kaplar: sağı serbest, görsele takılmaz. */}
      {kategoriGorunur && (
        <span className="kategori-etiket col-span-2 block mb-1">
          {trBuyuk(kategoriAdi)}
        </span>
      )}

      {/* Satır 2, sol kolon — başlık, yazar, spot, PDF */}
      <div className="min-w-0">
        {/* Başlık GERÇEK bir bağlantıdır: sağ tık → "yeni sekmede aç" çalışır
            ([12]). Sade sol tık satırın kendi tıklamasına düşer, sayfa yeniden
            yüklenmez. Satırın tamamı <a> DEĞİL, çünkü içinde ayrıca PDF
            bağlantısı var; iç içe <a> geçersiz HTML'dir. */}
        <h3 className={`${BASLIK_GIRINTI}`}>
          <a
            href={`/yazi/${encodeURIComponent(yazi.id)}`}
            onClick={(e) => {
              if (!uygulamaIciTiklama(e)) { e.stopPropagation(); return; }
              e.preventDefault();
            }}
            className={`block yazi-baslik leading-snug ${baslikSinifi} group-hover:underline underline-offset-4`}
          >
            <ZenginMetin html={yazi.baslik} />
          </a>
        </h3>
        <p className={`mt-1 icindekiler-yazar ${YAZAR_GIRINTI}`}>
          {yazarAdlari(yazi)}
        </p>

        {/* [6] Spot sol kolonda kalır — görseli sarmaz, altına girmez. */}
        {spotGoster && yazi.spot && (
          <ZenginMetin
            as="p"
            html={yazi.spot}
            className={`mt-2 text-sm leading-relaxed text-muted-foreground text-justify ${BASLIK_GIRINTI}`}
          />
        )}

        {yazi.pdfUrl && (
          <a
            href={yazi.pdfUrl}
            className={`pdf-link mt-1.5 inline-flex ${BASLIK_GIRINTI}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </a>
        )}
      </div>

      {/* Satır 2, sağ kolon — dizin görseli. Üstü başlık satırıyla hizalı. */}
      {kucukGorsel ? (
        <div className={`${GORSEL_GENISLIK} flex-shrink-0 bg-muted overflow-hidden ${GORSEL_ORAN_SINIFI} self-start`}>
          <img
            src={kucukGorsel}
            alt={duzMetin(yazi.baslik)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Dosya bulunamazsa boş gri kutu kalmasın.
              const kutu = (e.target as HTMLImageElement).parentElement;
              if (kutu) kutu.style.display = 'none';
            }}
          />
        </div>
      ) : (
        // Görsel yoksa kolon yer kaplamaz ama ızgara yapısı bozulmasın.
        <div aria-hidden />
      )}
    </div>
  );
}

export default IcindekilerSatiri;
