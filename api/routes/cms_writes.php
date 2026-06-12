<?php
/**
 * CMS yazma uçları (kimlik doğrulama + CSRF zorunlu).
 * Rol: editor -> içerik CRUD; admin -> publish + export/import/reset + kullanıcılar.
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';
require_once __DIR__ . '/../lib/auth_guard.php';
require_once __DIR__ . '/public_reads.php'; // build_sayi_payload, fetch_arayazi_full

/* ============================ YAZILAR (sayı makaleleri) ===================== */

/** Tek yaziyi (gömülü) serileştirip döndür (yazma yanıtı). */
function yazi_response_by_id(int $id): array
{
    $st = db()->prepare("SELECT * FROM yazilar WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    $y = $st->fetch();
    $yazarMap = load_yazar_map();
    $katMap   = load_kategori_map();
    $sc = db()->prepare("SELECT code FROM sayilar WHERE id = ? LIMIT 1");
    $sc->execute([(int)$y['sayi_id']]);
    $sayiCode = (string)$sc->fetchColumn();
    $yazar    = yazar_out($yazarMap[(int)$y['yazar_id']] ?? null);
    $kategori = $y['kategori_id'] !== null ? kategori_out($katMap[(int)$y['kategori_id']] ?? null) : null;
    return yazi_out($y, $yazar, $kategori, $sayiCode);
}

/** POST /api/yazi  — yeni makale (aktif sayıya eklenir varsayılan) */
function handle_create_yazi(array $b): void
{
    $baslik = trim((string)($b['baslik'] ?? ''));
    if ($baslik === '') fail('VALIDATION', 'Başlık gerekli.', 400, ['baslik' => 'zorunlu']);

    // İlişkiler: yazar (code) zorunlu, kategori (code) opsiyonel, sayı (code) -> yoksa aktif sayı
    $yazarCode = (string)($b['yazarId'] ?? ($b['yazar']['id'] ?? ''));
    if ($yazarCode === '') fail('VALIDATION', 'Yazar gerekli.', 400, ['yazar' => 'zorunlu']);
    $yazarId = require_id_by_code('yazarlar', $yazarCode, 'Yazar');

    $kategoriId = null;
    $katCode = (string)($b['kategoriId'] ?? ($b['kategori']['id'] ?? ''));
    if ($katCode !== '') $kategoriId = require_id_by_code('kategoriler', $katCode, 'Kategori');

    $sayiCode = (string)($b['sayiId'] ?? '');
    if ($sayiCode !== '') {
        $sayiId = require_id_by_code('sayilar', $sayiCode, 'Sayı');
    } else {
        $sayiId = (int)(db()->query("SELECT id FROM sayilar WHERE is_current = 1 ORDER BY id DESC LIMIT 1")->fetchColumn() ?: 0);
        if ($sayiId === 0) fail('NO_CURRENT_ISSUE', 'Aktif sayı yok; önce sayı oluşturun.', 409);
    }

    $code = trim((string)($b['id'] ?? '')) ?: gen_code('yazi');
    if (id_by_code('yazilar', $code)) $code = gen_code('yazi'); // çakışma varsa üret
    $slug = unique_slug(slugify($baslik), 'yazilar', 'slug');

    $st = db()->prepare(
        "INSERT INTO yazilar (code, slug, baslik, spot, icerik, yazar_id, kategori_id, sayi_id, sira_no, pdf_url, kapak_gorseli, yayin_tarihi)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    );
    $st->execute([
        $code, $slug, $baslik, $b['spot'] ?? null, $b['icerik'] ?? null,
        $yazarId, $kategoriId, $sayiId, (int)($b['siraNo'] ?? 0),
        $b['pdfUrl'] ?? null, $b['kapakGorseli'] ?? null, norm_date($b['yayinTarihi'] ?? null),
    ]);
    respond(yazi_response_by_id((int)db()->lastInsertId()), null, 201);
}

/** PUT /api/yazi/{code} */
function handle_update_yazi(string $code, array $b): void
{
    $id = require_id_by_code('yazilar', $code, 'Yazı');
    $set = [];
    $params = [];
    if (array_key_exists('baslik', $b)) { $set[] = 'baslik = ?'; $params[] = (string)$b['baslik']; }
    if (array_key_exists('spot', $b))   { $set[] = 'spot = ?';   $params[] = $b['spot']; }
    if (array_key_exists('icerik', $b)) { $set[] = 'icerik = ?'; $params[] = $b['icerik']; }
    if (array_key_exists('siraNo', $b)) { $set[] = 'sira_no = ?'; $params[] = (int)$b['siraNo']; }
    if (array_key_exists('pdfUrl', $b)) { $set[] = 'pdf_url = ?'; $params[] = $b['pdfUrl']; }
    if (array_key_exists('kapakGorseli', $b)) { $set[] = 'kapak_gorseli = ?'; $params[] = $b['kapakGorseli']; }
    if (array_key_exists('yayinTarihi', $b))  { $set[] = 'yayin_tarihi = ?'; $params[] = norm_date($b['yayinTarihi']); }
    if (isset($b['yazarId']) || isset($b['yazar']['id'])) {
        $set[] = 'yazar_id = ?'; $params[] = require_id_by_code('yazarlar', (string)($b['yazarId'] ?? $b['yazar']['id']), 'Yazar');
    }
    if (array_key_exists('kategoriId', $b) || isset($b['kategori']['id'])) {
        $kc = (string)($b['kategoriId'] ?? ($b['kategori']['id'] ?? ''));
        $set[] = 'kategori_id = ?'; $params[] = $kc !== '' ? require_id_by_code('kategoriler', $kc, 'Kategori') : null;
    }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);
    $params[] = $id;
    db()->prepare("UPDATE yazilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    respond(yazi_response_by_id($id));
}

/** DELETE /api/yazi/{code} */
function handle_delete_yazi(string $code): void
{
    $id = require_id_by_code('yazilar', $code, 'Yazı');
    db()->prepare("DELETE FROM yazilar WHERE id = ?")->execute([$id]);
    respond(['deleted' => $code]);
}

/* ============================ ARA YAZILAR (blog) =========================== */

function handle_create_arayazi(array $b): void
{
    $baslik = trim((string)($b['baslik'] ?? ''));
    if ($baslik === '') fail('VALIDATION', 'Başlık gerekli.', 400, ['baslik' => 'zorunlu']);
    $yazarCode = (string)($b['yazarId'] ?? ($b['yazar']['id'] ?? ''));
    if ($yazarCode === '') fail('VALIDATION', 'Yazar gerekli.', 400, ['yazar' => 'zorunlu']);
    $yazarId = require_id_by_code('yazarlar', $yazarCode, 'Yazar');

    $kategoriAd = (string)($b['kategori'] ?? '');
    $kategoriId = resolve_kategori_id_by_ad($kategoriAd);

    $slugIn = trim((string)($b['slug'] ?? '')) ?: slugify($baslik);
    $slug = unique_slug($slugIn, 'ara_yazilar', 'slug');
    $code = trim((string)($b['id'] ?? '')) ?: gen_code('ay');
    if (id_by_code('ara_yazilar', $code)) $code = gen_code('ay');

    $st = db()->prepare(
        "INSERT INTO ara_yazilar (code, slug, baslik, spot, icerik, yazar_id, kategori_id, kategori_ad, kapak_gorseli, yayin_tarihi)
         VALUES (?,?,?,?,?,?,?,?,?,?)"
    );
    $st->execute([
        $code, $slug, $baslik, $b['spot'] ?? '', $b['icerik'] ?? '',
        $yazarId, $kategoriId, $kategoriAd !== '' ? $kategoriAd : null,
        $b['kapakGorseli'] ?? null, norm_date($b['yayinTarihi'] ?? null),
    ]);
    $out = fetch_arayazi_full('code', $code);
    respond($out, null, 201);
}

function handle_update_arayazi(string $code, array $b): void
{
    $id = require_id_by_code('ara_yazilar', $code, 'Ara yazı');
    $set = [];
    $params = [];
    if (array_key_exists('baslik', $b)) { $set[] = 'baslik = ?'; $params[] = (string)$b['baslik']; }
    if (array_key_exists('spot', $b))   { $set[] = 'spot = ?';   $params[] = $b['spot']; }
    if (array_key_exists('icerik', $b)) { $set[] = 'icerik = ?'; $params[] = $b['icerik']; }
    if (array_key_exists('kapakGorseli', $b)) { $set[] = 'kapak_gorseli = ?'; $params[] = $b['kapakGorseli']; }
    if (array_key_exists('yayinTarihi', $b))  { $set[] = 'yayin_tarihi = ?'; $params[] = norm_date($b['yayinTarihi']); }
    if (isset($b['yazarId']) || isset($b['yazar']['id'])) {
        $set[] = 'yazar_id = ?'; $params[] = require_id_by_code('yazarlar', (string)($b['yazarId'] ?? $b['yazar']['id']), 'Yazar');
    }
    if (array_key_exists('kategori', $b)) {
        $ad = (string)$b['kategori'];
        $set[] = 'kategori_ad = ?'; $params[] = $ad !== '' ? $ad : null;
        $set[] = 'kategori_id = ?'; $params[] = resolve_kategori_id_by_ad($ad);
    }
    if (array_key_exists('slug', $b) && trim((string)$b['slug']) !== '') {
        $set[] = 'slug = ?'; $params[] = unique_slug(slugify((string)$b['slug']), 'ara_yazilar', 'slug', $id);
    }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);
    $params[] = $id;
    db()->prepare("UPDATE ara_yazilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    respond(fetch_arayazi_full('code', $code));
}

function handle_delete_arayazi(string $code): void
{
    $id = require_id_by_code('ara_yazilar', $code, 'Ara yazı');
    db()->prepare("DELETE FROM ara_yazilar WHERE id = ?")->execute([$id]);
    respond(['deleted' => $code]);
}

/* ============================ YAZARLAR ===================================== */

function handle_create_yazar(array $b): void
{
    $ad = trim((string)($b['ad'] ?? ''));
    $soyad = trim((string)($b['soyad'] ?? ''));
    $tamAd = trim((string)($b['tamAd'] ?? trim("$ad $soyad")));
    if ($tamAd === '') fail('VALIDATION', 'Yazar adı gerekli.', 400);
    $code = trim((string)($b['id'] ?? '')) ?: gen_code('yzr');
    if (id_by_code('yazarlar', $code)) $code = gen_code('yzr');
    $slug = unique_slug(slugify($tamAd), 'yazarlar', 'slug');
    db()->prepare(
        "INSERT INTO yazarlar (code, ad, soyad, tam_ad, slug, fotograf, biyografi) VALUES (?,?,?,?,?,?,?)"
    )->execute([$code, $ad, $soyad, $tamAd, $slug, $b['fotograf'] ?? null, $b['biyografi'] ?? null]);
    $r = db()->prepare("SELECT * FROM yazarlar WHERE code = ? LIMIT 1");
    $r->execute([$code]);
    respond(yazar_out($r->fetch()), null, 201);
}

function handle_update_yazar(string $code, array $b): void
{
    $id = require_id_by_code('yazarlar', $code, 'Yazar');
    $set = [];
    $params = [];
    foreach (['ad' => 'ad', 'soyad' => 'soyad', 'tamAd' => 'tam_ad', 'fotograf' => 'fotograf', 'biyografi' => 'biyografi'] as $k => $col) {
        if (array_key_exists($k, $b)) { $set[] = "$col = ?"; $params[] = $b[$k]; }
    }
    if (array_key_exists('tamAd', $b) && trim((string)$b['tamAd']) !== '') {
        $set[] = 'slug = ?'; $params[] = unique_slug(slugify((string)$b['tamAd']), 'yazarlar', 'slug', $id);
    }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);
    $params[] = $id;
    db()->prepare("UPDATE yazarlar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    $r = db()->prepare("SELECT * FROM yazarlar WHERE id = ? LIMIT 1");
    $r->execute([$id]);
    respond(yazar_out($r->fetch()));
}

function handle_delete_yazar(string $code): void
{
    $id = require_id_by_code('yazarlar', $code, 'Yazar');
    try {
        db()->prepare("DELETE FROM yazarlar WHERE id = ?")->execute([$id]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            fail('IN_USE', 'Bu yazar yazılarda kullanıldığı için silinemez. Önce yazıları başka yazara taşıyın.', 409);
        }
        throw $e;
    }
    respond(['deleted' => $code]);
}

/* ============================ KATEGORİLER ================================== */

function handle_create_kategori(array $b): void
{
    $ad = trim((string)($b['ad'] ?? ''));
    if ($ad === '') fail('VALIDATION', 'Kategori adı gerekli.', 400);
    $code = trim((string)($b['id'] ?? '')) ?: gen_code('kat');
    if (id_by_code('kategoriler', $code)) $code = gen_code('kat');
    $slugIn = trim((string)($b['slug'] ?? '')) ?: slugify($ad);
    $slug = unique_slug($slugIn, 'kategoriler', 'slug');
    $sira = (int)(db()->query("SELECT COALESCE(MAX(sira_no),0)+1 FROM kategoriler")->fetchColumn());
    try {
        db()->prepare("INSERT INTO kategoriler (code, ad, slug, sira_no) VALUES (?,?,?,?)")
            ->execute([$code, $ad, $slug, $sira]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('DUPLICATE', 'Bu kategori adı veya slug zaten var.', 409);
        throw $e;
    }
    $r = db()->prepare("SELECT * FROM kategoriler WHERE code = ? LIMIT 1");
    $r->execute([$code]);
    respond(kategori_out($r->fetch()), null, 201);
}

function handle_update_kategori(string $code, array $b): void
{
    $id = require_id_by_code('kategoriler', $code, 'Kategori');
    $set = [];
    $params = [];
    if (array_key_exists('ad', $b))   { $set[] = 'ad = ?';   $params[] = (string)$b['ad']; }
    if (array_key_exists('slug', $b)) { $set[] = 'slug = ?'; $params[] = unique_slug(slugify((string)$b['slug']), 'kategoriler', 'slug', $id); }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);
    $params[] = $id;
    try {
        db()->prepare("UPDATE kategoriler SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') fail('DUPLICATE', 'Bu kategori adı veya slug zaten var.', 409);
        throw $e;
    }
    $r = db()->prepare("SELECT * FROM kategoriler WHERE id = ? LIMIT 1");
    $r->execute([$id]);
    respond(kategori_out($r->fetch()));
}

function handle_delete_kategori(string $code): void
{
    $id = require_id_by_code('kategoriler', $code, 'Kategori');
    // Yazılarda FK SET NULL, ara_yazilarda SET NULL — silme güvenli (referanslar nullanır).
    db()->prepare("DELETE FROM kategoriler WHERE id = ?")->execute([$id]);
    respond(['deleted' => $code]);
}

/* ============================ ARŞİV SAYILARI =============================== */

function handle_create_arsiv(array $b): void
{
    $numara = trim((string)($b['numara'] ?? ''));
    if ($numara === '') fail('VALIDATION', 'Sayı numarası gerekli.', 400);
    $code = trim((string)($b['id'] ?? '')) ?: $numara;
    if (id_by_code('sayilar', $code)) $code = gen_code('sayi');
    db()->prepare(
        "INSERT INTO sayilar (code, numara, ay, yil, kapak_gorseli, pdf_url, is_current, yayin_tarihi)
         VALUES (?,?,?,?,?,?,0,?)"
    )->execute([
        $code, $numara, (string)($b['ay'] ?? ''), (int)($b['yil'] ?? 0),
        $b['kapakGorseli'] ?? '', $b['pdfUrl'] ?? '', norm_date($b['yayinTarihi'] ?? null),
    ]);
    $r = db()->prepare("SELECT * FROM sayilar WHERE code = ? LIMIT 1");
    $r->execute([$code]);
    respond(arsiv_out($r->fetch()), null, 201);
}

function handle_update_arsiv(string $code, array $b): void
{
    $id = require_id_by_code('sayilar', $code, 'Sayı');
    $set = [];
    $params = [];
    foreach (['numara'=>'numara','ay'=>'ay'] as $k=>$col) {
        if (array_key_exists($k,$b)) { $set[]="$col = ?"; $params[]=(string)$b[$k]; }
    }
    if (array_key_exists('yil',$b)) { $set[]='yil = ?'; $params[]=(int)$b['yil']; }
    if (array_key_exists('kapakGorseli',$b)) { $set[]='kapak_gorseli = ?'; $params[]=$b['kapakGorseli']; }
    if (array_key_exists('pdfUrl',$b)) { $set[]='pdf_url = ?'; $params[]=$b['pdfUrl']; }
    if (array_key_exists('yayinTarihi',$b)) { $set[]='yayin_tarihi = ?'; $params[]=norm_date($b['yayinTarihi']); }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);
    $params[] = $id;
    db()->prepare("UPDATE sayilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    $r = db()->prepare("SELECT * FROM sayilar WHERE id = ? LIMIT 1");
    $r->execute([$id]);
    respond(arsiv_out($r->fetch()));
}

function handle_delete_arsiv(string $code): void
{
    $id = require_id_by_code('sayilar', $code, 'Sayı');
    // Aktif sayı silinemez (önce başka sayıyı aktif yapın).
    $isCurrent = (int)db()->query("SELECT is_current FROM sayilar WHERE id = $id")->fetchColumn();
    if ($isCurrent === 1) fail('CANNOT_DELETE_CURRENT', 'Aktif sayı silinemez.', 409);
    db()->prepare("DELETE FROM sayilar WHERE id = ?")->execute([$id]); // yazilar CASCADE
    respond(['deleted' => $code]);
}

/* ============================ AKTİF SAYI ================================== */

/** PUT /api/sayi/current — aktif sayının meta alanlarını güncelle. */
function handle_update_current_sayi(array $b): void
{
    $row = db()->query("SELECT * FROM sayilar WHERE is_current = 1 ORDER BY id DESC LIMIT 1")->fetch();
    if (!$row) fail('NO_CURRENT_ISSUE', 'Aktif sayı yok.', 409);
    $id = (int)$row['id'];
    $set = [];
    $params = [];
    foreach (['numara'=>'numara','ay'=>'ay','tamBaslik'=>'tam_baslik','kapakGorseli'=>'kapak_gorseli','pdfUrl'=>'pdf_url','kunye'=>'kunye','onsoz'=>'onsoz'] as $k=>$col) {
        if (array_key_exists($k,$b)) { $set[]="$col = ?"; $params[]=$b[$k]; }
    }
    if (array_key_exists('yil',$b)) { $set[]='yil = ?'; $params[]=(int)$b['yil']; }
    if (array_key_exists('yayinTarihi',$b)) { $set[]='yayin_tarihi = ?'; $params[]=norm_date($b['yayinTarihi']); }
    if ($set) {
        $params[] = $id;
        db()->prepare("UPDATE sayilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    }
    $fresh = db()->prepare("SELECT * FROM sayilar WHERE id = ? LIMIT 1");
    $fresh->execute([$id]);
    respond(build_sayi_payload($fresh->fetch()));
}

/** POST /api/sayi/publish — aktif sayıyı arşive al (is_current=0). admin. */
function handle_publish_sayi(): void
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $row = $pdo->query("SELECT * FROM sayilar WHERE is_current = 1 ORDER BY id DESC LIMIT 1")->fetch();
        if (!$row) {
            $pdo->rollBack();
            fail('NO_CURRENT_ISSUE', 'Yayınlanacak aktif sayı yok.', 409);
        }
        // Tüm sayıları arşive al; bu satır arşiv kaydı olur (DUPLICATE oluşturmaz).
        $pdo->exec("UPDATE sayilar SET is_current = 0");
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    respond(arsiv_out($row));
}

/* ============================ YARIŞMA / HAKKIMIZDA ========================= */

function handle_update_yarisma(array $b): void
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE yarisma_bilgi SET baslik = ?, aciklama = ? WHERE id = 1")
            ->execute([(string)($b['baslik'] ?? ''), $b['aciklama'] ?? '']);
        // Kazananları tamamen yeniden yaz (istemci tüm diziyi gönderir).
        if (array_key_exists('gecmisKazananlar', $b) && is_array($b['gecmisKazananlar'])) {
            $pdo->exec("DELETE FROM yarisma_kazananlar");
            $ins = $pdo->prepare("INSERT INTO yarisma_kazananlar (yil, birinci, ikinci, sira_no) VALUES (?,?,?,?)");
            foreach ($b['gecmisKazananlar'] as $i => $k) {
                $ins->execute([(int)($k['yil'] ?? 0), (string)($k['birinci'] ?? ''), (string)($k['ikinci'] ?? ''), $i]);
            }
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    handle_get_yarisma();
}

function handle_update_hakkimizda(array $b): void
{
    $il = $b['iletisim'] ?? [];
    $sosyal = $il['sosyal'] ?? [];
    db()->prepare(
        "UPDATE hakkimizda SET baslik=?, icerik=?, iletisim_email=?, iletisim_adres=?,
         sosyal_twitter=?, sosyal_instagram=?, sosyal_facebook=? WHERE id = 1"
    )->execute([
        (string)($b['baslik'] ?? ''), $b['icerik'] ?? '',
        (string)($il['email'] ?? ''), (string)($il['adres'] ?? ''),
        (string)($sosyal['twitter'] ?? ''), (string)($sosyal['instagram'] ?? ''), (string)($sosyal['facebook'] ?? ''),
    ]);
    handle_get_hakkimizda();
}
