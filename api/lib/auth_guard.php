<?php
/**
 * Kimlik doğrulama & yetkilendirme — PHP yerel oturumları (HttpOnly çerez) + CSRF.
 * DB'de oturum tablosu YOKTUR; oturumlar sunucu tarafı dosya oturumlarıdır.
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/db.php';   // require_sayi_erisimi() sayı sahipliğini sorgular

/** Oturumu (varsa) başlat. Güvenli çerez bayraklarıyla. Birden çok kez çağrılabilir. */
function session_boot(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $app = sekans_config()['app'] ?? [];
    $ttl = (int)($app['session_ttl'] ?? 86400);

    // HTTPS tespiti (cPanel AutoSSL ardında X-Forwarded-Proto olabilir)
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https')
        || (($_SERVER['SERVER_PORT'] ?? '') === '443');

    session_name($app['session_name'] ?? 'SEKANSSESSID');
    session_set_cookie_params([
        'lifetime' => 0,            // oturum çerezi (tarayıcı kapanınca silinir)
        'path'     => '/',
        'httponly' => true,         // JS okuyamaz (XSS'e karşı)
        'secure'   => $https,       // sadece HTTPS (AutoSSL gerekli)
        'samesite' => 'Lax',        // siteler arası POST'u engeller (CSRF ana vektörü)
    ]);
    session_start();

    // Mutlak süre sonu (gc_maxlifetime'a güvenme).
    if (isset($_SESSION['uid'])) {
        $issued = (int)($_SESSION['issued_at'] ?? 0);
        if ($issued > 0 && (time() - $issued) > $ttl) {
            session_destroy_full();
        }
    }
}

/** Oturumu tamamen yok et (state + çerez). */
function session_destroy_full(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires'  => time() - 42000,
            'path'     => $p['path'],
            'domain'   => $p['domain'] ?? '',
            'secure'   => $p['secure'],
            'httponly' => $p['httponly'],
            'samesite' => $p['samesite'] ?? 'Lax',
        ]);
    }
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

/** Giriş yapmış kullanıcıyı döndür ya da 401. */
function require_auth(): array
{
    session_boot();
    if (empty($_SESSION['uid'])) {
        fail('UNAUTHORIZED', 'Oturum bulunamadı. Lütfen giriş yapın.', 401);
    }
    return [
        'id'       => (string)$_SESSION['uid'],
        'username' => $_SESSION['username'] ?? '',
        'role'     => $_SESSION['role'] ?? 'editor',
        'name'     => $_SESSION['name'] ?? '',
    ];
}

/** Belirli rolü zorunlu kıl (admin her şeyi yapar). */
function require_role(string $role): array
{
    $user = require_auth();
    if ($role === 'admin' && $user['role'] !== 'admin') {
        fail('FORBIDDEN', 'Bu işlem için yönetici yetkisi gerekir.', 403);
    }
    return $user;
}

/**
 * Oturumdaki kullanıcı yönetici mi?
 *
 * Yetki modeli ([15]):
 *   YÖNETİCİ — sitenin YAPISINI kurar: menü, ana sayfa panelleri, kategoriler,
 *              sabit sayfalar, filtre listeleri, Sekans İndeks ayarları, arşiv,
 *              kullanıcılar, sayı açma/silme/yayına alma, editör atama.
 *   EDİTÖR   — İÇERİK üretir: sorumlusu olduğu sayıların yazıları, blog
 *              yazıları, yazarlar. Site yapısına dokunamaz.
 *
 * Bu ayrım hem arayüzde (menü gizlenir) hem de BURADA, sunucuda uygulanır.
 * Arayüzde gizlemek tek başına yeterli değildir: istek doğrudan da atılabilir.
 */
function is_admin(): bool
{
    session_boot();
    return ($_SESSION['role'] ?? 'editor') === 'admin';
}

/** Oturumdaki kullanıcının kimliği (kullanicilar.id) — giriş yoksa 0. */
function current_uid(): int
{
    session_boot();
    return (int)($_SESSION['uid'] ?? 0);
}

/**
 * EDİTÖR bu sayıya dokunabilir mi?
 *
 * Yönetici her sayıya dokunur. Editör yalnızca SORUMLUSU OLDUĞU sayılara
 * dokunabilir; sorumlusu atanmamış sayılar tüm editörlere açıktır (bir sayı
 * atama yapılmadan da hazırlanabilsin diye).
 */
function require_sayi_erisimi(int $sayiId): void
{
    if (is_admin()) return;
    $st = db()->prepare("SELECT editor_id FROM sayilar WHERE id = ? LIMIT 1");
    $st->execute([$sayiId]);
    $editorId = $st->fetchColumn();
    if ($editorId === false) fail('NOT_FOUND', 'Sayı bulunamadı.', 404);
    if ($editorId === null || $editorId === '') return;   // atanmamış: herkese açık
    if ((int)$editorId !== current_uid()) {
        fail('FORBIDDEN', 'Bu sayının sorumlu editörü değilsiniz.', 403);
    }
}

/**
 * CSRF kontrolü — durum değiştiren her istek (POST/PUT/DELETE) için.
 * Double-submit: tarayıcı X-CSRF-Token başlığını gönderir, $_SESSION ile karşılaştırılır.
 */
function require_csrf(): void
{
    session_boot();
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $have = $_SESSION['csrf'] ?? '';
    if ($have === '' || !is_string($sent) || !hash_equals($have, $sent)) {
        fail('CSRF_FAILED', 'CSRF doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.', 403);
    }
}

/** Yeni CSRF token üret ve oturuma kaydet. Döndürür. */
function issue_csrf(): string
{
    session_boot();
    $token = bin2hex(random_bytes(32));
    $_SESSION['csrf'] = $token;
    return $token;
}
