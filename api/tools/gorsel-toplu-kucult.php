<?php
/**
 * TEK SEFERLİK: sitenin KULLANDIĞI görselleri küçültür.
 *
 * Dosya listesi KLASÖR TARAYARAK değil VERİTABANINDAN çıkarılır. Önceki sürüm
 * yalnızca uploads/ klasörüne bakıyordu; ana sayfayı ağırlaştıran dosyaların
 * (sayı kapağı 1,6 MB, dizin görselleri 580/408 kB) hiçbiri orada değildi —
 * eski Joomla kurulumundan kalan images/ klasöründe duruyorlar. Bu yüzden
 * betik "139 dosya, hepsi sınır içinde" deyip hiçbir şey yapmıyordu.
 *
 * Her adresin nerede kullanıldığı bilindiği için küçültme ölçüsü de kesindir;
 * ölçüler api/lib/gorsel.php içindeki gorsel_sinirlari'ndan gelir.
 *
 * PNG → JPEG: saydamlığı olmayan PNG'ler JPEG'e çevrilir ve veritabanındaki
 * adresler de birlikte güncellenir. Saydam PNG'ler (logo, grafik) korunur.
 *
 * ÇALIŞTIRMA:
 *     php api/tools/gorsel-toplu-kucult.php          # sadece rapor
 *     php api/tools/gorsel-toplu-kucult.php --uygula # gerçekten küçültür
 *
 * ÖNCE uploads/ + images/ KLASÖRLERİNİN VE VERİTABANININ YEDEĞİNİ ALIN.
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
$KOK = dirname(__DIR__, 2);   // public_html

if (!function_exists('imagecreatefromjpeg')) {
    fwrite(STDERR, 'HATA: PHP GD eklentisi kapali. Hicbir gorsel kucultulemez.' . PHP_EOL);
    exit(1);
}
echo 'GD acik. Kok: ' . $KOK . PHP_EOL . PHP_EOL;

/* --- Adres tutan sütunlar --------------------------------------------------
   [tablo, sütun, tür]. 'icerik' sütunları yazı gövdesidir: düz adres değil HTML
   tutarlar, içlerindeki <img src="..."> etiketleri ayrıca ayıklanır. */
const ALANLAR = [
    ['sayilar',     'kapak_gorseli', 'kapak'],
    ['yazilar',     'dizin_gorseli', 'dizin'],
    ['yazilar',     'kapak_gorseli', 'image'],
    ['ara_yazilar', 'kapak_gorseli', 'image'],
    ['yazarlar',    'fotograf',      'foto'],
];
const ICERIK_SUTUNLARI = [
    ['yazilar', 'icerik'], ['ara_yazilar', 'icerik'],
    ['hakkimizda', 'icerik'], ['sayfalar', 'icerik'],
];

/** Sitenin kullandığı tüm görsel adresleri: adres => tür. */
function adresleriTopla(): array
{
    $harita = [];
    // Bir adres birden çok yerde geçebilir; EN GENİŞ sınır kazansın ki
    // dizin görselini kapak olarak da kullanan bir yazı bulanıklaşmasın.
    $oncelik = ['foto' => 1, 'dizin' => 2, 'kapak' => 3, 'image' => 4];

    $ekle = static function (string $u, string $tur) use (&$harita, $oncelik): void {
        $u = trim($u);
        if ($u === '' || preg_match('#^(https?:)?//#i', $u)) return;   // dış adres
        if (!preg_match('#\.(jpe?g|png|webp)$#i', $u)) return;
        if (!isset($harita[$u]) || $oncelik[$tur] > $oncelik[$harita[$u]]) $harita[$u] = $tur;
    };

    foreach (ALANLAR as [$tablo, $sutun, $tur]) {
        try {
            foreach (db()->query("SELECT `$sutun` AS u FROM `$tablo`") as $sat) {
                $ekle((string)($sat['u'] ?? ''), $tur);
            }
        } catch (Throwable $e) {
            fwrite(STDERR, "UYARI: $tablo.$sutun okunamadi - {$e->getMessage()}" . PHP_EOL);
        }
    }
    foreach (ICERIK_SUTUNLARI as [$tablo, $sutun]) {
        try {
            foreach (db()->query("SELECT `$sutun` AS u FROM `$tablo`") as $sat) {
                if (preg_match_all('#src=["\']([^"\']+)["\']#i', (string)($sat['u'] ?? ''), $m)) {
                    foreach ($m[1] as $u) $ekle($u, 'image');
                }
            }
        } catch (Throwable $e) {
            fwrite(STDERR, "UYARI: $tablo.$sutun okunamadi - {$e->getMessage()}" . PHP_EOL);
        }
    }
    return $harita;
}

/** Adres -> disk yolu. Kökün dışına çıkan veya var olmayan adresler elenir. */
function diskYolu(string $kok, string $adres): ?string
{
    $temiz = parse_url($adres, PHP_URL_PATH) ?: $adres;
    $temiz = ltrim(rawurldecode($temiz), '/');
    if ($temiz === '' || strpos($temiz, '..') !== false) return null;
    $gercek = realpath($kok . '/' . $temiz);
    if ($gercek === false || strpos($gercek, (string)realpath($kok)) !== 0) return null;
    return is_file($gercek) ? $gercek : null;
}

