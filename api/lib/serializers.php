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
 * Sayi { id, numara, ay, yil, tamBaslik, kapakGorseli, pdfUrl, kunye?, onsoz?, yazilar[], yayinTarihi }
 * $yazilar önceden serileştirilmiş Yazi[] dizisidir.
 */
function sayi_out(array $r, array $yazilar): array
{
    return [
        'id'           => (string)$r['code'],
        'numara'       => $r['numara'],
        'ay'           => $r['ay'],
        'yil'          => (int)$r['yil'],
        'tamBaslik'    => $r['tam_baslik'] ?? '',
        'kapakGorseli' => $r['kapak_gorseli'] ?? '',
        'pdfUrl'       => $r['pdf_url'] ?? '',
        'kunye'        => $r['kunye'] ?? null,
        'onsoz'        => $r['onsoz'] ?? null,
        'yazilar'      => $yazilar,
        'yayinTarihi'  => $r['yayin_tarihi'] ?? '',
    ];
}

/** ArsivSayi { id, numara, ay, yil, kapakGorseli, pdfUrl, yayinTarihi } */
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
