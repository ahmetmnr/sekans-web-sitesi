<?php
/**
 * AI proxy uçları. Anahtar config.php'de; tarayıcıya asla gitmez.
 * /api/ai/edit kimlik doğrulama + CSRF gerektirir (editor+).
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth_guard.php';
require_once __DIR__ . '/../lib/openai.php';
require_once __DIR__ . '/../lib/prompts.php';
require_once __DIR__ . '/../lib/config.php';

/** GET /api/ai/status — anahtarın yapılandırılıp yapılandırılmadığını döndür (anahtar SIZDIRILMAZ). */
function handle_ai_status(): void
{
    require_auth(); // CMS-only ekran
    $cfg = sekans_config()['openai'] ?? [];
    respond([
        'configured' => !empty($cfg['api_key']),
        'model'      => $cfg['model'] ?? 'gpt-4o-mini',
    ]);
}

/** POST /api/ai/edit  body: { islem, icerik, ekTalimat? } */
function handle_ai_edit(): void
{
    require_auth();
    require_csrf();

    $b = read_json_body();
    $islem = (string)($b['islem'] ?? '');
    $icerik = (string)($b['icerik'] ?? '');
    $ekTalimat = isset($b['ekTalimat']) ? (string)$b['ekTalimat'] : null;

    $prompts = ai_prompts();
    if (!isset($prompts[$islem])) {
        fail('INVALID_ISLEM', 'Geçersiz işlem türü.', 400);
    }
    if (trim($icerik) === '') {
        fail('EMPTY_CONTENT', 'Düzenlenecek içerik bulunamadı.', 400);
    }
    // Maliyeti sınırlamak için üst sınır
    if (mb_strlen($icerik, 'UTF-8') > 120000) {
        fail('CONTENT_TOO_LONG', 'İçerik çok uzun.', 400);
    }

    $userContent = $ekTalimat !== null && $ekTalimat !== ''
        ? "Talimat: {$ekTalimat}\n\nİçerik:\n{$icerik}"
        : $icerik;

    $messages = [
        ['role' => 'system', 'content' => $prompts[$islem]],
        ['role' => 'user',   'content' => $userContent],
    ];

    // Dergi-stil: AI metni paragraflara bölüp yapısal HTML döndürür (metni aynen
    // korur). Çıktı ~girdi uzunluğunda olabileceğinden max_tokens yüksek, süre
    // biraz daha uzun. temperature=0 (kararlı), hızlı model.
    $opts = $islem === 'dergi-stil'
        ? ['temperature' => 0.0, 'max_tokens' => 8000, 'model' => 'gpt-4o-mini', 'timeout' => 60]
        : [];

    $r = openai_chat($messages, $opts);
    if (!$r['ok']) {
        // Hata kodu sözleşmesi: istemci (lib/openai.ts) bu kodları bekler.
        fail($r['error'], ai_error_message($r['error']), $r['status']);
    }
    respond(['content' => $r['content']]);
}

function ai_error_message(string $code): string
{
    switch ($code) {
        case 'AI_NOT_CONFIGURED':       return 'AI özelliği sunucu yöneticisi tarafından yapılandırılmamış.';
        case 'API_KEY_INVALID':         return 'OpenAI API anahtarı geçersiz.';
        case 'RATE_LIMIT':              return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
        case 'AI_TIMEOUT':              return 'AI yanıtı zaman aşımına uğradı. Tekrar deneyin.';
        case 'AI_TRANSPORT_UNAVAILABLE':return 'Sunucuda HTTP istemcisi (cURL/allow_url_fopen) etkin değil.';
        default:                        return 'AI isteği başarısız oldu.';
    }
}
