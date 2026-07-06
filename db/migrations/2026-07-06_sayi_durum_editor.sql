-- =============================================================================
-- Migration: sayilar tablosuna sayı yaşam döngüsü (durum) + sorumlu editör
-- Tarih: 2026-07-06
-- Amaç: Tek "aktif sayı" (ikili is_current) modelinden, birden çok sayının
--       PARALEL hazırlanabildiği (taslak/yayinda/arsiv) modele geçiş.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır. phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

-- 1) Kolonlar ------------------------------------------------------------------
ALTER TABLE sayilar
  ADD COLUMN durum     ENUM('taslak','yayinda','arsiv') NOT NULL DEFAULT 'taslak' AFTER is_current,
  ADD COLUMN editor_id BIGINT UNSIGNED NULL AFTER durum;

-- 2) Mevcut veriyi taşı (is_current -> durum) ---------------------------------
--    is_current=1  => canlı sayı  => 'yayinda'
--    is_current=0  => geçmiş sayı => 'arsiv'
UPDATE sayilar SET durum = 'yayinda' WHERE is_current = 1;
UPDATE sayilar SET durum = 'arsiv'   WHERE is_current = 0;

-- 3) İndeksler + FK ------------------------------------------------------------
ALTER TABLE sayilar
  ADD KEY idx_sayilar_durum (durum),
  ADD KEY idx_sayilar_editor (editor_id),
  ADD CONSTRAINT fk_sayilar_editor
      FOREIGN KEY (editor_id) REFERENCES kullanicilar (id)
      ON UPDATE CASCADE ON DELETE SET NULL;

-- Not: is_current kolonu KORUNUR ve durum='yayinda' ile senkron tutulur
-- (uygulama katmanı, geriye dönük uyumluluk için ikisini birlikte günceller).
