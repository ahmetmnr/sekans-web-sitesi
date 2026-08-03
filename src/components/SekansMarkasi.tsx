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

const LOGO_YOLU = '/images/sekans-logo.svg';

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
          <span className="sekans-logo notranslate text-3xl md:text-4xl tracking-[0.2em]" translate="no">
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
