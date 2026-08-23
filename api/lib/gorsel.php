<?php
/**
 * GÖRSEL KÜÇÜLTME — yüklenen görselleri kaydederken boyutlandırır.
 *
 * NEDEN: Editörler makineden çıkan fotoğrafı olduğu gibi yüklüyor. Ekranda
 * 192 piksel gösterilen bir dizin görseli 678 kB iniyordu; ana sayfa 18,9 MB
 * ve 4,8 saniyeydi. "Küçük yükleyin" demek işe yaramadı — sunucu küçültüyor.
 *
 * KURAL: her türün kendi azami ölçüsü var (bkz. gorsel_sinirlari). Görsel
 * sınırın altındaysa DOKUNULMAZ. Büyükse oran korunarak küçültülür.
 *
 * PNG → JPEG: saydamlığı olmayan bir fotoğrafın PNG olarak durması boşuna
 * yer kaplar (aynı kare 3-4 katı). Saydamlık varsa PNG kalır.
 *
 * GD yoksa veya herhangi bir adım başarısız olursa dosya OLDUĞU GİBİ kalır;
 * yükleme asla bu yüzden hata vermez.
 */
declare(strict_types=1);

/**
 * Tür başına [azami genişlik, azami yükseklik, jpeg kalitesi].
 * Ölçüler CSS pikselinin ~2 katıdır (retina ekranlarda net görünsün).
 */
function gorsel_sinirlari(string $kind): array
{
    switch ($kind) {
        // İçindekilerdeki 2:1 dizin görseli — en fazla ~400 CSS px gösterilir.
        case 'dizin': return [800, 400, 80];
        // Sayı kapağı — sayfada 280 px, arşiv ızgarasında 200 px. Daha büyüğü
        // hiçbir yerde gösterilmiyor; e29 kapağı 1,6 MB olarak iniyordu.
        case 'kapak': return [700, 940, 82];
        // Yazar fotoğrafı — 160 px daire.
        case 'foto':  return [400, 400, 82];
        // Kapak, ara yazı kapağı, yazı içi görsel: detay sayfasında büyük çıkar.
        default:      return [1600, 1600, 82];
    }
}

/**
 * $yol dosyasını yerinde küçültür.
 *
 * @param bool $uzantiKorunsun Toplu geçmiş temizliğinde true verilir: veritabanı
 *        zaten o adresi tuttuğu için PNG→JPEG dönüşümü bağlantıyı kırardı.
 * @return string Dosyanın son uzantısı (PNG→JPEG dönüşümünde değişir).
 *                Değişiklik yapılmadıysa gelen uzantı aynen döner.
 */
