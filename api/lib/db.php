<?php
/**
 * PDO bağlantı fabrikası (istek başına tekil).
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $cfg = sekans_config()['db'];
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $cfg['host'] ?? 'localhost',
        $cfg['name'] ?? '',
        $cfg['charset'] ?? 'utf8mb4'
    );

    try {
        $pdo = new PDO($dsn, $cfg['user'] ?? '', $cfg['pass'] ?? '', [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            // Paylaşımlı hostingte kalıcı bağlantı KULLANMA (bağlantı limiti tükenebilir).
            PDO::ATTR_PERSISTENT         => false,
        ]);
    } catch (PDOException $e) {
        // Bağlantı hatası ayrıntısını sızdırma.
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok'    => false,
            'data'  => null,
            'error' => ['code' => 'DB_CONNECT_FAILED', 'message' => 'Veritabanına bağlanılamadı.'],
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    return $pdo;
}
