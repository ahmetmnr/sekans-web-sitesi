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

/** Yarışma bilgisi + kazananlar (tek şekil; GET/PUT yanıtı ve bootstrap paylaşır). */
function yarisma_payload(): array
{
    $bilgi = db()->query("SELECT * FROM yarisma_bilgi WHERE id = 1 LIMIT 1")->fetch() ?: [];
    $kaz = db()->query("SELECT yil, birinci, ikinci FROM yarisma_kazananlar ORDER BY yil DESC")->fetchAll();
    return [
        'baslik'   => $bilgi['baslik'] ?? '',
        'aciklama' => $bilgi['aciklama'] ?? '',
        // Bilgi kartları + başvuru CTA (migration öncesi kolon yoksa boş döner)
        'basvuruTarihleri' => $bilgi['basvuru_tarihleri'] ?? '',
        'kategoriMetni'    => $bilgi['kategori_metni'] ?? '',
        'odulMetni'        => $bilgi['odul_metni'] ?? '',
        'basvuruEmail'     => $bilgi['basvuru_email'] ?? '',
        'gecmisKazananlar' => array_map(fn($k) => [
            'yil' => (int)$k['yil'], 'birinci' => $k['birinci'], 'ikinci' => $k['ikinci'],
        ], $kaz),
    ];
}

/** GET /api/yarisma */
function handle_get_yarisma(): void
{
    respond(yarisma_payload());
}

/** GET /api/sayfa/{slug} — statik sayfa (ör. yazi-standartlari). Taslak sayfalar herkese açık değildir. */
function handle_get_sayfa(string $slug): void
{
    $r = null;
    try {
        $st = db()->prepare("SELECT * FROM sayfalar WHERE slug = ? LIMIT 1");
        $st->execute([$slug]);
        $r = $st->fetch();
    } catch (PDOException $e) {
        // sayfalar tablosu henüz yok (migration bekleniyor) -> 404'e düş
    }
    if (!$r) fail('NOT_FOUND', 'Sayfa bulunamadı.', 404);
    // Taslak sayfalar siteye çıkmaz (kolon yoksa varsayılan 'yayinda').
    if (($r['yayin_durumu'] ?? 'yayinda') !== 'yayinda') fail('NOT_FOUND', 'Sayfa bulunamadı.', 404);
    respond(sayfa_out($r));
}

