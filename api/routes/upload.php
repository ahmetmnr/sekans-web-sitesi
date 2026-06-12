<?php
/**
 * Dosya yükleme: POST /api/upload (multipart) — kapak görselleri, yazar fotoğrafı, PDF.
 * Kimlik doğrulama + CSRF zorunlu. Dosya public_html/uploads içine taşınır, URL döner.
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth_guard.php';
require_once __DIR__ . '/../lib/config.php';

function handle_upload(): void
{
    require_auth();
    require_csrf();

    if (empty($_FILES['file'])) {
        // İstek gövdesi limiti aşılmışsa $_FILES boş gelebilir.
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 0) {
            fail('PAYLOAD_TOO_LARGE', 'Dosya çok büyük (sunucu yükleme sınırı).', 413);
        }
        fail('NO_FILE', 'Dosya gönderilmedi.', 400);
    }

    $f = $_FILES['file'];
    if ($f['error'] !== UPLOAD_ERR_OK) {
        $msg = in_array($f['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
            ? 'Dosya çok büyük.' : 'Yükleme hatası.';
        $status = $f['error'] === UPLOAD_ERR_INI_SIZE ? 413 : 400;
        fail('UPLOAD_FAILED', $msg, $status);
    }

    $kind = (string)($_POST['kind'] ?? 'image'); // image | pdf | foto
    [$allowedExt, $allowedMime] = upload_allowlist($kind);

    // Gerçek MIME tespiti
    $finfo = function_exists('finfo_open') ? finfo_open(FILEINFO_MIME_TYPE) : null;
    $mime = $finfo ? finfo_file($finfo, $f['tmp_name']) : ($f['type'] ?? '');
    if ($finfo) finfo_close($finfo);

    $ext = strtolower(pathinfo($f['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExt, true) || !in_array($mime, $allowedMime, true)) {
        fail('INVALID_TYPE', 'Geçersiz dosya türü.', 415);
    }

    $cfg = sekans_config()['app'] ?? [];
    $dir = $cfg['upload_dir'] ?? (dirname(__DIR__, 2) . '/uploads');
    $urlBase = rtrim($cfg['upload_url'] ?? '/uploads', '/');

    if (!is_dir($dir) && !@mkdir($dir, 0755, true) && !is_dir($dir)) {
        fail('UPLOAD_DIR', 'Yükleme klasörü oluşturulamadı.', 500);
    }
    if (!is_writable($dir)) {
        fail('UPLOAD_DIR', 'Yükleme klasörü yazılabilir değil (izin 755 olmalı).', 500);
    }

    $safe = preg_replace('/[^a-zA-Z0-9._-]+/', '-', pathinfo($f['name'], PATHINFO_FILENAME));
    $safe = trim((string)$safe, '-') ?: 'dosya';
    $name = $safe . '-' . substr(bin2hex(random_bytes(6)), 0, 8) . '.' . $ext;
    $dest = $dir . '/' . $name;

    if (!move_uploaded_file($f['tmp_name'], $dest)) {
        fail('UPLOAD_MOVE', 'Dosya kaydedilemedi.', 500);
    }
    @chmod($dest, 0644);

    respond(['url' => $urlBase . '/' . $name]);
}

function upload_allowlist(string $kind): array
{
    if ($kind === 'pdf') {
        return [['pdf'], ['application/pdf']];
    }
    // image / foto
    return [
        ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
        ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    ];
}
