<?php
/**
 * TEK SEFERLİK: uploads klasöründeki MEVCUT görselleri küçültür.
 *
 * Yeni yüklemeler artık kaydedilirken küçülüyor (api/lib/gorsel.php), ama
 * geçmişte yüklenmiş yüzlerce tam boy görsel olduğu gibi duruyor — canlı
 * sitedeki 18,9 MB'lık ana sayfanın sebebi bunlar.
 *
 * HANGİ DOSYA NE KADAR KÜÇÜLÜR: veritabanına bakılır. Bir dosya dizin görseli
 * olarak kullanılıyorsa 800x400'e, sayı kapağıysa 700x940'a, yazar fotoğrafıysa
 * 400x400'e, geri kalanı 1600 px uzun kenara iner.
 *
 * PNG → JPEG: fotoğrafların PNG olarak durması boşuna yer kaplıyor (en büyük
 * beş dosyanın hepsi PNG'ydi). Saydamlığı olmayan PNG'ler JPEG'e çevrilir ve
 * VERİTABANINDAKİ ADRESLER de birlikte güncellenir — yazı gövdesindeki
 * <img src> etiketleri dahil. Saydam PNG'ler (logo, grafik) dokunulmadan kalır.
 *
 * ÇALIŞTIRMA (cPanel → Terminal veya Cron İşleri):
 *     php api/tools/gorsel-toplu-kucult.php          # sadece rapor, DOSYAYA DOKUNMAZ
 *     php api/tools/gorsel-toplu-kucult.php --uygula # gerçekten küçültür
 *
 * ÖNCE UPLOADS KLASÖRÜNÜN VE VERİTABANININ YEDEĞİNİ ALIN. İşlem geri alınamaz.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Bu betik yalnızca komut satırından çalışır.\n");
}

require_once __DIR__ . '/../lib/config.php';
require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/gorsel.php';

$uygula = in_array('--uygula', $argv, true);

/* GD olmadan tek bir dosya bile kucultulemez; gorsel_kucult sessizce geri doner.
   Bu durumda "139 atlandi, 16.3 MB -> 16.3 MB" gibi ise yaramis gibi gorunen bir
   rapor cikiyordu. Yuksek sesle soyle. */
if (!function_exists('imagecreatefromjpeg')) {
    fwrite(STDERR, 'HATA: PHP GD eklentisi kapali. Hicbir gorsel kucultulemez.' . PHP_EOL);
    fwrite(STDERR, "cPanel > PHP Surumunu Sec > Extensions > 'gd' kutusunu isaretleyin." . PHP_EOL);
    exit(1);
}
echo 'GD acik. exif: ' . (function_exists('exif_read_data') ? 'var' : 'yok')
    . ', webp: ' . (function_exists('imagewebp') ? 'var' : 'yok') . PHP_EOL . PHP_EOL;

$cfg = sekans_config()['app'] ?? [];
$dir = $cfg['upload_dir'] ?? (dirname(__DIR__, 2) . '/uploads');

if (!is_dir($dir)) exit("Yükleme klasörü yok: $dir\n");

/* --- Adres tutan sütunlar --------------------------------------------------
   Dosya adı değişirse (PNG→JPEG) bu sütunların hepsinde metin değişimi yapılır.
   icerik sütunları yazı gövdesidir; içinde <img src="/uploads/..."> geçebilir. */
const ADRES_SUTUNLARI = [
    ['sayilar',     'kapak_gorseli'],
    ['yazilar',     'kapak_gorseli'],
    ['yazilar',     'dizin_gorseli'],
    ['yazilar',     'icerik'],
    ['ara_yazilar', 'kapak_gorseli'],
    ['ara_yazilar', 'icerik'],
    ['yazarlar',    'fotograf'],
    ['hakkimizda',  'icerik'],
    ['sayfalar',    'icerik'],
];

/** Dosya adı → küçültme türü. Veritabanı hangi alanda kullanıldığını söyler. */
function turleriBelirle(): array
{
    $tur = [];
    $sorgular = [
        'dizin' => "SELECT dizin_gorseli AS u FROM yazilar WHERE dizin_gorseli <> ''",
        'kapak' => "SELECT kapak_gorseli AS u FROM sayilar WHERE kapak_gorseli <> ''",
        'foto'  => "SELECT fotograf     AS u FROM yazarlar WHERE fotograf <> ''",
    ];
    foreach ($sorgular as $ad => $sql) {
        try {
            foreach (db()->query($sql) as $sat) {
                $dosya = basename((string)$sat['u']);
                // Bir dosya birden çok yerde kullanılıyorsa en GENİŞ sınır kazanır;
                // dizin görselini kapak olarak da kullanan yazı varsa bulanıklaşmasın.
                if (!isset($tur[$dosya]) || $ad === 'kapak') $tur[$dosya] = $ad;
            }
        } catch (Throwable $e) {
            fwrite(STDERR, "UYARI: $ad sorgusu başarısız — {$e->getMessage()}\n");
        }
    }
    return $tur;
}

/** Yeniden adlandırılan dosyanın adresini tüm sütunlarda günceller. */
function adresiGuncelle(string $eski, string $yeni): int
{
    $toplam = 0;
    foreach (ADRES_SUTUNLARI as [$tablo, $sutun]) {
        try {
            $st = db()->prepare("UPDATE `$tablo` SET `$sutun` = REPLACE(`$sutun`, ?, ?) WHERE `$sutun` LIKE ?");
            $st->execute([$eski, $yeni, '%' . $eski . '%']);
            $toplam += $st->rowCount();
        } catch (Throwable $e) {
            fwrite(STDERR, "UYARI: $tablo.$sutun güncellenemedi — {$e->getMessage()}\n");
        }
    }
    return $toplam;
}

