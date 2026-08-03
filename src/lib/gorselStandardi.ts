/**
 * Yazı görselleri için TEK ölçek standardı.
 *
 * Sorun: kapak görseli geniş bir bantta (3:1), dizin görseli ise kare kutuda
 * gösteriliyordu. Aynı dosya iki yerde FARKLI kırpılıyor, editör bilgisayarında
 * gördüğü kadrajı sitede göremiyordu.
 *
 * Çözüm — kural belli, sonuç öngörülebilir:
 *   • Kapak görseli ve dizin görseli AYNI en-boy oranındadır (2:1).
 *   • Boyutları farklıdır: kapak geniş bantta, dizin listede küçük olarak çıkar.
 *   • Önerilen ölçüde yüklenen görsel sitede aynen göründüğü gibi çıkar; daha
 *     küçük/büyük yüklenirse site yalnızca ölçekler (oran aynı olduğu sürece
 *     kırpma olmaz).
 *   • Dizin görseli yüklenmezse site kapak görselini küçülterek kullanır.
 *   • Yalnızca dizin görseli yüklenirse ondan kapak görseli ÜRETİLMEZ.
 */

/** Kapak ve dizin görsellerinin ortak en-boy oranı. */
export const GORSEL_ORANI = '2 / 1';

/** Tailwind sınıfı olarak aynı oran (kapak bandı ve dizin kutusu için). */
export const GORSEL_ORAN_SINIFI = 'aspect-[2/1]';

/** Önerilen yükleme ölçüleri (piksel). */
export const KAPAK_OLCU = { genislik: 1200, yukseklik: 600 } as const;
// Dizin görseli büyütüldü (150→200 kademesi; müşteri maddesi [4] "görsel
// doluluk" = imaj görünürlüğünü artırma). Oran 2:1 aynen korunur, yalnızca
// ölçek büyür — bu yüzden eski görseller yeniden kırpılmaz.
export const DIZIN_OLCU = { genislik: 400, yukseklik: 200 } as const;

const olcuMetni = (o: { genislik: number; yukseklik: number }) =>
  `${o.genislik}×${o.yukseklik} px`;

/** CMS'te kapak görseli alanının altında görünen açıklama. */
export const KAPAK_ACIKLAMA =
  `Oran 2:1 (yatay). Önerilen ölçü ${olcuMetni(KAPAK_OLCU)} — bu ölçüde ` +
  'yüklerseniz görsel sitede bilgisayarınızda gördüğünüz gibi çıkar. Farklı ' +
  'ölçüde yüklerseniz site yalnızca büyütür/küçültür.';

/** CMS'te dizin görseli alanının altında görünen açıklama. */
export const DIZIN_ACIKLAMA =
  `İçindekiler listesindeki küçük görsel. Kapakla AYNI oran: 2:1. Önerilen ölçü ` +
  `${olcuMetni(DIZIN_OLCU)}. Boş bırakırsanız site kapak görselini küçülterek ` +
  'kullanır; ikisi de boşsa listede görsel çıkmaz. (Yalnızca dizin görseli ' +
  'yüklerseniz bundan kapak görseli üretilmez.)';
