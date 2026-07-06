<?php
/**
 * Herkese açık GET uçları (kimlik doğrulama gerektirmez).
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';

/** Sayı (DB satırı) + makalelerini serileştirilmiş Sayi olarak döndür. */
function build_sayi_payload(array $sayiRow): array
{
    $yazarMap = load_yazar_map();
    $katMap   = load_kategori_map();

    $st = db()->prepare("SELECT * FROM yazilar WHERE sayi_id = ? ORDER BY sira_no ASC, id ASC");
    $st->execute([(int)$sayiRow['id']]);
    $yazilar = [];
    foreach ($st->fetchAll() as $y) {
        $yazar    = yazar_out($yazarMap[(int)$y['yazar_id']] ?? null);
        $kategori = $y['kategori_id'] !== null ? kategori_out($katMap[(int)$y['kategori_id']] ?? null) : null;
        $yazilar[] = yazi_out($y, $yazar, $kategori, (string)$sayiRow['code']);
    }
    return sayi_out($sayiRow, $yazilar);
}

/** GET /api/sayi/current — canlı (yayında) sayı. */
function handle_get_current_sayi(): void
{
    $row = db()->query("SELECT * FROM sayilar WHERE durum = 'yayinda' ORDER BY id DESC LIMIT 1")->fetch();
    if (!$row) {
        fail('NOT_FOUND', 'Aktif sayı bulunamadı.', 404);
    }
    respond(build_sayi_payload($row));
}

/** GET /api/arsiv  — arşiv sayıları (durum='arsiv'). Taslak sayılar siteye ÇIKMAZ. */
function handle_get_arsiv(): void
{
    $rows = db()->query(
        "SELECT * FROM sayilar WHERE durum = 'arsiv' ORDER BY yayin_tarihi DESC, id DESC"
    )->fetchAll();
    respond(array_map('arsiv_out', $rows));
}

/** GET /api/yazi/{code} */
function handle_get_yazi(string $code): void
{
    $st = db()->prepare("SELECT * FROM yazilar WHERE code = ? LIMIT 1");
    $st->execute([$code]);
    $y = $st->fetch();
    if (!$y) {
        fail('NOT_FOUND', 'Yazı bulunamadı.', 404);
    }
    $yazarMap = load_yazar_map();
    $katMap   = load_kategori_map();
    $sayiCode = '';
    $sc = db()->prepare("SELECT code FROM sayilar WHERE id = ? LIMIT 1");
    $sc->execute([(int)$y['sayi_id']]);
    $sayiCode = (string)$sc->fetchColumn();

    $yazar    = yazar_out($yazarMap[(int)$y['yazar_id']] ?? null);
    $kategori = $y['kategori_id'] !== null ? kategori_out($katMap[(int)$y['kategori_id']] ?? null) : null;
    respond(yazi_out($y, $yazar, $kategori, $sayiCode));
}

