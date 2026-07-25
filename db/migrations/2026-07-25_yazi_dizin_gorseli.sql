-- =============================================================================
-- Migration: Yazıya ayrı "dizin görseli" (Faz 12.1).
--   Şimdiye kadar yazının TEK görseli vardı (kapak_gorseli): hem detay
--   sayfasının üstündeki geniş kapak hem de sayı ana sayfasındaki içindekiler
--   listesinin küçük kare görseli aynı dosyaydı; geniş kapaklar listede
--   kırpılıyordu. Artık liste için ayrı bir görsel girilebilir:
--     dizin_gorseli boş ise kapak_gorseli kullanılır (geriye dönük uyum),
--     ikisi de boşsa listede görsel gösterilmez.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Idempotent: ADD COLUMN IF NOT EXISTS.
-- phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

ALTER TABLE yazilar
  ADD COLUMN IF NOT EXISTS dizin_gorseli VARCHAR(512) NULL AFTER kapak_gorseli;
