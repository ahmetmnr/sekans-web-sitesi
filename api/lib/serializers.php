<?php
/**
 * DB satırlarını (snake_case) frontend TS tiplerine (camelCase) dönüştürür.
 * Tip kaynakları: src/types/index.ts
 * KRİTİK: dış kimlikler `code`/`slug` üzerinden korunur; id alanı TS'te string'tir,
 * bu yüzden eski string id'yi (code) `id` olarak döndürüyoruz ki frontend hiç değişmesin.
 */
declare(strict_types=1);

/** Yazar { id, ad, soyad, tamAd, fotograf?, biyografi? } */
function yazar_out(?array $r): ?array
{
    if (!$r) return null;
    return [
        'id'        => (string)$r['code'],
        'ad'        => $r['ad'],
        'soyad'     => $r['soyad'],
        'tamAd'     => $r['tam_ad'],
        'fotograf'  => $r['fotograf'] ?? null,
        'biyografi' => $r['biyografi'] ?? null,
    ];
}

/**
 * Menü öğesi { id, parentId, gorunenBaslik, sistemBaslik, tur, hedef, sira,
 *              aktif, otomatik, yeniSekme }. children ağaç kurucuda eklenir.
 * id/parentId frontend'de string (menuler.id numeric AUTO_INCREMENT).
 */
function menu_out(array $r): array
{
    return [
        'id'            => (string)$r['id'],
        'parentId'      => $r['parent_id'] !== null ? (string)$r['parent_id'] : null,
        'gorunenBaslik' => $r['gorunen_baslik'],
        'sistemBaslik'  => $r['sistem_baslik'] ?? null,
        'tur'           => $r['tur'],
        'hedef'         => $r['hedef'] ?? null,
        'sira'          => (int)$r['sira'],
        'aktif'         => (bool)(int)$r['aktif'],
        'otomatik'      => (bool)(int)$r['otomatik'],
        'yeniSekme'     => (bool)(int)$r['yeni_sekme'],
    ];
}

/**
 * Ana sayfa bloğu { id, tip, baslik, sira, aktif, ayar }.
 * ayar DB'de JSON metnidir; çözülüp obje olarak döndürülür (bozuksa {}).
 */
function anasayfa_blok_out(array $r): array
{
    $ayar = [];
    if (!empty($r['ayar'])) {
        $d = json_decode((string)$r['ayar'], true);
        if (is_array($d)) $ayar = $d;
    }
    return [
        'id'     => (string)$r['id'],
        'tip'    => $r['tip'],
        'baslik' => $r['baslik'] ?? '',
        'sira'   => (int)$r['sira'],
        'aktif'  => (bool)(int)$r['aktif'],
        'ayar'   => (object)$ayar,
    ];
}

/** Kategori { id, ad, slug } */
function kategori_out(?array $r): ?array
{
    if (!$r) return null;
    return [
        'id'   => (string)$r['code'],
        'ad'   => $r['ad'],
        'slug' => $r['slug'],
    ];
}

/**
 * Yazi { id, baslik, spot?, icerik?, yazar, kategori, sayiId, siraNo, pdfUrl?, kapakGorseli?, yayinTarihi? }
 * $yazar ve $kategori önceden serileştirilmiş (gömülü) objelerdir.
 */
function yazi_out(array $r, ?array $yazar, ?array $kategori, string $sayiCode): array
{
    return [
        'id'           => (string)$r['code'],
        'baslik'       => $r['baslik'],
        'spot'         => $r['spot'] ?? null,
        'icerik'       => $r['icerik'] ?? null,
        'yazar'        => $yazar,
        'kategori'     => $kategori,
        'sayiId'       => $sayiCode,
        'siraNo'       => (int)$r['sira_no'],
        'pdfUrl'       => $r['pdf_url'] ?? null,
        'kapakGorseli' => $r['kapak_gorseli'] ?? null,
        'yayinTarihi'  => $r['yayin_tarihi'] ?? null,
    ];
}

/**
 * Sayi { id, numara, ay, yil, tamBaslik, kapakGorseli, pdfUrl, kunye?, onsoz?,
 *        durum, editorId?, editorAd?, yazilar[], yayinTarihi }
 * $yazilar önceden serileştirilmiş Yazi[] dizisidir.
 * durum/editor alanları $r'de yoksa güvenli varsayılanlara düşer (geriye dönük uyum).
 * editor_ad alanı yalnızca kullanicilar ile JOIN yapılan sorgularda bulunur.
 */