/** GET /api/arayazi  — sayfalı blog listesi (icerik HARİÇ) */
function handle_list_arayazi(): void
{
    $page  = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];
    if (!empty($_GET['kategori'])) {
        // ada, slug'a veya code'a göre filtrele
        $where[] = "(a.kategori_ad = ? OR k.slug = ? OR k.code = ?)";
        $params[] = $_GET['kategori'];
        $params[] = $_GET['kategori'];
        $params[] = $_GET['kategori'];
    }
    if (!empty($_GET['yazar'])) {
        $where[] = "y.code = ?";
        $params[] = $_GET['yazar'];
    }
    if (!empty($_GET['q'])) {
        $where[] = "(a.baslik LIKE ? OR a.spot LIKE ?)";
        $params[] = '%' . $_GET['q'] . '%';
        $params[] = '%' . $_GET['q'] . '%';
    }
    $whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

    $countSql = "SELECT COUNT(*) FROM ara_yazilar a
        LEFT JOIN yazarlar y ON y.id = a.yazar_id
        LEFT JOIN kategoriler k ON k.id = a.kategori_id $whereSql";
    $cst = db()->prepare($countSql);
    $cst->execute($params);
    $total = (int)$cst->fetchColumn();

    $sql = "SELECT a.*, y.code AS y_code, y.ad AS y_ad, y.soyad AS y_soyad,
                   y.tam_ad AS y_tam_ad, y.fotograf AS y_fotograf, y.biyografi AS y_biyografi
            FROM ara_yazilar a
            LEFT JOIN yazarlar y ON y.id = a.yazar_id
            LEFT JOIN kategoriler k ON k.id = a.kategori_id
            $whereSql
            ORDER BY a.yayin_tarihi DESC, a.id DESC
            LIMIT $limit OFFSET $offset";
    $st = db()->prepare($sql);
    $st->execute($params);

    $items = [];
    foreach ($st->fetchAll() as $r) {
        $yazar = $r['y_code'] !== null ? [
            'id' => (string)$r['y_code'], 'ad' => $r['y_ad'], 'soyad' => $r['y_soyad'],
            'tamAd' => $r['y_tam_ad'], 'fotograf' => $r['y_fotograf'], 'biyografi' => $r['y_biyografi'],
        ] : null;
        $items[] = ara_yazi_out($r, $yazar, false);
    }

    $totalPages = (int)ceil($total / $limit);
    respond($items, [
        'pagination' => [
            'page' => $page, 'limit' => $limit, 'total' => $total,
            'totalPages' => $totalPages, 'hasMore' => $page < $totalPages,
        ],
    ]);
}

/** Tek bir ara_yazi satırını (yazar gömülü) serileştir. */
function fetch_arayazi_full(string $by, string $value): ?array
{
    $col = $by === 'slug' ? 'slug' : 'code';
    $st = db()->prepare("SELECT * FROM ara_yazilar WHERE `$col` = ? LIMIT 1");
    $st->execute([$value]);
    $r = $st->fetch();
    if (!$r) return null;
    $yazarMap = load_yazar_map();
    $yazar = yazar_out($yazarMap[(int)$r['yazar_id']] ?? null);
    return ara_yazi_out($r, $yazar, true);
}

/** GET /api/arayazi/slug/{slug} */
function handle_get_arayazi_by_slug(string $slug): void
{
    $out = fetch_arayazi_full('slug', $slug);
    if (!$out) fail('NOT_FOUND', 'Ara yazı bulunamadı.', 404);
    respond($out);
}

/** GET /api/arayazi/{code} */
function handle_get_arayazi_by_code(string $code): void
{
    $out = fetch_arayazi_full('code', $code);
    if (!$out) fail('NOT_FOUND', 'Ara yazı bulunamadı.', 404);
    respond($out);
}

/** GET /api/yazarlar */
function handle_get_yazarlar(): void
{
    $rows = db()->query("SELECT * FROM yazarlar ORDER BY id ASC")->fetchAll();
    respond(array_map('yazar_out', $rows));
}

/** GET /api/yazar/{code} */
function handle_get_yazar(string $code): void
{
    $st = db()->prepare("SELECT * FROM yazarlar WHERE code = ? LIMIT 1");
    $st->execute([$code]);
    $r = $st->fetch();
    if (!$r) fail('NOT_FOUND', 'Yazar bulunamadı.', 404);
    respond(yazar_out($r));
}

/** GET /api/kategoriler */
function handle_get_kategoriler(): void
{
    $rows = db()->query("SELECT * FROM kategoriler ORDER BY sira_no ASC, id ASC")->fetchAll();
    respond(array_map('kategori_out', $rows));
}

/** GET /api/yarisma */
function handle_get_yarisma(): void
{
    $bilgi = db()->query("SELECT * FROM yarisma_bilgi WHERE id = 1 LIMIT 1")->fetch() ?: [];
    $kaz = db()->query("SELECT yil, birinci, ikinci FROM yarisma_kazananlar ORDER BY yil DESC")->fetchAll();
    respond([
        'baslik'   => $bilgi['baslik'] ?? '',
        'aciklama' => $bilgi['aciklama'] ?? '',
        'gecmisKazananlar' => array_map(fn($k) => [
            'yil' => (int)$k['yil'], 'birinci' => $k['birinci'], 'ikinci' => $k['ikinci'],
        ], $kaz),
    ]);
}

