<?php
/**
 * Kullanıcı yönetimi uçları (admin + CSRF).
 * Editör hesaplarını panelden açmak/düzenlemek/pasifleştirmek için.
 * password_hash ASLA döndürülmez; parolalar bcrypt ile saklanır.
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/db.php';
require_once __DIR__ . '/../lib/response.php';
require_once __DIR__ . '/../lib/serializers.php';
require_once __DIR__ . '/../lib/auth_guard.php';

/** Sistemdeki etkin yönetici sayısı (opsiyonel bir id'yi hariç tutarak). */
function active_admin_count(?int $excludeId = null): int
{
    $sql = "SELECT COUNT(*) FROM kullanicilar WHERE role = 'admin' AND is_active = 1";
    if ($excludeId !== null) {
        $sql .= " AND id <> " . (int)$excludeId;
    }
    return (int)db()->query($sql)->fetchColumn();
}

/** GET /api/kullanicilar */
function handle_list_kullanicilar(): void
{
    $rows = db()->query("SELECT * FROM kullanicilar ORDER BY (role='admin') DESC, name ASC")->fetchAll();
    respond(array_map('kullanici_out', $rows));
}

/** POST /api/kullanici  body {username, password, name, role?, email?} */
function handle_create_kullanici(array $b): void
{
    $username = trim((string)($b['username'] ?? ''));
    $password = (string)($b['password'] ?? '');
    $name     = trim((string)($b['name'] ?? ''));
    $role     = (string)($b['role'] ?? 'editor');
    $email    = trim((string)($b['email'] ?? ''));

    if ($username === '')      fail('VALIDATION', 'Kullanıcı adı gerekli.', 400, ['username' => 'zorunlu']);
    if (strlen($password) < 6) fail('VALIDATION', 'Şifre en az 6 karakter olmalı.', 400, ['password' => 'kısa']);
    if ($name === '')          fail('VALIDATION', 'İsim gerekli.', 400, ['name' => 'zorunlu']);
    if (!in_array($role, ['admin', 'editor'], true)) $role = 'editor';

    $ex = db()->prepare("SELECT id FROM kullanicilar WHERE username = ? LIMIT 1");
    $ex->execute([$username]);
    if ($ex->fetchColumn()) fail('DUPLICATE', 'Bu kullanıcı adı zaten kullanımda.', 409, ['username' => 'kullanımda']);

    $hash = password_hash($password, PASSWORD_BCRYPT);
    db()->prepare(
        "INSERT INTO kullanicilar (username, password_hash, role, name, email, is_active) VALUES (?,?,?,?,?,1)"
    )->execute([$username, $hash, $role, $name, $email !== '' ? $email : null]);

    $id = (int)db()->lastInsertId();
    $r = db()->prepare("SELECT * FROM kullanicilar WHERE id = ? LIMIT 1");
    $r->execute([$id]);
    respond(kullanici_out($r->fetch()), null, 201);
}

/** PUT /api/kullanici/{id}  body {name?, email?, role?, isActive?, password?} */
function handle_update_kullanici(string $idStr, array $b): void
{
    $id = (int)$idStr;
    $cur = db()->prepare("SELECT * FROM kullanicilar WHERE id = ? LIMIT 1");
    $cur->execute([$id]);
    $u = $cur->fetch();
    if (!$u) fail('NOT_FOUND', 'Kullanıcı bulunamadı.', 404);

    // Son etkin yöneticiyi editöre düşürme / pasifleştirme koruması.
    $willRole = array_key_exists('role', $b) ? (string)$b['role'] : $u['role'];
    if (!in_array($willRole, ['admin', 'editor'], true)) $willRole = $u['role'];
    $willActive = array_key_exists('isActive', $b) ? (bool)$b['isActive'] : (bool)((int)$u['is_active']);
    $wasAdminActive = ($u['role'] === 'admin' && (int)$u['is_active'] === 1);
    $losesAdmin = $wasAdminActive && ($willRole !== 'admin' || !$willActive);
    if ($losesAdmin && active_admin_count($id) === 0) {
        fail('LAST_ADMIN', 'Sistemdeki son etkin yöneticiyi devre dışı bırakamaz veya editöre düşüremezsiniz.', 409);
    }

    $set = [];
    $params = [];
    if (array_key_exists('name', $b))  { $set[] = 'name = ?';  $params[] = trim((string)$b['name']); }
    if (array_key_exists('email', $b)) { $e = trim((string)$b['email']); $set[] = 'email = ?'; $params[] = $e !== '' ? $e : null; }
    if (array_key_exists('role', $b))  { $set[] = 'role = ?';  $params[] = $willRole; }
    if (array_key_exists('isActive', $b)) { $set[] = 'is_active = ?'; $params[] = $willActive ? 1 : 0; }
    if (array_key_exists('password', $b) && (string)$b['password'] !== '') {
        if (strlen((string)$b['password']) < 6) fail('VALIDATION', 'Şifre en az 6 karakter olmalı.', 400, ['password' => 'kısa']);
        $set[] = 'password_hash = ?';
        $params[] = password_hash((string)$b['password'], PASSWORD_BCRYPT);
    }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);

    $params[] = $id;
    db()->prepare("UPDATE kullanicilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);

    $r = db()->prepare("SELECT * FROM kullanicilar WHERE id = ? LIMIT 1");
    $r->execute([$id]);
    respond(kullanici_out($r->fetch()));
}

/** DELETE /api/kullanici/{id} */
function handle_delete_kullanici(string $idStr): void
{
    session_boot();
    $meId = (int)($_SESSION['uid'] ?? 0);
    $id = (int)$idStr;
    if ($id === $meId) fail('CANNOT_DELETE_SELF', 'Kendi hesabınızı silemezsiniz.', 409);

    $cur = db()->prepare("SELECT * FROM kullanicilar WHERE id = ? LIMIT 1");
    $cur->execute([$id]);
    $u = $cur->fetch();
    if (!$u) fail('NOT_FOUND', 'Kullanıcı bulunamadı.', 404);

    if ($u['role'] === 'admin' && (int)$u['is_active'] === 1 && active_admin_count($id) === 0) {
        fail('LAST_ADMIN', 'Sistemdeki son etkin yöneticiyi silemezsiniz.', 409);
    }

    // sayilar.editor_id FK -> ON DELETE SET NULL (atama otomatik boşalır).
    db()->prepare("DELETE FROM kullanicilar WHERE id = ?")->execute([$id]);
    respond(['deleted' => (string)$id]);
}
