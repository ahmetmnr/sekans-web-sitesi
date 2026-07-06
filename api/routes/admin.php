<?php
/**
 * Admin uçları: export / import / reset. (admin rolü + CSRF)
 * Export, eski exportData() ile aynı toplu JSON şeklini döndürür.
 * OpenAI anahtarı DB'de olmadığından export'a asla sızmaz.
 */
declare(strict_types=1);

require_once __DIR__ . '/../lib/helpers.php';
require_once __DIR__ . '/../lib/auth_guard.php';
require_once __DIR__ . '/public_reads.php';

/** GET /api/export */
function handle_export(): void
{
    $current = db()->query("SELECT * FROM sayilar WHERE durum = 'yayinda' ORDER BY id DESC LIMIT 1")->fetch();
    $sonSayi = $current ? build_sayi_payload($current) : null;
    // Not: taslak (hazırlanan) sayılar yedeğe henüz dahil edilmez; yalnızca arşiv + yayında.
    $arsiv = array_map('arsiv_out', db()->query("SELECT * FROM sayilar WHERE durum = 'arsiv' ORDER BY yayin_tarihi DESC, id DESC")->fetchAll());

    // Ara yazılar TAM içerikle (yedek için).
    $yazarMap = load_yazar_map();
    $araYazilar = array_map(
        fn($r) => ara_yazi_out($r, yazar_out($yazarMap[(int)$r['yazar_id']] ?? null), true),
        db()->query("SELECT * FROM ara_yazilar ORDER BY yayin_tarihi DESC, id DESC")->fetchAll()
    );

    $yazarlar = array_map('yazar_out', db()->query("SELECT * FROM yazarlar ORDER BY id ASC")->fetchAll());
    $kategoriler = array_map('kategori_out', db()->query("SELECT * FROM kategoriler ORDER BY sira_no ASC")->fetchAll());

    $bilgi = db()->query("SELECT * FROM yarisma_bilgi WHERE id=1")->fetch() ?: [];
    $kaz = db()->query("SELECT yil,birinci,ikinci FROM yarisma_kazananlar ORDER BY yil DESC")->fetchAll();
    $yarismasiBilgi = [
        'baslik' => $bilgi['baslik'] ?? '', 'aciklama' => $bilgi['aciklama'] ?? '',
        'gecmisKazananlar' => array_map(fn($k) => ['yil'=>(int)$k['yil'],'birinci'=>$k['birinci'],'ikinci'=>$k['ikinci']], $kaz),
    ];
    $h = db()->query("SELECT * FROM hakkimizda WHERE id=1")->fetch() ?: [];
    $hakkimizdaIcerik = [
        'baslik'=>$h['baslik']??'','icerik'=>$h['icerik']??'',
        'iletisim'=>['email'=>$h['iletisim_email']??'','adres'=>$h['iletisim_adres']??'',
            'sosyal'=>['twitter'=>$h['sosyal_twitter']??'','instagram'=>$h['sosyal_instagram']??'','facebook'=>$h['sosyal_facebook']??'']],
    ];

    respond([
        'sonSayi' => $sonSayi,
        'arsivSayilari' => $arsiv,
        'araYazilar' => $araYazilar,
        'yazarlar' => $yazarlar,
        'kategoriler' => $kategoriler,
        'yarismasiBilgi' => $yarismasiBilgi,
        'hakkimizdaIcerik' => $hakkimizdaIcerik,
        'exportDate' => date('c'),
    ]);
}

/** POST /api/import — toplu geri yükleme (kullanıcılar/oturumlar dokunulmaz). */
function handle_import(array $b): void
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
        // İçerik tablolarını temizle (kullanıcılar/giris_denemeleri/ayarlar korunur).
        $pdo->exec("DELETE FROM yarisma_kazananlar");
        $pdo->exec("DELETE FROM ara_yazilar");
        $pdo->exec("DELETE FROM yazilar");
        $pdo->exec("DELETE FROM sayilar");
        $pdo->exec("DELETE FROM kategoriler");
        $pdo->exec("DELETE FROM yazarlar");

        import_seed_arrays($pdo, $b);

        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        fail('IMPORT_FAILED', 'İçe aktarma başarısız: ' . $e->getMessage(), 500);
    }
    respond(['imported' => true]);
}

/** POST /api/reset — varsayılan tohuma sıfırlama gerçek veriyle değil; sadece içeriği boşaltır. */
function handle_reset(): void
{
    // Güvenli reset: tüm içerik tablolarını boşalt (kullanıcılar korunur).
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
        $pdo->exec("DELETE FROM yarisma_kazananlar");
        $pdo->exec("DELETE FROM ara_yazilar");
        $pdo->exec("DELETE FROM yazilar");
        $pdo->exec("DELETE FROM sayilar");
        $pdo->exec("DELETE FROM kategoriler");
        $pdo->exec("DELETE FROM yazarlar");
        $pdo->exec("UPDATE yarisma_bilgi SET baslik='', aciklama=NULL WHERE id=1");
        $pdo->exec("UPDATE hakkimizda SET baslik='', icerik=NULL WHERE id=1");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        fail('RESET_FAILED', 'Sıfırlama başarısız.', 500);
    }
    respond(['reset' => true]);
}

