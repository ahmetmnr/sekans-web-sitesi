# Sekans — cPanel Dağıtım Kılavuzu

Bu site artık **React (Vite) frontend + PHP/MySQL backend** mimarisindedir.
Tüm içerik sunucudaki MySQL veritabanında saklanır (tarayıcı localStorage'ı kullanılmaz).
Kimlik doğrulama gerçek (bcrypt + PHP oturum çerezi + CSRF), OpenAI anahtarı yalnızca sunucuda tutulur.

> Bu kılavuz **kök alan adı** dağıtımı içindir (site `public_html/` kökünde).
> Yükleme yalnızca File Manager / FTP iledir; sunucuda shell/composer gerekmez.

---

## Mimari (sunucudaki yerleşim)

```
public_html/
├── index.html, assets/, images/   ← derlenmiş React SPA (dist/ içeriği)
├── .htaccess                       ← SPA geri dönüşü (/api ve /uploads hariç) + cache/güvenlik
├── uploads/                        ← yüklenen görsel/PDF (yazılabilir, PHP çalıştırma KAPALI)
│   └── .htaccess
└── api/                            ← PHP REST API
    ├── index.php  (ön denetleyici)
    ├── .htaccess
    ├── seed_admin.php  (tek seferlik — sonra SİLİN)
    ├── lib/ , routes/
    └── (config.php BURADA DEĞİL — aşağıya bakın)

/home/<cpuser>/sekans_config/
└── config.php                      ← gizli bilgiler (DB + OpenAI), web köküNÜN ÜZERİNDE
```

---

## 0. Ön koşullar (cPanel)

1. **PHP sürümü:** cPanel > *Select PHP Version* → PHP **8.1 / 8.2 / 8.3**.
   Etkinleştirin: `pdo_mysql`, `curl`, `mbstring`, `json`, `fileinfo`, `openssl`.
2. **PHP ayarları** (*Select PHP Version > Options* veya `.user.ini`):
   - `post_max_size` ≥ **32M**, `upload_max_filesize` ≥ **32M** (dergi PDF'leri büyük olabilir)
   - `memory_limit` ≥ 128M
3. **HTTPS:** Alan adında AutoSSL/Let's Encrypt etkin olmalı. Oturum çerezi `Secure`
   bayrağı taşır; HTTPS yoksa giriş **sessizce başarısız** olur. Önce HTTPS'i sağlayın.

---

## 1. Yerelde derleyin

```bash
npm ci
npm run build      # dist/ üretir (index.html, assets/, images/, uploads/.htaccess, .htaccess)
```

`vite.config.ts` içinde `base: '/'` olduğundan emin olun (varsayılan budur).

---

## 2. SPA'yı yükleyin

- `dist/` **içeriğini** `public_html/` köküne yükleyin
  (yani `public_html/index.html`, `public_html/assets/`, `public_html/images/` oluşmalı).
  `dist` klasörünü alt dizin olarak DEĞİL, içindekileri kökü hedefleyerek yükleyin.
- Önceki bir dağıtım varsa, eski `public_html/assets/` içeriğini **silin** (eski hash'li JS/CSS kalmasın).
- `dist/.htaccess` kök `.htaccess` olarak yüklenmeli (içinde `/api` ve `/uploads` istisnaları var).

---

## 3. API'yi yükleyin

- Bu depodaki `api/` ağacını `public_html/api/` içine yükleyin
  (`index.php`, `.htaccess`, `lib/`, `routes/`, `seed_admin.php`).
- `public_html/uploads/` klasörü `dist/uploads/.htaccess` ile birlikte oluşur; izni **755** yapın.

---

## 4. Gizli bilgileri web kökünün ÜZERİNE koyun

1. `/home/<cpuser>/sekans_config/` klasörünü oluşturun (public_html ile **kardeş**).
2. Bu depodaki `api/config.sample.php` dosyasını oraya **`config.php`** adıyla kopyalayın.
3. İçindeki değerleri doldurun: DB bilgileri, OpenAI anahtarı, `app.base_url`, `upload_dir`.
4. `config.php` iznini **600** yapın.

> Hesabınız `public_html`'e hapsedilmişse (üst dizine yazamıyorsanız), `config.php`'yi
> `public_html/api/config.php` olarak koyun — `api/.htaccess` onu tarayıcıya kapatır.
> Kod her iki konumu da otomatik dener.

---

## 5. Veritabanı + kullanıcı oluşturun (cPanel > MySQL Databases)

1. Veritabanı oluşturun: örn. `cpuser_sekans` (karakter seti **utf8mb4 / utf8mb4_unicode_ci**).
2. Kullanıcı oluşturun: örn. `cpuser_sekansusr` (güçlü parola) ve veritabanına **ALL PRIVILEGES** ile ekleyin.
3. cPanel önekli adları `config.php`'deki `db` bloğuna yazın.

---

## 6. Şema + tohum verisini içe aktarın (phpMyAdmin)

1. phpMyAdmin > **`cpuser_sekans` veritabanını seçin** (önce doğru DB'yi seçmek şarttır).
2. *Import* → `db/schema.sql` yükleyin (tablolar; utf8mb4 seçili olsun).
3. *Import* → `db/seed.sql` yükleyin.
   **İçerik CANLI sekans.org Joomla sitesinden dönüştürülmüştür:** 28 sayı (e1–e28 + Odak: David
   Lynch), 443 sayı yazısı (başlık+yazar+PDF), 179 bölüm yazısı (Ara Yazılar, Yazarlarımızdan,
   Sinema Kitaplığı, Duyurular, Basılı Sayılar...), 203 yazar, 67 kategori. Aktif sayı: **e28 (Mart 2026)**.
   - `seed.sql` çok büyürse phpMyAdmin yükleme sınırına takılabilir; o durumda `.sql.gz` olarak yükleyin.

> Yeniden üretmek için: canlı DB dökümünü Docker MariaDB'ye yükleyip `node db/convert-joomla.mjs`
> çalıştırın (ayrıntılar dosyanın başındaki yorumda). Mock veriyle başlamak isterseniz alternatif:
> `npx tsx db/generate-seed.mjs`.

## 6b. Medya dosyalarını canlı siteden taşıyın (ZORUNLU)

İçerik, canlı sunucudaki dosyalara `/docs/...` (sayı PDF'leri) ve `/images/...` (görseller)
yollarıyla referans verir. Bu iki klasör taşınmazsa kapaklar ve PDF'ler kırık olur:

1. CANLI cPanel → File Manager → `public_html/docs` ve `public_html/images` klasörlerini
   **Compress → ZIP → Download** ile indirin.
2. YENİ sitenin `public_html/` köküne aynı adlarla (`docs/`, `images/`) çıkarın.
   Kök `.htaccess` gerçek dosyaları SPA yönlendirmesinden zaten muaf tutar; ek ayar gerekmez.

En çok referans alan klasörler: `docs/e-sayilar/` (472 PDF referansı), `images/yazilar/`,
`images/arayazilar/`, `images/kitaplik/`, `images/duyurular/`, `images/secki/`.

---

## 7. İlk yönetici (admin) kullanıcısını oluşturun

1. `api/seed_admin.php` dosyasını açıp **ADMIN_PASSWORD** (ve isterseniz username/name) değerini
   güçlü bir parola ile değiştirin, kaydedin/yeniden yükleyin.
2. Tarayıcıda bir kez açın: `https://<alan-adı>/api/seed_admin.php`
3. **"Admin oluşturuldu"** mesajını görünce `seed_admin.php` dosyasını **SİLİN** (arka kapı bırakmayın).

> Demo parolaları (eski `admin/sekans2024`) **taşınmaz**. Yeni parolanız geçerlidir.

---

## 8. Duman testi (smoke test)

- `https://<alan-adı>/` → SPA açılır; `/arsiv` gibi bir derin yolda **sayfa yenile** → 404 değil, uygulama gelir.
- `https://<alan-adı>/api/kategoriler` → **JSON** döner (HTML değil). HTML dönüyorsa kök `.htaccess`'teki
  `/api` istisnası eksiktir.
- `https://<alan-adı>/api/config.sample.php` → **403** (deny kuralları çalışıyor).
- `https://<alan-adı>/api/lib/db.php` → **403**.
- CMS: `https://<alan-adı>/cms` → giriş yapın (admin) → bir görsel yükleyin → `/uploads/...` altında sunulur.
- Editörde **Sparkles (AI)** butonu → çalışır (OpenAI anahtarı config.php'de ayarlıysa).

---

## 9. İzinler özeti

| Yol | İzin |
|-----|------|
| Dizinler | 755 |
| Dosyalar | 644 |
| `public_html/uploads/` | 755 (yazılabilir) |
| `sekans_config/config.php` | 600 |

---

## 10. Yerel geliştirme (opsiyonel)

```bash
# Terminal 1 — PHP API
php -S localhost:8080 -t public_html      # (api/ ve uploads/ public_html altında olmalı)
# Terminal 2 — Vite (dev proxy /api -> localhost:8080)
npm run dev
```
`config.php` içinde `app.dev = 1` yaparsanız localhost için CORS başlıkları eklenir. **Üretimde 0 olmalı.**

---

## Geri alma (rollback)

- Önceki `dist/` yüklemesini saklayın; sorun olursa eski `index.html` + `assets/`'i geri yükleyin.
- Veritabanı değişmez; içerik geri yüklemesi için CMS > Ayarlar > İçe Aktarma (admin) kullanılabilir.

---

## Sorun giderme

- **`/api/...` JSON yerine HTML dönüyor:** kök `.htaccess`'te `RewriteRule ^api(/.*)?$ - [L]` satırı eksik/yanlış.
- **Giriş yapılamıyor / oturum açılmıyor:** HTTPS/AutoSSL etkin mi? `Secure` çerez HTTPS gerektirir.
- **`config.php bulunamadı` (500):** dosya `/home/<cpuser>/sekans_config/config.php` veya `public_html/api/config.php` konumunda mı?
- **Yükleme 413:** `post_max_size`/`upload_max_filesize` değerlerini artırın.
- **AI "yapılandırılmamış":** `config.php` içindeki `openai.api_key` boş; doldurun.
- **Türkçe karakter bozuk:** DB ve bağlantı `utf8mb4` mü? schema.sql utf8mb4 ile mi içe aktarıldı?
- **cURL kapalı:** *Select PHP Version*'da `curl`'ü açın (yoksa `allow_url_fopen` yedeği devreye girer).