/** GET /api/arama?q= — site içi arama: dergi yazıları + blog yazıları + yazarlar. */
function handle_search(): void
{
    $q = trim((string)($_GET['q'] ?? ''));
    if (mb_strlen($q) < 2) {
        respond(['yazilar' => [], 'araYazilar' => [], 'yazarlar' => []]);
    }
    $like = '%' . $q . '%';

    // Dergi yazıları (taslak sayılardakiler siteye çıkmaz)
    $st = db()->prepare(
        "SELECT y.code, y.baslik, y.spot, y.pdf_url,
                s.code AS sayi_code, s.numara AS sayi_numara, s.ay AS sayi_ay, s.yil AS sayi_yil,
                yz.tam_ad AS yazar_ad, k.ad AS kategori_ad
         FROM yazilar y
         JOIN sayilar s ON s.id = y.sayi_id AND s.durum <> 'taslak'
         LEFT JOIN yazarlar yz ON yz.id = y.yazar_id
         LEFT JOIN kategoriler k ON k.id = y.kategori_id
         WHERE y.baslik LIKE ? OR y.spot LIKE ? OR yz.tam_ad LIKE ? OR y.icerik LIKE ?
         ORDER BY s.yayin_tarihi DESC, y.sira_no ASC
         LIMIT 30"
    );
    $st->execute([$like, $like, $like, $like]);
    $yazilar = array_map(fn($r) => [
        'id'         => (string)$r['code'],
        'baslik'     => $r['baslik'],
        'spot'       => $r['spot'] ?? null,
        'yazarAd'    => $r['yazar_ad'] ?? '',
        'kategoriAd' => $r['kategori_ad'] ?? '',
        'sayiId'     => (string)$r['sayi_code'],
        'sayiNumara' => $r['sayi_numara'],
        'sayiAy'     => $r['sayi_ay'],
        'sayiYil'    => (int)$r['sayi_yil'],
        'pdfUrl'     => $r['pdf_url'] ?? null,
    ], $st->fetchAll());

    // Blog (ara yazılar) — liste şekli, icerik gövdesi olmadan
    $st2 = db()->prepare(
        "SELECT a.*, yz.code AS y_code, yz.ad AS y_ad, yz.soyad AS y_soyad, yz.tam_ad AS y_tam_ad,
                yz.fotograf AS y_fotograf, yz.biyografi AS y_biyografi
         FROM ara_yazilar a
         LEFT JOIN yazarlar yz ON yz.id = a.yazar_id
         WHERE a.baslik LIKE ? OR a.spot LIKE ? OR yz.tam_ad LIKE ? OR a.icerik LIKE ?
         ORDER BY a.yayin_tarihi DESC, a.id DESC
         LIMIT 30"
    );
    $st2->execute([$like, $like, $like, $like]);
    $araYazilar = array_map(function ($r) {
        $yazar = $r['y_code'] !== null ? [
            'id' => (string)$r['y_code'], 'ad' => $r['y_ad'], 'soyad' => $r['y_soyad'],
            'tamAd' => $r['y_tam_ad'], 'fotograf' => $r['y_fotograf'], 'biyografi' => $r['y_biyografi'],
        ] : null;
        return ara_yazi_out($r, $yazar, false);
    }, $st2->fetchAll());

    // Yazarlar
    $st3 = db()->prepare("SELECT * FROM yazarlar WHERE tam_ad LIKE ? ORDER BY tam_ad ASC LIMIT 10");
    $st3->execute([$like]);
    $yazarlar = array_map('yazar_out', $st3->fetchAll());

    respond(['yazilar' => $yazilar, 'araYazilar' => $araYazilar, 'yazarlar' => $yazarlar]);
}

/**
 * GET /api/indeks — Sekans İndeks: yayımlanmış TÜM içeriğin kategorili dökümü.
 * Dergi yazıları (taslak sayılar hariç) + blog yazıları; gövde (icerik) taşınmaz.
 */
function handle_get_indeks(): void
{
    $entries = [];

    $rows = db()->query(
        "SELECT y.code, y.baslik, y.pdf_url, y.yayin_tarihi, y.sira_no,
                s.code AS sayi_code, s.numara AS sayi_numara, s.ay AS sayi_ay, s.yil AS sayi_yil, s.yayin_tarihi AS sayi_tarihi,
                yz.code AS yazar_code, yz.tam_ad AS yazar_ad, k.ad AS kategori_ad
         FROM yazilar y
         JOIN sayilar s ON s.id = y.sayi_id AND s.durum <> 'taslak'
         LEFT JOIN yazarlar yz ON yz.id = y.yazar_id
         LEFT JOIN kategoriler k ON k.id = y.kategori_id
         ORDER BY s.yayin_tarihi DESC, y.sira_no ASC, y.id ASC"
    )->fetchAll();
    foreach ($rows as $r) {
        $entries[] = [
            'tip'         => 'dergi',
            'id'          => (string)$r['code'],
            'baslik'      => $r['baslik'],
            'yazarAd'     => $r['yazar_ad'] ?? '',
            'kategoriAd'  => $r['kategori_ad'] ?? '',
            'sayiId'      => (string)$r['sayi_code'],
            'sayiNumara'  => $r['sayi_numara'],
            'sayiAy'      => $r['sayi_ay'],
            'sayiYil'     => (int)$r['sayi_yil'],
            'yayinTarihi' => $r['yayin_tarihi'] ?? ($r['sayi_tarihi'] ?? ''),
            'pdfUrl'      => $r['pdf_url'] ?? null,
        ];
    }

    $rows2 = db()->query(
        "SELECT a.code, a.baslik, a.kategori_ad, a.yayin_tarihi,
                yz.code AS yazar_code, yz.tam_ad AS yazar_ad
         FROM ara_yazilar a
         LEFT JOIN yazarlar yz ON yz.id = a.yazar_id
         ORDER BY a.yayin_tarihi DESC, a.id DESC"
    )->fetchAll();
    foreach ($rows2 as $r) {
        $entries[] = [
            'tip'         => 'blog',
            'id'          => (string)$r['code'],
            'baslik'      => $r['baslik'],
            'yazarAd'     => $r['yazar_ad'] ?? '',
            'kategoriAd'  => $r['kategori_ad'] ?? '',
            'sayiId'      => null,
            'sayiNumara'  => null,
            'sayiAy'      => null,
            'sayiYil'     => null,
            'yayinTarihi' => $r['yayin_tarihi'] ?? '',
            'pdfUrl'      => null,
        ];
    }

    respond(['girisler' => $entries]);
}