$turler = turleriBelirle();
$dagilim = array_count_values($turler);
echo 'Veritabanindan eslesen dosya: ' . count($turler) . ' (';
foreach ($dagilim as $t => $n) echo $t . '=' . $n . ' ';
echo ')' . PHP_EOL . PHP_EOL;

$sayac = ['kucultuldu' => 0, 'atlandi' => 0, 'donusturuldu' => 0, 'hata' => 0];
$oncekiToplam = 0;
$enBuyukler = [];
$sonrakiToplam = 0;

foreach (scandir($dir) ?: [] as $ad) {
    $yol = $dir . '/' . $ad;
    if (!is_file($yol)) continue;

    $ext = strtolower(pathinfo($ad, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) continue;

    $onceki = (int)filesize($yol);
    $oncekiToplam += $onceki;
    $kind = $turler[$ad] ?? 'image';
    $enBuyukler[] = [$onceki, $ad, $kind];

    if (!$uygula) {
        $bilgi = @getimagesize($yol);
        if (!$bilgi) { $sayac['hata']++; continue; }
        [$azamiG, $azamiY] = gorsel_sinirlari($kind);
        $sonrakiToplam += $onceki;
        $buyuk = $bilgi[0] > $azamiG || $bilgi[1] > $azamiY;
        if (!$buyuk && $ext !== 'png') { $sayac['atlandi']++; continue; }
        $sayac['kucultuldu']++;
        printf("  %-52s %4dx%-4d %7s KB  [%s%s]\n", $ad, $bilgi[0], $bilgi[1],
            number_format($onceki / 1024), $kind, $ext === 'png' ? ', png' : '');
        continue;
    }

    $yeniExt = gorsel_kucult($yol, $ext, $kind);
    $yeniAd = $ad;
    if ($yeniExt !== $ext) {
        $yeniAd = preg_replace('/\.[^.]+$/', '.' . $yeniExt, $ad);
        $satir = adresiGuncelle($ad, $yeniAd);
        $sayac['donusturuldu']++;
        $yol = $dir . '/' . $yeniAd;
        printf("  %-52s -> %s (%d kayit)" . PHP_EOL, $ad, $yeniAd, $satir);
    }

    clearstatcache(true, $yol);
    $sonraki = (int)@filesize($yol);
    $sonrakiToplam += $sonraki;
    if ($sonraki > 0 && $sonraki < $onceki) {
        $sayac['kucultuldu']++;
        printf("  %-52s %7s KB -> %7s KB" . PHP_EOL, $yeniAd,
            number_format($onceki / 1024), number_format($sonraki / 1024));
        continue;
    }

    /* Dosya kucuulmedi. SEBEBINI yaz -- sessiz atlama yuzunden bir tur kaybettik:
       rapor "139 atlandi" deyip duruyordu, nedeni belli degildi. */
    $sayac['atlandi']++;
    $bilgi = @getimagesize($yol);
    [$azamiG, $azamiY] = gorsel_sinirlari($kind);
    if (!$bilgi) {
        $sebep = 'gorsel okunamadi (bozuk veya desteklenmeyen bicim)';
    } elseif ($bilgi[0] <= $azamiG && $bilgi[1] <= $azamiY && $ext !== 'png') {
        $sebep = sprintf('zaten sinir icinde (%dx%d <= %dx%d)', $bilgi[0], $bilgi[1], $azamiG, $azamiY);
    } elseif (!is_writable($yol)) {
        $sebep = 'dosyaya yazma izni yok';
    } elseif (!is_writable($dir)) {
        $sebep = 'uploads klasorune yazma izni yok';
    } else {
        $sebep = sprintf('kaydetme basarisiz (%dx%d, sinir %dx%d, %s)',
            $bilgi[0], $bilgi[1], $azamiG, $azamiY, $ext);
    }
    if ($sayac['atlandi'] <= 40) printf("  ATLANDI %-44s %s" . PHP_EOL, $ad, $sebep);
}

echo PHP_EOL;
echo $uygula ? "UYGULANDI\n" : "KURU ÇALIŞTIRMA — hiçbir dosyaya dokunulmadı\n";
printf("  küçültülen        : %d\n", $sayac['kucultuldu']);
printf("  JPEG'e çevrilen   : %d\n", $sayac['donusturuldu']);
printf("  atlanan           : %d\n", $sayac['atlandi']);
printf("  okunamayan        : %d\n", $sayac['hata']);
printf("  toplam            : %s MB → %s MB\n",
    number_format($oncekiToplam / 1048576, 1), number_format($sonrakiToplam / 1048576, 1));
if (!$uygula) echo "\nGerçekten küçültmek için komutun sonuna --uygula ekleyin.\n";

/* En agir dosyalar -- hangi turde siniflandiklari ve gercek olculeri.
   Sayfa yavassa suclu bu listenin tepesindedir. */
usort($enBuyukler, fn($a, $b) => $b[0] <=> $a[0]);
echo PHP_EOL . 'EN BUYUK 20 DOSYA' . PHP_EOL;
foreach (array_slice($enBuyukler, 0, 20) as [$boyut, $ad, $kind]) {
    $b = @getimagesize($dir . '/' . $ad);
    printf("  %8s KB  %-52s %-6s %s" . PHP_EOL,
        number_format($boyut / 1024), $ad, $kind,
        $b ? $b[0] . 'x' . $b[1] : '?');
}