/** Adres değiştiyse tüm sütunlarda metin değişimi yap. */
function adresiGuncelle(string $eski, string $yeni): int
{
    $sutunlar = array_merge(
        array_map(static fn($a) => [$a[0], $a[1]], ALANLAR),
        ICERIK_SUTUNLARI
    );
    $toplam = 0;
    foreach ($sutunlar as [$tablo, $sutun]) {
        try {
            $st = db()->prepare("UPDATE `$tablo` SET `$sutun` = REPLACE(`$sutun`, ?, ?) WHERE `$sutun` LIKE ?");
            $st->execute([$eski, $yeni, '%' . $eski . '%']);
            $toplam += $st->rowCount();
        } catch (Throwable $e) {
            fwrite(STDERR, "UYARI: $tablo.$sutun guncellenemedi - {$e->getMessage()}" . PHP_EOL);
        }
    }
    return $toplam;
}

$harita = adresleriTopla();
$dagilim = array_count_values($harita);
ksort($dagilim);
echo 'Veritabaninda ' . count($harita) . ' gorsel adresi (';
foreach ($dagilim as $t => $n) echo $t . '=' . $n . ' ';
echo ')' . PHP_EOL;

// Hangi klasörlerde duruyorlar? Sorunun kaynağı buydu: uploads/ değil images/.
$klasorler = [];
foreach (array_keys($harita) as $adres) {
    $ilk = explode('/', ltrim($adres, '/'))[0] ?: '?';
    $klasorler[$ilk] = ($klasorler[$ilk] ?? 0) + 1;
}
arsort($klasorler);
echo 'Klasor dagilimi: ';
foreach ($klasorler as $k => $n) echo $k . '=' . $n . ' ';
echo PHP_EOL . PHP_EOL;

$sayac = ['kucultuldu' => 0, 'atlandi' => 0, 'donusturuldu' => 0, 'yok' => 0];
$onceToplam = 0;
$sonraToplam = 0;
$buyukler = [];

foreach ($harita as $adres => $kind) {
    $yol = diskYolu($KOK, $adres);
    if ($yol === null) {
        $sayac['yok']++;
        if ($sayac['yok'] <= 10) echo '  YOK   ' . $adres . PHP_EOL;
        continue;
    }

    $ext = strtolower(pathinfo($yol, PATHINFO_EXTENSION));
    $once = (int)filesize($yol);
    $onceToplam += $once;
    $olcu = @getimagesize($yol);
    $buyukler[] = [$once, $adres, $kind, $olcu ? $olcu[0] . 'x' . $olcu[1] : '?'];

    if (!$uygula) {
        $sonraToplam += $once;
        [$azamiG, $azamiY] = gorsel_sinirlari($kind);
        $buyuk = $olcu && ($olcu[0] > $azamiG || $olcu[1] > $azamiY);
        if ($buyuk || $ext === 'png') $sayac['kucultuldu']++; else $sayac['atlandi']++;
        continue;
    }

    $yeniExt = gorsel_kucult($yol, $ext, $kind);
    if ($yeniExt !== $ext) {
        $yeniAdres = preg_replace('/\.[^.\/]+$/', '.' . $yeniExt, $adres);
        $n = adresiGuncelle($adres, $yeniAdres);
        $yol = preg_replace('/\.[^.\/]+$/', '.' . $yeniExt, $yol);
        $sayac['donusturuldu']++;
        printf('  JPEG  %-52s (%d kayit)' . PHP_EOL, basename($adres), $n);
    }

    clearstatcache(true, $yol);
    $sonra = (int)@filesize($yol);
    $sonraToplam += $sonra;
    if ($sonra > 0 && $sonra < $once) {
        $sayac['kucultuldu']++;
        printf('  %-52s %7s KB -> %6s KB' . PHP_EOL, basename($yol),
            number_format($once / 1024), number_format($sonra / 1024));
    } else {
        $sayac['atlandi']++;
    }
}

echo PHP_EOL . ($uygula ? 'UYGULANDI' : 'KURU CALISTIRMA - hicbir dosyaya dokunulmadi') . PHP_EOL;
printf('  kuculen / kuculecek : %d' . PHP_EOL, $sayac['kucultuldu']);
printf('  JPEG e cevrilen     : %d' . PHP_EOL, $sayac['donusturuldu']);
printf('  dokunulmayan        : %d' . PHP_EOL, $sayac['atlandi']);
printf('  diskte bulunamayan  : %d' . PHP_EOL, $sayac['yok']);
printf('  toplam              : %s MB -> %s MB' . PHP_EOL,
    number_format($onceToplam / 1048576, 1), number_format($sonraToplam / 1048576, 1));
if (!$uygula) echo PHP_EOL . 'Gercekten kucultmek icin komutun sonuna --uygula ekleyin.' . PHP_EOL;

usort($buyukler, static fn($a, $b) => $b[0] <=> $a[0]);
echo PHP_EOL . 'EN BUYUK 20' . PHP_EOL;
foreach (array_slice($buyukler, 0, 20) as [$b, $adres, $kind, $olcu]) {
    printf('  %7s KB  %-6s %-11s %s' . PHP_EOL, number_format($b / 1024), $kind, $olcu, $adres);
}