function gorsel_kucult(string $yol, string $ext, string $kind, bool $uzantiKorunsun = false): string
{
    // SVG vektördür, GIF animasyonlu olabilir — ikisine de dokunulmaz.
    if (in_array($ext, ['svg', 'gif'], true)) return $ext;
    if (!function_exists('imagecreatefromjpeg')) return $ext;   // GD yok

    $bilgi = @getimagesize($yol);
    if (!$bilgi) return $ext;
    [$g, $y] = $bilgi;
    $tip = $bilgi[2];

    [$azamiG, $azamiY, $kalite] = gorsel_sinirlari($kind);

    $kaynak = gorsel_ac($yol, $tip);
    if (!$kaynak) return $ext;

    // Paletli (256 renk) PNG'de imagecolorat renk DEĞİL indeks döner; saydamlık
    // ölçümü ve yeniden örnekleme doğru çalışsın diye önce truecolor'a çevir.
    if (function_exists('imagepalettetotruecolor')) @imagepalettetotruecolor($kaynak);

    // JPEG'lerde telefon fotoğrafı yan yatmış olabilir; EXIF'e göre çevir.
    if ($tip === IMAGETYPE_JPEG) {
        $kaynak = gorsel_exif_dondur($kaynak, $yol);
        $g = imagesx($kaynak);
        $y = imagesy($kaynak);
    }

    $oran = min($azamiG / $g, $azamiY / $y, 1.0);
    // Uzantı korunacaksa PNG, PNG kalmalı — yani saydammış gibi davranılır.
    $saydam = gorsel_saydam_mi($kaynak, $tip) || ($uzantiKorunsun && $tip === IMAGETYPE_PNG);

    // Zaten küçük ve zaten JPEG/WebP ise yeniden kodlamaya gerek yok.
    if ($oran >= 1.0 && $tip !== IMAGETYPE_PNG) {
        imagedestroy($kaynak);
        return $ext;
    }
    // Küçük ama saydam PNG (logo, grafik) — olduğu gibi bırak.
    if ($oran >= 1.0 && $tip === IMAGETYPE_PNG && $saydam) {
        imagedestroy($kaynak);
        return $ext;
    }

    $yeniG = max(1, (int)round($g * $oran));
    $yeniY = max(1, (int)round($y * $oran));

    $hedef = imagecreatetruecolor($yeniG, $yeniY);
    if ($saydam) {
        imagealphablending($hedef, false);
        imagesavealpha($hedef, true);
    } else {
        // Saydam alan JPEG'de siyah çıkar; önce beyaza boya.
        imagefilledrectangle($hedef, 0, 0, $yeniG, $yeniY, imagecolorallocate($hedef, 255, 255, 255));
    }
    imagecopyresampled($hedef, $kaynak, 0, 0, 0, 0, $yeniG, $yeniY, $g, $y);
    imagedestroy($kaynak);

    // Saydamlık yoksa JPEG'e düş: aynı kare çok daha az yer kaplar.
    $yeniExt = $ext;
    $ok = false;
    if ($tip === IMAGETYPE_WEBP && function_exists('imagewebp')) {
        $ok = @imagewebp($hedef, $yol, $kalite);
    } elseif ($saydam) {
        $ok = @imagepng($hedef, $yol, 8);
        $yeniExt = 'png';
    } else {
        $jpgYol = $ext === 'png' ? preg_replace('/\.png$/i', '.jpg', $yol) : $yol;
        $ok = @imagejpeg($hedef, $jpgYol, $kalite);
        if ($ok && $jpgYol !== $yol) {
            @unlink($yol);          // eski PNG'yi bırakma
            $yeniExt = 'jpg';
        }
    }
    imagedestroy($hedef);

    return $ok ? $yeniExt : $ext;
}

function gorsel_ac(string $yol, int $tip)
{
    switch ($tip) {
        case IMAGETYPE_JPEG: return @imagecreatefromjpeg($yol);
        case IMAGETYPE_PNG:  return @imagecreatefrompng($yol);
        case IMAGETYPE_WEBP: return function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($yol) : null;
        default:             return null;
    }
}

/** Görselde gerçekten saydam piksel var mı (PNG'yi boşuna korumayalım). */
function gorsel_saydam_mi($im, int $tip): bool
{
    if ($tip !== IMAGETYPE_PNG && $tip !== IMAGETYPE_WEBP) return false;
    $g = imagesx($im);
    $y = imagesy($im);
    // Tam tarama büyük görselde pahalı; 40x40'lık ızgarada örnekle.
    $adimX = max(1, (int)($g / 40));
    $adimY = max(1, (int)($y / 40));
    for ($x = 0; $x < $g; $x += $adimX) {
        for ($j = 0; $j < $y; $j += $adimY) {
            if (((imagecolorat($im, $x, $j) >> 24) & 0x7F) > 0) return true;
        }
    }
    return false;
}

/** Telefondan gelen yan yatmış JPEG'i EXIF etiketine göre düzeltir. */
function gorsel_exif_dondur($im, string $yol)
{
    if (!function_exists('exif_read_data')) return $im;
    $exif = @exif_read_data($yol);
    $yon = (int)($exif['Orientation'] ?? 0);
    $aci = $yon === 3 ? 180 : ($yon === 6 ? -90 : ($yon === 8 ? 90 : 0));
    if ($aci === 0) return $im;
    $donmus = @imagerotate($im, $aci, 0);
    if (!$donmus) return $im;
    imagedestroy($im);
    return $donmus;
}
