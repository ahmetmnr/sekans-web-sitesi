<?php
/**
 * Sekans - Yapılandırma ŞABLONU (config.sample.php)
 * =============================================================================
 * GERÇEK config.php dosyasını WEB KÖKÜNÜN ÜZERİNE koyun, ASLA public_html içine değil:
 *
 *     /home/<cpuser>/sekans_config/config.php
 *
 * api/index.php bunu şu yolla okur:  require dirname(__DIR__, 2) . '/sekans_config/config.php';
 * (public_html/api -> ../../sekans_config => /home/<cpuser>/sekans_config)
 *
 * Bu dosya (config.sample.php) yalnızca şablondur; gerçek gizli bilgi içermez ve
 * api/.htaccess tarafından tarayıcıya kapatılmıştır. chmod 600 önerilir (gerçek config.php).
 * =============================================================================
 */

return [
    // --- Veritabanı (cPanel > MySQL Databases'ten alın; cpuser_ önekli) ---
    'db' => [
        'host'    => 'localhost',
        'name'    => 'cpuser_sekans',      // cPanel veritabanı adı
        'user'    => 'cpuser_sekansusr',   // cPanel veritabanı kullanıcısı
        'pass'    => 'DEGISTIRIN',          // güçlü parola
        'charset' => 'utf8mb4',
    ],

    // --- OpenAI (anahtar SADECE burada; tarayıcıya asla gönderilmez) ---
    'openai' => [
        'api_key'     => '',                // 'sk-...' — boşsa AI özelliği "yapılandırılmamış" görünür
        'model'       => 'gpt-4o-mini',
        'temperature' => 0.3,
        'max_tokens'  => 4096,
        'timeout'     => 60,                // saniye
    ],

    // --- Uygulama ---
    'app' => [
        // Yükleme klasörü (public_html/uploads). __DIR__ = sekans_config, web kökü kardeş.
        'upload_dir'  => dirname(__DIR__) . '/public_html/uploads',
        'upload_url'  => '/uploads',        // tarayıcıya dönen URL öneki
        'base_url'    => 'https://ornek-alan-adi.com',
        // Geliştirme bayrağı: 1 ise localhost:5173 için CORS başlıkları eklenir (Vite dev).
        // ÜRETİMDE 0 OLMALI.
        'dev'         => 0,
        // Oturum çerezi adı
        'session_name' => 'SEKANSSESSID',
        // Oturum süresi (saniye) — 24 saat
        'session_ttl' => 86400,
    ],
];
