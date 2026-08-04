# Sekans Web Sitesi — Talepler ve Kullanım Kılavuzu

Bu dosya, **"Sekans Yeni Web Sitesi Ahmet Münir.pdf"** içindeki 19 maddenin
tamamını kapsar. Her madde için üç şey yazılıdır:

- **Talep** — sizin istediğiniz
- **Ne yapıldı** — sitede/panelde neyin değiştiği
- **Nasıl kullanılır** — panelde nereye tıklayacağınız, neye dikkat edeceğiniz

Sonda: hesaplar, bilinmesi gereken sınırlar ve test listesi.

---

## Hızlı özet tablosu

| # | Konu | Durum |
|---|------|-------|
| 1 | Kategori gizleme ON/OFF | ✅ Editör kontrolünde |
| 2 | "İ" harfinin "I" olması | ✅ Düzeltildi |
| 3 | Yazı başlığı fontu / bold sorunu | ✅ Düzeltildi |
| 4 | İçindekiler tasarımı (görsel, renk, girinti) | ✅ Yapıldı |
| 5 | Dizin görselinin başlıkla hizalanması | ✅ Yapıldı |
| 6 | Spotun görseli sarmaması | ✅ Yapıldı |
| 7 | Künye: italik + akordiyon panel | ✅ Yapıldı |
| 8 | Künyede e-posta / spam riski | ✅ Form çözümü uygulandı |
| 9 | Ana Metin hep siyah mı | ✅ Garanti altına alındı |
| 10 | Sekans markası görsel olsun | ⚠️ Kod hazır, **görsel dosya sizden** |
| 11 | Marka küçük görünüyor | ⚠️ Büyütüldü — ama sınırı var, aşağıda açıklandı |
| 12 | Sağ tık → yeni sekmede aç | ✅ Yapıldı |
| 13 | Geri tuşu tutarsızlığı | ✅ Düzeltildi |
| 14 | Sayının kendi sayfası yerine PDF açılması | ✅ Düzeltildi |
| 15 | Admin / editör ayrımı | ✅ Yapıldı |
| 16 | Yayındaki sayı "hazırlananlar"da görünüyor | ✅ Düzeltildi |
| 17 | Spot önizlemede italik görünüyor | ✅ Düzeltildi |
| 18 | Dipnot stili yanlış bilgi veriyor | ✅ Düzeltildi |
| 19 | Sayı silmeyi zorlaştırma | ✅ Yapıldı |

---

## [1] Kategori adını içindekilerde gizleme

**Talep:** "DOSYA — DOSYA — DOSYA…" diye alt alta tekrar etmesin. Editör
penceresinde, kategori seçilen yerin altına ON/OFF anahtarı konsun.

**Ne yapıldı:** Her yazının kendi anahtarı var. Varsayılan **AÇIK** — hiçbir şey
yapmazsanız her şey bugünkü gibi kalır.

**Nasıl kullanılır**

```
CMS → Yazı Yönetimi → yazının kalem ikonu → SAĞ SÜTUN
```

Sağ sütunda, Kategori seçicisinin **hemen altında**:

```
┌─────────────────────────────────────────────┐
│ Kategori *                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ Dosya: Sinemanın Politikası…        ▾   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Kategoriyi içindekilerde göster   [ ●━] │ │  ← ANAHTAR
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

Bir kategoride A, B, C yazıları varsa:

| Yazı | Anahtar | Sonuç |
|---|---|---|
| **A** (grubun ilki) | AÇIK bırakın | Üstünde `DOSYA: …` yazar |
| **B** | KAPATIN | Kategori satırı çıkmaz |
| **C** | KAPATIN | Kategori satırı çıkmaz |

Sonuç:

```
DOSYA: SİNEMANIN POLİTİKASI - POLİTİKANIN SİNEMASI      ← bir kez
    Zor Zamanlarda Toplumsal Mücadeleye Dair…
        Alper Şen

    Bir Karşılaşma Alanı Olarak Görüntü…                ← kategori yok
        Özgür Çiçek
