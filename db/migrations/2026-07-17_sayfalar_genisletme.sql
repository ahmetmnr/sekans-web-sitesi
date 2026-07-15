-- =============================================================================
-- Migration: Sabit sayfa CMS genişletme (Faz 3 — müşteri feedback maddesi 4).
--   `sayfalar` tablosuna admin panelden yönetilebilir alanlar:
--     - kisa_aciklama : sayfa kısa açıklaması
--     - seo_baslik    : SEO başlığı
--     - seo_aciklama  : SEO açıklaması
--     - yayin_durumu  : taslak | yayinda (taslak sayfalar siteye çıkmaz)
--     - sira          : listedeki sıralama
--   URL adresi = slug (mevcut). Yeni sabit sayfalar admin panelden oluşturulur.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır (kolonlar zaten varsa update.sh atlar).
-- =============================================================================

ALTER TABLE sayfalar
  ADD COLUMN kisa_aciklama VARCHAR(500) NULL                             AFTER baslik,
  ADD COLUMN seo_baslik    VARCHAR(255) NULL                             AFTER icerik,
  ADD COLUMN seo_aciklama  VARCHAR(500) NULL                             AFTER seo_baslik,
  ADD COLUMN yayin_durumu  ENUM('taslak','yayinda') NOT NULL DEFAULT 'yayinda' AFTER seo_aciklama,
  ADD COLUMN sira          INT NOT NULL DEFAULT 0                        AFTER yayin_durumu;
