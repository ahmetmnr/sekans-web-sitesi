<?php
/**
 * Sekans API — ön denetleyici (front controller).
 * Tüm /api/* istekleri buraya .htaccess ile yönlendirilir.
 * Yönlendirme tablosu: [method, regex, auth, handler]. auth: null | 'auth' | 'editor' | 'admin'.
 * Durum değiştiren tüm istekler (POST/PUT/DELETE) ayrıca CSRF doğrulaması yapar.
 */
declare(strict_types=1);

require_once __DIR__ . '/lib/config.php';
require_once __DIR__ . '/lib/response.php';
require_once __DIR__ . '/lib/auth_guard.php';
require_once __DIR__ . '/routes/public_reads.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/cms_writes.php';
require_once __DIR__ . '/routes/ai.php';
require_once __DIR__ . '/routes/upload.php';
require_once __DIR__ . '/routes/admin.php';

// --- Geliştirme CORS (yalnızca app.dev=1) -----------------------------------
$app = sekans_config()['app'] ?? [];
if (!empty($app['dev'])) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (preg_match('#^https?://localhost(:\d+)?$#', $origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- İstek yolunu çöz --------------------------------------------------------
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
// /api ön ekini ve olası alt dizini at; /api'den SONRAKİ kısmı al.
$path = preg_replace('#^.*?/api#', '', $uri);
$path = '/' . ltrim(rawurldecode($path), '/');
$path = rtrim($path, '/');
if ($path === '') $path = '/';

// --- Yönlendirme tablosu -----------------------------------------------------
// auth: null=public, 'auth'=giriş yeterli, 'editor'=editor+, 'admin'=admin
$routes = [
    // ---- Public reads ----
    ['GET',  '#^/bootstrap$#',           null, fn($m) => handle_bootstrap()],
    ['GET',  '#^/sayi/current$#',        null, fn($m) => handle_get_current_sayi()],
    ['GET',  '#^/arsiv$#',               null, fn($m) => handle_get_arsiv()],
    ['GET',  '#^/yazi/([^/]+)$#',        null, fn($m) => handle_get_yazi($m[1])],
    ['GET',  '#^/arayazi$#',             null, fn($m) => handle_list_arayazi()],
    ['GET',  '#^/arayazi/slug/([^/]+)$#',null, fn($m) => handle_get_arayazi_by_slug($m[1])],
    ['GET',  '#^/arayazi/([^/]+)$#',     null, fn($m) => handle_get_arayazi_by_code($m[1])],
    ['GET',  '#^/yazarlar$#',            null, fn($m) => handle_get_yazarlar()],
    ['GET',  '#^/yazar/([^/]+)$#',       null, fn($m) => handle_get_yazar($m[1])],
    ['GET',  '#^/kategoriler$#',         null, fn($m) => handle_get_kategoriler()],
    ['GET',  '#^/yarisma$#',             null, fn($m) => handle_get_yarisma()],
    ['GET',  '#^/hakkimizda$#',          null, fn($m) => handle_get_hakkimizda()],

    // ---- Auth ----
    ['POST', '#^/auth/login$#',          null,   fn($m) => handle_login()],
    ['POST', '#^/auth/logout$#',         'auth', fn($m) => handle_logout()],
    ['GET',  '#^/auth/me$#',             null,   fn($m) => handle_me()],

    // ---- AI proxy ----
    ['GET',  '#^/ai/status$#',           'auth',   fn($m) => handle_ai_status()],
    ['POST', '#^/ai/edit$#',             'editor', fn($m) => handle_ai_edit()],

    // ---- Uploads ----
    ['POST', '#^/upload$#',              'editor', fn($m) => handle_upload()],

    // ---- CMS writes: yazi ----
    ['POST',   '#^/yazi$#',              'editor', fn($m) => handle_create_yazi(read_json_body())],
    ['PUT',    '#^/yazi/([^/]+)$#',      'editor', fn($m) => handle_update_yazi($m[1], read_json_body())],
    ['DELETE', '#^/yazi/([^/]+)$#',      'editor', fn($m) => handle_delete_yazi($m[1])],

    // ---- CMS writes: arayazi ----
    ['POST',   '#^/arayazi$#',           'editor', fn($m) => handle_create_arayazi(read_json_body())],
    ['PUT',    '#^/arayazi/([^/]+)$#',   'editor', fn($m) => handle_update_arayazi($m[1], read_json_body())],
    ['DELETE', '#^/arayazi/([^/]+)$#',   'editor', fn($m) => handle_delete_arayazi($m[1])],

    // ---- CMS writes: yazar ----
    ['POST',   '#^/yazar$#',             'editor', fn($m) => handle_create_yazar(read_json_body())],
    ['PUT',    '#^/yazar/([^/]+)$#',     'editor', fn($m) => handle_update_yazar($m[1], read_json_body())],
    ['DELETE', '#^/yazar/([^/]+)$#',     'editor', fn($m) => handle_delete_yazar($m[1])],

    // ---- CMS writes: kategori ----
    ['POST',   '#^/kategori$#',          'editor', fn($m) => handle_create_kategori(read_json_body())],
    ['PUT',    '#^/kategori/([^/]+)$#',  'editor', fn($m) => handle_update_kategori($m[1], read_json_body())],
    ['DELETE', '#^/kategori/([^/]+)$#',  'editor', fn($m) => handle_delete_kategori($m[1])],

    // ---- CMS writes: arsiv ----
    ['POST',   '#^/arsiv$#',             'editor', fn($m) => handle_create_arsiv(read_json_body())],
    ['PUT',    '#^/arsiv/([^/]+)$#',     'editor', fn($m) => handle_update_arsiv($m[1], read_json_body())],
    ['DELETE', '#^/arsiv/([^/]+)$#',     'editor', fn($m) => handle_delete_arsiv($m[1])],

    // ---- Aktif sayı ----
    ['PUT',    '#^/sayi/current$#',      'editor', fn($m) => handle_update_current_sayi(read_json_body())],
    ['POST',   '#^/sayi/publish$#',      'admin',  fn($m) => handle_publish_sayi()],

    // ---- Yarışma / Hakkımızda ----
    ['PUT',    '#^/yarisma$#',           'editor', fn($m) => handle_update_yarisma(read_json_body())],
    ['PUT',    '#^/hakkimizda$#',        'editor', fn($m) => handle_update_hakkimizda(read_json_body())],

    // ---- Admin: export / import / reset ----
    ['GET',    '#^/export$#',            'admin', fn($m) => handle_export()],
    ['POST',   '#^/import$#',            'admin', fn($m) => handle_import(read_json_body())],
    ['POST',   '#^/reset$#',             'admin', fn($m) => handle_reset()],
];

// --- Eşleştir & gönder -------------------------------------------------------
try {
    foreach ($routes as [$rm, $regex, $auth, $handler]) {
        if ($rm !== $method) continue;
        if (!preg_match($regex, $path, $m)) continue;

        // Yetki kapısı (merkezî — her handler'da tekrar etmeye gerek yok)
        if ($auth === 'auth')   require_auth();
        if ($auth === 'editor') require_auth();             // editor+ : giriş yeterli
        if ($auth === 'admin')  require_role('admin');

        // CSRF: durum değiştiren istekler (login hariç — login CSRF üretir)
        if (in_array($method, ['POST', 'PUT', 'DELETE'], true)
            && $path !== '/auth/login') {
            require_csrf();
        }

        $handler($m);
        // handler respond()/fail() ile exit eder; buraya düşülmez.
        exit;
    }
    fail('NOT_FOUND', 'Uç bulunamadı: ' . $method . ' ' . $path, 404);
} catch (PDOException $e) {
    error_log('[sekans-api] PDO: ' . $e->getMessage());
    fail('DB_ERROR', 'Veritabanı hatası.', 500);
} catch (Throwable $e) {
    error_log('[sekans-api] ERR: ' . $e->getMessage());
    fail('SERVER_ERROR', 'Sunucu hatası.', 500);
}