```

**Dikkat edilecekler**

- **Girintiler değişmez.** Kategorisi gizli yazının başlığı ve yazar adı, açık
  olanla aynı hizada durur.
- **Boşluk bırakmaz.** Gizlenen kategori satırının yeri boş kalmaz.
- **Yazının kategorisi değişmez.** Filtreler, arama, Sekans İndeks, kategori
  sayfaları etkilenmez — sadece o satırın görünürlüğü kapanır.
- **Sıralama önemli.** Yazıları *Sıra Numarası* ile gruplandırılmış tutun; aynı
  kategorinin yazıları art arda gelsin. Araya başka kategoriden yazı girerse,
  sonraki yazıda anahtarı **tekrar açın**.
- Hem ana sayfada hem sayı sayfasında geçerlidir.

> Bunu site kendiliğinden yapmıyor ("bir öncekiyle aynı kategori, gizleyeyim"
> demiyor) çünkü **"bunu editör ayarlayacak"** dediniz. Karar sizde.

---

## [2] Bölüm başlıklarında "İ" harfinin "I" olması

**Talep:** "ELEŞTIRI", "SÖYLEŞI", "SINEMANIN POLITIKASI" yerine doğru yazım.

**Sorunun sebebi:** Başlıklar büyük harfe tarayıcının CSS kuralıyla çevriliyordu.
Chrome bu kuralda Türkçe bilmez: "i" harfini "İ" değil "I" yapar.

**Ne yapıldı:** Büyük harfe çevirme işi tarayıcıdan alındı, Türkçe kuralıyla
yapılıyor. Menü ve alt bilgi başlıkları da düzeltildi (`Dergi Yazıları` →
`DERGİ YAZILARI`).

**Nasıl kullanılır:** Bir şey yapmanıza gerek yok. Kategori adını panelde nasıl
yazarsanız, sitede doğru büyük harfle çıkar. `Ğ, Ü, Ş, Ö, Ç, ı` hepsi doğru.

---

## [3] Yazı başlığı fontu ve kalın (bold) sorunu

**Talep:** Font sabit olsun. Başlık varsayılan kalın olsun. İtalik editörün
inisiyatifinde kalsın. Punto bir gıdım büyüsün.

**İki ayrı sorun vardı:**

1. *"Bold yaptığımda geri düz yapamıyoruz."* — Sebep: başlık zaten kalın
   basılıyordu, "kalın" işaretini açmak da kapatmak da aynı görünüyordu.
2. *"Word'den çekilmiş font kalıyor (Times New Roman)."* — Sebep: yapıştırılan
   metnin içindeki font bildirimi temizlenmiyordu.

**Ne yapıldı**

- Başlık fontu **kilitlendi**. Nereden yapıştırırsanız yapıştırın sitenin
  fontunda çıkar.
- Başlık **varsayılan kalın**.
- **Kalın düğmesi başlık alanından kaldırıldı** — artık bir işe yaramadığı ve
  kafa karıştırdığı için. `Ctrl+B` de başlıkta iş yapmaz.
- Punto bir kademe büyüdü.
- Editördeki başlık kutusu artık **sitenin gerçek fontunu** gösteriyor:
  yazarken gördüğünüz, yayında göreceğiniz.

**Nasıl kullanılır:** Başlıkta elinizde kalan tek biçim **italik**. Film/kitap
adını seçip `Ctrl+I` yapın. Geri almak için tekrar `Ctrl+I`.

> Word'den yapıştırma artık güvenli — renk, punto, font temizleniyor; italik ve
> alt/üst simge gibi anlamlı biçimler korunuyor.

---

## [4] İçindekiler menüsü tasarımı

**Talep:** Dizin görseli 150×300 → 200×400. Yazar adları gri değil **siyah**,
kalın değil. Başlık ve yazar adı kategoriye göre **kademeli** içeriden.

**Ne yapıldı**

- Dizin görseli **%33 büyütüldü** (önerilen yükleme ölçüsü artık 400×200 px,
  oran 2:1 aynen korundu — eski görseller yeniden kırpılmaz).
- Yazar adı **siyah**, kalın değil, punto aynı.
- Kademeli girinti uygulandı:

```
DOSYA: SİNEMANIN POLİTİKASI…          ← kategori: en solda
    Zor Zamanlarda Toplumsal…         ← başlık: 1 kademe içeride
        Alper Şen                     ← yazar: 2 kademe içeride
