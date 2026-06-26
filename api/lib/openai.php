<?php
/**
 * OpenAI Chat Completions çağrısı — cURL, yoksa file_get_contents+stream fallback.
 * Anahtar yalnızca config.php'den okunur, asla tarayıcıya gönderilmez/yansıtılmaz.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * @return array{ok:bool,status:int,content:string,error:string}
 */
function openai_chat(array $messages, array $opts = []): array
{
    $cfg = sekans_config()['openai'] ?? [];
    $key = (string)($cfg['api_key'] ?? '');

    if ($key === '') {
        return ['ok' => false, 'status' => 503, 'content' => '', 'error' => 'AI_NOT_CONFIGURED'];
    }

    // İşleme özel override'lar (ör. dergi-stil için temperature=0, hızlı model, yüksek max_tokens).
    $payload = json_encode([
        'model'       => (string)($opts['model'] ?? ($cfg['model'] ?? 'gpt-4o-mini')),
        'messages'    => $messages,
        'temperature' => isset($opts['temperature']) ? (float)$opts['temperature'] : (float)($cfg['temperature'] ?? 0.3),
        'max_tokens'  => isset($opts['max_tokens']) ? (int)$opts['max_tokens'] : (int)($cfg['max_tokens'] ?? 4096),
    ], JSON_UNESCAPED_UNICODE);

    $url     = 'https://api.openai.com/v1/chat/completions';
    $timeout = isset($opts['timeout']) ? (int)$opts['timeout'] : (int)($cfg['timeout'] ?? 60);
    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $key,
    ];

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_TIMEOUT        => $timeout,
            CURLOPT_CONNECTTIMEOUT => 15,
        ]);
        $resp   = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $errno  = curl_errno($ch);
        curl_close($ch);

        if ($errno === 28) {
            return ['ok' => false, 'status' => 504, 'content' => '', 'error' => 'AI_TIMEOUT'];
        }
        if ($resp === false || $resp === '') {
            return ['ok' => false, 'status' => 502, 'content' => '', 'error' => 'AI_TRANSPORT_ERROR'];
        }
        return openai_parse($resp, $status);
    }

    // Fallback: allow_url_fopen
    if (ini_get('allow_url_fopen')) {
        $ctx = stream_context_create([
            'http' => [
                'method'        => 'POST',
                'header'        => implode("\r\n", $headers),
                'content'       => $payload,
                'timeout'       => $timeout,
                'ignore_errors' => true,
            ],
        ]);
        $resp = @file_get_contents($url, false, $ctx);
        $status = 0;
        if (isset($http_response_header[0]) &&
            preg_match('#\s(\d{3})\s#', $http_response_header[0], $m)) {
            $status = (int)$m[1];
        }
        if ($resp === false || $resp === '') {
            return ['ok' => false, 'status' => 504, 'content' => '', 'error' => 'AI_TIMEOUT'];
        }
        return openai_parse($resp, $status);
    }

    return ['ok' => false, 'status' => 503, 'content' => '', 'error' => 'AI_TRANSPORT_UNAVAILABLE'];
}

/** Üst HTTP durumunu ve gövdeyi sonuca dönüştür. */
function openai_parse(string $resp, int $status): array
{
    if ($status === 401) {
        return ['ok' => false, 'status' => 401, 'content' => '', 'error' => 'API_KEY_INVALID'];
    }
    if ($status === 429) {
        return ['ok' => false, 'status' => 429, 'content' => '', 'error' => 'RATE_LIMIT'];
    }

    $data = json_decode($resp, true);
    if (!is_array($data)) {
        return ['ok' => false, 'status' => 502, 'content' => '', 'error' => 'AI_BAD_RESPONSE'];
    }
    if ($status >= 400 || isset($data['error'])) {
        return ['ok' => false, 'status' => $status ?: 502, 'content' => '', 'error' => 'AI_UPSTREAM_ERROR'];
    }

    $content = $data['choices'][0]['message']['content'] ?? '';
    return ['ok' => true, 'status' => 200, 'content' => trim((string)$content), 'error' => ''];
}
