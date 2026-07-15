<?php
/**
 * Ortak yardımcılar: slugify, kod üretimi, satır bulma, gömme.
 */
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/serializers.php';

/** Türkçe karakterleri normalize ederek slug üret. */
function slugify(string $s): string
{
    $s = mb_strtolower($s, 'UTF-8');
    $map = ['ç'=>'c','ğ'=>'g','ı'=>'i','ö'=>'o','ş'=>'s','ü'=>'u','â'=>'a','î'=>'i','û'=>'u'];
    $s = strtr($s, $map);
    $s = preg_replace('/[^a-z0-9]+/u', '-', $s);
    return trim((string)$s, '-');
}

/** Çakışmayan benzersiz slug üret (tablo + sütun kontrolü). */
function unique_slug(string $base, string $table, string $column, ?int $excludeId = null): string
{
    $base = $base !== '' ? $base : 'icerik';
    $slug = $base;
    $i = 2;
    while (slug_exists($slug, $table, $column, $excludeId)) {
        $slug = $base . '-' . $i;
        $i++;
    }
    return $slug;
}

function slug_exists(string $slug, string $table, string $column, ?int $excludeId): bool
{
    $sql = "SELECT 1 FROM `$table` WHERE `$column` = ?";
    $params = [$slug];
    if ($excludeId !== null) {
        $sql .= " AND id <> ?";
        $params[] = $excludeId;
    }
    $sql .= " LIMIT 1";
    $st = db()->prepare($sql);
    $st->execute($params);
    return (bool)$st->fetchColumn();
}

/** İstemci kodu (eski string id) yoksa üret. prefix-zamandamgası tabanlı. */
function gen_code(string $prefix): string
{
    return $prefix . '-' . base_convert((string)(int)(microtime(true) * 1000), 10, 36)
        . substr(bin2hex(random_bytes(2)), 0, 3);
}

/** code'a göre numeric id getir (yoksa null). */
function id_by_code(string $table, string $code): ?int
{
    $st = db()->prepare("SELECT id FROM `$table` WHERE code = ? LIMIT 1");
    $st->execute([$code]);
    $id = $st->fetchColumn();
    return $id === false ? null : (int)$id;
}

/** code'a göre numeric id getir; bulunamazsa 404 ile biter (yardımcı). */
function require_id_by_code(string $table, string $code, string $what): int
{
    $st = db()->prepare("SELECT id FROM `$table` WHERE code = ? LIMIT 1");
    $st->execute([$code]);
    $id = $st->fetchColumn();
    if ($id === false) {
        fail('NOT_FOUND', "$what bulunamadı.", 404);
    }
    return (int)$id;
}

/** Tüm yazarları code->satır map olarak yükle (gömme için). */
function load_yazar_map(): array
{
    $map = [];
    foreach (db()->query("SELECT * FROM yazarlar")->fetchAll() as $r) {
        $map[(int)$r['id']] = $r;
    }
    return $map;
}

/** Tüm kategorileri id->satır map olarak yükle. */
function load_kategori_map(): array
{
    $map = [];
    foreach (db()->query("SELECT * FROM kategoriler")->fetchAll() as $r) {
        $map[(int)$r['id']] = $r;
    }
    return $map;
}

/** AraYazi serbest-metin kategori adını kategori_id'ye çöz (eşleşmezse null). */
function resolve_kategori_id_by_ad(?string $ad): ?int
{
    if ($ad === null || $ad === '') return null;
    $st = db()->prepare("SELECT id FROM kategoriler WHERE ad = ? LIMIT 1");
    $st->execute([$ad]);
    $id = $st->fetchColumn();
    return $id === false ? null : (int)$id;
}

/** ISO tarih (YYYY-MM-DD) doğrula/normalize et; geçersizse null. */
function norm_date(?string $d): ?string
{
    if (!$d) return null;
    $d = substr($d, 0, 10);
    return preg_match('/^\d{4}-\d{2}-\d{2}$/', $d) ? $d : null;
}

/**
 * Tüm ara yazıların kategori adlarını [arayazi_id => [ad,...]] map olarak yükle.
 * arayazi_kategorileri tablosu yoksa (migration öncesi) boş map döner ve
 * çağıran taraf birincil kategori_ad'e düşer.
 */
function load_arayazi_kategori_map(): array
{
    $map = [];
    try {
        $rows = db()->query("SELECT arayazi_id, kategori_ad FROM arayazi_kategorileri ORDER BY id ASC")->fetchAll();
        foreach ($rows as $r) {
            $map[(int)$r['arayazi_id']][] = $r['kategori_ad'];
        }
    } catch (PDOException $e) {
        // tablo yok — boş map (birincil kategoriye düşülür)
    }
    return $map;
}

/** Tek bir ara yazının kategori adları (tablo yoksa []). */
function arayazi_kategori_list(int $id): array
{
    try {
        $st = db()->prepare("SELECT kategori_ad FROM arayazi_kategorileri WHERE arayazi_id = ? ORDER BY id ASC");
        $st->execute([$id]);
        return array_map(fn($r) => $r['kategori_ad'], $st->fetchAll());
    } catch (PDOException $e) {
        return [];
    }
}

/**
 * Bir ara yazının kategori adları kümesini join tabloyla senkronla (sil + ekle).
 * Boş/eşleşmeyen adlar atlanır. Tablo yoksa sessizce geçilir (migration öncesi).
 */
function sync_arayazi_kategoriler(int $id, array $adlar): void
{
    $temiz = [];
    foreach ($adlar as $ad) {
        $ad = trim((string)$ad);
        if ($ad !== '' && !in_array($ad, $temiz, true)) $temiz[] = $ad;
    }
    try {
        db()->prepare("DELETE FROM arayazi_kategorileri WHERE arayazi_id = ?")->execute([$id]);
        if ($temiz) {
            $ins = db()->prepare("INSERT IGNORE INTO arayazi_kategorileri (arayazi_id, kategori_ad) VALUES (?, ?)");
            foreach ($temiz as $ad) { $ins->execute([$id, $ad]); }
        }
    } catch (PDOException $e) {
        // tablo yok — çoklu kategori pasif (birincil kategori_ad zaten yazıldı)
    }
}