```

**Nasıl kullanılır:** Görsel yüklerken **400×200 px** hedefleyin. Farklı ölçüde
yüklerseniz site sadece büyütür/küçültür — oran aynı olduğu sürece kırpma olmaz.
Panelde alanın altında bu bilgi yazılı.

### Ekranlar arası aralık farkı sorusu

*"Gökhan'da aralıklar geniş, bende dar. İkimiz de %100'deyiz."*

Sebep tarayıcı yakınlaştırması değil, **Windows ekran ölçeklemesi** (Ayarlar →
Sistem → Ekran → Ölçek, genelde %100/%125/%150) ve ekran çözünürlüğü. Aynı sayfa
farklı DPI'da farklı genişlikte görünür. Bu web'in doğasıdır, kapatılamaz.
Görselin büyümesi ve başlık puntosunun artması bu farkı **azaltır**.

---

## [5] Dizin görselinin konumu

**Talep:** Dizin görselinin üst sınırı kategori satırıyla değil **yazı başlığı
satırıyla** eşlensin. Kategori adı görsele takılmasın, alt satıra akmasın.

**Ne yapıldı:** İçindekiler düzeni ızgaraya (grid) çevrildi:

```
┌─────────────────────────────────────────────────────────┐
│ DOSYA: SİNEMANIN POLİTİKASI - POLİTİKANIN SİNEMASI      │  ← tam genişlik
├──────────────────────────────────────────┬──────────────┤
│   Zor Zamanlarda Toplumsal Mücadeleye…   │  ┌────────┐  │
│     Alper Şen                            │  │ görsel │  │
│   (spot — sayı sayfasında)               │  └────────┘  │
└──────────────────────────────────────────┴──────────────┘
```

**Sorduğunuz soruların cevabı:**

- *"Gösterilmeyen kategoriler sayfada yok sayılacak, değil mi?"* — **Evet.**
  Satır tamamen yok sayılır, boşluk bırakmaz.
- *"Kategoriler de dizin görseli bloğu sınırına tabi mi?"* — **Artık değil.**
  Word mantığınız doğruymuş: kategori satırı iki sütunu birden kaplıyor, sağı
  serbest, kendi satırında düz gidiyor. Telefonda da görsele takılmıyor.

**Nasıl kullanılır:** Bir şey yapmanıza gerek yok, otomatik.

---

## [6] Spot metninin dizin görselini sarmaması

**Talep:** Spot görseli sarmasın, altına metin girmesin. Spot, görselin sol
dikey sınırından belli bir uzaklıkta sınırlansın (iki yana yaslı).

**Ne yapıldı:** Sarmalama (float) kaldırıldı. Metin sol sütunda kalıyor:

```
│ ……………………………………………………………  │←boşluk→│ ┌──────────┐ │
│ ……… azami satır uzunluğu   │        │ │  görsel  │ │
│ ……………………………………………          │        │ └──────────┘ │
                             ▲        ▲
                     metnin sağ    görselin
                     sınırı        sol kenarı
