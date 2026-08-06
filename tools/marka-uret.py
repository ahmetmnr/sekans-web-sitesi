#!/usr/bin/env python3
"""
Sekans marka varlıklarını tek kaynaktan üretir.

    KAYNAK : src/sekans.png   (2000×2000, beyaz zeminde siyah yazı)
    ÇIKTI  : public/images/sekans-logo.png   üst menü logosu
             public/favicon-16.png / -32.png / -48.png
             public/favicon.ico
             public/apple-touch-icon.png

Çalıştırma:  python tools/marka-uret.py

NEDEN BU BETİK VAR
------------------
Logo değişirse (yeni tasarım gelirse) tüm türevlerin elle yeniden kırpılması
gerekirdi. Bu betik hepsini aynı kurallarla yeniden üretir: kaynak dosyayı
değiştirip betiği çalıştırmak yeterlidir.

ALINAN KARARLAR
---------------
1) Beyaz zemin SAYDAM yapılır (alfa = 255 − parlaklık). Aksi hâlde logo,
   sitenin zemin renginin üzerinde beyaz bir dikdörtgen olarak durur.
   Yarı saydam gri pikseller korunduğu için kenar yumuşaklığı bozulmaz.

2) Kaynaktaki geniş boşluk KIRPILIR. Kırpılmazsa üst menüde yazı, kutunun
   ortasında minicik kalırdı (içerik kaynağın yalnızca orta %40'ını kaplıyor).

3) Favicon'da ÖLÇÜYE GÖRE FARKLI marka kullanılır:
     16 / 32 / 48 px  ->  yalnızca "s" harfi (monogram)
     180 px (iOS)     ->  tam logo ("sekans" + alt başlık)
   Sebebi ölçülerek bulundu: "sekans" yazısı 16 pikselde okunmuyor, sekme
   çubuğunda gri bir lekeye dönüşüyor. Tek harf ise o boyutta bile seçiliyor.
   Küçük ölçüde monogram, büyük ölçüde tam kilit kullanmak marka işlerinde
   yerleşik bir uygulamadır.
"""

import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow gerekli:  pip install Pillow")

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(KOK, "src", "sekans.png")
PUBLIC = os.path.join(KOK, "public")
GORSELLER = os.path.join(PUBLIC, "images")

# Kaynak görseldeki içerik sınırları (piksel). Kaynak değişirse
# icerik_sinirlari() ile yeniden hesaplanır.
TAM_KILIT = (244, 582, 1752, 1296)   # "sekans" + "sinema kültürü dergisi"
KELIME = (244, 583, 1752, 993)       # yalnızca "sekans"
S_HARFI = (245, 583, 424, 993)       # yalnızca ilk harf


def saydamlastir(im: Image.Image) -> Image.Image:
    """Beyaz zemini saydam yap; yazıyı #111 tonunda tut."""
    alfa = im.convert("L").point(lambda p: 255 - p)
    cikti = Image.new("RGBA", im.size, (17, 17, 17, 255))
    cikti.putalpha(alfa)
    return cikti


def kirp(im: Image.Image, kutu, pay_orani: float = 0.04) -> Image.Image:
    """Verilen kutuyu, çevresinde oranlı bir nefes payı bırakarak kırp."""
    sol, ust, sag, alt = kutu
    pay = int((sag - sol) * pay_orani)
    return im.crop((max(0, sol - pay), max(0, ust - pay),
                    min(im.width, sag + pay), min(im.height, alt + pay)))


def kareye_otur(im: Image.Image, boy: int, zemin=(0, 0, 0, 0),
                pay_orani: float = 0.08) -> Image.Image:
    """Görüntüyü oranını bozmadan kare tuvalin ortasına yerleştir."""
    tuval = Image.new("RGBA", (boy, boy), zemin)
    pay = int(boy * pay_orani)
    ic = boy - 2 * pay
    olcek = min(ic / im.width, ic / im.height)
    yeni = im.resize((max(1, round(im.width * olcek)),
                      max(1, round(im.height * olcek))), Image.LANCZOS)
    tuval.paste(yeni, ((boy - yeni.width) // 2, (boy - yeni.height) // 2), yeni)
    return tuval


def main() -> None:
    if not os.path.exists(KAYNAK):
        sys.exit(f"Kaynak bulunamadı: {KAYNAK}")

    os.makedirs(GORSELLER, exist_ok=True)
    saydam = saydamlastir(Image.open(KAYNAK).convert("RGB"))

    # --- Üst menü logosu: tam kilit, 256 px yükseklik (64 px gösterim için 4×) ---
    logo = kirp(saydam, TAM_KILIT)
    logo = logo.resize((round(logo.width * 256 / logo.height), 256), Image.LANCZOS)
    yol = os.path.join(GORSELLER, "sekans-logo.png")
    logo.save(yol, optimize=True)
    print(f"  sekans-logo.png      {logo.size[0]}×{logo.size[1]}  "
          f"{os.path.getsize(yol)//1024} KB")

    # --- Favicon (16/32/48): monogram — 16 pikselde okunan tek biçim ---
    monogram = kirp(saydam, S_HARFI, pay_orani=0.06)
    for boy in (16, 32, 48):
        yol = os.path.join(PUBLIC, f"favicon-{boy}.png")
        kareye_otur(monogram, boy, pay_orani=0.10).save(yol, optimize=True)
        print(f"  favicon-{boy}.png{'':<8} {boy}×{boy}  {os.path.getsize(yol)} bayt")

    yol = os.path.join(PUBLIC, "favicon.ico")
    kareye_otur(monogram, 48, pay_orani=0.10).save(
        yol, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  favicon.ico          16+32+48  {os.path.getsize(yol)} bayt")

    # --- iOS ana ekran: 180 px, tam kilit okunur; saydamlık siyaha döner ---
    yol = os.path.join(PUBLIC, "apple-touch-icon.png")
    kareye_otur(kirp(saydam, TAM_KILIT), 180,
                zemin=(255, 255, 255, 255), pay_orani=0.10).save(yol, optimize=True)
    print(f"  apple-touch-icon.png 180×180  {os.path.getsize(yol)//1024} KB")

    print("\nTamam. Ardından: npx vite build")


if __name__ == "__main__":
    main()
