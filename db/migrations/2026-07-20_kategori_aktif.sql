-- =============================================================================
-- Migration: Kategori aktif/pasif (Faz 8 — feedback maddesi 5).
--   Kategoriler sıralanabilir (sira_no zaten var) ve aktif/pasif yapılabilir.
--   Bu migration yalnızca `aktif` kolonunu ekler.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Bir kez çalıştırılır (kolon zaten varsa update.sh atlar).
-- =============================================================================

ALTER TABLE kategoriler
  ADD COLUMN aktif TINYINT(1) NOT NULL DEFAULT 1 AFTER sira_no;
