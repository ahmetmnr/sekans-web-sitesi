-- =============================================================================
-- Sekans Dergisi - MySQL/MariaDB Schema (cPanel shared hosting)
-- Charset: utf8mb4 / Collation: utf8mb4_unicode_ci (full Turkish + emoji safe)
-- Engine: InnoDB (FK support, transactions)
-- Import via phpMyAdmin -> Import, or as part of one-time seed.php.
--
-- ID STRATEGY:
--   Every table uses BIGINT UNSIGNED AUTO_INCREMENT `id` as the internal PK.
--   External-facing identifiers from the old app are preserved as `code`/`slug`
--   columns with UNIQUE indexes so existing URLs, PDF names and references keep
--   working (e.g. sayi code 'e27', kategori slug 'elestiri', araYazi slug, etc.).
--   FKs reference the internal numeric id, never the human-facing code.
--
-- NOTE ON cPanel DB NAMES: phpMyAdmin/cPanel prefixes the database itself
-- (e.g. cpuser_sekans). These statements run INSIDE that database, so table
-- names are unprefixed. Do NOT add USE/CREATE DATABASE here - cPanel users
-- import into a pre-created DB.
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- yazarlar (authors) — Yazar { ad, soyad, tamAd, fotograf?, biyografi? }
-- tamAd is denormalized in source data; kept as stored column for fidelity but
-- can be regenerated from ad + soyad.
-- -----------------------------------------------------------------------------
CREATE TABLE yazarlar (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(40)     NOT NULL,                 -- old string id: '1'..'16'
  ad          VARCHAR(120)    NOT NULL,                 -- first name(s)
  soyad       VARCHAR(120)    NOT NULL,                 -- last name(s)
  tam_ad      VARCHAR(255)    NOT NULL,                 -- full display name (tamAd)
  slug        VARCHAR(160)    NOT NULL,                 -- url slug for /yazardetay
  fotograf    VARCHAR(512)    NULL,                     -- image path/URL (fotograf)
  biyografi   TEXT            NULL,                      -- bio (biyografi)
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_yazarlar_code (code),
  UNIQUE KEY uq_yazarlar_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- kategoriler (categories) — Kategori { ad, slug }
-- Both Yazi.kategori (object) and AraYazi.kategori (free string == ad) resolve here.
-- -----------------------------------------------------------------------------
CREATE TABLE kategoriler (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code        VARCHAR(40)     NOT NULL,                 -- old string id: '1'..'12'
  ad          VARCHAR(120)    NOT NULL,                 -- display name e.g. 'Kuram / Yorum'
  slug        VARCHAR(160)    NOT NULL,                 -- e.g. 'kuram-yorum'
  sira_no     INT             NOT NULL DEFAULT 0,        -- display order
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kategoriler_code (code),
  UNIQUE KEY uq_kategoriler_slug (slug),
  UNIQUE KEY uq_kategoriler_ad (ad)                     -- ad must be unique so AraYazi string match is deterministic
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- sayilar (issues) — unifies sonSayi (Sayi) + arsivSayilari (ArsivSayi)
-- "current issue" is a flag (is_current). Archive-only issues simply have empty
-- yazilar and is_current=0. kunye/onsoz are only populated for full issues.
-- A partial unique index would be ideal (only one is_current=1) but MySQL lacks
-- filtered indexes; enforce single-current at the app layer / seed.
-- -----------------------------------------------------------------------------
CREATE TABLE sayilar (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code          VARCHAR(40)     NOT NULL,               -- old id == numara: 'e27', 'e26' ...
  numara        VARCHAR(40)     NOT NULL,               -- display number 'e27' (== code here)
  ay            VARCHAR(40)     NOT NULL,               -- month name 'Temmuz'
  yil           SMALLINT UNSIGNED NOT NULL,             -- year 2025
  tam_baslik    VARCHAR(255)    NULL,                   -- 'Temmuz 2025 | Sayı e27' (tamBaslik)
  menu_etiket   VARCHAR(120)    NULL,                   -- "Sayılar" menüsünde görünen özel ad (ör. 'Lynch Sayısı'); boşsa 'Sayı e27'
  menu_goster   TINYINT(1)      NOT NULL DEFAULT 1,     -- "Sayılar" menüsünde listelensin mi (admin panelden)
  anasayfa_goster TINYINT(1)    NOT NULL DEFAULT 0,     -- ana sayfada yayındaki sayıya EK olarak göster (çift sayı düzeni)
  kapak_gorseli VARCHAR(512)    NULL,                   -- cover image path
  pdf_url       VARCHAR(512)    NULL,                   -- issue PDF path
  kunye         TEXT            NULL,                   -- credits / colophon (full issue only)
  onsoz         TEXT            NULL,                   -- editorial / foreword (full issue only)
  is_current    TINYINT(1)      NOT NULL DEFAULT 0,     -- 1 == sonSayi (durum='yayinda' ile SENKRON tutulur)
  -- Sayı yaşam döngüsü: birden çok 'taslak' aynı anda paralel hazırlanabilir.
  --   taslak  = hazırlanıyor, siteye ÇIKMAZ, yazıları düzenlenebilir (birden çok olabilir)
  --   yayinda = canlı/güncel sayı (tam olarak 1 tane, is_current=1 ile eş)
  --   arsiv   = geçmiş yayımlanmış sayı (siteye PDF/arşiv üzerinden çıkar)
  durum         ENUM('taslak','yayinda','arsiv') NOT NULL DEFAULT 'taslak',
  editor_id     BIGINT UNSIGNED NULL,                   -- sorumlu editör (FK -> kullanicilar.id); sadece etiket
  yayin_tarihi  DATE            NULL,                   -- publish date '2025-07-01'
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sayilar_code (code),
  KEY idx_sayilar_is_current (is_current),
  KEY idx_sayilar_durum (durum),
  KEY idx_sayilar_editor (editor_id),
  KEY idx_sayilar_yil (yil)
  -- fk_sayilar_editor (editor_id -> kullanicilar.id) kullanicilar tablosu
  -- tanımlandıktan SONRA, dosyanın altında ALTER TABLE ile eklenir.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- yazilar (issue articles) — Yazi { baslik, spot?, icerik?(html), yazar(FK),
--   kategori(FK), sayiId(FK), siraNo, pdfUrl?, kapakGorseli?, yayinTarihi? }
-- icerik is TipTap/BlockNote HTML (may embed <img>) -> LONGTEXT.
-- -----------------------------------------------------------------------------
CREATE TABLE yazilar (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code          VARCHAR(60)     NOT NULL,               -- old id 'e27-01'
  slug          VARCHAR(200)    NULL,                   -- optional url slug (derived)
  baslik        VARCHAR(500)    NOT NULL,               -- title
  spot          TEXT            NULL,                   -- standfirst / dek
  icerik        LONGTEXT        NULL,                   -- HTML body
  yazar_id      BIGINT UNSIGNED NOT NULL,               -- FK -> yazarlar.id (Yazi.yazar)
  kategori_id   BIGINT UNSIGNED NOT NULL,               -- FK -> kategoriler.id (Yazi.kategori)
  sayi_id       BIGINT UNSIGNED NOT NULL,               -- FK -> sayilar.id (Yazi.sayiId)
  sira_no       INT             NOT NULL DEFAULT 0,     -- order within issue (siraNo)
  pdf_url       VARCHAR(512)    NULL,                   -- per-article PDF
  kapak_gorseli VARCHAR(512)    NULL,                   -- cover image
  yayin_tarihi  DATE            NULL,                   -- publish date
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_yazilar_code (code),
  KEY idx_yazilar_sayi (sayi_id, sira_no),
  KEY idx_yazilar_yazar (yazar_id),
  KEY idx_yazilar_kategori (kategori_id),
  CONSTRAINT fk_yazilar_yazar    FOREIGN KEY (yazar_id)    REFERENCES yazarlar (id)    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_yazilar_kategori FOREIGN KEY (kategori_id) REFERENCES kategoriler (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_yazilar_sayi     FOREIGN KEY (sayi_id)     REFERENCES sayilar (id)     ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- ara_yazilar (blog posts) — AraYazi { baslik, spot, icerik(html), yazar(FK),
--   kategori(STRING -> resolved to FK), kapakGorseli?, yayinTarihi, slug }
-- The source stores kategori as the category NAME string; we normalize to a FK.
-- kategori_id is nullable to tolerate any string that doesn't match a category.
-- -----------------------------------------------------------------------------
CREATE TABLE ara_yazilar (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code          VARCHAR(60)     NOT NULL,               -- old id 'ay-001'
  slug          VARCHAR(200)    NOT NULL,               -- AraYazi.slug (url)
  baslik        VARCHAR(500)    NOT NULL,
  spot          TEXT            NULL,
  icerik        LONGTEXT        NULL,                   -- HTML body
  yazar_id      BIGINT UNSIGNED NOT NULL,               -- FK -> yazarlar.id
  kategori_id   BIGINT UNSIGNED NULL,                   -- FK -> kategoriler.id (resolved from name)
  kategori_ad   VARCHAR(120)    NULL,                   -- raw original string fallback (audit)
  kapak_gorseli VARCHAR(512)    NULL,
  yayin_tarihi  DATE            NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ara_yazilar_code (code),
  UNIQUE KEY uq_ara_yazilar_slug (slug),
  KEY idx_ara_yazilar_yazar (yazar_id),
  KEY idx_ara_yazilar_kategori (kategori_id),
  KEY idx_ara_yazilar_tarih (yayin_tarihi),
  CONSTRAINT fk_ara_yazilar_yazar    FOREIGN KEY (yazar_id)    REFERENCES yazarlar (id)    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ara_yazilar_kategori FOREIGN KEY (kategori_id) REFERENCES kategoriler (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- yarisma_bilgi (contest info, singleton) — { baslik, aciklama }
-- Single row (id=1). gecmisKazananlar normalized into yarisma_kazananlar.
-- -----------------------------------------------------------------------------
CREATE TABLE yarisma_bilgi (
  id                TINYINT UNSIGNED NOT NULL DEFAULT 1,
  baslik            VARCHAR(255)     NOT NULL,
  aciklama          LONGTEXT         NULL,              -- markdown/plain description
  basvuru_tarihleri VARCHAR(255)     NULL,              -- bilgi kartı: "Her yıl Mart-Nisan aylarında"
  kategori_metni    VARCHAR(255)     NULL,              -- bilgi kartı: "Film Eleştirisi ve Film Çözümlemesi"
  odul_metni        VARCHAR(255)     NULL,              -- bilgi kartı: "Para ödülü ve dergide yayınlanma"
  basvuru_email     VARCHAR(255)     NULL,              -- başvuru CTA e-posta adresi
  updated_at        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_yarisma_bilgi_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- yarisma_kazananlar (past winners) — gecmisKazananlar [{ yil, birinci, ikinci }]
-- -----------------------------------------------------------------------------
CREATE TABLE yarisma_kazananlar (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  yil         SMALLINT UNSIGNED NOT NULL,
  birinci     VARCHAR(500)    NULL,                     -- first place text
  ikinci      VARCHAR(500)    NULL,                     -- second place text
  sira_no     INT             NOT NULL DEFAULT 0,       -- display order (client array order)
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_yarisma_kazananlar_yil (yil),
  KEY idx_yarisma_kazananlar_yil (yil)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- hakkimizda (about page, singleton) — { baslik, icerik,
--   iletisim:{ email, adres, sosyal:{twitter,instagram,facebook} } }
-- Flattened: contact + socials become columns of the single about row.
-- -----------------------------------------------------------------------------
CREATE TABLE hakkimizda (
  id                TINYINT UNSIGNED NOT NULL DEFAULT 1,
  baslik            VARCHAR(255)     NOT NULL,
  icerik            LONGTEXT         NULL,              -- about body (markdown)
  iletisim_email    VARCHAR(255)     NULL,             -- iletisim.email
  iletisim_adres    VARCHAR(512)     NULL,             -- iletisim.adres
  sosyal_twitter    VARCHAR(512)     NULL,             -- iletisim.sosyal.twitter
  sosyal_instagram  VARCHAR(512)     NULL,             -- iletisim.sosyal.instagram
  sosyal_facebook   VARCHAR(512)     NULL,             -- iletisim.sosyal.facebook
  updated_at        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_hakkimizda_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- sayfalar (static pages) — admin panelden düzenlenebilir serbest sayfalar.
-- İlk kullanım: 'yazi-standartlari' (Sekans Yazı Standartları).
-- -----------------------------------------------------------------------------
CREATE TABLE sayfalar (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(160)    NOT NULL,                 -- ör. 'yazi-standartlari'
  baslik      VARCHAR(255)    NOT NULL,
  icerik      LONGTEXT        NULL,                     -- markdown-benzeri metin
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sayfalar_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- menuler (dynamic top navigation) — admin panelden yönetilen hiyerarşik menü.
-- Sabit kod yerine bu tablodan kurulur; öğeler eklenir/silinir/yeniden
-- adlandırılır/sıralanır/aktif-pasif yapılır ve başka bir üst menünün altına
-- taşınabilir. tur: bağlantı türü, hedef: pageId|slug|kategori|URL|sayı code.
-- Varsayılan menü seed'i dosyanın sonundaki seed bölümündedir.
-- -----------------------------------------------------------------------------
CREATE TABLE menuler (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  parent_id      BIGINT UNSIGNED NULL,                 -- üst menü (NULL = en üst düzey)
  gorunen_baslik VARCHAR(160)    NOT NULL,             -- kullanıcıya görünen ad ("Lynch Sayısı")
  sistem_baslik  VARCHAR(160)    NULL,                 -- sistemin ürettiği ad ("Sayı özel")
  tur            ENUM('dahili','grup','sabit_sayfa','kategori','filtre_liste','dergi_sayisi','dergi_sayilari','harici_link')
                 NOT NULL DEFAULT 'dahili',
  hedef          VARCHAR(255)    NULL,                 -- pageId | slug | kategori adı | URL | sayı code
  sira           INT             NOT NULL DEFAULT 0,
  aktif          TINYINT(1)      NOT NULL DEFAULT 1,
  otomatik       TINYINT(1)      NOT NULL DEFAULT 0,
  yeni_sekme     TINYINT(1)      NOT NULL DEFAULT 0,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_menuler_parent (parent_id),
  KEY idx_menuler_sira (parent_id, sira),
  CONSTRAINT fk_menuler_parent FOREIGN KEY (parent_id) REFERENCES menuler (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- anasayfa_bloklar (homepage blocks) — ana sayfa panelleri admin panelden
-- yönetilir: hangi paneller, sıraları, başlıkları. tip: sayilar|blog|kategori.
-- ayar (JSON): {kategori, adet}. Varsayılan blok seed'i dosya sonundadır.
-- -----------------------------------------------------------------------------
CREATE TABLE anasayfa_bloklar (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tip         ENUM('sayilar','blog','kategori') NOT NULL DEFAULT 'blog',
  baslik      VARCHAR(200)    NULL,
  sira        INT             NOT NULL DEFAULT 0,
  aktif       TINYINT(1)      NOT NULL DEFAULT 1,
  ayar        LONGTEXT        NULL,                 -- JSON: {kategori, adet}
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_anasayfa_bloklar_sira (sira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- ayarlar (key/value settings) — generic store for misc global toggles.
-- NOTE: The OpenAI API key is NOT stored here. Per the migration design the key
-- lives ONLY in the above-webroot config.php (never in the DB, never returned by
-- any API), so /api/export can never leak it. This table is for non-secret
-- settings (e.g. default AI model name shown in the CMS status panel).
-- -----------------------------------------------------------------------------
CREATE TABLE ayarlar (
  anahtar     VARCHAR(120)    NOT NULL,                 -- key e.g. 'openai_api_key', 'openai_model'
  deger       LONGTEXT        NULL,                     -- value (string/JSON)
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (anahtar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- kullanicilar (users) — real auth replacing FAKE AuthContext DEMO_USERS.
-- password_hash holds a PHP password_hash() bcrypt string (60 chars).
-- role is admin|editor matching the front-end User.role union.
-- -----------------------------------------------------------------------------
CREATE TABLE kullanicilar (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username       VARCHAR(80)     NOT NULL,              -- login name
  password_hash  VARCHAR(255)    NOT NULL,              -- bcrypt/argon2 hash (never plaintext)
  role           ENUM('admin','editor') NOT NULL DEFAULT 'editor',
  name           VARCHAR(120)    NOT NULL,              -- display name (User.name)
  email          VARCHAR(255)    NULL,
  is_active      TINYINT(1)      NOT NULL DEFAULT 1,
  last_login_at  TIMESTAMP       NULL,
  created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_kullanicilar_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTE: There is no session token table. Auth uses PHP native sessions over an
-- HttpOnly+Secure+SameSite=Lax cookie (server-side session files), so sessions
-- are not stored in MySQL. See api/lib/auth_guard.php.

-- -----------------------------------------------------------------------------
-- giris_denemeleri (login attempts) — brute-force throttle, keyed by username.
-- -----------------------------------------------------------------------------
CREATE TABLE giris_denemeleri (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ident         VARCHAR(160)    NOT NULL,               -- username (per-user lock; safer than per-IP behind NAT)
  attempts      INT             NOT NULL DEFAULT 0,
  locked_until  DATETIME        NULL,
  last_attempt  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_giris_denemeleri_ident (ident)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- sayilar.editor_id -> kullanicilar.id (kullanicilar artık tanımlı olduğundan güvenli).
ALTER TABLE sayilar
  ADD CONSTRAINT fk_sayilar_editor FOREIGN KEY (editor_id) REFERENCES kullanicilar (id)
  ON UPDATE CASCADE ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- Seed for singletons + first admin (run once; replace the bcrypt hashes!).
-- Generate hashes with PHP: password_hash('sekans2024', PASSWORD_BCRYPT)
-- Placeholder hashes below MUST be regenerated before going live.
-- =============================================================================
INSERT INTO yarisma_bilgi (id, baslik, aciklama) VALUES (1, '', NULL)
  ON DUPLICATE KEY UPDATE id = id;
INSERT INTO hakkimizda (id, baslik) VALUES (1, '')
  ON DUPLICATE KEY UPDATE id = id;
INSERT INTO sayfalar (slug, baslik, icerik) VALUES
  ('yazi-standartlari', 'Sekans Yazı Standartları', NULL)
  ON DUPLICATE KEY UPDATE slug = slug;

-- Varsayılan üst menü (mevcut yapı birebir). Yalnızca tablo boşsa kurulur.
SET @seed := (SELECT COUNT(*) FROM menuler);
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'Ana Sayfa','dahili','anasayfa',0,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Hakkımızda','grup',1,1 FROM DUAL WHERE @seed = 0;
SET @m_hakkimizda := LAST_INSERT_ID();
INSERT INTO menuler (parent_id, gorunen_baslik, tur, hedef, sira, aktif)
SELECT @m_hakkimizda,'Sekans Sinema Grubu','dahili','hakkimizda',0,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_hakkimizda,'Sekans Yazı Standartları','sabit_sayfa','yazi-standartlari',1,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_hakkimizda,'Duyurular','dahili','duyurular',2,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Sayılar','dergi_sayilari',2,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'Yarışma','dahili','yarisma',3,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Yazılar','grup',4,1 FROM DUAL WHERE @seed = 0;
SET @m_yazilar := LAST_INSERT_ID();
INSERT INTO menuler (parent_id, gorunen_baslik, tur, hedef, sira, aktif)
SELECT @m_yazilar,'Sekans İndeks','dahili','indeks',0,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_yazilar,'Ara Yazılar','dahili','arayazilar-arayazi',1,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_yazilar,'Sinema Kitaplığı','dahili','sinemakitapligi',2,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_yazilar,'Texts in English','dahili','textsinenglish',3,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'Yazarlar','dahili','yazarlar',5,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, sira, aktif)
SELECT 'Arşiv','grup',6,1 FROM DUAL WHERE @seed = 0;
SET @m_arsiv := LAST_INSERT_ID();
INSERT INTO menuler (parent_id, gorunen_baslik, tur, hedef, sira, aktif)
SELECT @m_arsiv,'e-Sayılar','dahili','arsiv',0,1 FROM DUAL WHERE @seed = 0
UNION ALL SELECT @m_arsiv,'Basılı Sayılar','dahili','basilisayilar',1,1 FROM DUAL WHERE @seed = 0;
INSERT INTO menuler (gorunen_baslik, tur, hedef, sira, aktif)
SELECT 'İletişim','dahili','iletisim',7,1 FROM DUAL WHERE @seed = 0;

-- Varsayılan ana sayfa panelleri (mevcut yapı: sayılar + Blog).
SET @seedb := (SELECT COUNT(*) FROM anasayfa_bloklar);
INSERT INTO anasayfa_bloklar (tip, baslik, sira, aktif, ayar)
SELECT 'sayilar', NULL, 0, 1, NULL FROM DUAL WHERE @seedb = 0
UNION ALL SELECT 'blog', 'Blog', 1, 1, '{"adet":6}' FROM DUAL WHERE @seedb = 0;
