# Sekans — cPanel Dağıtım Kılavuzu

Bu site artık **React (Vite) frontend + PHP/MySQL backend** mimarisindedir.
Tüm içerik sunucudaki MySQL veritabanında saklanır (tarayıcı localStorage'ı kullanılmaz).
Kimlik doğrulama gerçek (bcrypt + PHP oturum çerezi + CSRF), OpenAI anahtarı yalnızca sunucuda tutulur.

> Bu kılavuz **kök alan adı** dağıtımı içindir (site `public_html/` kökünde).
> Yükleme yalnızca File Manager / FTP iledir; sunucuda shell/composer gerekmez.

> **Hangi bölümü izleyeceksiniz?**
> - **Test sunucusundaki çalışmayı taşıyorsanız** → doğrudan
>   [TEST SUNUCUSUNDAN cPANEL'E TAŞIMA](#test-sunucusundan-cpanele-taşıma) bölümüne gidin.
>   (Bölüm 6 ve 6b'deki `schema.sql` + `seed.sql` içe aktarımını YAPMAYIN;
>   döküm hem veriyi hem şemayı zaten getirir.)
> - **Sıfırdan kuruyorsanız** → aşağıdaki 0–9 adımlarını sırayla izleyin.

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

## TEST SUNUCUSUNDAN cPANEL'E TAŞIMA

Test sunucusunda gerçek çalışma var: hazırlanan sayı, editör hesapları, Dergi
Görünümü ayarları, panelden yüklenen görseller. Bunları `seed.sql` ile
kuramazsınız — **veritabanının dökümünü** taşımak gerekir. Döküm ayrıca
uygulanmış tüm migration'ları beraberinde getirir; cPanel'de tek tek migration
çalıştırmanız gerekmez.

### T1. Test sunucusunda paketi hazırlayın

```bash
cd /root/sekans-web-sitesi
git pull
bash deploy_test/tasima-paketi.sh
```

`/root/sekans-tasima/` altında üç dosya oluşur:

| Dosya | İçerik |
|---|---|
| `sekans-db.sql.gz` | veritabanının tam dökümü (utf8mb4) |
| `sekans-uploads.zip` *(ya da `.tar.gz`)* | panelden yüklenen görsel/PDF dosyaları — `zip` kurulu değilse tar.gz üretilir, cPanel ikisini de açar |
| `OZET.txt` | içerik sayıları + kullanıcı listesi — **kontrol için saklayın** |

Yerel bilgisayarınıza indirin:

```bash
scp root@<test-sunucusu>:/root/sekans-tasima/* ./
```

### T2. cPanel ön hazırlığı

Ana kılavuzdaki **0**, **4**, **5** adımlarını uygulayın:
PHP sürümü ve eklentiler, HTTPS/AutoSSL, `config.php`, veritabanı + kullanıcı.
**Bölüm 6 ve 6b'yi ATLAYIN** — şema ve veri dökümden gelecek.

> **HTTPS önce gelir.** Oturum çerezi `Secure` bayrağı taşır; AutoSSL etkin
> değilken giriş sessizce başarısız olur.

### T3. Veritabanını içe aktarın

1. phpMyAdmin → **doğru veritabanını seçin** (`cpuser_sekans`).
2. Veritabanı boş olmalı. Önceki bir deneme varsa tüm tabloları silin
   (*Check all → Drop*), yoksa döküm çakışır.
3. *Import* → `sekans-db.sql.gz` (phpMyAdmin gz dosyasını doğrudan kabul eder).
   Karakter kümesi **utf8mb4** seçili olsun.
4. Yükleme sınırına takılırsa: cPanel > *Terminal* varsa
   `mysql -u KULLANICI -p VERITABANI < sekans-db.sql`, yoksa hosting
   desteğinden içe aktarma isteyin.

### T3b. CANLI Joomla sitesinin üzerine kuruyorsanız (sekans.org)

Hedef cPanel şu anda sekans.org'u çalıştırıyorsa `public_html` dolu demektir.
İki şeyi **ayırmak** gerekir:

| Kalacak | Gidecek |
|---|---|
| `docs/` — 1245 sayı PDF'i (~467 MB) | `index.php`, `configuration.php` |
| `images/` — görseller (~49 MB) | `administrator/`, `components/`, `modules/`, `plugins/`, `templates/`, `libraries/`, `cache/`, `language/`, `media/`, `tmp/` |
| `cgi-bin/` (cPanel'e ait) | Joomla'nın `.htaccess` dosyası |

Veritabanı `/docs/...` ve `/images/...` yollarına **mutlak** referans verir; bu iki
klasör yerinde kaldığı için yeniden yüklemenize gerek yoktur (~511 MB tasarruf).

**Sıra önemlidir — önce yedek:**

1. **Tam yedek alın.** cPanel > *Yedekleme Sihirbazı* > *Yedekle* > *Tam Yedek*.
   Ayrıca File Manager'da `public_html`'i seçip *Compress* → indirin.
   Joomla veritabanının da dökümünü alın (phpMyAdmin > Export).

2. **Joomla dosyalarını SİLMEYİN, TAŞIYIN.** File Manager'da `public_html` içinde
   `_joomla_eski/` klasörü açın; `docs/`, `images/` ve `cgi-bin/` DIŞINDAKİ her şeyi
   (gizli `.htaccess` dahil — *Settings > Show Hidden Files* açık olsun) oraya taşıyın.

   > Taşımak silmekten iyidir: bir aksilikte geri almak dosyaları yerine
   > sürüklemekten ibarettir. Yer sıkıntısı varsa taşıma yerine yedeği indirip
   > silebilirsiniz — ama önce yedeğin indiğini doğrulayın.

3. **PHP sürümünü 8.1+ yapın** (Joomla eski sürümde çalışıyor olabilir).
   Bu ayar hesabın tamamını etkiler; geri alırsanız Joomla için eski sürüme
   dönmeniz gerekebilir.

4. Bundan sonra **T4**'ten devam edin.

**Kesinti süresi:** Joomla dosyaları taşındığı andan yeni site çalışana kadar
site kapalıdır — yaklaşık yarım saat. Ziyaretçi yoğunluğunun düşük olduğu bir
saatte yapın.

**Geri alma:** `_joomla_eski/` içindekileri `public_html`'e geri taşıyın, yeni
dosyaları (`index.html`, `assets/`, `api/`) silin. Joomla veritabanına hiç
dokunulmadığı için site olduğu gibi geri gelir.

> Sekans için **yeni ve ayrı** bir veritabanı oluşturun (bölüm 5). Joomla'nın
> veritabanına dokunmayın — geri alma güvenceniz odur.

### T4. Kodu yükleyin

Yerelde arşivleri hazırlayın:

```bash
npx vite build
python tools/cpanel-paketi.py          # docs/ + images/ hedefte varsa bu yeter
# python tools/cpanel-paketi.py --medya   # yoksa medyayı da üretir (~511 MB)
```

`belgeler/cpanel-paket/` altında oluşan dosyaları File Manager ile
`public_html/` içine yükleyip **Extract** edin:

| Dosya | Boyut | Açılınca |
|---|---|---|
| `cpanel-site.zip` | ~0,4 MB | `index.html`, `assets/`, favicon'lar, `.htaccess` |
| `cpanel-api.zip` | ~0,1 MB | `api/` |

> 1200'den fazla dosyayı tek tek yüklemeyin: saatler sürer ve yarıda kesilirse
> hangi dosyanın eksik kaldığı anlaşılmaz.

- Önceki bir Sekans dağıtımı varsa `public_html/assets/` içeriğini **silin**
  (eski hash'li JS/CSS kalmasın).
- `cpanel-site.zip` içindeki `.htaccess` kök `.htaccess` olmalı — Joomla'nınkinin
  üzerine yazmalı. *Show Hidden Files* açıkken doğrulayın.
- `docs/` ve `images/` hedefte yoksa `cpanel-docs.zip` (~467 MB) ve
  `cpanel-images.zip` (~49 MB) da gerekir. 467 MB'lık dosya File Manager'ı
  zorlar; **FTP** kullanın.

### T5. Yüklenen dosyaları açın

`sekans-uploads.zip` (ya da `sekans-uploads.tar.gz`) → cPanel File Manager ile
`public_html/` içine yükleyip **Extract** edin; `public_html/uploads/` oluşmalı.
İzin **755**, içindeki dosyalar **644**.

> Bu adım atlanırsa panelden yüklenmiş kapak ve dizin görselleri kırık çıkar.
> Eski Joomla sitesinden gelen `docs/` ve `images/` klasörleri ayrı bir iştir
> (bkz. bölüm 6b) — henüz taşınmadıysa onları da alın.

### T6. Test hesaplarını temizleyin — ATLAMAYIN

Döküm test parolalarını da taşır (`admin / Sekans.Test.2026` ve oluşturduğunuz
test editörü). Bunlar canlı sitede **açık kapı** demektir.

1. `https://<alan-adı>/cms` → admin ile girin.
2. **Kullanıcılar** → test editörünü **silin**.
3. Admin parolasını güçlü bir parolayla **değiştirin**.
4. `api/seed_admin.php` sunucuda varsa **silin** (dökümde kullanıcı olduğu için
   zaten çalışmaz, ama durmasın).

`OZET.txt` içindeki kullanıcı listesini karşılaştırarak fazladan hesap
kalmadığını doğrulayın.

### T7. Doğrulama

`OZET.txt`'teki sayılarla karşılaştırın — **aynı olmalı**:

| Kontrol | Nerede |
|---|---|
| Sayı / yazı / yazar / kategori sayıları | CMS > Kontrol Paneli |
| Yayındaki sayı doğru mu | Ana sayfa |
| Dergi Görünümü ayarları geldi mi | CMS > Dergi Görünümü (durum çubuğu "yayında olanla aynı" demeli) |
| Kapak ve dizin görselleri | Ana sayfa içindekiler |
| Derin bağlantı | `https://<alan-adı>/sayi/e29` adresini **doğrudan yazın** → 404 değil |
| Sağ tık | Menüde bir öğeye sağ tık → "Yeni sekmede aç" |
| API | `https://<alan-adı>/api/kategoriler` → JSON döner |
| Gizli dosyalar | `/api/config.sample.php` ve `/api/lib/db.php` → **403** |
| Yükleme | CMS'ten bir görsel yükleyin → `/uploads/...` altında açılır |
| Editör kapsamı | Editör hesabıyla girin → yalnızca kendisine atanmış sayı görünür |

### T8. Test sunucusunu ne yapmalı

Canlı doğrulandıktan sonra test sunucusunu **hemen kapatmayın** — birkaç gün
karşılaştırma için elde kalsın. Kapatırken:
- `docker compose -f /opt/sekans/docker-compose.yml down -v` (veriyi de siler)
- ya da sunucuyu tümden silin.

> Test sunucusu açık kaldığı sürece arama motorlarına düşebilir. Kapatmayacaksanız
> `robots.txt` ile engelleyin veya HTTP parola koruması ekleyin.

### Taşımada sık çıkan sorunlar

| Belirti | Sebep / çözüm |
|---|---|
| Türkçe karakterler bozuk | Döküm ya da içe aktarma utf8mb4 değil. DB'yi boşaltıp `--default-character-set=utf8mb4` ile alınmış dökümü tekrar aktarın. |
| Giriş yapılamıyor | HTTPS yok ya da `Secure` çerez engelleniyor. Önce AutoSSL. |
| `/api/...` HTML dönüyor | Kök `.htaccess` yüklenmemiş ya da `RewriteRule ^api(/.*)?$ - [L]` satırı yok. |
| Derin adres 404 | Kök `.htaccess` yok; SPA geri dönüşü çalışmıyor. |
| Görseller kırık | `uploads/` çıkarılmamış ya da izinler yanlış. |
| Site eski görünüyor | `public_html/assets/` içindeki eski dosyalar silinmemiş. `.htaccess` index.html'i `no-store` yapar; yine de bir kez `Ctrl+Shift+R`. |
| 500 hatası | `config.php` bulunamıyor ya da DB bilgileri yanlış. cPanel > *Errors* günlüğüne bakın. |

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