/** GET /api/hakkimizda */
function handle_get_hakkimizda(): void
{
    $r = db()->query("SELECT * FROM hakkimizda WHERE id = 1 LIMIT 1")->fetch() ?: [];
    respond([
        'baslik' => $r['baslik'] ?? '',
        'icerik' => $r['icerik'] ?? '',
        'iletisim' => [
            'email' => $r['iletisim_email'] ?? '',
            'adres' => $r['iletisim_adres'] ?? '',
            'sosyal' => [
                'twitter'   => $r['sosyal_twitter'] ?? '',
                'instagram' => $r['sosyal_instagram'] ?? '',
                'facebook'  => $r['sosyal_facebook'] ?? '',
            ],
        ],
    ]);
}

/** GET /api/bootstrap — tek seferde tüm açık veriyi döndür (frontend ilk yükleme). */
function handle_bootstrap(): void
{
    $current = db()->query("SELECT * FROM sayilar WHERE durum = 'yayinda' ORDER BY id DESC LIMIT 1")->fetch();
    $sonSayi = $current ? build_sayi_payload($current) : null;

    // Yalnızca ARŞİV siteye çıkar; taslak (hazırlanan) sayılar herkese açık bootstrap'ta YER ALMAZ.
    $arsivRows = db()->query("SELECT * FROM sayilar WHERE durum = 'arsiv' ORDER BY yayin_tarihi DESC, id DESC")->fetchAll();

    // Tüm ara yazılar (icerik HARİÇ — bootstrap hafif kalsın; detay ayrı çekilir).
    $yazarMap = load_yazar_map();
    $araRows = db()->query("SELECT * FROM ara_yazilar ORDER BY yayin_tarihi DESC, id DESC")->fetchAll();
    $araYazilar = array_map(function ($r) use ($yazarMap) {
        return ara_yazi_out($r, yazar_out($yazarMap[(int)$r['yazar_id']] ?? null), false);
    }, $araRows);

    $yazarlar = array_map('yazar_out', db()->query("SELECT * FROM yazarlar ORDER BY id ASC")->fetchAll());
    $kategoriler = array_map('kategori_out', db()->query("SELECT * FROM kategoriler ORDER BY sira_no ASC, id ASC")->fetchAll());

    $bilgi = db()->query("SELECT * FROM yarisma_bilgi WHERE id = 1 LIMIT 1")->fetch() ?: [];
    $kaz = db()->query("SELECT yil, birinci, ikinci FROM yarisma_kazananlar ORDER BY yil DESC")->fetchAll();
    $yarismasiBilgi = [
        'baslik' => $bilgi['baslik'] ?? '',
        'aciklama' => $bilgi['aciklama'] ?? '',
        'gecmisKazananlar' => array_map(fn($k) => [
            'yil' => (int)$k['yil'], 'birinci' => $k['birinci'], 'ikinci' => $k['ikinci'],
        ], $kaz),
    ];

    $h = db()->query("SELECT * FROM hakkimizda WHERE id = 1 LIMIT 1")->fetch() ?: [];
    $hakkimizdaIcerik = [
        'baslik' => $h['baslik'] ?? '',
        'icerik' => $h['icerik'] ?? '',
        'iletisim' => [
            'email' => $h['iletisim_email'] ?? '',
            'adres' => $h['iletisim_adres'] ?? '',
            'sosyal' => [
                'twitter'   => $h['sosyal_twitter'] ?? '',
                'instagram' => $h['sosyal_instagram'] ?? '',
                'facebook'  => $h['sosyal_facebook'] ?? '',
            ],
        ],
    ];

    respond([
        'sonSayi'          => $sonSayi,
        'arsivSayilari'    => array_map('arsiv_out', $arsivRows),
        'araYazilar'       => $araYazilar,
        'yazarlar'         => $yazarlar,
        'kategoriler'      => $kategoriler,
        'yarismasiBilgi'   => $yarismasiBilgi,
        'hakkimizdaIcerik' => $hakkimizdaIcerik,
    ]);
}
