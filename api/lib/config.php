<?php
/**
 * Yapılandırma yükleyici.
 * Gerçek config.php dosyasını web kökünün ÜZERİNDE arar; bulamazsa web kökü
 * içindeki yedek konuma (api/config.php) bakar (hesap public_html'e hapsedilmişse).
 * Yedek konum api/.htaccess ile tarayıcıya KAPATILMIŞTIR.
 */
declare(strict_types=1);

function sekans_config(): array
{
    static $cfg = null;
    if ($cfg !== null) {
        return $cfg;
    }

    // 1) Tercih edilen: web kökünün üzerinde  (public_html/api -> ../../sekans_config)
    $above = dirname(__DIR__, 3) . '/sekans_config/config.php';
    // 2) Yedek: web kökü içinde (api/config.php) — sadece hesap hapsedilmişse
    $inside = dirname(__DIR__) . '/config.php';

    if (is_file($above)) {
        $cfg = require $above;
    } elseif (is_file($inside)) {
        $cfg = require $inside;
    } else {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok'    => false,
            'data'  => null,
            'error' => ['code' => 'CONFIG_MISSING', 'message' => 'Sunucu yapılandırması bulunamadı.'],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!is_array($cfg)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok'    => false,
            'data'  => null,
            'error' => ['code' => 'CONFIG_INVALID', 'message' => 'Sunucu yapılandırması geçersiz.'],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return $cfg;
}
