<?php
/**
 * Tek tip JSON zarfı: { ok, data, error, meta }
 * Türkçe içerik için JSON_UNESCAPED_UNICODE zorunlu.
 */
declare(strict_types=1);

function json_headers(): void
{
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        // Dinamik + kimlik doğrulamalı API: tarayıcı/proxy/CDN ASLA önbelleğe almasın.
        // Aksi halde yeni kaydedilen içerik, bayat /bootstrap yüzünden sayfa
        // yenilenince kaybolmuş görünebilir.
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
    }
}

/** Başarılı yanıt. */
function respond($data = null, ?array $meta = null, int $status = 200): void
{
    json_headers();
    http_response_code($status);
    $body = ['ok' => true, 'data' => $data, 'error' => null];
    if ($meta !== null) {
        $body['meta'] = $meta;
    }
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Hata yanıtı. */
function fail(string $code, string $message, int $status = 400, ?array $fields = null): void
{
    json_headers();
    http_response_code($status);
    $error = ['code' => $code, 'message' => $message];
    if ($fields !== null) {
        $error['fields'] = $fields;
    }
    echo json_encode(['ok' => false, 'data' => null, 'error' => $error], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** İstek gövdesini JSON olarak oku. post_max_size aşılırsa php://input boş gelir. */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === '' || $raw === false) {
        // Gövde beklenirken boş => muhtemelen post_max_size aşıldı.
        if (($_SERVER['CONTENT_LENGTH'] ?? '0') !== '0' && empty($_POST)) {
            fail('PAYLOAD_TOO_LARGE', 'Gönderilen veri çok büyük veya boş (sunucu post_max_size sınırı).', 413);
        }
        return [];
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        fail('BAD_JSON', 'Geçersiz JSON gövdesi.', 400);
    }
    return $data;
}