```

Ek olarak, sonradan netleştirdiğiniz nokta da karşılandı: **azami satır
uzunluğu bütün satırlarda aynı.** Dizin görseli olmayan bir yazının satırları da
aynı yerde biter — görsel sütunu görselsiz satırlarda da yerini korur.

"İki yana yaslı" derken sağdaki yan sayfanın kenarı değil, o sınırdır. Doğru
anlaşıldı.

**Nasıl kullanılır:** Otomatik. Spotu panelde normal yazın.

---

## [7] Sayı künyesi

**Talep:** Künyede italik açılsın. Künye akordiyon panel içinde çıksın (kapalı
başlasın). İki yana yaslı olsun, gereksiz satır boşluğu olmasın.

**Ne yapıldı**

- Künye alanı artık biçimlendirilebilir bir editör — **italik açık**.
- Sitede kapağın altında **kapalı akordiyon** olarak duruyor; başlığı
  "Sayı künyesi". Tıklayınca aşağı açılıyor, ok işareti dönüyor.
- allmusic'teki gibi renkli bant **konmadı** (minimalist istemiştiniz).
- Panel sağ tarafa taşmıyor, kapağın altındaki kendi bloğunda açılıyor.
- Metin iki yana yaslı, paragraflar arası fazla boşluk yok.

**Nasıl kullanılır**

```
CMS → Sayı Yönetimi → sayının "Düzenle" düğmesi → Künye alanı
```

- **ENTER** yeni satır açar.
- Bir yeri seçip **italik** yapabilirsiniz (film/kitap adları için).
- Punto, font ve renk sitenin künye stilinden gelir, değiştirilemez.

> Eski künyeleriniz kaybolmadı; ilk kez düzenleyip kaydettiğinizde biçimli
> hâle geçer.

---

## [8] Künyede yayın sorumlusunun e-posta adresi

**Sorunuz:** Adresi açık yazmak bizi spam'e boğar mı? Okur yayın sorumlusuna
nasıl ulaşsın?

**Cevap:** Haklısınız — bir e-posta adresi sayfada düz metin olarak durduğu anda
otomatik toplayıcılar tarafından alınır. Açıkta yazıp spam'den korunmak aynı
anda mümkün değildir.

**Ne yapıldı:** Künye panelinin altına **"Sayı sorumlusuna yazın"** bağlantısı
kondu. Tıklayan okur, konusu o sayı olarak **ön doldurulmuş** İletişim formuna
gider. Sorumlu editör atanmışsa adı da görünür. E-posta adresi hiçbir yerde
yazmaz.

**Nasıl kullanılır:** Sayı Yönetimi'nde sayıya **Sorumlu editör** atarsanız adı
künyede görünür. Atamazsanız sadece bağlantı çıkar, o da yeterlidir.

---

## [9] Ana Metin stili her zaman siyah mı?

**Talep:** Teyit edilsin; bazı yerlerde metni elle siyaha çekmek gerekiyordu.

**Sorunun sebebi:** Word/Docs'tan yapıştırılan metin kendi rengini satır içinde
taşıyordu. Stil "Ana Metin" seçili olsa bile bazı paragraflar koyu gri kalıyordu.

**Ne yapıldı:** Renk artık stile bağlı. Ana Metin **her zaman siyah** basılır;
yapıştırılan renk bastırılır. Bağlantılar hariç (onların rengi anlam taşır).

**Nasıl kullanılır:** Artık metni elle siyaha çekmenize gerek yok. Eski
yazılarda da geçerli — kaydetmenize gerek kalmadan düzelir.

---

## [10] Sekans markasının görsel olması

**Talep:** Marka görsel yapılacaktı; otomatik çeviriyle bakanlar "Sekans" adını
yanlış görüyordu.

**Ne yapıldı — iki katman:**

1. **Şimdi çalışan koruma:** Markaya "çevirme" işareti kondu. Google Translate
   ve Edge çevirici artık markaya dokunmuyor. **Bildirdiğiniz sorun çözüldü.**
2. **Görsel katman — sizden bekleniyor:** Kod hazır. `public/images/`
   klasörüne **`sekans-logo.svg`** adıyla tasarlanmış logoyu koyduğunuz anda
   site otomatik olarak onu kullanır. Kod değişikliği gerekmez.

**Neden logoyu ben üretmedim:** Marka fontu (Cormorant Garamond) dışarıdan
yükleniyor, harflerin vektör çizimi elimizde yok. Yaklaşık bir taklit, bir
dergi mastheadi için kabul edilemez. Bu Cem'in işi.

---

## [11] Markanın küçük görünmesi

**Durum:** Sizde 3 cm, Gökhan'da küçük.

**Ne yapıldı:** Marka bir kademe büyütüldü.

**Bilinmesi gereken:** "Herkeste 3 santim" diye bir şey **web'de mümkün
değildir.** Fiziksel boyut okurun ekran çözünürlüğüne ve işletim sistemi
ölçeklemesine bağlıdır; tarayıcı %100'de olsa bile değişir. Gökhan'ın ekranında
küçük görünmesinin sebebi budur — [4]'teki aralık farkıyla **aynı sebep**.

Yapabildiğimiz, bir piksel ölçüsü seçip sabitlemektir. Daha da büyümesini
isterseniz söyleyin, tek satırlık bir ayar.

---

## [12] Sağ tık → "yeni sekmede aç"

**Varsayımınız:** *"Bu, sitenin şu anki haliyle, durduğu sunucuyla alakalıdır."*

**Cevap: Hayır, sunucuyla ilgisi yoktu.** Sitenin sayfalarının **adresi yoktu**;
hangi sayfada olursanız olun tarayıcının adresi tek bir adresti. Menü öğeleri de
bağlantı değil düğmeydi. Gidilecek bir adres olmayınca "yeni sekmede aç" da
olmaz.

**Ne yapıldı:** Her sayfaya gerçek adres verildi:

```
/sayi/e29          bir sayının içindekiler sayfası
/yazi/e29-01       dergi yazısı
/blog/{yazi-adi}   blog yazısı
/yazar/{id}        yazar sayfası
/arsiv  /yazarlar  /indeks  /iletisim  /hakkimizda  /yarisma
/sayfa/{slug}      sabit sayfalar
/liste/{slug}      filtre listeleri
```

Bağlantı olan her şey artık gerçek bağlantı: üst menü, açılır menüler, mobil
menü, arama sonuçları, **içindekiler başlıkları**, blog ve yazar kartları, alt
bilgi.

**Nasıl kullanılır**

- **Sağ tık → Yeni sekmede aç** çalışır.
- **Orta tık** (tekerlek) yeni sekmede açar.
- **Ctrl + tık** (Mac'te Cmd) yeni sekmede açar.
- Normal sol tıkta sayfa yeniden yüklenmez, eskisi gibi hızlı geçer.
- Bir yazının adresini **kopyalayıp paylaşabilirsiniz** — artık her yazının
  kendi adresi var. (Bu, [8]'deki paylaşım ve arama motorları için de kazanç.)

---

## [13] Telefonda geri (back) tuşunun tutarsızlığı

**Sorunuz:** *"Gerçek sunucuya geçtiğimizde doğal yoldan çözülecek bir şey
midir?"*

**Cevap: Hayır.** [12] ile aynı kök sebep: gezinmeler tarayıcının geçmiş
defterine yazılmıyordu. Sunucu değiştirmek bunu çözmezdi.

**Ne yapıldı:** Artık her gezinme geçmişe kayıt bırakıyor ve durum adresten
çözülüyor.

**Nasıl kullanılır**

- **Geri** tuşu bir önceki sayfaya döner.
- **İleri** tuşu çalışır.
- **Sayfa yenilendiğinde (F5) aynı sayfada kalırsınız** — eskiden ana sayfaya
  dönüyordu.

---

## [14] Sayının kendi sayfası yerine PDF'inin açılması

**Talep:** e28'i "Anasayfada göster" deyince çıkan içindekiler menüsü, e28'in
kendi sayfasında da çıksın. Şimdi PDF açılıyor.

**Sorunun sebebi:** Arşivdeki sayıların içeriğini verecek bir uç nokta yoktu.
Site de mecburen PDF'e yönlendiriyordu.

**Ne yapıldı**

- Arşiv sayıları için içerik uç noktası eklendi.
- **Sayılar menüsünden** bir sayı seçince artık kendi sayfası açılıyor.
- **Arşiv sayfasında** kapağa (ve sayı adına) tıklayınca da kendi sayfası
  açılıyor — eskiden doğrudan PDF'e gidiyordu.
- PDF, her iki yerde de **ayrı bir bağlantı** olarak duruyor.

**Nasıl kullanılır:** Bir şey yapmanıza gerek yok. Arşiv sayfasındaki açıklama
metni de güncellendi.

---

## [15] Admin / editör ayrımı

**Talep:** *"Bunların nasıl işleyeceğini senden duymam gerekecek."*

**Kurulan model:**

| İş | Yönetici | Editör |
|---|:---:|:---:|
| Menü yönetimi | ✅ | ❌ |
| Ana sayfa panelleri | ✅ | ❌ |
| Kategoriler | ✅ | ❌ |
| Sabit sayfalar, sayfa metinleri | ✅ | ❌ |
| Filtre listeleri, Sekans İndeks | ✅ | ❌ |
| Arşiv yönetimi | ✅ | ❌ |
| Kullanıcılar, Ayarlar | ✅ | ❌ |
| Yarışma, Hakkımızda | ✅ | ❌ |
| **Sayı açma / silme / yayına alma** | ✅ | ❌ |
| **Sorumlu editör atama** | ✅ | ❌ |
| Yazar **silme** | ✅ | ❌ |
| Kendi sayısının yazıları | ✅ | ✅ |
| Kendi sayısının kapak / PDF / künye / önsöz | ✅ | ✅ |
| Blog yazıları (Ara Yazılar vd.) | ✅ | ✅ |
| Yazar ekleme / düzenleme | ✅ | ✅ |

**Kural:** *Yönetici sitenin **yapısını** kurar, editör **içerik** üretir.*

**Editörün gördüğü sayılar:** Yalnızca kendisine atanmış olanlar + henüz kimseye
atanmamış olanlar. (Atanmamışları açık bıraktık ki atama yapılmadan da sayı
hazırlanabilsin.)

**Nasıl kullanılır**

*Editör hesabı açmak:*
```
CMS → Kullanıcılar → Yeni kullanıcı
  Kullanıcı adı, İsim, Şifre (en az 6 karakter)
  Rol: Editör