/** Toplu dizilerden DB'yi yeniden doldur (import için). */
function import_seed_arrays(PDO $pdo, array $b): void
{
    // yazarlar
    $yi = $pdo->prepare("INSERT INTO yazarlar (code, ad, soyad, tam_ad, slug, fotograf, biyografi) VALUES (?,?,?,?,?,?,?)");
    foreach (($b['yazarlar'] ?? []) as $y) {
        $tam = $y['tamAd'] ?? trim(($y['ad']??'').' '.($y['soyad']??''));
        $yi->execute([(string)($y['id']??gen_code('yzr')), $y['ad']??'', $y['soyad']??'', $tam,
            slugify($tam), $y['fotograf']??null, $y['biyografi']??null]);
    }
    // kategoriler
    $ki = $pdo->prepare("INSERT INTO kategoriler (code, ad, slug, sira_no) VALUES (?,?,?,?)");
    foreach (($b['kategoriler'] ?? []) as $i => $k) {
        $ki->execute([(string)($k['id']??gen_code('kat')), $k['ad']??'', $k['slug']??slugify($k['ad']??''), $i+1]);
    }
    // sayilar (sonSayi + arsiv) — durum, is_current ile senkron yazılır.
    $si = $pdo->prepare("INSERT INTO sayilar (code, numara, ay, yil, tam_baslik, kapak_gorseli, pdf_url, kunye, onsoz, is_current, durum, yayin_tarihi) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
    $son = $b['sonSayi'] ?? null;
    if ($son) {
        $si->execute([(string)($son['id']??'son'), $son['numara']??'', $son['ay']??'', (int)($son['yil']??0),
            $son['tamBaslik']??'', $son['kapakGorseli']??'', $son['pdfUrl']??'', $son['kunye']??null, $son['onsoz']??null,
            1, 'yayinda', norm_date($son['yayinTarihi']??null)]);
    }
    foreach (($b['arsivSayilari'] ?? []) as $a) {
        $si->execute([(string)($a['id']??gen_code('sayi')), $a['numara']??'', $a['ay']??'', (int)($a['yil']??0),
            '', $a['kapakGorseli']??'', $a['pdfUrl']??'', null, null, 0, 'arsiv', norm_date($a['yayinTarihi']??null)]);
    }
    // yazilar (sonSayi.yazilar)
    if ($son && !empty($son['yazilar'])) {
        $sayiId = (int)$pdo->query("SELECT id FROM sayilar WHERE is_current=1 LIMIT 1")->fetchColumn();
        $zi = $pdo->prepare("INSERT INTO yazilar (code, slug, baslik, spot, icerik, yazar_id, kategori_id, sayi_id, sira_no, pdf_url, kapak_gorseli, yayin_tarihi) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
        foreach ($son['yazilar'] as $z) {
            $yid = id_by_code('yazarlar', (string)($z['yazar']['id'] ?? ''));
            $kid = id_by_code('kategoriler', (string)($z['kategori']['id'] ?? ''));
            $zi->execute([(string)($z['id']??gen_code('yazi')), slugify($z['baslik']??''), $z['baslik']??'', $z['spot']??null,
                $z['icerik']??null, $yid ?: null, $kid ?: null, $sayiId, (int)($z['siraNo']??0),
                $z['pdfUrl']??null, $z['kapakGorseli']??null, norm_date($z['yayinTarihi']??null)]);
        }
    }
    // ara_yazilar
    $ai = $pdo->prepare("INSERT INTO ara_yazilar (code, slug, baslik, spot, icerik, yazar_id, kategori_id, kategori_ad, kapak_gorseli, yayin_tarihi) VALUES (?,?,?,?,?,?,?,?,?,?)");
    foreach (($b['araYazilar'] ?? []) as $a) {
        $yid = id_by_code('yazarlar', (string)($a['yazar']['id'] ?? ''));
        $kad = (string)($a['kategori'] ?? '');
        $ai->execute([(string)($a['id']??gen_code('ay')), $a['slug']??slugify($a['baslik']??''), $a['baslik']??'', $a['spot']??'',
            $a['icerik']??'', $yid ?: null, resolve_kategori_id_by_ad($kad), $kad ?: null,
            $a['kapakGorseli']??null, norm_date($a['yayinTarihi']??null)]);
    }
    // yarisma + hakkimizda
    if (!empty($b['yarismasiBilgi'])) {
        $yb = $b['yarismasiBilgi'];
        $pdo->prepare("UPDATE yarisma_bilgi SET baslik=?, aciklama=? WHERE id=1")->execute([$yb['baslik']??'', $yb['aciklama']??'']);
        $kz = $pdo->prepare("INSERT INTO yarisma_kazananlar (yil, birinci, ikinci, sira_no) VALUES (?,?,?,?)");
        foreach (($yb['gecmisKazananlar'] ?? []) as $i => $k) {
            $kz->execute([(int)($k['yil']??0), $k['birinci']??'', $k['ikinci']??'', $i]);
        }
    }
    if (!empty($b['hakkimizdaIcerik'])) {
        $h = $b['hakkimizdaIcerik']; $il = $h['iletisim']??[]; $so = $il['sosyal']??[];
        $pdo->prepare("UPDATE hakkimizda SET baslik=?, icerik=?, iletisim_email=?, iletisim_adres=?, sosyal_twitter=?, sosyal_instagram=?, sosyal_facebook=? WHERE id=1")
            ->execute([$h['baslik']??'', $h['icerik']??'', $il['email']??'', $il['adres']??'', $so['twitter']??'', $so['instagram']??'', $so['facebook']??'']);
    }
}
