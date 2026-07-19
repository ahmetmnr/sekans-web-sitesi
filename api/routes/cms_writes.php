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
    // Yazıyı başka bir sayıya taşı (editör sağ paneldeki "Sayı" menüsünü değiştirdiğinde).
    if (array_key_exists('sayiId', $b) && (string)$b['sayiId'] !== '') {
        $set[] = 'sayi_id = ?'; $params[] = require_id_by_code('sayilar', (string)$b['sayiId'], 'Sayı');
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

    // Çoklu kategori: 'kategoriler' (dizi) varsa birincil = ilki; yoksa tekil 'kategori'.
    $katListe = arayazi_kategori_input($b);
    $kategoriAd = $katListe ? $katListe[0] : (string)($b['kategori'] ?? '');
    $kategoriId = resolve_kategori_id_by_ad($kategoriAd);
    $syncListe = $katListe ?: ($kategoriAd !== '' ? [$kategoriAd] : []);

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
    sync_arayazi_kategoriler((int)db()->lastInsertId(), $syncListe);
    // Serbest metin tarih etiketi (kolon varsa) — migration öncesi tolere edilir.
    if (array_key_exists('tarihEtiketi', $b) && column_exists('ara_yazilar', 'tarih_etiketi')) {
        db()->prepare("UPDATE ara_yazilar SET tarih_etiketi = ? WHERE code = ?")
            ->execute([($b['tarihEtiketi'] ?? '') !== '' ? (string)$b['tarihEtiketi'] : null, $code]);
    }
    $out = fetch_arayazi_full('code', $code);
    respond($out, null, 201);
}

