# Sekans — Sinema Kültürü Dergisi

[sekans.org](https://sekans.org) için React + PHP/MySQL tabanlı yeni site. İçerik, eski
Joomla sitesinden dönüştürülmüştür (28 sayı, 443 sayı yazısı, 179 bölüm yazısı, 203 yazar).

## Mimari

- **Frontend:** React 19 + TypeScript + Vite (Tailwind, shadcn/ui). Çıktı: `dist/`
- **Backend:** Bağımsız PHP 8 REST API (`api/`) — framework/composer yok; PDO + MySQL
- **Kimlik doğrulama:** bcrypt + PHP oturum çerezi + CSRF (`/cms` paneli)
- **AI düzenleme:** OpenAI, sunucu tarafı proxy üzerinden (anahtar `config.php`'de, tarayıcıya gitmez)
- **Veritabanı:** `db/schema.sql` + `db/seed.sql` (phpMyAdmin'e import edilir)

## Geliştirme

```bash
npm install
npm run dev          # http://localhost:5173 (/api -> localhost:8080 proxy)
npm run build        # dist/ üretir
```

Yerel API için Docker düzeni ve tüm dağıtım adımları: **[DEPLOY.md](DEPLOY.md)**

## Önemli klasörler

| Yol | İçerik |
|---|---|
| `api/` | PHP REST API (gizli yapılandırma şablonu: `api/config.sample.php`) |
| `db/` | Şema, seed, Joomla dönüştürücü (`convert-joomla.mjs`), medya kontrolü (`check-media.mjs`) |
| `public/docs`, `public/images` | **Git'te değildir** (büyük medya). Canlı sunucuda mevcuttur; yerel kopya için DEPLOY.md 6b |
| `.cpanel.yml` | cPanel Git "Deploy HEAD Commit" betiği |

## Dağıtım (özet)

1. cPanel > Git Version Control ile bu repoyu klonla
2. DB oluştur + `db/schema.sql` ve `db/seed.sql` import et (phpMyAdmin)
3. `/home/<kullanıcı>/sekans_config/config.php` oluştur (`api/config.sample.php`'den)
4. "Deploy HEAD Commit" → `dist/` ve `api/` public_html'e kopyalanır
5. `https://alan-adi/api/seed_admin.php` ile admin oluştur, sonra dosyayı SİL

Ayrıntı ve sorun giderme: [DEPLOY.md](DEPLOY.md)
