-- =============================================================================
-- Migration: Faz 13 — çoklu yazar + kapak görselinin üst bantta görünürlüğü.
--
--   1) kapak_ustte (yazilar / ara_yazilar)
--      Kapak görseli yüklemek editörün inisiyatifinde; artık bu görselin yazı
--      sayfasının EN ÜSTÜNDEKİ bantta görünüp görünmeyeceği de ayrı bir seçenek.
--      Varsayılan AÇIK (1): kapak görseli varsa üstte gösterilir. Editör
--      kapatırsa görsel yalnızca listelerde/dizin görseli üretiminde kullanılır.
--
--   2) yazi_yazarlari / arayazi_yazarlari (çoklu yazar)
--      Bir yazıya birden fazla yazar atanabilir. Birincil yazar (kartlarda ve
--      "yazarın diğer yazıları" gibi yerlerde kullanılan) yazilar.yazar_id /
--      ara_yazilar.yazar_id olarak KORUNUR; join tablo tüm yazarları (birincil
--      dahil, sira_no ile sıralı) tutar. Mevcut tekil yazarlar backfill edilir.
--
-- CANLI VERİDE ÇALIŞTIRMADAN ÖNCE YEDEK ALIN (phpMyAdmin -> Export).
-- Idempotent: ADD COLUMN IF NOT EXISTS + CREATE TABLE IF NOT EXISTS +
-- INSERT IGNORE. phpMyAdmin -> SQL sekmesine yapıştırıp çalıştırın.
-- =============================================================================

/* --- 1) Kapak görselinin üst bantta görünürlüğü ---------------------------- */

ALTER TABLE yazilar
  ADD COLUMN IF NOT EXISTS kapak_ustte TINYINT(1) NOT NULL DEFAULT 1 AFTER dizin_gorseli;

ALTER TABLE ara_yazilar
  ADD COLUMN IF NOT EXISTS kapak_ustte TINYINT(1) NOT NULL DEFAULT 1 AFTER kapak_gorseli;

/* --- 2) Çoklu yazar ------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS yazi_yazarlari (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  yazi_id   BIGINT UNSIGNED NOT NULL,
  yazar_id  BIGINT UNSIGNED NOT NULL,
  sira_no   INT             NOT NULL DEFAULT 0,   -- 0 = birincil yazar
  PRIMARY KEY (id),
  UNIQUE KEY uq_yazi_yazar (yazi_id, yazar_id),
  KEY idx_yazi_yazar_yazar (yazar_id),
  CONSTRAINT fk_yy_yazi  FOREIGN KEY (yazi_id)  REFERENCES yazilar (id)  ON DELETE CASCADE,
  CONSTRAINT fk_yy_yazar FOREIGN KEY (yazar_id) REFERENCES yazarlar (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS arayazi_yazarlari (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  arayazi_id  BIGINT UNSIGNED NOT NULL,
  yazar_id    BIGINT UNSIGNED NOT NULL,
  sira_no     INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_arayazi_yazar (arayazi_id, yazar_id),
  KEY idx_arayazi_yazar_yazar (yazar_id),
  CONSTRAINT fk_ay_yazi  FOREIGN KEY (arayazi_id) REFERENCES ara_yazilar (id) ON DELETE CASCADE,
  CONSTRAINT fk_ay_yazar FOREIGN KEY (yazar_id)   REFERENCES yazarlar (id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backfill: mevcut tekil yazarları join tabloya birincil (sira_no=0) olarak taşı.
INSERT IGNORE INTO yazi_yazarlari (yazi_id, yazar_id, sira_no)
SELECT id, yazar_id, 0 FROM yazilar WHERE yazar_id IS NOT NULL;

INSERT IGNORE INTO arayazi_yazarlari (arayazi_id, yazar_id, sira_no)
SELECT id, yazar_id, 0 FROM ara_yazilar WHERE yazar_id IS NOT NULL;