/**
 * Menü ağacını (hiyerarşik) kur. $onlyActive=true => yalnızca aktif öğeler (site);
 * false => tüm öğeler (CMS düzenleme). Tablo yoksa (migration bekleniyor) [] döner.
 */
function menu_tree(bool $onlyActive = true): array
{
    try {
        $where = $onlyActive ? 'WHERE aktif = 1' : '';
        $rows = db()->query(
            "SELECT * FROM menuler $where ORDER BY COALESCE(parent_id, 0) ASC, sira ASC, id ASC"
        )->fetchAll();
    } catch (PDOException $e) {
        return []; // menuler tablosu henüz yok — Header sabit menüye düşer.
    }

    $byParent = [];
    foreach ($rows as $r) {
        $pid = $r['parent_id'] !== null ? (int)$r['parent_id'] : 0;
        $byParent[$pid][] = $r;
    }
    $build = function (int $pid) use (&$build, $byParent): array {
        $out = [];
        foreach ($byParent[$pid] ?? [] as $r) {
            $node = menu_out($r);
            $node['children'] = $build((int)$r['id']);
            $out[] = $node;
        }
        return $out;
    };
    return $build(0);
}

/** GET /api/menu — herkese açık üst menü ağacı (yalnızca aktif öğeler). */
function handle_get_menu(): void
{
    respond(['menu' => menu_tree(true)]);
}

/**
 * Ana sayfa bloklarını (panelleri) sıraya göre getir. $onlyActive=true => site;
 * false => CMS düzenleme (pasifler dahil). Tablo yoksa [] döner (Faz 2 öncesi uyum).
 */
function anasayfa_bloklar_list(bool $onlyActive = true): array
{
    try {
        $where = $onlyActive ? 'WHERE aktif = 1' : '';
        $rows = db()->query("SELECT * FROM anasayfa_bloklar $where ORDER BY sira ASC, id ASC")->fetchAll();
    } catch (PDOException $e) {
        return []; // anasayfa_bloklar tablosu henüz yok — AnaSayfa sabit düzene düşer.
    }
    return array_map('anasayfa_blok_out', $rows);
}

