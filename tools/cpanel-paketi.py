#!/usr/bin/env python3
"""
cPanel'e yüklenecek arşivleri hazırlar.

    python tools/cpanel-paketi.py            # site + api (küçük paket)
    python tools/cpanel-paketi.py --medya    # docs/ ve images/ arşivlerini de üret

NEDEN ARŞİV: dist/ içinde 1200'den fazla dosya var. File Manager ile tek tek
yüklemek saatler sürer ve yarıda kesilirse hangi dosyanın eksik kaldığı
anlaşılmaz. Arşiv yükleyip sunucuda "Extract" demek hem hızlı hem güvenli.

NEDEN AYRI PAKETLER: medya (docs/ + images/) yarım gigabaytın üzerinde ve
NADİREN değişir. Site kabuğu (index.html + assets) birkaç megabayt ve HER
güncellemede değişir. Ayrı tutulunca sonraki güncellemelerde yalnızca küçük
paket yüklenir.

ÇIKTI: belgeler/cpanel-paket/ altında.
"""

import argparse
import os
import shutil
import sys
import zipfile

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIKTI = os.path.join(KOK, "belgeler", "cpanel-paket")

# Site kabuğunda OLMAYACAKLAR: ayrı arşivlere giderler.
MEDYA_KLASORLERI = {"docs", "images", "uploads"}

# images/ KÖKÜNDEKİ dosyalar site kabuğuna DAHİL edilir (~3 MB).
#
# Neden: marka logosu gibi UYGULAMAYA ait görseller images/ kökünde durur
# (kod /images/sekans-logo.png diye referans verir). images/ tamamen hariç
# tutulunca bu dosyalar hiç yüklenmiyordu — canlıda logo yerine metin
# yedeği çıktı, üstelik Joomla'dan kalma eski bir sekans-logo.png sessizce
# servis edildi. İÇERİK görselleri images/ ALT KLASÖRLERİNDE (dergi/,
# altyazilar/, yazilar/ ...) durur; onlar hariç kalmaya devam eder.
IMAGES_KOKU_DAHIL = True


def mb(bayt: int) -> str:
    return f"{bayt / 1024 / 1024:.1f} MB"


def klasor_boyutu(yol: str) -> int:
    return sum(
        os.path.getsize(os.path.join(k, d))
        for k, _, dosyalar in os.walk(yol)
        for d in dosyalar
    )


def arsivle(hedef_zip: str, kaynak: str, ic_kok: str = "", atla: set = frozenset()) -> int:
    """kaynak klasörünü zip'le. ic_kok verilirse arşiv içinde o ad altına yazar."""
    adet = 0
    with zipfile.ZipFile(hedef_zip, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for kok, klasorler, dosyalar in os.walk(kaynak):
            klasorler[:] = [k for k in klasorler
                            if os.path.relpath(os.path.join(kok, k), kaynak).split(os.sep)[0] not in atla]
            for d in dosyalar:
                tam = os.path.join(kok, d)
                bagil = os.path.relpath(tam, kaynak)
                if bagil.split(os.sep)[0] in atla:
                    continue
                z.write(tam, os.path.join(ic_kok, bagil) if ic_kok else bagil)
                adet += 1
    return adet


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--medya", action="store_true",
                    help="docs/ ve images/ arşivlerini de üret (yarım GB'ın üzerinde)")
    args = ap.parse_args()

    dist = os.path.join(KOK, "dist")
    if not os.path.isdir(dist):
        sys.exit("dist/ yok. Önce: npx vite build")

    shutil.rmtree(CIKTI, ignore_errors=True)
    os.makedirs(CIKTI, exist_ok=True)
    print(f"Çıktı: {CIKTI}\n")

    # --- 1) Site kabuğu: index.html + assets + favicon + .htaccess
    #        + images/ kökündeki marka görselleri ---
    yol = os.path.join(CIKTI, "cpanel-site.zip")
    adet = arsivle(yol, dist, atla=MEDYA_KLASORLERI)
    if IMAGES_KOKU_DAHIL:
        kok_img = os.path.join(dist, "images")
        if os.path.isdir(kok_img):
            with zipfile.ZipFile(yol, "a", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
                for d in sorted(os.listdir(kok_img)):
                    tam = os.path.join(kok_img, d)
                    if os.path.isfile(tam):
                        z.write(tam, os.path.join("images", d))
                        adet += 1
    print(f"  cpanel-site.zip   {mb(os.path.getsize(yol)):>10}  {adet:>5} dosya"
          f"   -> public_html/ içine Extract")

    # --- 2) API ---
    yol = os.path.join(CIKTI, "cpanel-api.zip")
    adet = arsivle(yol, os.path.join(KOK, "api"), ic_kok="api")
    print(f"  cpanel-api.zip    {mb(os.path.getsize(yol)):>10}  {adet:>5} dosya"
          f"   -> public_html/ içine Extract (api/ oluşur)")

    # --- 3) Medya (isteğe bağlı) ---
    if args.medya:
        for ad in ("images", "docs"):
            kaynak = os.path.join(dist, ad)
            if not os.path.isdir(kaynak):
                continue
            print(f"\n  {ad}/ arşivleniyor ({mb(klasor_boyutu(kaynak))} ham)... "
                  f"PDF'ler zaten sıkışık, sabırlı olun.")
            yol = os.path.join(CIKTI, f"cpanel-{ad}.zip")
            adet = arsivle(yol, kaynak, ic_kok=ad)
            print(f"  cpanel-{ad}.zip{'':<4}{mb(os.path.getsize(yol)):>10}  {adet:>5} dosya"
                  f"   -> public_html/ içine Extract")
    else:
        toplam = sum(klasor_boyutu(os.path.join(dist, a))
                     for a in ("docs", "images") if os.path.isdir(os.path.join(dist, a)))
        print(f"\n  (docs/ + images/ = {mb(toplam)} ATLANDI."
              f"\n   Bu klasörler hedef sunucuda zaten varsa gerek yok."
              f"\n   Gerekiyorsa: python tools/cpanel-paketi.py --medya)")

    print("\nYükleme sırası: cpanel-site.zip -> cpanel-api.zip -> (medya) -> uploads")
    print("Ayrıntı: DEPLOY.md > TEST SUNUCUSUNDAN cPANEL'E TAŞIMA")


if __name__ == "__main__":
    main()