/** Body'den ara yazı kategori adları dizisini çıkar (yoksa null). */
function arayazi_kategori_input(array $b): ?array
{
    if (!array_key_exists('kategoriler', $b) || !is_array($b['kategoriler'])) return null;
    $out = [];
    foreach ($b['kategoriler'] as $ad) {
        $ad = trim((string)$ad);
        if ($ad !== '' && !in_array($ad, $out, true)) $out[] = $ad;
    }
    return $out;
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
    if (array_key_exists('tarihEtiketi', $b) && column_exists('ara_yazilar', 'tarih_etiketi')) {
        $set[] = 'tarih_etiketi = ?'; $params[] = ($b['tarihEtiketi'] ?? '') !== '' ? (string)$b['tarihEtiketi'] : null;
    }
    // Kategori: çoklu ('kategoriler' dizisi) veya tekil ('kategori') — birincil = ilki.
    $katListe = arayazi_kategori_input($b);   // null: kategoriler alanı gönderilmedi
    if ($katListe !== null) {
        $birincil = $katListe[0] ?? '';
        $set[] = 'kategori_ad = ?'; $params[] = $birincil !== '' ? $birincil : null;
        $set[] = 'kategori_id = ?'; $params[] = resolve_kategori_id_by_ad($birincil);
    } elseif (array_key_exists('kategori', $b)) {
        $ad = (string)$b['kategori'];
        $set[] = 'kategori_ad = ?'; $params[] = $ad !== '' ? $ad : null;
        $set[] = 'kategori_id = ?'; $params[] = resolve_kategori_id_by_ad($ad);
        $katListe = $ad !== '' ? [$ad] : [];   // tekil kategori -> join tabloyu da güncelle
    }
    if (array_key_exists('slug', $b) && trim((string)$b['slug']) !== '') {
        $set[] = 'slug = ?'; $params[] = unique_slug(slugify((string)$b['slug']), 'ara_yazilar', 'slug', $id);
    }
    if (!$set) fail('VALIDATION', 'Güncellenecek alan yok.', 400);
    $params[] = $id;
    db()->prepare("UPDATE ara_yazilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    if ($katListe !== null) sync_arayazi_kategoriler($id, $katListe);
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
    if (array_key_exists('sira', $b)) { $set[] = 'sira_no = ?'; $params[] = (int)$b['sira']; }
    // aktif kolonu yalnızca migration uygulandıysa güncellenir.
    if (array_key_exists('aktif', $b) && column_exists('kategoriler', 'aktif')) {
        $set[] = 'aktif = ?'; $params[] = !empty($b['aktif']) ? 1 : 0;
    }
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

/** PUT /api/kategori-sirala — kategori sırasını topluca kaydet. body {siralar:[{id(code),sira}]}. editör+ */
function handle_reorder_kategori(array $b): void
{
    $siralar = $b['siralar'] ?? [];
    if (!is_array($siralar)) fail('VALIDATION', 'siralar dizisi gerekli.', 400);
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $up = $pdo->prepare("UPDATE kategoriler SET sira_no = ? WHERE code = ?");
        foreach ($siralar as $s) {
            if (!isset($s['id'])) continue;
            $up->execute([(int)($s['sira'] ?? 0), (string)$s['id']]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    $rows = db()->query("SELECT * FROM kategoriler ORDER BY sira_no ASC, id ASC")->fetchAll();
    respond(['kategoriler' => array_map('kategori_out', $rows)]);
}

function handle_delete_kategori(string $code): void
{
    $id = require_id_by_code('kategoriler', $code, 'Kategori');
    // Yazılarda FK SET NULL, ara_yazilarda SET NULL — silme güvenli (referanslar nullanır).
    db()->prepare("DELETE FROM kategoriler WHERE id = ?")->execute([$id]);
    respond(['deleted' => $code]);
}

/* ============================ ARŞİV SAYILARI =============================== */

/** Menü/ana sayfa alanlarını (menuEtiket, menuGoster, anasayfaGoster) SET listesine ekle. */
function sayi_menu_fields(array $b, array &$set, array &$params): void
{
    if (array_key_exists('menuEtiket', $b)) {
        $set[] = 'menu_etiket = ?';
        $v = trim((string)($b['menuEtiket'] ?? ''));
        $params[] = $v !== '' ? $v : null;
    }
    if (array_key_exists('menuGoster', $b)) {
        $set[] = 'menu_goster = ?';
        $params[] = !empty($b['menuGoster']) ? 1 : 0;
    }
    if (array_key_exists('anasayfaGoster', $b)) {
        $set[] = 'anasayfa_goster = ?';
        $params[] = !empty($b['anasayfaGoster']) ? 1 : 0;
    }
}

function handle_create_arsiv(array $b): void
{
    $numara = trim((string)($b['numara'] ?? ''));
    if ($numara === '') fail('VALIDATION', 'Sayı numarası gerekli.', 400);
    $code = trim((string)($b['id'] ?? '')) ?: $numara;
    if (id_by_code('sayilar', $code)) $code = gen_code('sayi');
    // Arşiv sayısı doğrudan durum='arsiv' olur (public arşiv sorgusu durum'a bakar).
    db()->prepare(
        "INSERT INTO sayilar (code, numara, ay, yil, kapak_gorseli, pdf_url, is_current, durum, yayin_tarihi)
         VALUES (?,?,?,?,?,?,0,'arsiv',?)"
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
    sayi_menu_fields($b, $set, $params);
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
    sayi_menu_fields($b, $set, $params);
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
        // Yayındaki sayıyı arşive al (durum + is_current birlikte).
        $pdo->exec("UPDATE sayilar SET is_current = 0, durum = 'arsiv' WHERE durum = 'yayinda'");
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    respond(arsiv_out($row));
}

/* ============================ SAYILAR (yaşam döngüsü) ===================== */

/** Numerik kullanıcı id'sinin geçerli olduğunu doğrula, int döndür. */
function require_editor_id(string $idStr): int
{
    $id = (int)$idStr;
    if ($id <= 0) fail('VALIDATION', 'Geçersiz editör.', 400);
    $st = db()->prepare("SELECT id FROM kullanicilar WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    if (!$st->fetchColumn()) fail('NOT_FOUND', 'Editör bulunamadı.', 404);
    return $id;
}

/** code ile sayıyı (editör adı JOIN + yazılar gömülü) serileştir. */
function cms_sayi_by_code(string $code): array
{
    $st = db()->prepare(
        "SELECT s.*, k.name AS editor_ad FROM sayilar s
         LEFT JOIN kullanicilar k ON k.id = s.editor_id
         WHERE s.code = ? LIMIT 1"
    );
    $st->execute([$code]);
    $row = $st->fetch();
    if (!$row) fail('NOT_FOUND', 'Sayı bulunamadı.', 404);
    return build_sayi_payload($row);
}

/** GET /api/cms/sayilar — düzenlenebilir sayılar (taslak + yayında), yazılarıyla. editör+ */
function handle_cms_list_sayilar(): void
{
    $rows = db()->query(
        "SELECT s.*, k.name AS editor_ad
         FROM sayilar s
         LEFT JOIN kullanicilar k ON k.id = s.editor_id
         WHERE s.durum IN ('taslak','yayinda')
         ORDER BY FIELD(s.durum,'yayinda','taslak'), s.yayin_tarihi DESC, s.id DESC"
    )->fetchAll();
    respond(array_map(fn($r) => build_sayi_payload($r), $rows));
}

/** GET /api/editorler — atama açılır menüsü için aktif kullanıcılar {id,name,role}. editör+ */
function handle_list_editorler(): void
{
    $rows = db()->query(
        "SELECT id, name, role FROM kullanicilar WHERE is_active = 1 ORDER BY (role='admin') DESC, name ASC"
    )->fetchAll();
    respond(array_map('editor_out', $rows));
}

/** POST /api/sayi — yeni TASLAK sayı oluştur. editör+ */
function handle_create_sayi(array $b): void
{
    $numara = trim((string)($b['numara'] ?? ''));
    if ($numara === '') fail('VALIDATION', 'Sayı numarası gerekli.', 400, ['numara' => 'zorunlu']);

    $code = trim((string)($b['id'] ?? '')) ?: $numara;
    if (id_by_code('sayilar', $code)) $code = gen_code('sayi');

    $editorId = (!empty($b['editorId'])) ? require_editor_id((string)$b['editorId']) : null;

    $ay  = (string)($b['ay'] ?? '');
    $yil = (int)($b['yil'] ?? 0);
    $tamBaslik = trim((string)($b['tamBaslik'] ?? '')) ?: trim("$ay $yil | Sayı $numara");

    db()->prepare(
        "INSERT INTO sayilar (code, numara, ay, yil, tam_baslik, kapak_gorseli, pdf_url, kunye, onsoz, is_current, durum, editor_id, yayin_tarihi)
         VALUES (?,?,?,?,?,?,?,?,?,0,'taslak',?,?)"
    )->execute([
        $code, $numara, $ay, $yil, $tamBaslik,
        $b['kapakGorseli'] ?? '', $b['pdfUrl'] ?? '', $b['kunye'] ?? null, $b['onsoz'] ?? null,
        $editorId, norm_date($b['yayinTarihi'] ?? null),
    ]);
    respond(cms_sayi_by_code($code), null, 201);
}

/** PUT /api/sayi/{code} — herhangi bir sayının meta alanlarını + sorumlu editörünü güncelle. editör+ */
function handle_update_sayi(string $code, array $b): void
{
    $id = require_id_by_code('sayilar', $code, 'Sayı');
    $set = [];
    $params = [];
    foreach (['numara'=>'numara','ay'=>'ay','tamBaslik'=>'tam_baslik','kapakGorseli'=>'kapak_gorseli','pdfUrl'=>'pdf_url','kunye'=>'kunye','onsoz'=>'onsoz'] as $k=>$col) {
        if (array_key_exists($k,$b)) { $set[]="$col = ?"; $params[]=$b[$k]; }
    }
    if (array_key_exists('yil',$b)) { $set[]='yil = ?'; $params[]=(int)$b['yil']; }
    if (array_key_exists('yayinTarihi',$b)) { $set[]='yayin_tarihi = ?'; $params[]=norm_date($b['yayinTarihi']); }
    sayi_menu_fields($b, $set, $params);
    if (array_key_exists('editorId',$b)) {
        $set[]='editor_id = ?';
        $params[] = ($b['editorId'] === null || $b['editorId'] === '') ? null : require_editor_id((string)$b['editorId']);
    }
    if ($set) {
        $params[] = $id;
        db()->prepare("UPDATE sayilar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    }
    respond(cms_sayi_by_code($code));
}

/**
 * PUT /api/sayi/{code}/durum  body {durum: taslak|yayinda|arsiv}
 * yayinda => bu sayı canlıya alınır; önceki yayında sayı otomatik arşive iner. editör+
 */
function handle_set_sayi_durum(string $code, array $b): void
{
    $durum = (string)($b['durum'] ?? '');
    if (!in_array($durum, ['taslak','yayinda','arsiv'], true)) {
        fail('VALIDATION', 'Geçersiz durum (taslak/yayinda/arsiv olmalı).', 400);
    }
    $id = require_id_by_code('sayilar', $code, 'Sayı');
    $pdo = db();
    $pdo->beginTransaction();
    try {
        if ($durum === 'yayinda') {
            $pdo->exec("UPDATE sayilar SET durum='arsiv', is_current=0 WHERE durum='yayinda'");
            $pdo->prepare("UPDATE sayilar SET durum='yayinda', is_current=1 WHERE id=?")->execute([$id]);
        } elseif ($durum === 'arsiv') {
            $pdo->prepare("UPDATE sayilar SET durum='arsiv', is_current=0 WHERE id=?")->execute([$id]);
        } else { // taslak
            $pdo->prepare("UPDATE sayilar SET durum='taslak', is_current=0 WHERE id=?")->execute([$id]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    respond(cms_sayi_by_code($code));
}

/** DELETE /api/sayi/{code} — yayındaki sayı hariç herhangi bir sayıyı sil (yazılar CASCADE). editör+ */
function handle_delete_sayi(string $code): void
{
    $id = require_id_by_code('sayilar', $code, 'Sayı');
    $durum = (string)db()->query("SELECT durum FROM sayilar WHERE id = " . (int)$id)->fetchColumn();
    if ($durum === 'yayinda') {
        fail('CANNOT_DELETE_CURRENT', 'Yayındaki sayı silinemez. Önce başka bir sayıyı yayına alın.', 409);
    }
    db()->prepare("DELETE FROM sayilar WHERE id = ?")->execute([$id]);
    respond(['deleted' => $code]);
}

/* ============================ YARIŞMA / HAKKIMIZDA ========================= */

function handle_update_yarisma(array $b): void
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $set = ['baslik = ?', 'aciklama = ?'];
        $params = [(string)($b['baslik'] ?? ''), $b['aciklama'] ?? ''];
        // Bilgi kartları + başvuru e-postası (yalnızca gönderildiyse — eski istemcilerle uyumlu)
        foreach ([
            'basvuruTarihleri' => 'basvuru_tarihleri',
            'kategoriMetni'    => 'kategori_metni',
            'odulMetni'        => 'odul_metni',
            'basvuruEmail'     => 'basvuru_email',
        ] as $k => $col) {
            if (array_key_exists($k, $b)) { $set[] = "$col = ?"; $params[] = (string)($b[$k] ?? ''); }
        }
        $pdo->prepare("UPDATE yarisma_bilgi SET " . implode(', ', $set) . " WHERE id = 1")->execute($params);
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

/** PUT /api/sayfa/{slug} — statik sayfayı güncelle (yoksa oluştur). editör+ */
function handle_update_sayfa(string $slug, array $b): void
{
    $slug = slugify($slug);
    if ($slug === '') fail('VALIDATION', 'Geçersiz sayfa adresi.', 400);
    $baslik = trim((string)($b['baslik'] ?? ''));
    if ($baslik === '') fail('VALIDATION', 'Başlık gerekli.', 400, ['baslik' => 'zorunlu']);

    $kisa   = array_key_exists('kisaAciklama', $b) ? (string)$b['kisaAciklama'] : null;
    $icerik = $b['icerik'] ?? '';
    $seoB   = array_key_exists('seoBaslik', $b) ? (string)$b['seoBaslik'] : null;
    $seoA   = array_key_exists('seoAciklama', $b) ? (string)$b['seoAciklama'] : null;
    $durum  = (($b['yayinDurumu'] ?? 'yayinda') === 'taslak') ? 'taslak' : 'yayinda';
    $sira   = isset($b['sira']) ? (int)$b['sira'] : 0;

    try {
        db()->prepare(
            "INSERT INTO sayfalar (slug, baslik, kisa_aciklama, icerik, seo_baslik, seo_aciklama, yayin_durumu, sira)
             VALUES (?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE baslik = VALUES(baslik), kisa_aciklama = VALUES(kisa_aciklama),
               icerik = VALUES(icerik), seo_baslik = VALUES(seo_baslik), seo_aciklama = VALUES(seo_aciklama),
               yayin_durumu = VALUES(yayin_durumu), sira = VALUES(sira)"
        )->execute([$slug, $baslik, $kisa, $icerik, $seoB, $seoA, $durum, $sira]);
    } catch (PDOException $e) {
        // Yeni kolonlar yoksa (migration bekleniyor) eski şemayla yaz.
        db()->prepare(
            "INSERT INTO sayfalar (slug, baslik, icerik) VALUES (?,?,?)
             ON DUPLICATE KEY UPDATE baslik = VALUES(baslik), icerik = VALUES(icerik)"
        )->execute([$slug, $baslik, $icerik]);
    }
    $st = db()->prepare("SELECT * FROM sayfalar WHERE slug = ? LIMIT 1");
    $st->execute([$slug]);
    respond(sayfa_out($st->fetch()));
}

/** GET /api/cms/sayfalar — tüm statik sayfalar (taslaklar dahil). editör+ */
function handle_cms_list_sayfalar(): void
{
    try {
        $rows = db()->query("SELECT * FROM sayfalar ORDER BY sira ASC, baslik ASC")->fetchAll();
    } catch (PDOException $e) {
        $rows = db()->query("SELECT * FROM sayfalar ORDER BY baslik ASC")->fetchAll();
    }
    respond(['sayfalar' => array_map('sayfa_out', $rows)]);
}

/** POST /api/sayfa — yeni statik sayfa. editör+ */
function handle_create_sayfa(array $b): void
{
    $baslik = trim((string)($b['baslik'] ?? ''));
    if ($baslik === '') fail('VALIDATION', 'Başlık gerekli.', 400, ['baslik' => 'zorunlu']);
    $base = slugify((string)($b['slug'] ?? '') ?: $baslik);
    $slug = unique_slug($base !== '' ? $base : 'sayfa', 'sayfalar', 'slug');
    $b['baslik'] = $baslik;
    // Upsert ile oluştur (slug benzersiz üretildi -> INSERT). respond() içeride.
    handle_update_sayfa($slug, $b);
}

/** DELETE /api/sayfa/{slug} — statik sayfayı sil. editör+ */
function handle_delete_sayfa(string $slug): void
{
    $slug = slugify($slug);
    db()->prepare("DELETE FROM sayfalar WHERE slug = ?")->execute([$slug]);
    respond(['deleted' => $slug]);
}

/* ============================ FİLTRE SAYFALARI ============================= */

/** Tek filtre sayfasını serileştirip döndür. */
function filtre_row_out(int $id): array
{
    $st = db()->prepare("SELECT * FROM filtre_sayfalar WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) fail('NOT_FOUND', 'Filtre sayfası bulunamadı.', 404);
    return filtre_sayfa_out($r);
}

/** GET /api/cms/filtreler — tüm filtre sayfaları (pasifler dahil). editör+ */
function handle_cms_list_filtreler(): void
{
    $rows = db()->query("SELECT * FROM filtre_sayfalar ORDER BY sira ASC, baslik ASC")->fetchAll();
    respond(['filtreler' => array_map('filtre_sayfa_out', $rows)]);
}

/** POST /api/filtre — yeni filtre sayfası. editör+ */
function handle_create_filtre(array $b): void
{
    $baslik = trim((string)($b['baslik'] ?? ''));
    if ($baslik === '') fail('VALIDATION', 'Başlık gerekli.', 400, ['baslik' => 'zorunlu']);
    $base = slugify((string)($b['slug'] ?? '') ?: $baslik);
    $slug = unique_slug($base !== '' ? $base : 'filtre', 'filtre_sayfalar', 'slug');

    // Booleans için create varsayılanları (gönderilmezse kapak+yazar/tarih görünür).
    $kapak = array_key_exists('kapakGoster', $b) ? (!empty($b['kapakGoster']) ? 1 : 0) : 1;
    $yazarTarih = array_key_exists('yazarTarihGoster', $b) ? (!empty($b['yazarTarihGoster']) ? 1 : 0) : 1;
    $aktif = array_key_exists('aktif', $b) ? (!empty($b['aktif']) ? 1 : 0) : 1;
    $siralama = (string)($b['siralama'] ?? 'yeni');
    if (!in_array($siralama, ['yeni','eski','alfabetik'], true)) $siralama = 'yeni';

    db()->prepare(
        "INSERT INTO filtre_sayfalar (slug, baslik, aciklama, kategori, siralama, sayfa_basina, kapak_goster, yazar_tarih_goster, aktif, sira)
         VALUES (?,?,?,?,?,?,?,?,?,?)"
    )->execute([
        $slug, $baslik, (string)($b['aciklama'] ?? ''),
        ($b['kategori'] ?? '') !== '' ? (string)$b['kategori'] : null,
        $siralama, max(1, min(96, (int)($b['sayfaBasina'] ?? 12))),
        $kapak, $yazarTarih, $aktif, (int)($b['sira'] ?? 0),
    ]);
    respond(filtre_row_out((int)db()->lastInsertId()));
}

/** PUT /api/filtre/{id} — filtre sayfasını güncelle. editör+ */
function handle_update_filtre(string $idStr, array $b): void
{
    $id = (int)$idStr;
    $st = db()->prepare("SELECT id FROM filtre_sayfalar WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    if ($st->fetchColumn() === false) fail('NOT_FOUND', 'Filtre sayfası bulunamadı.', 404);

    $set = [];
    $params = [];
    if (array_key_exists('baslik', $b)) {
        $bs = trim((string)$b['baslik']);
        if ($bs === '') fail('VALIDATION', 'Başlık boş olamaz.', 400);
        $set[] = 'baslik = ?'; $params[] = $bs;
    }
    if (array_key_exists('aciklama', $b)) { $set[] = 'aciklama = ?'; $params[] = (string)($b['aciklama'] ?? ''); }
    if (array_key_exists('kategori', $b)) { $set[] = 'kategori = ?'; $params[] = ($b['kategori'] ?? '') !== '' ? (string)$b['kategori'] : null; }
    if (array_key_exists('siralama', $b)) {
        $s = (string)$b['siralama']; $set[] = 'siralama = ?'; $params[] = in_array($s, ['yeni','eski','alfabetik'], true) ? $s : 'yeni';
    }
    if (array_key_exists('sayfaBasina', $b))      { $set[] = 'sayfa_basina = ?';       $params[] = max(1, min(96, (int)$b['sayfaBasina'])); }
    if (array_key_exists('kapakGoster', $b))      { $set[] = 'kapak_goster = ?';       $params[] = !empty($b['kapakGoster']) ? 1 : 0; }
    if (array_key_exists('yazarTarihGoster', $b)) { $set[] = 'yazar_tarih_goster = ?'; $params[] = !empty($b['yazarTarihGoster']) ? 1 : 0; }
    if (array_key_exists('aktif', $b))            { $set[] = 'aktif = ?';              $params[] = !empty($b['aktif']) ? 1 : 0; }
    if (array_key_exists('sira', $b))             { $set[] = 'sira = ?';               $params[] = (int)$b['sira']; }

    if ($set) {
        $params[] = $id;
        db()->prepare("UPDATE filtre_sayfalar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    }
    respond(filtre_row_out($id));
}

/** DELETE /api/filtre/{id} — filtre sayfasını sil. editör+ */
function handle_delete_filtre(string $idStr): void
{
    $id = (int)$idStr;
    db()->prepare("DELETE FROM filtre_sayfalar WHERE id = ?")->execute([$id]);
    respond(['deleted' => (string)$id]);
}

/* ========================= SEKANS İNDEKS AYARI =========================== */

/** İçerikte geçen tüm kategori adlarını (dergi + blog) sayılarıyla keşfet. */
function indeks_kategori_kesfet(): array
{
    $sql = "SELECT ad, COUNT(*) AS adet FROM (
                SELECT k.ad AS ad
                FROM yazilar y
                  JOIN sayilar s ON s.id = y.sayi_id AND s.durum <> 'taslak'
                  JOIN kategoriler k ON k.id = y.kategori_id
                UNION ALL
                SELECT a.kategori_ad AS ad
                FROM ara_yazilar a
                WHERE a.kategori_ad IS NOT NULL AND a.kategori_ad <> ''
            ) t
            GROUP BY ad";
    return db()->query($sql)->fetchAll();
}

/** GET /api/cms/indeks-kategoriler — keşfedilen kategoriler + kayıtlı ayar. editör+ */
function handle_cms_list_indeks_kategoriler(): void
{
    $kesif = indeks_kategori_kesfet();       // [{ad, adet}]
    $ayar  = indeks_kategori_ayar();          // [{ad, goster, sira}]
    $ayarMap = [];
    foreach ($ayar as $a) { if ($a['ad'] !== '') $ayarMap[$a['ad']] = $a; }

    $out = [];
    foreach ($kesif as $k) {
        $ad  = (string)$k['ad'];
        $cfg = $ayarMap[$ad] ?? null;
        $out[] = [
            'ad'     => $ad,
            'adet'   => (int)$k['adet'],
            'goster' => $cfg ? (bool)$cfg['goster'] : true,
            'sira'   => $cfg ? (int)$cfg['sira'] : 9999,
        ];
    }
    usort($out, fn($a, $b) => ($a['sira'] <=> $b['sira']) ?: strcmp($a['ad'], $b['ad']));
    respond(['kategoriler' => $out]);
}

/** PUT /api/indeks-kategoriler — indeks kategori sırası/görünürlüğünü kaydet. editör+ */
function handle_update_indeks_kategoriler(array $b): void
{
    $list = $b['kategoriler'] ?? [];
    if (!is_array($list)) fail('VALIDATION', 'kategoriler dizisi gerekli.', 400);
    $norm = [];
    foreach ($list as $i => $k) {
        if (!isset($k['ad']) || $k['ad'] === '') continue;
        $norm[] = [
            'ad'     => (string)$k['ad'],
            'goster' => !empty($k['goster']),
            'sira'   => isset($k['sira']) ? (int)$k['sira'] : $i,
        ];
    }
    $json = json_encode($norm, JSON_UNESCAPED_UNICODE);
    db()->prepare(
        "INSERT INTO ayarlar (anahtar, deger) VALUES ('indeks_kategoriler', ?)
         ON DUPLICATE KEY UPDATE deger = VALUES(deger)"
    )->execute([$json]);
    respond(['kategoriler' => $norm]);
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

/* ================================ MENÜ ==================================== */

const MENU_TURLER = ['dahili','grup','sabit_sayfa','kategori','filtre_liste','dergi_sayisi','dergi_sayilari','harici_link'];

/** Geçerli menü türünü döndür (geçersizse 'dahili'). */
function menu_norm_tur($tur): string
{
    $tur = (string)$tur;
    return in_array($tur, MENU_TURLER, true) ? $tur : 'dahili';
}

/** parentId (string) -> geçerli menuler.id (int) ya da null. Yoksa null'a düşer. */
function menu_norm_parent($parentId): ?int
{
    if ($parentId === null || $parentId === '' || $parentId === '0') return null;
    $id = (int)$parentId;
    $st = db()->prepare("SELECT id FROM menuler WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    return $st->fetchColumn() !== false ? $id : null;
}

/** Aynı seviyedeki (parent) bir sonraki sıra numarası. */
function menu_next_sira(?int $parentId): int
{
    if ($parentId === null) {
        $st = db()->query("SELECT COALESCE(MAX(sira), -1) + 1 FROM menuler WHERE parent_id IS NULL");
        return (int)$st->fetchColumn();
    }
    $st = db()->prepare("SELECT COALESCE(MAX(sira), -1) + 1 FROM menuler WHERE parent_id = ?");
    $st->execute([$parentId]);
    return (int)$st->fetchColumn();
}

/** Tek menü satırını (children olmadan) serileştirip döndür. */
function menu_row_out(int $id): array
{
    $st = db()->prepare("SELECT * FROM menuler WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) fail('NOT_FOUND', 'Menü öğesi bulunamadı.', 404);
    $out = menu_out($r);
    $out['children'] = [];
    return $out;
}

/** GET /api/cms/menu — düzenleme için TÜM menü ağacı (pasifler dahil). editör+ */
function handle_cms_list_menu(): void
{
    respond(['menu' => menu_tree(false)]);
}

/** POST /api/menu — yeni menü öğesi. editör+ */
function handle_create_menu(array $b): void
{
    $gorunen = trim((string)($b['gorunenBaslik'] ?? ''));
    if ($gorunen === '') fail('VALIDATION', 'Menü başlığı gerekli.', 400, ['gorunenBaslik' => 'zorunlu']);

    $tur      = menu_norm_tur($b['tur'] ?? 'dahili');
    $parentId = menu_norm_parent($b['parentId'] ?? null);
    $hedef    = ($b['hedef'] ?? null) !== null ? trim((string)$b['hedef']) : null;
    if ($hedef === '') $hedef = null;
    $sira     = isset($b['sira']) ? (int)$b['sira'] : menu_next_sira($parentId);
    $aktif    = array_key_exists('aktif', $b) ? (!empty($b['aktif']) ? 1 : 0) : 1;
    $yeniSekme = !empty($b['yeniSekme']) ? 1 : 0;
    $sistem   = ($b['sistemBaslik'] ?? null) !== null ? trim((string)$b['sistemBaslik']) : null;

    db()->prepare(
        "INSERT INTO menuler (parent_id, gorunen_baslik, sistem_baslik, tur, hedef, sira, aktif, yeni_sekme, otomatik)
         VALUES (?,?,?,?,?,?,?,?,0)"
    )->execute([$parentId, $gorunen, $sistem ?: null, $tur, $hedef, $sira, $aktif, $yeniSekme]);

    respond(menu_row_out((int)db()->lastInsertId()));
}

/** PUT /api/menu/{id} — menü öğesini güncelle (yalnızca gönderilen alanlar). editör+ */
function handle_update_menu(string $idStr, array $b): void
{
    $id = (int)$idStr;
    $st = db()->prepare("SELECT id FROM menuler WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    if ($st->fetchColumn() === false) fail('NOT_FOUND', 'Menü öğesi bulunamadı.', 404);

    $set = [];
    $params = [];
    if (array_key_exists('gorunenBaslik', $b)) {
        $g = trim((string)$b['gorunenBaslik']);
        if ($g === '') fail('VALIDATION', 'Menü başlığı boş olamaz.', 400, ['gorunenBaslik' => 'zorunlu']);
        $set[] = 'gorunen_baslik = ?'; $params[] = $g;
    }
    if (array_key_exists('sistemBaslik', $b)) {
        $s = trim((string)($b['sistemBaslik'] ?? '')); $set[] = 'sistem_baslik = ?'; $params[] = $s !== '' ? $s : null;
    }
    if (array_key_exists('tur', $b)) { $set[] = 'tur = ?'; $params[] = menu_norm_tur($b['tur']); }
    if (array_key_exists('hedef', $b)) {
        $h = trim((string)($b['hedef'] ?? '')); $set[] = 'hedef = ?'; $params[] = $h !== '' ? $h : null;
    }
    if (array_key_exists('parentId', $b)) {
        $pid = menu_norm_parent($b['parentId']);
        // Kendini üst yapamaz (basit döngü koruması; menü 2 seviyeli).
        if ($pid === $id) fail('VALIDATION', 'Öğe kendi altına taşınamaz.', 400);
        $set[] = 'parent_id = ?'; $params[] = $pid;
    }
    if (array_key_exists('sira', $b))      { $set[] = 'sira = ?';       $params[] = (int)$b['sira']; }
    if (array_key_exists('aktif', $b))     { $set[] = 'aktif = ?';      $params[] = !empty($b['aktif']) ? 1 : 0; }
    if (array_key_exists('yeniSekme', $b)) { $set[] = 'yeni_sekme = ?'; $params[] = !empty($b['yeniSekme']) ? 1 : 0; }

    if ($set) {
        $params[] = $id;
        db()->prepare("UPDATE menuler SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    }
    respond(menu_row_out($id));
}

/** DELETE /api/menu/{id} — menü öğesini (ve alt öğelerini CASCADE) sil. editör+ */
function handle_delete_menu(string $idStr): void
{
    $id = (int)$idStr;
    db()->prepare("DELETE FROM menuler WHERE id = ?")->execute([$id]);
    respond(['deleted' => (string)$id]);
}

/** PUT /api/menu-sirala — bir seviyedeki sıralamayı topluca kaydet. body {siralar:[{id,sira}]}. editör+ */
function handle_reorder_menu(array $b): void
{
    $siralar = $b['siralar'] ?? [];
    if (!is_array($siralar)) fail('VALIDATION', 'siralar dizisi gerekli.', 400);
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $up = $pdo->prepare("UPDATE menuler SET sira = ? WHERE id = ?");
        foreach ($siralar as $s) {
            if (!isset($s['id'])) continue;
            $up->execute([(int)($s['sira'] ?? 0), (int)$s['id']]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    respond(['menu' => menu_tree(false)]);
}

/* ============================ ANA SAYFA BLOKLARI ========================== */

const ANASAYFA_BLOK_TIPLERI = ['sayilar', 'blog', 'kategori'];

/** Geçerli blok tipini döndür (geçersizse 'blog'). */
function blok_norm_tip($tip): string
{
    $tip = (string)$tip;
    return in_array($tip, ANASAYFA_BLOK_TIPLERI, true) ? $tip : 'blog';
}

/** Body'deki ayar (obje) -> güvenli JSON metni (yalnızca kategori/adet). */
function blok_ayar_json($ayar): ?string
{
    if (!is_array($ayar)) return null;
    $out = [];
    if (isset($ayar['kategori']) && $ayar['kategori'] !== '') $out['kategori'] = (string)$ayar['kategori'];
    if (isset($ayar['adet']))     $out['adet'] = max(1, min(48, (int)$ayar['adet']));
    return $out ? json_encode($out, JSON_UNESCAPED_UNICODE) : null;
}

/** Aynı seviyedeki bir sonraki sıra numarası (bloklar tek seviyeli). */
function blok_next_sira(): int
{
    return (int)db()->query("SELECT COALESCE(MAX(sira), -1) + 1 FROM anasayfa_bloklar")->fetchColumn();
}

/** Tek blok satırını serileştirip döndür. */
function blok_row_out(int $id): array
{
    $st = db()->prepare("SELECT * FROM anasayfa_bloklar WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) fail('NOT_FOUND', 'Blok bulunamadı.', 404);
    return anasayfa_blok_out($r);
}

/** GET /api/cms/anasayfa-bloklar — TÜM bloklar (pasifler dahil). editör+ */
function handle_cms_list_bloklar(): void
{
    respond(['bloklar' => anasayfa_bloklar_list(false)]);
}

/** POST /api/anasayfa-blok — yeni panel. editör+ */
function handle_create_blok(array $b): void
{
    $tip    = blok_norm_tip($b['tip'] ?? 'blog');
    $baslik = trim((string)($b['baslik'] ?? ''));
    $sira   = isset($b['sira']) ? (int)$b['sira'] : blok_next_sira();
    $aktif  = array_key_exists('aktif', $b) ? (!empty($b['aktif']) ? 1 : 0) : 1;
    $ayar   = blok_ayar_json($b['ayar'] ?? null);

    db()->prepare(
        "INSERT INTO anasayfa_bloklar (tip, baslik, sira, aktif, ayar) VALUES (?,?,?,?,?)"
    )->execute([$tip, $baslik !== '' ? $baslik : null, $sira, $aktif, $ayar]);

    respond(blok_row_out((int)db()->lastInsertId()));
}

/** PUT /api/anasayfa-blok/{id} — paneli güncelle (yalnızca gönderilen alanlar). editör+ */
function handle_update_blok(string $idStr, array $b): void
{
    $id = (int)$idStr;
    $st = db()->prepare("SELECT id FROM anasayfa_bloklar WHERE id = ? LIMIT 1");
    $st->execute([$id]);
    if ($st->fetchColumn() === false) fail('NOT_FOUND', 'Blok bulunamadı.', 404);

    $set = [];
    $params = [];
    if (array_key_exists('tip', $b))    { $set[] = 'tip = ?';    $params[] = blok_norm_tip($b['tip']); }
    if (array_key_exists('baslik', $b)) { $bs = trim((string)($b['baslik'] ?? '')); $set[] = 'baslik = ?'; $params[] = $bs !== '' ? $bs : null; }
    if (array_key_exists('sira', $b))   { $set[] = 'sira = ?';   $params[] = (int)$b['sira']; }
    if (array_key_exists('aktif', $b))  { $set[] = 'aktif = ?';  $params[] = !empty($b['aktif']) ? 1 : 0; }
    if (array_key_exists('ayar', $b))   { $set[] = 'ayar = ?';   $params[] = blok_ayar_json($b['ayar']); }

    if ($set) {
        $params[] = $id;
        db()->prepare("UPDATE anasayfa_bloklar SET " . implode(', ', $set) . " WHERE id = ?")->execute($params);
    }
    respond(blok_row_out($id));
}

/** DELETE /api/anasayfa-blok/{id} — paneli sil. editör+ */
function handle_delete_blok(string $idStr): void
{
    $id = (int)$idStr;
    db()->prepare("DELETE FROM anasayfa_bloklar WHERE id = ?")->execute([$id]);
    respond(['deleted' => (string)$id]);
}

/** PUT /api/anasayfa-blok-sirala — panellerin sırasını topluca kaydet. body {siralar:[{id,sira}]}. editör+ */
function handle_reorder_blok(array $b): void
{
    $siralar = $b['siralar'] ?? [];
    if (!is_array($siralar)) fail('VALIDATION', 'siralar dizisi gerekli.', 400);
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $up = $pdo->prepare("UPDATE anasayfa_bloklar SET sira = ? WHERE id = ?");
        foreach ($siralar as $s) {
            if (!isset($s['id'])) continue;
            $up->execute([(int)($s['sira'] ?? 0), (int)$s['id']]);
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    respond(['bloklar' => anasayfa_bloklar_list(false)]);
}
