<?php
// Sekans TEST sunucusu yapılandırması (/opt/sekans/sekans_config/config.php).
// PHP konteynerine /var/www/sekans_config/config.php olarak bağlanır (webroot ÜSTÜ).
return [
    'db' => [
        'host'    => 'db',
        'name'    => 'sekans',
        'user'    => 'root',
        'pass'    => 'sekans-test-db-2026',
        'charset' => 'utf8mb4',
    ],
    'openai' => [
        'api_key'     => '',          // test ortamında AI kapalı; istenirse buraya anahtar girin
        'model'       => 'gpt-4o-mini',
        'temperature' => 0.3,
        'max_tokens'  => 4096,
        'timeout'     => 60,
    ],
    'app' => [
        'upload_dir'   => '/var/www/html/uploads',
        'upload_url'   => '/uploads',
        'base_url'     => 'https://sekans.65-21-234-84.sslip.io',
        'dev'          => 0,
        'session_name' => 'SEKANSSESSID',
        'session_ttl'  => 86400,
    ],
];
