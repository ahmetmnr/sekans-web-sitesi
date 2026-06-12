<?php
/**
 * Kimlik doğrulama uçları: login / logout / me.
 * PHP yerel oturumları + CSRF token. Bcrypt parola doğrulama. Brute-force throttle.
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/auth_guard.php';

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 15;

/** POST /api/auth/login  body: {username, password} */
function handle_login(): void
{
    session_boot();
    $b = read_json_body();
    $username = trim((string)($b['username'] ?? ''));
    $password = (string)($b['password'] ?? '');

    if ($username === '' || $password === '') {
        fail('VALIDATION', 'Kullanıcı adı ve şifre gerekli.', 400);
    }

    // Throttle kontrolü
    $st = db()->prepare("SELECT attempts, locked_until FROM giris_denemeleri WHERE ident = ? LIMIT 1");
    $st->execute([$username]);
    $att = $st->fetch();
    if ($att && $att['locked_until'] !== null && strtotime($att['locked_until']) > time()) {
        fail('TOO_MANY_ATTEMPTS', 'Çok fazla başarısız deneme. Lütfen biraz bekleyin.', 429);
    }

    $us = db()->prepare("SELECT * FROM kullanicilar WHERE username = ? AND is_active = 1 LIMIT 1");
    $us->execute([$username]);
    $user = $us->fetch();

    $ok = $user && password_verify($password, $user['password_hash']);

    if (!$ok) {
        record_failed_attempt($username);
        // Kullanıcı sayımı önlemek için aynı genel mesaj + küçük gecikme
        usleep(300000);
        fail('INVALID_CREDENTIALS', 'Kullanıcı adı veya şifre hatalı', 401);
    }

    // Başarılı: throttle temizle, oturum sabitlemeyi önle, oturumu kur
    db()->prepare("DELETE FROM giris_denemeleri WHERE ident = ?")->execute([$username]);

    // Parola yeniden hash gerekiyorsa şeffafça yükselt
    if (password_needs_rehash($user['password_hash'], PASSWORD_BCRYPT)) {
        $new = password_hash($password, PASSWORD_BCRYPT);
        db()->prepare("UPDATE kullanicilar SET password_hash = ? WHERE id = ?")->execute([$new, (int)$user['id']]);
    }

    session_regenerate_id(true);
    $_SESSION['uid']       = (int)$user['id'];
    $_SESSION['username']  = $user['username'];
    $_SESSION['role']      = $user['role'];
    $_SESSION['name']      = $user['name'];
    $_SESSION['issued_at'] = time();
    $csrf = issue_csrf();

    db()->prepare("UPDATE kullanicilar SET last_login_at = NOW() WHERE id = ?")->execute([(int)$user['id']]);

    respond([
        'user' => [
            'id'       => (string)$user['id'],
            'username' => $user['username'],
            'role'     => $user['role'],
            'name'     => $user['name'],
        ],
        'csrfToken' => $csrf,
    ]);
}

function record_failed_attempt(string $username): void
{
    $st = db()->prepare("SELECT id, attempts FROM giris_denemeleri WHERE ident = ? LIMIT 1");
    $st->execute([$username]);
    $row = $st->fetch();
    if ($row) {
        $attempts = (int)$row['attempts'] + 1;
        $lock = $attempts >= LOGIN_MAX_ATTEMPTS
            ? date('Y-m-d H:i:s', time() + LOGIN_LOCK_MINUTES * 60)
            : null;
        db()->prepare("UPDATE giris_denemeleri SET attempts = ?, locked_until = ? WHERE id = ?")
            ->execute([$attempts, $lock, (int)$row['id']]);
    } else {
        db()->prepare("INSERT INTO giris_denemeleri (ident, attempts) VALUES (?, 1)")
            ->execute([$username]);
    }
}

/** POST /api/auth/logout */
function handle_logout(): void
{
    session_boot();
    session_destroy_full();
    respond(['loggedOut' => true]);
}

/** GET /api/auth/me */
function handle_me(): void
{
    session_boot();
    if (empty($_SESSION['uid'])) {
        respond(['authenticated' => false, 'user' => null, 'csrfToken' => null]);
    }
    // CSRF token yoksa üret (sayfa yenileme sonrası rehydrate)
    if (empty($_SESSION['csrf'])) {
        issue_csrf();
    }
    respond([
        'authenticated' => true,
        'user' => [
            'id'       => (string)$_SESSION['uid'],
            'username' => $_SESSION['username'] ?? '',
            'role'     => $_SESSION['role'] ?? 'editor',
            'name'     => $_SESSION['name'] ?? '',
        ],
        'csrfToken' => $_SESSION['csrf'],
    ]);
}
