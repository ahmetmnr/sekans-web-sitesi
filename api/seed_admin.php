<?php
/**
 * TEK SEFERLİK admin oluşturma betiği.
 * =============================================================================
 * KULLANIM:
 *   1) Bu dosyayı public_html/api/ içine yükleyin.
 *   2) Aşağıdaki ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_NAME değerlerini düzenleyin
 *      (GÜÇLÜ bir parola seçin).
 *   3) Tarayıcıda bir kez açın: https://alan-adi/api/seed_admin.php
 *   4) "Admin oluşturuldu" mesajını görünce bu dosyayı SİLİN (File Manager).
 *
 * GÜVENLİK: Zaten kullanıcı varsa çalışmayı reddeder. Yine de işiniz bitince
 * dosyayı mutlaka silin — sunucuda kalırsa arka kapı oluşturur.
 * =============================================================================
 */
declare(strict_types=1);

// ----- DÜZENLEYİN -----
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'DEGISTIRIN-Guclu-Parola-2026!';
const ADMIN_NAME     = 'Yönetici';
const ADMIN_EMAIL    = '';
// ----------------------

require_once __DIR__ . '/lib/db.php';

header('Content-Type: text/plain; charset=utf-8');

if (ADMIN_PASSWORD === 'DEGISTIRIN-Guclu-Parola-2026!') {
    http_response_code(400);
    echo "Önce bu dosyadaki ADMIN_PASSWORD değerini güçlü bir parola ile değiştirin.\n";
    exit;
}

try {
    $count = (int)db()->query("SELECT COUNT(*) FROM kullanicilar")->fetchColumn();
    if ($count > 0) {
        http_response_code(409);
        echo "Zaten kullanıcı var. Bu betik çalışmayacak. Lütfen bu dosyayı SİLİN.\n";
        exit;
    }
    $hash = password_hash(ADMIN_PASSWORD, PASSWORD_BCRYPT);
    $st = db()->prepare(
        "INSERT INTO kullanicilar (username, password_hash, role, name, email, is_active)
         VALUES (?, ?, 'admin', ?, ?, 1)"
    );
    $st->execute([ADMIN_USERNAME, $hash, ADMIN_NAME, ADMIN_EMAIL ?: null]);

    echo "Admin oluşturuldu: " . ADMIN_USERNAME . "\n";
    echo "ÖNEMLİ: Bu dosyayı (seed_admin.php) ŞİMDİ SİLİN.\n";
} catch (Throwable $e) {
    http_response_code(500);
    echo "Hata: " . $e->getMessage() . "\n";
}