/** GET /api/filtre/{slug} — filtre listeleme sayfası ayarları (aktif olanlar). */
function handle_get_filtre(string $slug): void
{
    $r = null;
    try {
        $st = db()->prepare("SELECT * FROM filtre_sayfalar WHERE slug = ? LIMIT 1");
        $st->execute([$slug]);
        $r = $st->fetch();
    } catch (PDOException $e) {
        // filtre_sayfalar tablosu henüz yok (migration bekleniyor) -> 404
    }
    if (!$r) fail('NOT_FOUND', 'Filtre sayfası bulunamadı.', 404);
    if (isset($r['aktif']) && !(int)$r['aktif']) fail('NOT_FOUND', 'Filtre sayfası bulunamadı.', 404);
    respond(filtre_sayfa_out($r));
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

    // Ana sayfada gösterilecek sayılar: yayındaki + admin'in işaretledikleri (arşivden).
    // Yayındaki her zaman ilk sırada; kolon migration öncesi yoksa yalnızca yayındaki.
    $anasayfaSayilari = $sonSayi ? [$sonSayi] : [];
    try {
        $extraRows = db()->query(
            "SELECT * FROM sayilar
             WHERE anasayfa_goster = 1 AND durum = 'arsiv'
             ORDER BY yayin_tarihi DESC, id DESC"
        )->fetchAll();
        foreach ($extraRows as $r) {
            $anasayfaSayilari[] = build_sayi_payload($r);
        }
    } catch (PDOException $e) {
        // anasayfa_goster kolonu henüz yok (migration bekleniyor) — yalnızca yayındaki sayı.
    }

    // Yalnızca ARŞİV siteye çıkar; taslak (hazırlanan) sayılar herkese açık bootstrap'ta YER ALMAZ.
    $arsivRows = db()->query("SELECT * FROM sayilar WHERE durum = 'arsiv' ORDER BY yayin_tarihi DESC, id DESC")->fetchAll();

    // Tüm ara yazılar (icerik HARİÇ — bootstrap hafif kalsın; detay ayrı çekilir).
    $yazarMap = load_yazar_map();
    $araRows = db()->query("SELECT * FROM ara_yazilar ORDER BY yayin_tarihi DESC, id DESC")->fetchAll();
    $araYazilar = array_map(function ($r) use ($yazarMap) {
        return ara_yazi_out($r, yazar_out($yazarMap[(int)$r['yazar_id']] ?? null), false);
    }, $araRows);

    // Yazar başına toplam yazı sayısı (dergi yazıları [taslak hariç] + blog) — Yazarlar sayfası için.
    $yaziSayilari = [];
    $cnt = db()->query(
        "SELECT yazar_id, SUM(c) AS toplam FROM (
            SELECT y.yazar_id, COUNT(*) AS c
            FROM yazilar y JOIN sayilar s ON s.id = y.sayi_id AND s.durum <> 'taslak'
            GROUP BY y.yazar_id
            UNION ALL
            SELECT a.yazar_id, COUNT(*) AS c FROM ara_yazilar a GROUP BY a.yazar_id
        ) t GROUP BY yazar_id"
    )->fetchAll();
    foreach ($cnt as $c) {
        $yaziSayilari[(int)$c['yazar_id']] = (int)$c['toplam'];
    }
    $yazarlar = array_map(function ($r) use ($yaziSayilari) {
        $out = yazar_out($r);
        $out['yaziSayisi'] = $yaziSayilari[(int)$r['id']] ?? 0;
        return $out;
    }, db()->query("SELECT * FROM yazarlar ORDER BY id ASC")->fetchAll());

    $kategoriler = array_map('kategori_out', db()->query("SELECT * FROM kategoriler ORDER BY sira_no ASC, id ASC")->fetchAll());

    $yarismasiBilgi = yarisma_payload();

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
        'anasayfaSayilari' => $anasayfaSayilari,
        'arsivSayilari'    => array_map('arsiv_out', $arsivRows),
        'araYazilar'       => $araYazilar,
        'yazarlar'         => $yazarlar,
        'kategoriler'      => $kategoriler,
        'menu'             => menu_tree(true),           // dinamik üst menü (tablo yoksa [] -> Header sabit menüye düşer)
        'anasayfaBloklar'  => anasayfa_bloklar_list(true), // ana sayfa panelleri (tablo yoksa [] -> sabit düzen)
        'yarismasiBilgi'   => $yarismasiBilgi,
        'hakkimizdaIcerik' => $hakkimizdaIcerik,
    ]);
}
