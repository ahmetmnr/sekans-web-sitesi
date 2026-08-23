<?php
/**
 * TEK SEFERLİK: yazı gövdelerine GÖMÜLÜ (base64) görselleri dosyaya çıkarır.
 *
 * Editörler Word'den kopyala-yapıştır yapınca görseller metnin İÇİNE base64
 * olarak gömülüyor: <img src="data:image/png;base64,...">. Tek yazı 2 MB'a
 * çıkmıştı; sonSayi 7 MB'ının 6,4 MB'ı buydu. Tarayıcı bunları önbelleğe de
 * alamaz — her açılışta yeniden iner.
 *
 * Bu betik her gömülü görseli:
 *   1. çözer, uploads/ altına dosya olarak yazar (govde-{tablo}{id}-{n}.jpg),
 *   2. gorsel_kucult ile ekran ölçüsüne indirir (PNG ise JPEG'e çevrilir),
 *   3. gövdedeki src'yi dosya adresiyle değiştirip kaydı günceller.
 *
 * ÇALIŞTIRMA:
 *     php api/tools/govde-gorsel-cikar.php          # sadece rapor
 *     php api/tools/govde-gorsel-cikar.php --uygula # gerçekten uygular
 *
 * ÖNCE VERİTABANININ YEDEĞİNİ ALIN. İşlem geri alınamaz.
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

if (!function_exists('imagecreatefromjpeg')) {
    fwrite(STDERR, 'HATA: PHP GD eklentisi kapali.' . PHP_EOL);
    exit(1);
}

$cfg = sekans_config()['app'] ?? [];
$dir = $cfg['upload_dir'] ?? (dirname(__DIR__, 2) . '/uploads');
$urlBase = rtrim($cfg['upload_url'] ?? '/uploads', '/');
if (!is_dir($dir) || !is_writable($dir)) exit("uploads klasoru yok ya da yazilamiyor: $dir\n");

const TABLOLAR = [
    ['yazilar', 'icerik', 'y'],
    ['ara_yazilar', 'icerik', 'a'],
    ['hakkimizda', 'icerik', 'h'],
    ['sayfalar', 'icerik', 's'],
];
const DESEN = '#src=(["\'])(data:image/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=\s]+?))\1#i';

$sayac = ['gorsel' => 0, 'kayit' => 0, 'hata' => 0];
$onceToplam = 0;
$sonraToplam = 0;

foreach (TABLOLAR as [$tablo, $sutun, $kisa]) {
    try {
        $rows = db()->query("SELECT id, `$sutun` AS ic FROM `$tablo` WHERE `$sutun` LIKE '%data:image%'")->fetchAll();
    } catch (Throwable $e) {
        fwrite(STDERR, "UYARI: $tablo okunamadi - {$e->getMessage()}" . PHP_EOL);
        continue;
    }

    foreach ($rows as $r) {
        $ic = (string)$r['ic'];
        $id = (int)$r['id'];
        if (!preg_match_all(DESEN, $ic, $eslesmeler, PREG_SET_ORDER)) continue;

        $onceBoyut = strlen($ic);
        $n = 0;
        $degisti = false;

        foreach ($eslesmeler as $m) {
            $n++;
            $ext = strtolower($m[3]) === 'jpeg' ? 'jpg' : strtolower($m[3]);
            $ham = base64_decode(preg_replace('/\s+/', '', $m[4]), true);
            if ($ham === false || strlen($ham) < 100) { $sayac['hata']++; continue; }

            $sayac['gorsel']++;
            if (!$uygula) continue;

            $ad = sprintf('govde-%s%d-%d-%s.%s', $kisa, $id, $n, substr(md5($ham), 0, 6), $ext);
            $yol = $dir . '/' . $ad;
            if (file_put_contents($yol, $ham) === false) { $sayac['hata']++; continue; }
            @chmod($yol, 0644);

            // Ekran ölçüsüne indir; PNG ise JPEG'e dönebilir (ad değişir).
            $sonExt = gorsel_kucult($yol, $ext, 'image');
            if ($sonExt !== $ext) {
                $ad = preg_replace('/\.[^.]+$/', '.' . $sonExt, $ad);
            }

            $ic = str_replace($m[2], $urlBase . '/' . $ad, $ic);
            $degisti = true;
        }

        if ($uygula && $degisti) {
            $st = db()->prepare("UPDATE `$tablo` SET `$sutun` = ? WHERE id = ?");
            $st->execute([$ic, $id]);
            $sayac['kayit']++;
            printf('  %-12s #%-5d %4d KB -> %4d KB  (%d gorsel)' . PHP_EOL,
                $tablo, $id, intdiv($onceBoyut, 1024), intdiv(strlen($ic), 1024), $n);
        } elseif (!$uygula) {
            $sayac['kayit']++;
            printf('  %-12s #%-5d %4d KB govde, %d gomulu gorsel' . PHP_EOL,
                $tablo, $id, intdiv($onceBoyut, 1024), $n);
        }
        $onceToplam += $onceBoyut;
        $sonraToplam += strlen($ic);
    }
}

echo PHP_EOL . ($uygula ? 'UYGULANDI' : 'KURU CALISTIRMA - hicbir sey degistirilmedi') . PHP_EOL;
printf('  kayit  : %d' . PHP_EOL, $sayac['kayit']);
printf('  gorsel : %d' . PHP_EOL, $sayac['gorsel']);
printf('  hata   : %d' . PHP_EOL, $sayac['hata']);
printf('  govde  : %s MB -> %s MB' . PHP_EOL,
    number_format($onceToplam / 1048576, 1), number_format($sonraToplam / 1048576, 1));
if (!$uygula) echo PHP_EOL . 'Uygulamak icin komutun sonuna --uygula ekleyin.' . PHP_EOL;
