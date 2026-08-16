<?php
/**
 * TEK SEFERLİK: uploads klasöründeki MEVCUT görselleri küçültür.
 *
 * Yeni yüklemeler artık kaydedilirken küçülüyor (api/lib/gorsel.php), ama
 * geçmişte yüklenmiş yüzlerce tam boy görsel olduğu gibi duruyor — canlı
 * sitedeki 18,9 MB'lık ana sayfanın sebebi bunlar.
 *
 * ÇALIŞTIRMA (cPanel → Terminal, ya da SSH):
 *     php api/tools/gorsel-toplu-kucult.php          # sadece rapor, DOSYAYA DOKUNMAZ
 *     php api/tools/gorsel-toplu-kucult.php --uygula # gerçekten küçültür
 *
 * GÜVENLİK NOTLARI
 *  - Yalnızca komut satırından çalışır; tarayıcıdan çağrılamaz.
 *  - Uzantı ASLA değişmez (veritabanındaki adresler kırılmasın).
 *  - --uygula öncesi uploads klasörünün yedeğini alın; işlem geri alınamaz.
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

$cfg = sekans_config()['app'] ?? [];
$dir = $cfg['upload_dir'] ?? (dirname(__DIR__, 2) . '/uploads');
$urlBase = rtrim($cfg['upload_url'] ?? '/uploads', '/');

if (!is_dir($dir)) exit("Yükleme klasörü yok: $dir\n");

/* Dizin görselleri içindekilerde en fazla ~400 px gösterilir; onlara çok daha
   sıkı bir sınır uygulanır. Hangi dosyanın dizin görseli olduğunu veritabanı
   söyler. */
$dizinDosyalari = [];
try {
    foreach (db()->query("SELECT dizin_gorseli FROM yazilar WHERE dizin_gorseli <> ''") as $sat) {
        $dizinDosyalari[basename((string)$sat['dizin_gorseli'])] = true;
    }
} catch (Throwable $e) {
    fwrite(STDERR, "UYARI: veritabanı okunamadı, hepsi genel sınırla işlenecek. ({$e->getMessage()})\n");
}

$sayac = ['atlandi' => 0, 'kucultuldu' => 0, 'hata' => 0];
$oncekiToplam = 0;
$sonrakiToplam = 0;

foreach (scandir($dir) ?: [] as $ad) {
    $yol = $dir . '/' . $ad;
    if (!is_file($yol)) continue;

    $ext = strtolower(pathinfo($ad, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) continue;

    $onceki = (int)filesize($yol);
    $oncekiToplam += $onceki;
    $kind = isset($dizinDosyalari[$ad]) ? 'dizin' : 'image';

    if (!$uygula) {
        // Kuru çalıştırma: yalnızca sınırı aşanları listele.
        $bilgi = @getimagesize($yol);
        if (!$bilgi) { $sayac['hata']++; continue; }
        [$azamiG, $azamiY] = gorsel_sinirlari($kind);
        if ($bilgi[0] <= $azamiG && $bilgi[1] <= $azamiY) {
            $sayac['atlandi']++;
            $sonrakiToplam += $onceki;
            continue;
        }
        $sayac['kucultuldu']++;
        $sonrakiToplam += $onceki;
        printf("  %-55s %sx%s  %s KB  [%s]\n", $ad, $bilgi[0], $bilgi[1], number_format($onceki / 1024), $kind);
        continue;
    }

    gorsel_kucult($yol, $ext, $kind, true);
    clearstatcache(true, $yol);
    $sonraki = (int)@filesize($yol);
    $sonrakiToplam += $sonraki;

    if ($sonraki > 0 && $sonraki < $onceki) {
        $sayac['kucultuldu']++;
        printf("  %-55s %s KB → %s KB\n", $ad, number_format($onceki / 1024), number_format($sonraki / 1024));
    } else {
        $sayac['atlandi']++;
    }
}

echo "\n";
echo $uygula ? "UYGULANDI\n" : "KURU ÇALIŞTIRMA — hiçbir dosyaya dokunulmadı\n";
printf("  küçültülen : %d\n", $sayac['kucultuldu']);
printf("  atlanan    : %d\n", $sayac['atlandi']);
printf("  okunamayan : %d\n", $sayac['hata']);
printf("  toplam     : %s MB → %s MB\n", number_format($oncekiToplam / 1048576, 1), number_format($sonrakiToplam / 1048576, 1));
if (!$uygula) echo "\nGerçekten küçültmek için: php " . basename(__FILE__) . " --uygula\n";