```

*Bir sayıyı editöre atamak:*
```
CMS → Sayı Yönetimi → sayının kartında "Sorumlu editör" açılır menüsü
```

Atadıktan sonra o editör panele girdiğinde yalnızca o sayıyı görür.

> **Önemli:** Bu ayrım sadece menüyü gizlemekle yapılmadı. Sunucu tarafında da
> uygulanıyor — yetkisiz bir istek doğrudan atılsa bile reddedilir. Menü
> gizlemek tek başına güvenlik değildir.

---

## [16] Yayındaki sayının "Hazırlanan Sayılar" altında görünmesi

**Talep:** Arşiv altında çıkmalı.

**Ne yapıldı**

- **Hazırlanan Sayılar** sekmesi artık yalnızca **taslakları** listeler.
- Yayındaki sayı **Arşiv** sekmesinin başında, *"Yayında olan sayı"* başlığı
  altında duruyor.
- Yönetimi kaybolmadı: aynı kart, aynı düğmeler (yazıları yönet, düzenle,
  taslağa al) orada.

**Nasıl kullanılır:** Yayındaki sayıyı düzenlemek için artık **Arşiv** sekmesine
bakın.

---

## [17] Düz spot metninin önizlemede italik görünmesi

**Ne yapıldı:** Önizleme spotu zorla italik gösteriyordu; kaldırıldı.

**Nasıl kullanılır:** Artık önizlemede ne görüyorsanız yayında da o. Bir yeri
italik istiyorsanız spot alanında elle italik yapın.

---

## [18] Dipnot stilinin yanlış görünmesi

**Talep:** İmleç dipnot içindeyken alt çubuk "Ana metin / sola yaslı" diyordu;
oysa dipnot kendi stilinde ve iki yana yaslı.

**Ne yapıldı:** İmleç "Notlar" bölümündeki bir dipnotun içindeyken alt çubuk
artık şunu yazıyor:

```
Dipnot · küçük punto · iki yana yaslı
```

**Nasıl kullanılır:** Bir şey yapmanıza gerek yok. Alt çubuğa güvenebilirsiniz —
imlecin bulunduğu yerin stilini doğru söylüyor.

---

## [19] Sayı silmeyi zorlaştırma

**Talep:** Admin bir cümleyi birebir yazsın; alternatif "DELETE THIS ISSUE".

**Ne yapıldı:** Silme onay penceresine yazma zorunluluğu kondu:

```
┌──────────────────────────────────────────────┐
│ Taslak Sayıyı Sil                            │
│                                              │
│ "Sayı e30" ve içindeki 12 yazı silinecek.    │
│ Bu işlem GERİ ALINAMAZ.                      │
│                                              │
│ Onaylamak için: DELETE THIS ISSUE            │
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                       [İptal]  [Sil]         │
└──────────────────────────────────────────────┘
```

`DELETE THIS ISSUE` birebir yazılmadan **Sil düğmesi pasif** kalır.
Metin bilinçli olarak Türkçe karakter içermiyor.

Silme zaten **yalnızca yöneticide** ([15]).

> Matematik işlemi ("(16*17)-(6^2)") önerinizi uygulamadım — sonuç 236, bir kez
> hesaplanıp not edilirdi ve yanlışlıkla silme riskini azaltmazdı. Yazma
> doğrulaması bu işin standart çözümü.

---

## Hesaplar

| Rol | Kullanıcı | Şifre |
|---|---|---|
| Yönetici | `admin` | `Sekans.Test.2026` |
| Editör | *(siz oluşturacaksınız)* | — |

Panel adresi: `<site-adresi>/cms`

> Test bitince oluşturduğunuz test hesaplarını **silin**. Canlıya geçerken
> sabit parolalı hesap kalmasın.

---

## Bilinmesi gereken sınırlar

1. **"Herkeste aynı santim" mümkün değil** — [11]. Ekran ölçeklemesi okurun
   makinesinde, bizim elimizde değil.
2. **Açık e-posta + spam koruması aynı anda olmaz** — [8]. Form çözümü seçildi.
3. **Sekans logosu görsel dosyası bekleniyor** — [10]. Kod hazır.

---

## Deploy sonrası kontrol listesi

| Ne | Nasıl bakılır |
|---|---|
| Yeni adresler | `/sayi/e29`, `/blog`, `/arsiv` adreslerini doğrudan yazın |
| Sağ tık | Menüde "Yazarlar"a sağ tık → "Yeni sekmede aç" |
| Geri tuşu | Ana sayfa → yazı → geri; sonra F5 → aynı sayfada kal |
| "İ" sorunu | `ELEŞTİRİ`, `SÖYLEŞİ`, `SİNEMANIN POLİTİKASI` |
| Kategori gizleme | Bir yazıda anahtarı kapatın, ana sayfaya bakın |
| Künye | Kapağın altında kapalı akordiyon; açınca iki yana yaslı |
| Spot | Görseli sarmıyor; satır sonları hepsinde aynı hizada |
| e28 | Menüden ve Arşiv'den → PDF değil, içindekiler sayfası |
| Sayı silme | `DELETE THIS ISSUE` yazmadan Sil pasif |
| Editör | Editör hesabıyla girin, menüde 5 öğe olmalı |

---

*Bu dosya, PDF'teki 19 maddenin tamamını kapsar. Eksik ya da yanlış anlaşılmış
bir madde görürseniz numarasını söylemeniz yeterli.*
