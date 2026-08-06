import { useState } from 'react';

/* ---------------------------------------------------------------------------
   SEKANS MARKASI (sol üst köşe) — müşteri maddeleri [10] ve [11].

   [10] Sorun: marka HTML metni olarak basılıyordu; tarayıcının otomatik çeviri
   özelliği açık olan okurlarda "Sekans" adı ÇEVRİLİYOR ve yanlış görünüyordu.

   İki katmanlı çözüm:

     1) Görsel katman — public/images/sekans-logo.svg varsa marka bir <img>
        olarak basılır. Bir görselin içindeki yazı hiçbir çeviri motoru
        tarafından değiştirilemez; sorunun kesin çözümü budur. Dosya yoksa
        (henüz tasarlanmadıysa) aşağıdaki metin katmanına düşülür — site
        kırılmaz, dosya eklendiği anda görsele geçer, kod değişikliği gerekmez.

     2) Metin katmanı — translate="no" + .notranslate. Google Translate ve
        Edge'in çeviricisi bu işaretlere uyar ve markayı olduğu gibi bırakır.

   [11] Boyut: marka herkeste AYNI SANTİMDE görünemez. Fiziksel boyut okurun
   ekran çözünürlüğüne ve işletim sistemi ölçeklemesine bağlıdır; tarayıcı
   yakınlaştırması %100 olsa bile değişir (Gökhan'ın ekranında küçük, sizde
   büyük görünmesinin sebebi budur). Yapabildiğimiz, bir piksel ölçüsü seçip
   sabitlemektir — aşağıdaki ölçü öncekinden bir kademe büyüktür.
   --------------------------------------------------------------------------- */

/**
 * Marka görseli. Kaynak dosya src/sekans.png'den üretildi:
 * beyaz zemin saydamlaştırıldı (site zemininde beyaz kutu durmasın), çevresindeki
 * boşluk kırpıldı (menüde yazı küçücük kalmasın), retina için 4x çözünürlükte
 * (500×256) kaydedildi.
 *
 * Dosya bulunamazsa aşağıdaki metin katmanına düşülür; site kırılmaz.
 */
const LOGO_YOLU = '/images/sekans-logo.png';

interface SekansMarkasiProps {
  onClick: () => void;
}

export function SekansMarkasi({ onClick }: SekansMarkasiProps) {
  const [gorselYok, setGorselYok] = useState(false);

  return (
    <button onClick={onClick} className="flex flex-col items-center text-center" aria-label="Sekans — Ana Sayfa">
      {!gorselYok ? (
        <img
          src={LOGO_YOLU}
          alt="Sekans — sinema kültürü dergisi"
          className="h-12 md:h-16 w-auto"
          onError={() => setGorselYok(true)}
        />
      ) : (
        <>
          {/* [11] Bir kademe büyütüldü (3xl/4xl -> 4xl/5xl). Bundan ötesi
              okurun ekran ölçeklemesine bağlıdır, bizim elimizde değildir. */}
          <span className="sekans-logo notranslate text-4xl md:text-5xl tracking-[0.2em]" translate="no">
            sekans
          </span>
          <span className="sekans-logo-sub notranslate mt-0.5" translate="no">
            sinema kültürü dergisi
          </span>
        </>
      )}
    </button>
  );
}

export default SekansMarkasi;
