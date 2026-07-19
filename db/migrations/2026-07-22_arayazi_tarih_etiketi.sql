-- =============================================================================
-- Migration: ara_yazilar.tarih_etiketi (Faz 10 — serbest metin tarih etiketi).
--   Blog/bölüm kartlarında tarih normalde `yayin_tarihi`den biçimlenir ("17 Mayıs
--   2016"). Bazı içeriklerde tarih bir ARALIK ya da serbest metin olmalı
--   (örn. "Şubat - Mart 2005", "Kasım 2009"). Bunun için opsiyonel serbest metin
--   alanı: doluysa kartta/detayta bu metin gösterilir; boşsa yayin_tarihi biçimlenir.
--   `yayin_tarihi` (gerçek tarih) SIRALAMA için korunur — yani hem "Şubat - Mart
--   2005" yazılır hem de "En eski/En yeni" sıralaması doğru çalışır.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Idempotent: ADD COLUMN IF NOT EXISTS.
-- phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

ALTER TABLE ara_yazilar
  ADD COLUMN IF NOT EXISTS tarih_etiketi VARCHAR(80) NULL AFTER yayin_tarihi;