function sayi_out(array $r, array $yazilar): array
{
    return [
        'id'           => (string)$r['code'],
        'numara'       => $r['numara'],
        'ay'           => $r['ay'],
        'yil'          => (int)$r['yil'],
        'tamBaslik'    => $r['tam_baslik'] ?? '',
        // Menü/ana sayfa alanları: kolonlar migration öncesi yoksa güvenli varsayılanlar.
        'menuEtiket'      => $r['menu_etiket'] ?? null,
        'menuGoster'      => isset($r['menu_goster']) ? (bool)(int)$r['menu_goster'] : true,
        'anasayfaGoster'  => isset($r['anasayfa_goster']) ? (bool)(int)$r['anasayfa_goster'] : false,
        'kapakGorseli' => $r['kapak_gorseli'] ?? '',
        'pdfUrl'       => $r['pdf_url'] ?? '',
        'kunye'        => $r['kunye'] ?? null,
        'onsoz'        => $r['onsoz'] ?? null,
        'durum'        => $r['durum'] ?? 'yayinda',
        'editorId'     => isset($r['editor_id']) && $r['editor_id'] !== null ? (string)$r['editor_id'] : null,
        'editorAd'     => $r['editor_ad'] ?? null,
        'yazilar'      => $yazilar,
        'yayinTarihi'  => $r['yayin_tarihi'] ?? '',
    ];
}

/** ArsivSayi { id, numara, ay, yil, kapakGorseli, pdfUrl, yayinTarihi, menuEtiket?, menuGoster?, anasayfaGoster? } */
function arsiv_out(array $r): array
{
    return [
        'id'           => (string)$r['code'],
        'numara'       => $r['numara'],
        'ay'           => $r['ay'],
        'yil'          => (int)$r['yil'],
        'kapakGorseli' => $r['kapak_gorseli'] ?? '',
        'pdfUrl'       => $r['pdf_url'] ?? '',
        'yayinTarihi'  => $r['yayin_tarihi'] ?? '',
        'menuEtiket'     => $r['menu_etiket'] ?? null,
        'menuGoster'     => isset($r['menu_goster']) ? (bool)(int)$r['menu_goster'] : true,
        'anasayfaGoster' => isset($r['anasayfa_goster']) ? (bool)(int)$r['anasayfa_goster'] : false,
    ];
}

/**
 * AraYazi { id, baslik, spot, icerik, yazar, kategori(STRING), kapakGorseli?, yayinTarihi, slug }
 * kategori TS'te düz string'tir => kategori_ad (ham ad) veya çözülen kategori adını döndürürüz.
 * $includeIcerik=false ise liste görünümünde ağır HTML gövdesi atlanır.
 */
function ara_yazi_out(array $r, ?array $yazar, bool $includeIcerik = true): array
{
    $out = [
        'id'           => (string)$r['code'],
        'baslik'       => $r['baslik'],
        'spot'         => $r['spot'] ?? '',
        'yazar'        => $yazar,
        // kategori: çözülen kategori adı (varsa) yoksa ham kategori_ad
        'kategori'     => $r['kategori_ad'] ?? '',
        'kapakGorseli' => $r['kapak_gorseli'] ?? null,
        'yayinTarihi'  => $r['yayin_tarihi'] ?? '',
        'slug'         => $r['slug'],
    ];
    if ($includeIcerik) {
        $out['icerik'] = $r['icerik'] ?? '';
    }
    return $out;
}

/**
 * Kullanici { id, username, role, name, email?, isActive, lastLoginAt? }
 * password_hash ASLA döndürülmez.
 */
function kullanici_out(array $r): array
{
    return [
        'id'          => (string)$r['id'],
        'username'    => $r['username'],
        'role'        => $r['role'],
        'name'        => $r['name'],
        'email'       => $r['email'] ?? null,
        'isActive'    => (bool)((int)$r['is_active']),
        'lastLoginAt' => $r['last_login_at'] ?? null,
    ];
}

/** Editör seçim listesi için hafif çıktı { id, name, role } (atama açılır menüsü). */
function editor_out(array $r): array
{
    return [
        'id'   => (string)$r['id'],
        'name' => $r['name'],
        'role' => $r['role'],
    ];
}
