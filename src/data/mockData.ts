// Sekans Dergisi - Mock Veriler

import type { Sayi, AraYazi, ArsivSayi, Yazar, Kategori } from '@/types';

export const yazarlar: Yazar[] = [
  { id: '1', ad: 'Canay', soyad: 'Batırbek', tamAd: 'Canay Batırbek', biyografi: 'Sinema eleştirmeni ve akademisyen. İstanbul Üniversitesi İletişim Fakültesi mezunu. Uluslararası film festivalleri üzerine çalışmalar yürütüyor. Özellikle Avrupa sanat sineması ve çağdaş Türk sineması üzerine eleştiriler kaleme alıyor. Sekans dergisinin kurucu yazarlarından.' },
  { id: '2', ad: 'Çiçek', soyad: 'Coşkun', tamAd: 'Çiçek Coşkun', biyografi: 'Film çözümlemeci ve sinema yazarı. Marmara Üniversitesi Sinema-TV bölümünden yüksek lisans derecesi aldı. Anlatı yapıları ve görsel dil üzerine derinlemesine çözümlemeler yapıyor. Çeşitli sinema dergilerinde yazıları yayımlandı.' },
  { id: '3', ad: 'Umut', soyad: 'Morkoç', tamAd: 'Umut Morkoç', biyografi: 'Sinema kuramcısı ve yazar. Boğaziçi Üniversitesi Felsefe bölümü mezunu. Film felsefesi, Wittgenstein ve sinema ilişkisi üzerine akademik çalışmalar yürütüyor. Kuram ve yorum alanında özgün bir bakış açısı sunuyor.' },
  { id: '4', ad: 'Ayşe Naz', soyad: 'Bulamur', tamAd: 'Ayşe Naz Bulamur', biyografi: 'Müzikal sinema uzmanı ve eleştirmen. Galatasaray Üniversitesi İletişim Fakültesi mezunu. Hollywood müzikalleri, Bollywood ve çağdaş müzikal sinema üzerine yazılar kaleme alıyor. Müzik ve sinemanın kesişim noktalarını araştırıyor.' },
  { id: '5', ad: 'Fatmagül', soyad: 'Aslaner Gegeoğlu', tamAd: 'Fatmagül Aslaner Gegeoğlu', biyografi: 'Sinema ve mimarlık ilişkisi üzerine uzmanlaşmış araştırmacı. ODTÜ Mimarlık Fakültesi ve İstanbul Bilgi Üniversitesi Sinema-TV çift anadal mezunu. Filmsel mekânlar ve mimari temsil üzerine akademik çalışmalar yürütüyor.' },
  { id: '6', ad: 'Gökhan', soyad: 'Gökdoğan', tamAd: 'Gökhan Gökdoğan', biyografi: 'Deneme yazarı ve sinema eleştirmeni. Ankara Üniversitesi DTCF Türk Dili ve Edebiyatı bölümü mezunu. Sinema ve edebiyat arasındaki geçişleri, filmlerin edebi boyutlarını inceleyen denemeler yazıyor.' },
  { id: '7', ad: 'Nurten', soyad: 'Bayraktar', tamAd: 'Nurten Bayraktar', biyografi: 'Sinema tarihçisi ve araştırmacı. Hacettepe Üniversitesi Tarih bölümü mezunu. Erken dönem Türk sineması, Yeşilçam ve dünya sinema tarihi üzerine kapsamlı araştırmalar yapıyor. Arşiv çalışmalarıyla tanınıyor.' },
  { id: '8', ad: 'Can', soyad: 'Ataç', tamAd: 'Can Ataç', biyografi: 'Animasyon sineması uzmanı ve illüstratör. Anadolu Üniversitesi Animasyon bölümü mezunu. Dünya animasyon sinemasını, stop-motion tekniklerden dijital animasyona uzanan geniş bir yelpazede inceliyor. Kendi kısa animasyon filmlerini de çekiyor.' },
  { id: '9', ad: 'Süleyman', soyad: 'Bölükbaş', tamAd: 'Süleyman Bölükbaş', biyografi: 'Tür sineması uzmanı ve eleştirmen. Bilgi Üniversitesi Film ve Televizyon bölümü mezunu. Korku, bilim kurgu, gerilim ve aksiyon türlerinde derinlemesine analizler yapıyor. B filmleri ve kült sinema üzerine de yazıyor.' },
  { id: '10', ad: 'Esra', soyad: 'Ballım', tamAd: 'Esra Ballım', biyografi: 'Sinema yazarı ve kültür eleştirmeni. İstanbul Bilgi Üniversitesi Karşılaştırmalı Edebiyat mezunu. Sinema ve toplumsal cinsiyet, feminist film kuramı ve kadın yönetmenler üzerine yazılar kaleme alıyor.' },
  { id: '11', ad: 'Eda Güngör', soyad: 'Korçak', tamAd: 'Eda Güngör Korçak', biyografi: 'Söyleşi editörü ve sinema gazetecisi. Galatasaray Üniversitesi Gazetecilik bölümü mezunu. Yönetmenler, oyuncular ve sinema profesyonelleriyle derinlemesine söyleşiler gerçekleştiriyor. Festival haberciliği de yapıyor.' },
  { id: '12', ad: 'Muharrem', soyad: 'Derin', tamAd: 'Muharrem Derin', biyografi: 'Belgesel sinema uzmanı ve yönetmen. Dokuz Eylül Üniversitesi Sinema-TV bölümü mezunu. Belgesel sinema estetiği, etik sorunları ve gerçeklik temsili üzerine hem yazılar yazıyor hem de kendi belgesellerini çekiyor.' },
  { id: '13', ad: 'Akın', soyad: 'Tunç', tamAd: 'Akın Tunç', biyografi: 'Film eleştirmeni ve yorum yazarı. Sabancı Üniversitesi Sanat ve Sosyal Bilimler mezunu. Güncel sinema üzerine keskin yorumlar ve film incelemeleri yapıyor. Özellikle bağımsız sinema ve festival filmleri üzerine uzmanlaşmış.' },
  { id: '14', ad: 'Emrah', soyad: 'Günok', tamAd: 'Emrah Günok', biyografi: 'Sinema yazarı ve senarist. Bahçeşehir Üniversitesi Sinema-TV bölümü mezunu. Senaryo yazarlığı, dramatik yapı ve karakter geliştirme üzerine hem akademik hem de pratik çalışmalar yürütüyor.' },
  { id: '15', ad: 'Cem', soyad: 'Kayalıgil', tamAd: 'Cem Kayalıgil', biyografi: 'Film kuramcısı ve çevirmen. Boğaziçi Üniversitesi Çeviribilim bölümü mezunu. Uluslararası sinema kuramı metinlerinin Türkçeye kazandırılmasında önemli çalışmalar yaptı. Psikanalitik film kuramı ve göstergebilim üzerine yazıyor.' },
  { id: '16', ad: 'Zehra', soyad: 'Yiğit', tamAd: 'Zehra Yiğit', biyografi: 'Genç sinema eleştirmeni ve sosyal medya içerik üreticisi. Kadir Has Üniversitesi Yeni Medya bölümü mezunu. Dijital sinema kültürü, streaming platformları ve yeni medya ile sinema ilişkisi üzerine yazıyor.' },
];

export const kategoriler: Kategori[] = [
  { id: '1', ad: 'Eleştiri', slug: 'elestiri' },
  { id: '2', ad: 'Çözümleme', slug: 'cozumleme' },
  { id: '3', ad: 'Kuram / Yorum', slug: 'kuram-yorum' },
  { id: '4', ad: 'Müzikal', slug: 'muzikal' },
  { id: '5', ad: 'Sinema ve Mimarlık', slug: 'sinema-mimarlik' },
  { id: '6', ad: 'Deneme', slug: 'deneme' },
  { id: '7', ad: 'Tarih', slug: 'tarih' },
  { id: '8', ad: 'Animasyon', slug: 'animasyon' },
  { id: '9', ad: 'Tür Sineması', slug: 'tur-sinemasi' },
  { id: '10', ad: 'Anısına', slug: 'anisina' },
  { id: '11', ad: 'Söyleşi', slug: 'soylesi' },
  { id: '12', ad: 'Yorum', slug: 'yorum' },
];

// Son Sayı: e27 - Temmuz 2025
export const sonSayi: Sayi = {
  id: 'e27',
  numara: 'e27',
  ay: 'Temmuz',
  yil: 2025,
  tamBaslik: 'Temmuz 2025 | Sayı e27',
  kapakGorseli: '/images/sayi-e27-kapak.jpg',
  pdfUrl: '/pdfs/sekans-e27-temmuz-2025.pdf',
  kunye: `Editör: S. T. Işlek
Katkıda Bulunanlar: Canay Batırbek, Çiçek Coşkun, Umut Morkoç, Ayşe Naz Bulamur, Fatmagül Aslaner Gegeoğlu, Gökhan Gökdoğan, Nurten Bayraktar, Can Ataç, Süleyman Bölükbaş, Esra Ballım, Eda Güngör Korçak
Kapak Tasarım: Sekans Tasarım Ekibi`,
  onsoz: `Bu sayımızda sinemanın farklı yüzlerini keşfediyoruz. The Brutalist'ten B korku sinemasına, animasyondan müzikallere uzanan geniş bir yelpazede sinema dünyasının derinliklerine iniyoruz.`,
  yayinTarihi: '2025-07-01',
  yazilar: [
    {
      id: 'e27-01',
      baslik: 'The Brutalist: Bir Mimarlık ve Göç Hikâyesi (The Brutalist, 2024)',
      spot: 'Brady Corbet\'in üç buçuk saatlik destansı filmi, modernist mimarinin yükselişi ve çöküşü üzerine derin bir meditasyon sunuyor.',
      icerik: `<p>Brady Corbet'in yönettiği <em>The Brutalist</em>, 2024'ün en iddialı ve en tartışmalı filmlerinden biri olarak sinema tarihine geçti. Üç buçuk saati aşan süresiyle seyirciden ciddi bir bağlılık talep eden film, Macar göçmen mimar László Tóth'un Amerika'daki yaşamını anlatıyor. Adrien Brody'nin olağanüstü performansıyla hayat bulan Tóth karakteri, Avrupa'nın yıkıntılarından Amerikan rüyasının vaadine sığınan bir sanatçının hikâyesini taşıyor.</p>

<p>Filmin en güçlü yanlarından biri, brutalist mimariyi yalnızca bir estetik tercih olarak değil, bir varoluşsal duruş olarak sunmasıdır. Tóth'un tasarladığı yapılar, betonun ham gücüyle insan ruhunun kırılganlığı arasındaki gerilimi somutlaştırır. Corbet, mimari formları sinematik kompozisyonun merkezine yerleştirerek mekânın insanı nasıl şekillendirdiğini — ya da ezip geçtiğini — görselleştiriyor.</p>

<p>Göç deneyimi, filmin omurgasını oluşturan ikinci büyük tema. Tóth'un Amerika'ya varışı, umut ve hayal kırıklığının iç içe geçtiği bir süreçtir. Film, Amerikan rüyasının vaatlerini sorgulamakla kalmaz, göçmenin "öteki" olarak konumlanmasının sanatsal üretim üzerindeki etkilerini de inceler. Tóth'un sanatı, hem bir direniş hem de bir uyum aracıdır; brutal formlar aracılığıyla kendi travmasını dışa vuran mimar, aynı zamanda yeni vatanının dilini konuşmaya çalışmaktadır.</p>

<p>Felicity Jones'un canlandırdığı Erzsébet karakteri, filmin duygusal derinliğini artıran bir figür olarak öne çıkar. Göçmen kadının görünmezliği ve sessiz direnci, Tóth'un gösterişli mimari projeleriyle tezat oluşturarak filmin toplumsal cinsiyet okumasını zenginleştirir.</p>

<p>Corbet'in yönetmenlik tercihleri arasında özellikle VistaVision formatının kullanımı dikkat çeker. Bu geniş ekran formatı, brutalist yapıların devasa boyutlarını ve bireyin bu yapılar karşısındaki küçüklüğünü vurgulayan bir araç olarak işlev görür. Daniel Blumberg'in müziği ise filmin atmosferik katmanını tamamlayan, minimalist ama etkileyici bir ses dünyası yaratır.</p>

<p>The Brutalist, kolay tüketilen bir film değil. Seyircisinden sabır ve dikkat talep ediyor. Ancak bu talebe karşılık sunduğu ödül — sanat, göç, güç ve yaratıcılık üzerine derin bir meditasyon — 2024 sinemasının en değerli deneyimlerinden birini oluşturuyor.</p>`,
      yazar: yazarlar[0],
      kategori: kategoriler[0],
      sayiId: 'e27',
      siraNo: 1,
      pdfUrl: '/pdfs/e27-01-the-brutalist.pdf',
    },
    {
      id: 'e27-02',
      baslik: 'Geçmişin Yükü ve Sessiz Travmalar',
      spot: 'Karanlık Gece\'de Toroslar\'ın derinliklerinde uyuyan tarihsel hafıza ve bireysel travmaların kesişimi.',
      icerik: `<p>Toroslar'ın sarp yamaçları arasında geçen <em>Karanlık Gece</em>, Türkiye sinemasının son dönemde ürettiği en etkileyici çözümlemelerden birini hak eden yapımlardan. Film, bir köye dönen genç bir kadının, ailesinin ve toplumun bastırılmış geçmişiyle yüzleşme hikâyesini anlatırken, bireysel travma ile kolektif hafızanın birbirine nasıl dolandığını ustaca gösteriyor.</p>

<p>Yönetmenin en belirgin tercihi, anlatıyı doğrusal bir çizgiden kopararak bellek fragmanları biçiminde sunmasıdır. Bu yapısal tercih, travmanın doğasıyla örtüşür; çünkü travmatik deneyimler kronolojik bir düzende değil, ani parlamalar ve kesintili hatırlamalar biçiminde yüzeye çıkar. Seyirci de tıpkı ana karakter gibi, geçmişin parçalarını birleştirmeye, eksik kalan boşlukları doldurmaya çalışır.</p>

<p>Filmin görsel dili, Toroslar'ın coğrafyasını hem bir sığınak hem de bir hapishane olarak sunar. Dağların kuşatıcı varlığı, karakterlerin iç dünyasındaki sıkışmışlık hissini dışsal bir metafora dönüştürür. Gece sahnelerinin yoğun karanlığı ise yalnızca atmosferik bir tercih değil, bastırılmış gerçekliklerin gizlendiği bir alan olarak işlev görür.</p>

<p>Sessizlik, filmde diyalogdan daha güçlü bir anlatı aracı olarak kullanılır. Karakterlerin konuşmadıkları, bakışlarla ve bedensel gerilimle ilettiği şeyler, söylenen sözlerden çok daha fazlasını anlatır. Bu sessizlik politikası, Türkiye'nin toplumsal hafızasındaki dile getirilemeyen konulara da bir gönderme taşır.</p>

<p>Ses tasarımı, filmin en dikkat çekici teknik başarılarından biridir. Doğa sesleri — rüzgâr, su, böcek sesleri — bir tür bilinçaltı müziği oluşturarak seyircinin duyusal deneyimini derinleştirir. Bu sesler, geçmişin "hayaletlerinin" varlığını hissettiren birer işaret gibi işler.</p>

<p>Sonuç olarak <em>Karanlık Gece</em>, Türk sinemasının travma anlatılarına önemli bir katkı sunuyor. Film, geçmişle yüzleşmenin acı verici ama zorunlu olduğunu, bastırılanın er ya da geç yüzeye çıkacağını hatırlatırken, sinemanın bu tür yüzleşmeleri mümkün kılan benzersiz kapasitesini de ortaya koyuyor.</p>`,
      yazar: yazarlar[1],
      kategori: kategoriler[1],
      sayiId: 'e27',
      siraNo: 2,
      pdfUrl: '/pdfs/e27-02-karanlik-gece.pdf',
    },
    {
      id: 'e27-03',
      baslik: '"Tuhaf" Bir Wittgensteinci Terapi: Köpek Dişi',
      spot: 'Lisandro Alonso\'nun minimalist şaheserinde zaman, bellek ve varoluşun sınırları.',
      icerik: `<p>Yorgos Lanthimos'un <em>Köpek Dişi</em> (Dogtooth, 2009) filmi, izleyiciyi rahatsız edici bir aile portresinin içine çeker. Üç yetişkin çocuğunu dış dünyadan tamamen izole eden bir anne-baba, kendi yarattıkları dil ve gerçeklik sistemiyle evlerini bir tür kapalı evren haline getirmiştir. Ancak bu filmin sunduğu deneyim, basit bir "garip aile" hikâyesinin çok ötesindedir.</p>

<p>Ludwig Wittgenstein'ın dil felsefesinden hareketle <em>Köpek Dişi</em>'ni okumak, filmin katmanlarını açmanın en verimli yollarından biridir. Wittgenstein'ın "dilimin sınırları dünyamın sınırlarıdır" önermesi, filmde adeta somutlaşır. Aile, sözcüklerin anlamlarını keyfi biçimde yeniden tanımlamıştır: "deniz" bir koltuk anlamına gelebilir, "zombi" küçük sarı bir çiçektir. Bu dilsel manipülasyon, çocukların algı dünyasını temelden şekillendirir.</p>

<p>Wittgenstein'ın "dil oyunları" kavramı, filmdeki her sahneye uygulanabilir. Aile içinde geçerli olan dil oyunları, dış dünyanın kurallarından radikal biçimde farklıdır. Bu fark, yalnızca sözcüklerin anlamlarında değil, davranış normlarında, beden algısında ve duygu ifadesinde de kendini gösterir. Lanthimos, bu kapalı sistemin iç tutarlılığını o kadar titizlikle kurar ki, seyirci zaman zaman "normal" olanın ne olduğunu sorgular hale gelir.</p>

<p>Filmin terapötik boyutu, paradoksal biçimde rahatsızlık verici sahnelerde açığa çıkar. Çocukların dış dünyayla teması — bir VHS kaset aracılığıyla — sistemin çatlamasına yol açar. Bu çatlak, Wittgenstein'ın bir dil oyunundan diğerine geçişin yarattığı kavramsal krize benzer: mevcut anlam çerçevesi yetersiz kaldığında, yeni bir anlam arayışı başlar.</p>

<p>Lanthimos'un kamera kullanımı, bu tematik çerçeveyi destekler niteliktedir. Sabit, geniş planlar evin sınırlayıcı mekânını vurgularken, kadrajın dışında bırakılan şeyler — dış dünya, şiddetin doğrudan gösterimi — seyircinin kendi "dilsel sınırlarıyla" yüzleşmesini sağlar.</p>

<p><em>Köpek Dişi</em>, bir aile dramı, bir distopya, bir dil felsefesi dersi ve bir psikolojik gerilim olarak aynı anda işler. Filmin "tuhaflığı", tam da bu çok katmanlılıktan ve izleyiciyi alışkanlıklarından koparma kapasitesinden kaynaklanır.</p>`,
      yazar: yazarlar[2],
      kategori: kategoriler[2],
      sayiId: 'e27',
      siraNo: 3,
      pdfUrl: '/pdfs/e27-03-kopek-disi.pdf',
    },
    {
      id: 'e27-04',
      baslik: 'Trans Müzikal Emilia Pérez',
      spot: 'Jacques Audiard\'ın cesur müzikali, kimlik, dönüşüm ve kabul üzerine bir opera.',
      icerik: `<p>Jacques Audiard'ın <em>Emilia Pérez</em>'i, 2024 sinema yılının en beklenmedik ve en cesur yapımlarından biri olarak öne çıktı. Bir Meksika kartel lideri, bir cinsiyet geçişi, bir müzikal ve bir kara komedi — bu unsurları aynı film içinde bir araya getirmek, çoğu yönetmen için düşünülemeyecek bir risk olurdu. Audiard ise bu riski büyük bir özgüvenle üstleniyor.</p>

<p>Filmin müzikal formu, anlatının duygusal yoğunluğunu taşıyan birincil araç olarak işlev görür. Şarkılar, karakterlerin iç dünyasını dışa vuran, diyalogla ifade edilemeyecek duyguları sese dönüştüren birer itiraf gibidir. Özellikle Emilia'nın dönüşüm sürecini anlatan müzikal sekanslar, transcinsiyet deneyiminin hem acısını hem de özgürleşme potansiyelini yoğun bir lirizimle aktarır.</p>

<p>Zoe Saldaña'nın canlandırdığı avukat Rita karakteri, filmin ahlaki pusulası gibidir. Kartel dünyasının karanlığına rağmen insani bir bağ kurabilen, pragmatizm ile empati arasında gidip gelen bir figür olarak Rita, seyircinin filme tutunma noktası oluşturur. Saldaña'nın performansı, özellikle dans sahnelerinde olağanüstü bir fiziksel ifade gücü sergiler.</p>

<p>Audiard, tür sinemasının klişelerini bilinçli biçimde kullanır ve alt üst eder. Kartel filmi estetiği, müzikal formunun neşeli enerjisiyle çarpışır; bu çarpışma, ne basit bir parodi ne de sıradan bir tür melezi üretir. Aksine, her iki türün de alışılmadık bir perspektiften yeniden düşünülmesini sağlar.</p>

<p>Kimlik meselesi, filmin her katmanına nüfuz eder. Emilia'nın cinsiyet geçişi, yalnızca bireysel bir dönüşüm değil, aynı zamanda güç yapılarının, toplumsal rollerin ve "kabul edilebilirlik" sınırlarının sorgulanmasıdır. Film, kimliğin sabit bir öz olmadığını, sürekli bir inşa ve yeniden inşa sürecinde oluştuğunu ileri sürer.</p>

<p><em>Emilia Pérez</em>, kusurları olan bir film — kimi sahnelerde tonal dengesizlikler hissedilir, anlatının bazı kolları yeterince geliştirilmemiştir. Ancak bu kusurlar, filmin enerjisini ve cesaret duygusunu gölgeleyemez. Audiard, sinema ile müzikal tiyatroyu buluşturan, kimlik politikalarını popüler formlarla tartışan ve izleyiciyi sürekli şaşırtan bir eser ortaya koymuştur.</p>`,
      yazar: yazarlar[3],
      kategori: kategoriler[3],
      sayiId: 'e27',
      siraNo: 4,
      pdfUrl: '/pdfs/e27-04-emilia-perez.pdf',
    },
    {
      id: 'e27-05',
      baslik: 'İnsanlar Mekânlar ve Sınırlar Üzerine',
      spot: 'The Big Lebowski\'den La Grande Bellezza\'ya mekânın sinemadaki varoluşsal boyutu.',
      icerik: `<p>Sinema, mekânı yalnızca bir fon olarak değil, anlatının ayrılmaz bir parçası olarak kullanan ender sanat dallarından biridir. Mimarlık ve sinema arasındaki ilişki, bu iki disiplinin mekânı deneyimleme biçimlerindeki ortaklıklardan beslenir: her ikisi de üç boyutlu uzayda hareket, ışık ve zaman ile çalışır.</p>

<p><em>The Big Lebowski</em>'de (1998) Los Angeles, yalnızca bir coğrafi mekân değil, bir ruh hali, bir yaşam biçimi ve bir karakter olarak işlev görür. Coen Kardeşler, bowling salonlarından Malibu sahillerine uzanan mekânsal çeşitlilik aracılığıyla, Amerikan toplumunun sınıfsal katmanlarını ve kültürel çelişkilerini haritalandırır. Dude'un dairesi — dağınık, mütevazı, kendi haline bırakılmış — karakterin varoluşsal duruşunun mimari bir ifadesidir.</p>

<p>Öte yandan <em>La Grande Bellezza</em>'da (2013) Roma, yüzyılların birikimini taşıyan bir güzellik ve çürüme alanı olarak sunulur. Sorrentino'nun kamerası, barok saraylardan terkedilmiş bahçelere süzülerek zamanın mekân üzerindeki izlerini takip eder. Jep Gambardella'nın Roma'sı, güzelliğin aşırılığıyla seyirciyi sarhoş eden ama aynı zamanda bu güzelliğin altındaki boşluğu hissettiren bir şehirdir.</p>

<p>Bu iki filmi yan yana koymak, mekânın sinemada nasıl farklı varoluşsal anlamlar taşıyabileceğini gösterir. Los Angeles'ın yatay yayılımı ve Roma'nın dikey katmanlanması, iki farklı uygarlık anlayışını, iki farklı zaman kavramını ve iki farklı "güzel yaşam" idealini temsil eder.</p>

<p>Mekânın sınırları — duvarlar, eşikler, pencereler — sinemada geçiş ve dönüşüm anlarını işaretler. Bir kapıdan geçmek, bir pencereden bakmak, bir sınırı aşmak: bu mekânsal eylemler, karakterlerin iç yolculuklarının dışsal karşılıklarıdır. Mimarlığın yarattığı fiziksel sınırlar, sinemada psikolojik ve toplumsal sınırların metaforuna dönüşür.</p>

<p>Sonuç olarak sinema ve mimarlık, mekânı anlamlandırma konusunda birbirlerini besleyen iki disiplindir. Film yapımcıları mekânı bilinçli biçimde kullandıklarında, anlatı yalnızca zamanda değil, uzayda da derinlik kazanır. İzleyici, bir mekânı deneyimlerken aynı zamanda bir fikri, bir duyguyu, bir varoluşsal durumu da deneyimler.</p>`,
      yazar: yazarlar[4],
      kategori: kategoriler[4],
      sayiId: 'e27',
      siraNo: 5,
      pdfUrl: '/pdfs/e27-05-mekanlar-sinirlar.pdf',
    },
    {
      id: 'e27-06',
      baslik: 'Kusurlu Görüntünün Dayanılmaz Hafifliği',
      spot: 'Dijital çağda "kusurlu" görüntünün estetik ve politik anlamları üzerine bir deneme.',
      icerik: `<p>Dijital sinemanın egemenliği altında, "kusurlu" görüntü paradoksal bir çekicilik kazandı. Film greninin sıcaklığı, VHS'in bulanıklığı, Super 8'in titrekliği — bir zamanlar teknik yetersizliğin işaretleri olan bu özellikler, bugün bilinçli bir estetik tercih olarak geri dönüyor. Peki, kusurlu görüntünün bu nostaljik çekiciliğinin ardında ne yatıyor?</p>

<p>Dijital görüntünün "fazla mükemmel" bulunması, aslında sinemanın ontolojisiyle ilgili derin bir tartışmayı yansıtır. André Bazin'in gerçekliğin yeniden üretimi olarak tanımladığı sinema, dijital çağda gerçekliğin simülasyonuna dönüşmüştür. Kusurlu görüntü ise bu simülasyonun karşısında, "gerçekliğin dokunuşu" olarak algılanır — her ne kadar bu algı da kendi içinde bir yanılsama barındırsa da.</p>

<p>Sean Baker'ın <em>Tangerine</em>'i iPhone ile çekmesi, Harmony Korine'in VHS estetiğini sanatsal bir araca dönüştürmesi, ya da günümüzde TikTok'un düşük çözünürlüklü görüntülerinin yarattığı "otantiklik" hissi — bunların tümü, kusurlu görüntünün farklı bağlamlarda nasıl anlam ürettiğini gösterir.</p>

<p>Politik açıdan bakıldığında, kusurlu görüntü bir demokratikleşme aracı olarak da okunabilir. Yüksek prodüksiyon değerlerinin normlaştırdığı sinema estetiği, belirli bir ekonomik ve kurumsal güce erişimi gerektirir. Kusurlu görüntü ise bu hiyerarşiyi sorgulayan, "herkesin sinemacı olabileceği" fikrini somutlaştıran bir karşı-estetik sunar.</p>

<p>Ancak bu demokratik potansiyel, kendi çelişkilerini de barındırır. "Kusurlu görüntü estetiği" pazarlanabilir bir stil haline geldiğinde — Instagram filtreleri, yapay film gren efektleri — başlangıçtaki yıkıcılığını yitirir ve bir tüketim nesnesine dönüşür. Kusur, kontrollü ve öngörülebilir hale geldiğinde, artık gerçek anlamda kusurlu değildir.</p>

<p>Belki de asıl soru, görüntünün "kusurlu" ya da "mükemmel" olup olmadığı değil, neyi gösterdiği ve nasıl gösterdiğidir. Sinema tarihi bize, en güçlü görüntülerin her zaman teknik mükemmeliyetten değil, duygusal ve düşünsel dürüstlükten kaynaklandığını gösterir.</p>`,
      yazar: yazarlar[5],
      kategori: kategoriler[5],
      sayiId: 'e27',
      siraNo: 6,
      pdfUrl: '/pdfs/e27-06-kusurlu-goruntu.pdf',
    },
    {
      id: 'e27-07',
      baslik: 'Alice Guy\'den Kadın Yönetmenler Üzerine',
      spot: 'Sinema tarihinin ilk kadın yönetmeninden günümüze kadın sinemacıların mücadelesi.',
      icerik: `<p>Alice Guy-Blaché, sinema tarihinin en büyük unutturulmuşlarından biridir. 1896'da, sinemanın henüz doğduğu yıllarda, ilk kurgusal filmi yöneten kişi olarak kabul edilen Guy-Blaché, yüzlerce film çekmiş, kendi stüdyosunu kurmuş ve sinema dilinin oluşumuna temel katkılarda bulunmuştur. Ancak ölümünden on yıllar sonra bile adı sinema tarihlerinde neredeyse hiç anılmamıştır.</p>

<p>Guy-Blaché'nin silinme hikâyesi, sinema tarihinin nasıl yazıldığına dair önemli sorular doğurur. Tarih yazımının erkek egemen yapısı, kadın sinemacıların katkılarını sistematik biçimde görünmez kılmıştır. Bu durum yalnızca Guy-Blaché için değil, erken dönem sinemasının birçok kadın öncüsü — Lois Weber, Dorothy Arzner, Germaine Dulac — için de geçerlidir.</p>

<p>Günümüze geldiğimizde, kadın yönetmenlerin sayısı ve görünürlüğü artmış olsa da, yapısal eşitsizlikler devam etmektedir. Hollywood'da yönetmen koltuğunda oturan kadınların oranı hâlâ yüzde yirmiyi bulmamaktadır. Bütçe dağılımı, festival seçkileri ve ödül törenleri gibi alanlarda cinsiyet eşitsizliği, farklı biçimlerde de olsa sürmektedir.</p>

<p>Ancak son on yılda kayda değer bir dönüşüm de yaşandı. Chloé Zhao'nun <em>Nomadland</em>'i, Jane Campion'ın <em>The Power of the Dog</em>'u, Greta Gerwig'in <em>Barbie</em>'si ve Justine Triet'nin <em>Bir Düşüşün Anatomisi</em> gibi filmler, kadın yönetmenlerin artık "kadın filmi" kategorisine sıkıştırılamayacağını kanıtladı. Bu yönetmenler, tür sinemasından sanat sinemasına uzanan geniş bir yelpazede, kendi özgün seslerini ortaya koydular.</p>

<p>Türkiye'de de kadın yönetmenlerin varlığı giderek güçleniyor. Deniz Gamze Ergüven, Emin Alper, Pelin Esmer ve genç kuşak sinemacılar, Türk sinemasının çehresini değiştiren işler üretiyorlar. Ancak burada da yapısal sorunlar — finansman erişimi, dağıtım kanalları, eleştiri pratikleri — kadın sinemacıların önünde engeller oluşturmaya devam ediyor.</p>

<p>Alice Guy-Blaché'den bugüne uzanan çizgi, hem bir kayıp hem de bir kazanım hikâyesidir. Kaybedilen, bastırılan seslerin geri kazanılması, sinema tarihinin yeniden yazılmasını gerektirir. Ve bu yeniden yazım, yalnızca geçmişe değil, geleceğe dair de bir sorumluluktur.</p>`,
      yazar: yazarlar[6],
      kategori: kategoriler[6],
      sayiId: 'e27',
      siraNo: 7,
      pdfUrl: '/pdfs/e27-07-kadin-yonetmenler.pdf',
    },
    {
      id: 'e27-08',
      baslik: 'Animasyon Film Sektöründeki Sessiz Devrim',
      spot: 'Bağımsız animasyonun yükselişi ve stüdyo sistemine karşı alternatif üretim modelleri.',
      icerik: `<p>Animasyon sineması, son yirmi yılda sessiz ama köklü bir devrim yaşıyor. Disney ve Pixar'ın egemenliğindeki stüdyo sistemi hâlâ gişe rekorları kırsa da, bağımsız animasyon alanında üretilen işler, medyanın geleceğini şekillendiren asıl yenilikçi güç olarak öne çıkıyor.</p>

<p>Bu devrimin teknolojik altyapısı, dijital araçların demokratikleşmesidir. Bir zamanlar büyük stüdyolara özgü olan animasyon yazılımları — Blender gibi açık kaynaklı alternatifler sayesinde — artık bağımsız sanatçıların da erişimine açıktır. Tek bir bilgisayar ve yaratıcı bir vizyon, uzun metrajlı bir animasyon film üretmek için yeterli hale gelmiştir.</p>

<p>Tomm Moore'un <em>Wolfwalkers</em>'ı, bu bağımsız ruhun en güzel örneklerinden biridir. İrlanda'nın Cartoon Saloon stüdyosundan çıkan film, Celtic mitolojisini el çizimi animasyonun sıcaklığıyla buluşturarak, dijital mükemmeliyetçiliğin karşısına zanaat ruhunu koyar. Benzer şekilde, Sylvain Chomet'nin <em>The Triplets of Belleville</em>'i, Alberto Mielgo'nun <em>The Windshield Wiper</em>'ı ve Hayao Miyazaki'nin son filmi <em>The Boy and the Heron</em>, farklı coğrafyalardan gelen ama ortak bir yaratıcı özgürlük anlayışını paylaşan yapımlar olarak dikkat çeker.</p>

<p>Stüdyo sisteminin formüle dayalı yaklaşımına karşı, bağımsız animasyon risk almayı, deneyselliği ve kişisel ifadeyi ön plana çıkarır. Yetişkin izleyiciye yönelik animasyonların — <em>Persepolis</em>, <em>Waltz with Bashir</em>, <em>Flee</em> — artan başarısı, animasyonun "çocuk eğlencesi" kalıbını kıran bir eğilimin göstergesidir.</p>

<p>Türkiye'de ise animasyon sineması henüz emekleme aşamasında olsa da, umut verici gelişmeler yaşanıyor. Kısa film festivalleri, animasyon atölyeleri ve üniversite programları, yeni nesil Türk animatörlerinin yetişmesine zemin hazırlıyor.</p>

<p>Animasyondaki bu sessiz devrim, sinemanın geleceği hakkında önemli ipuçları taşıyor: yaratıcılık, teknolojik imkânlardan çok vizyona bağlıdır ve en güçlü hikâyeler, her zaman en büyük bütçelerden değil, en derin hayal güçlerinden doğar.</p>`,
      yazar: yazarlar[7],
      kategori: kategoriler[7],
      sayiId: 'e27',
      siraNo: 8,
      pdfUrl: '/pdfs/e27-08-animasyon-devrim.pdf',
    },
    {
      id: 'e27-09',
      baslik: 'Ana Akımın Ötesinde: B Korku Sinemasının Yaratıcı Gücü ve Alucarda',
      spot: 'Meksika korku sinemasının unutulmaz örneği Alucarda ve B filmlerin kültürel önemi.',
      icerik: `<p>"B film" etiketi, sinema tarihinde hep küçümseyici bir çağrışım taşımıştır. Düşük bütçe, vasat oyunculuk, sıradan hikâye — bu kalıp yargılar, B sinemasının gerçek doğasını gizler. Oysa B filmler, ana akım sinemanın cesaret edemediği konulara girme, tür kurallarını yıkma ve radikal estetik deneyler yapma özgürlüğüne sahip olmuştur her zaman.</p>

<p>Juan López Moctezuma'nın 1977 yapımı <em>Alucarda</em>'sı, bu yaratıcı özgürlüğün en çarpıcı örneklerinden biridir. Meksika korku sinemasının kült klasiği, bir manastırda geçen gotik bir hikâyeyi aşırılığa varan bir görsel dille anlatır. Film, dinsel imgelerle şeytani unsurları, erotizmle şiddeti, sanat sineması estetiğiyle sömürü filmi konvansiyonlarını bir arada kullanarak benzersiz bir melez yaratır.</p>

<p><em>Alucarda</em>'nın en dikkat çekici özelliği, korku türünün klişelerini kullanırken aynı zamanda derin bir toplumsal eleştiri sunmasıdır. Manastır mekânı, baskıcı kurumsal yapıların metaforuna dönüşür; "şeytani" olan, aslında bu baskıya karşı yükselen isyanın kendisidir. Film, kurumsal dindarlığın maskesini düşürürken, bastırılmış arzuların yıkıcı gücünü de gözler önüne serer.</p>

<p>B korku sinemasının kültürel önemi, yalnızca alt-kültürel bir merak konusu olmaktan ibaret değildir. George Romero'nun <em>Night of the Living Dead</em>'i nasıl ırk politikalarının bir alegorisiyse, Tobe Hooper'ın <em>The Texas Chain Saw Massacre</em>'ı nasıl Vietnam sonrası Amerikan toplumunun travmasını yansıtıyorsa, <em>Alucarda</em> da Meksika'nın Katolik toplum yapısının baskılarını korku dilinde ifade eder.</p>

<p>Bugün B sinemasının mirası, bağımsız korku filmlerinin altın çağında yaşamaya devam ediyor. Ari Aster, Robert Eggers, Jordan Peele gibi yönetmenler, B sinemasının transgresif ruhunu ana akım sinemanın prodüksiyon değerleriyle buluşturarak türe yeni bir meşruiyet kazandırdılar.</p>

<p><em>Alucarda</em> gibi filmler, sinema tarihinin "marjinlerinde" konumlansa da, aslında sinemanın en canlı ve en cesur damarını temsil eder. Ana akımın ötesine bakmak, sinemanın tüm zenginliğini kavramanın ön koşuludur.</p>`,
      yazar: yazarlar[8],
      kategori: kategoriler[8],
      sayiId: 'e27',
      siraNo: 9,
      pdfUrl: '/pdfs/e27-09-alucarda.pdf',
    },
    {
      id: 'e27-10',
      baslik: 'Mutluluk Yanımızdan Gelip Geçti',
      spot: 'Kaybettiklerimizin ardından sinemanın teselli edici gücü ve hafızanın sinematografisi.',
      icerik: `<p>Kayıp, sinemanın en temel ve en evrensel temalarından biridir. Bir sevdiğimizi kaybettiğimizde, zamanın akışı değişir; geçmiş anılar keskin bir berraklık kazanırken, gelecek bulanıklaşır. Sinema, bu değişmiş zaman algısını yeniden üretebilen ender araçlardan biridir — çünkü sinema da, tıpkı hafıza gibi, zamanla oynar.</p>

<p>Hirokazu Kore-eda'nın <em>Yürüyüşe Devam</em> (Still Walking) filmi, kaybın gündelik hayatın dokusuna nasıl işlediğini en sade biçimiyle gösterir. Bir aile toplantısında, yıllar önce kaybedilen bir çocuğun hayaleti — fiziksel değil, duygusal bir hayalet — her konuşmada, her bakışta, her sessizlikte mevcuttur. Kore-eda'nın dehası, büyük trajedileri küçük jestlerle anlatabilmesindedir.</p>

<p>Terrence Malick'in <em>The Tree of Life</em>'ı ise kaybı kozmik bir ölçeğe taşır. Bir annenin oğlunu kaybetmesi, evrenin doğuşundan günümüze uzanan varoluşsal bir sorunun parçası olarak sunulur. Malick'in görsel şiiri, bireysel acıyı evrensel bir deneyime dönüştürürken, sinemanın teselli edici kapasitesinin sınırlarını zorlar.</p>

<p>Hafızanın sinematografisi, teknik açıdan da ilgi çekici sorular doğurur. Flashback kullanımı, renk tonlarındaki değişimler, odak kaymaları, yavaşlatılmış zaman — bu teknikler, hafızanın seçici, duygusal ve çoğu zaman güvenilmez doğasını yeniden üretmeye çalışır. En iyi örneklerde, seyirci yalnızca bir anıyı izlemez, anımsamanın kendisini deneyimler.</p>

<p>Türkiye sinemasında da kayıp ve hafıza, merkezi temalar olarak karşımıza çıkar. Nuri Bilge Ceylan'ın filmlerinde yitirilen ilişkilerin sessiz acısı, Semih Kaplanoğlu'nun <em>Yumurta</em> üçlemesinde anneyle hesaplaşma, Yeşim Ustaoğlu'nun <em>Bulutları Beklerken</em>'inde tarihsel kayıpların bireysel izleri — bu filmler, Türk sinemasının kayıp temasıyla kurduğu derin ilişkinin farklı yüzlerini sunar.</p>

<p>Sinema, kaybettiklerimizi geri getiremez. Ama onları hatırlamamız için, o hatırlamanın acısını ve güzelliğini paylaşmamız için bir alan açar. Karanlık salonda, yabancılarla birlikte ağlamak — belki de sinemanın sunabileceği en derin teselli budur.</p>`,
      yazar: yazarlar[9],
      kategori: kategoriler[9],
      sayiId: 'e27',
      siraNo: 10,
      pdfUrl: '/pdfs/e27-10-mutluluk.pdf',
    },
    {
      id: 'e27-11',
      baslik: 'Mert Güncüer\'in Sinema Yolculuğuna Dair Kısa Bir Söyleşi',
      spot: 'Genç sinemacı Mert Güncüer ile kariyerinin ilk yılları üzerine samimi bir sohbet.',
      icerik: `<p><strong>Sekans:</strong> Mert, sinemayla ilk tanışman nasıl oldu? Yönetmenliğe nasıl bir yoldan geldin?</p>

<p><strong>Mert Güncüer:</strong> Lisede bir arkadaşım bana Tarkovski'nin <em>Stalker</em>'ını izletti. O film beni tamamen değiştirdi. O güne kadar sinema benim için eğlenceydi ama <em>Stalker</em>'dan sonra sinemanın düşünce biçimi olduğunu anladım. Sonra Kiarostami, Bresson, Haneke derken bir yol açıldı. Üniversitede sinema okumak yerine felsefe okudum aslında, ama hep kamera elimdeydi.</p>

<p><strong>Sekans:</strong> İlk kısa filmin <em>Karınca Duası</em> festivallerde büyük ilgi gördü. Bu filmin hikâyesini nasıl buldun?</p>

<p><strong>Mert Güncüer:</strong> O film tamamen kişisel bir yerden çıktı. Annemin köyüne gittik bir yaz, orada yaşlı bir amca vardı, her gün aynı ağacın altına oturup bir şeyler mırıldanıyordu. Kimse ne söylediğini anlamıyordu. Bir gün yanına oturdum, saatlerce. Aslında kendine dua ediyormuş — kendi yarattığı bir duaymış. İşte film orada doğdu, o adamın yanında.</p>

<p><strong>Sekans:</strong> Filmlerinde doğa ve mekân çok önemli bir yer tutuyor. Bu bilinçli bir tercih mi?</p>

<p><strong>Mert Güncüer:</strong> Kesinlikle. Ben mekândan yola çıkan bir sinemacıyım. Önce mekânı bulurum, sonra o mekân bana hikâyeyi anlatır. <em>Karınca Duası</em>'ndaki köy de öyleydi, şu an çekmeye hazırlandığım uzun metrajdaki kasaba da öyle. Mekânı dinlemek lazım — her mekânın bir ritmi, bir sessizliği, bir ışığı var. O ritmi yakalarsanız, film zaten kendini çekmeye başlar.</p>

<p><strong>Sekans:</strong> Genç bir sinemacı olarak Türkiye'de bağımsız film üretmenin zorlukları neler?</p>

<p><strong>Mert Güncüer:</strong> En büyük zorluk finansman, bu herkesin bildiği bir şey. Ama bence asıl zorluk sabır meselesi. Türkiye'de bağımsız sinema yapan insanlar çok çabuk tükeniyor çünkü sistem sizi desteklemiyor. Festivallerde ödül alıyorsunuz ama sonraki filme geçemiyorsunuz. Ben şanslıyım, çevremde beni destekleyen insanlar var. Ama herkes bu kadar şanslı değil.</p>

<p><strong>Sekans:</strong> Son olarak, önümüzdeki dönemde neler planlıyorsun?</p>

<p><strong>Mert Güncüer:</strong> İlk uzun metrajım üzerinde çalışıyorum. Karadeniz'de geçen bir hikâye — deniz, dağ, yalnızlık ve bir kadının kendi sesini bulması. Daha fazla detay veremem şimdilik ama umarım önümüzdeki yıl çekime girebiliriz. Bir de belgesel projelerim var, onları da yavaş yavaş geliştiriyorum. Sinemaya her gün yeniden âşık oluyorum, bu hissi kaybetmemek en önemli şey bence.</p>`,
      yazar: yazarlar[10],
      kategori: kategoriler[10],
      sayiId: 'e27',
      siraNo: 11,
      pdfUrl: '/pdfs/e27-11-mert-guncuer.pdf',
    },
  ],
};

// Geçmiş Sayılar (Arşiv)
export const arsivSayilari: ArsivSayi[] = [
  { id: 'e26', numara: 'e26', ay: 'Aralık', yil: 2024, kapakGorseli: '/images/sayi-e26-kapak.jpg', pdfUrl: '/pdfs/sekans-e26-aralik-2024.pdf', yayinTarihi: '2024-12-01' },
  { id: 'e25', numara: 'e25', ay: 'Temmuz', yil: 2024, kapakGorseli: '/images/sayi-e25-kapak.jpg', pdfUrl: '/pdfs/sekans-e25-temmuz-2024.pdf', yayinTarihi: '2024-07-01' },
  { id: 'e24', numara: 'e24', ay: 'Aralık', yil: 2023, kapakGorseli: '/images/sayi-e24-kapak.jpg', pdfUrl: '/pdfs/sekans-e24-aralik-2023.pdf', yayinTarihi: '2023-12-01' },
  { id: 'e23', numara: 'e23', ay: 'Temmuz', yil: 2023, kapakGorseli: '/images/sayi-e23-kapak.jpg', pdfUrl: '/pdfs/sekans-e23-temmuz-2023.pdf', yayinTarihi: '2023-07-01' },
  { id: 'e22', numara: 'e22', ay: 'Aralık', yil: 2022, kapakGorseli: '/images/sayi-e22-kapak.jpg', pdfUrl: '/pdfs/sekans-e22-aralik-2022.pdf', yayinTarihi: '2022-12-01' },
  { id: 'e21', numara: 'e21', ay: 'Temmuz', yil: 2022, kapakGorseli: '/images/sayi-e21-kapak.jpg', pdfUrl: '/pdfs/sekans-e21-temmuz-2022.pdf', yayinTarihi: '2022-07-01' },
  { id: 'e20', numara: 'e20', ay: 'Aralık', yil: 2021, kapakGorseli: '/images/sayi-e20-kapak.jpg', pdfUrl: '/pdfs/sekans-e20-aralik-2021.pdf', yayinTarihi: '2021-12-01' },
  { id: 'e19', numara: 'e19', ay: 'Temmuz', yil: 2021, kapakGorseli: '/images/sayi-e19-kapak.jpg', pdfUrl: '/pdfs/sekans-e19-temmuz-2021.pdf', yayinTarihi: '2021-07-01' },
  { id: 'e18', numara: 'e18', ay: 'Aralık', yil: 2020, kapakGorseli: '/images/sayi-e18-kapak.jpg', pdfUrl: '/pdfs/sekans-e18-aralik-2020.pdf', yayinTarihi: '2020-12-01' },
  { id: 'e17', numara: 'e17', ay: 'Temmuz', yil: 2020, kapakGorseli: '/images/sayi-e17-kapak.jpg', pdfUrl: '/pdfs/sekans-e17-temmuz-2020.pdf', yayinTarihi: '2020-07-01' },
  { id: 'e16', numara: 'e16', ay: 'Aralık', yil: 2019, kapakGorseli: '/images/sayi-e16-kapak.jpg', pdfUrl: '/pdfs/sekans-e16-aralik-2019.pdf', yayinTarihi: '2019-12-01' },
  { id: 'e15', numara: 'e15', ay: 'Temmuz', yil: 2019, kapakGorseli: '/images/sayi-e15-kapak.jpg', pdfUrl: '/pdfs/sekans-e15-temmuz-2019.pdf', yayinTarihi: '2019-07-01' },
];

// Ara Yazılar - Uzun içerik üretici
const IMG = '/images/default-cover.svg';

function icerikUret(baslik: string, paragrafSayisi: number = 12): string {
  const paragraflar = [
    `<p>${baslik} başlığını taşıyan bu yazıda, sinema sanatının farklı katmanlarını incelemeye çalışacağız. Sinema, yirminci yüzyılın en etkili sanat formu olarak kabul edilir ve bu kabul, onun hem görsel hem de işitsel boyutlarının zenginliğinden kaynaklanır. Bir film izlediğimizde, yalnızca bir hikâye takip etmiyoruz; aynı zamanda ışığın, rengin, sesin ve hareketin bir araya geldiği karmaşık bir estetik deneyimin içine çekiliyoruz. Bu deneyim, seyirciye hem entelektüel hem de duygusal düzeyde hitap eder ve sinemanın diğer sanat dallarından ayırt edici özelliğini oluşturur.</p>`,

    `<p>Sinemanın tarihsel gelişimine baktığımızda, Lumière kardeşlerin ilk gösterimlerinden günümüzün dijital prodüksiyonlarına kadar uzanan devasa bir evrim görürüz. Bu evrim yalnızca teknolojik bir ilerleme değil, aynı zamanda anlatı biçimlerinin, estetik anlayışların ve toplumsal işlevlerin de köklü bir dönüşümüdür. İlk dönem sineması, gerçekliğin basit bir kaydı olarak başlamış, ancak kısa sürede Georges Méliès'in fantastik dünyalarıyla hayal gücünün sınırlarını zorlamaya başlamıştır.</p>`,

    `<img src="${IMG}" alt="Sinema görseli" style="width:100%; border-radius:8px; margin:1.5rem 0;" />`,

    `<p>Sovyet montaj kuramcıları Eisenstein, Pudovkin ve Vertov, sinemanın dilbilimsel yapısını keşfederek montajın anlatıdaki merkezi rolünü ortaya koymuşlardır. Eisenstein'ın "çarpışma montajı" kavramı, iki görüntünün yan yana getirilmesinin yeni bir anlam üretebileceğini göstermiş ve sinema dilinin temel yapıtaşlarından birini oluşturmuştur. Bu kuramsal çerçeve, sinemanın salt bir eğlence aracı olmadığını, aksine güçlü bir düşünce ve ifade aracı olduğunu kanıtlamıştır. Montajın gücü, seyirciyi pasif bir izleyici olmaktan çıkarıp aktif bir anlam üreticisine dönüştürmesidir.</p>`,

    `<p>İtalyan Yeni-Gerçekçilik akımı, sinemanın toplumsal gerçeklikle ilişkisini yeniden tanımlamıştır. Roberto Rossellini'nin "Roma, Açık Şehir" filmi, savaş sonrası İtalya'sının yıkımını belgesel bir dürüstlükle perdeye taşımış, Vittorio De Sica'nın "Bisiklet Hırsızları" ise sıradan insanların gündelik mücadelelerini evrensel bir trajedi olarak sunmuştur. Bu akım, stüdyo yapımlarının yapay dünyalarından sokağa çıkarak sinemanın otantiklik arayışına öncülük etmiştir. Gerçek mekânlarda, profesyonel olmayan oyuncularla çekilen bu filmler, sinema estetiğine yeni bir boyut kazandırmıştır.</p>`,

    `<p>Fransız Yeni Dalga'sı, sinemanın auteur kuramını geliştirerek yönetmenin bir sanatçı olarak konumunu pekiştirmiştir. Jean-Luc Godard'ın "Serseri Âşıklar" filmi, geleneksel anlatı kurallarını yıkarak sinemanın biçimsel sınırlarını genişletmiş, François Truffaut'nun "400 Darbe" filmi ise özyaşamöyküsel anlatının sinemadaki gücünü ortaya koymuştur. Bu yönetmenler, hem eleştirmen hem de sinemacı kimlikleriyle sinema kültürüne çok katmanlı bir katkıda bulunmuşlardır. Cahiers du Cinéma dergisindeki yazılarıyla kuramsal temellerini atan bu sinemacılar, kamerayı bir kalem gibi kullanma fikrini hayata geçirmişlerdir.</p>`,

    `<img src="${IMG}" alt="Film sahnesi" style="width:100%; border-radius:8px; margin:1.5rem 0;" />`,

    `<p>Üçüncü Sinema hareketi, sömürgecilik sonrası toplumlarda sinemanın politik bir araç olarak kullanılmasını savunmuştur. Fernando Solanas ve Octavio Getino'nun manifestosu, Hollywood'un kültürel emperyalizmine karşı ulusal sinemaların direniş potansiyelini vurgulamıştır. Bu hareket, sinemanın yalnızca sanatsal değil, aynı zamanda politik ve toplumsal bir pratik olduğunu hatırlatmıştır. Latin Amerika, Afrika ve Asya sinemalarının kendine özgü seslerini bulması, bu kuramsal çerçevenin pratik yansımalarıdır.</p>`,

    `<p>Türkiye sineması da bu küresel akımlardan etkilenmiş ve kendi özgün yolunu çizmiştir. Yılmaz Güney'in toplumsal gerçekçi sinemasından Nuri Bilge Ceylan'ın minimalist estetiğine, Zeki Demirkubuz'un varoluşsal sorgulamalarından Semih Kaplanoğlu'nun spiritüel arayışlarına kadar geniş bir yelpazede üretim yapılmıştır. Bu yönetmenler, evrensel sinema dilini yerel hikâyelerle buluşturarak Türkiye sinemasını uluslararası festivallerin vazgeçilmez bir parçası haline getirmişlerdir. Son dönemde ise genç kuşak yönetmenler, dijital teknolojinin sunduğu olanaklarla daha cesur ve deneysel işler ortaya koymaktadırlar.</p>`,

    `<p>Dijital devrim, sinema yapım süreçlerini kökten değiştirmiştir. Dijital kameralar, bağımsız sinemacılara daha önce hayal edemeyecekleri olanaklar sunmuş, post-prodüksiyon süreçleri demokratikleşmiştir. Ancak bu teknolojik devrim, sinema estetiğine ilişkin yeni sorular da doğurmuştur. Film dokusunun kaybı, dijital görüntünün "fazla temiz" bulunması, CGI'ın anlatı üzerindeki etkisi gibi konular, sinemacılar ve kuramcılar arasında hâlâ tartışılmaktadır. Bununla birlikte, dijital teknoloji sayesinde daha önce mümkün olmayan görsel efektler ve anlatı teknikleri de sinema diline eklenmiştir.</p>`,

    `<img src="${IMG}" alt="Sinema salonu" style="width:100%; border-radius:8px; margin:1.5rem 0;" />`,

    `<p>Sinema eleştirisi, filmlerin anlaşılması ve değerlendirilmesinde kritik bir rol oynar. İyi bir eleştiri, filmin yüzeysel katmanlarının ötesine geçerek altında yatan temaları, biçimsel tercihleri ve kültürel bağlamı ortaya koyar. Eleştirmenin görevi, seyirciye yeni bakış açıları sunmak, filmin zenginliğini açığa çıkarmak ve sinema kültürüne katkıda bulunmaktır. Günümüzde sosyal medya ve blog platformları sayesinde herkes eleştirmen olabilse de, derinlikli ve bağlamsal bir eleştiri pratiğinin önemi azalmamış, aksine artmıştır.</p>`,

    `<p>Sonuç olarak, sinema sanatı sürekli bir dönüşüm içindedir ve bu dönüşüm, hem teknolojik gelişmelerden hem de toplumsal değişimlerden beslenir. Her yeni kuşak sinemacı, kendinden önceki mirası alarak yeni ifade biçimleri arar ve sinema dilini zenginleştirir. Seyirci olarak bizim görevimiz ise bu zenginliğin farkında olmak, filmleri salt bir tüketim nesnesi olarak değil, birer sanat eseri olarak deneyimlemektir. Sinema, karanlık bir salonda yabancılarla paylaşılan kolektif bir rüya olmaya devam ettiği sürece, en güçlü ve en demokratik sanat formu olma özelliğini koruyacaktır.</p>`,
  ];
  return paragraflar.slice(0, paragrafSayisi).join('\n\n');
}

// Her yazar için yazı başlıkları ve kategorileri
const yaziBilgileri: { baslik: string; spot: string; kategori: string; slug: string }[] = [
  // Canay Batırbek (0) - 10 yazı
  { baslik: 'The Brutalist ve Mimarlığın Sinematik Temsili', spot: 'Brady Corbet\'in destansı filminde modernist mimarinin yükselişi ve çöküşü üzerine bir okuma.', kategori: 'Eleştiri', slug: 'the-brutalist-mimarlik' },
  { baslik: 'Conclave: Vatikan\'ın Karanlık Koridorları', spot: 'Edward Berger\'in gerilim dolu filminde güç, inanç ve siyasetin iç içe geçtiği anlar.', kategori: 'Eleştiri', slug: 'conclave-vatikan' },
  { baslik: 'Nosferatu Yeniden: Eggers\'in Gotik Vizyonu', spot: 'Robert Eggers\'in klasik vampir hikâyesine getirdiği yeni yorum ve görsel şölen.', kategori: 'Çözümleme', slug: 'nosferatu-eggers' },
  { baslik: 'Anora ve Amerikan Rüyasının Çöküşü', spot: 'Sean Baker\'in Altın Palmiye ödüllü filminde sınıf çatışması ve aşkın imkânsızlığı.', kategori: 'Eleştiri', slug: 'anora-amerikan-ruyasi' },
  { baslik: 'Dune: Çöl Gezegeninin Sinematik Evreni', spot: 'Denis Villeneuve\'ün bilimkurgu destanında görsellik, mitoloji ve siyasi alegoriler.', kategori: 'Çözümleme', slug: 'dune-col-gezegen' },
  { baslik: 'Sinema Salonlarının Geleceği Üzerine', spot: 'Streaming çağında sinema salonlarının yeri, anlamı ve dönüşümü hakkında düşünceler.', kategori: 'Deneme', slug: 'sinema-salonlari-gelecek' },
  { baslik: 'Tarkovski\'nin Zaman Kavramı', spot: 'Andrei Tarkovski\'nin filmlerinde zamanın akışı, bellek ve rüya arasındaki sınırlar.', kategori: 'Kuram / Yorum', slug: 'tarkovski-zaman' },
  { baslik: 'Kurosawa\'nın Samuraylara Vedası', spot: 'Akira Kurosawa\'nın son dönem filmlerinde Japon geleneği ve modernleşme çatışması.', kategori: 'Çözümleme', slug: 'kurosawa-samurai-veda' },
  { baslik: 'Wes Anderson Estetiği: Simetri ve Melankoli', spot: 'Wes Anderson filmlerinde görsel düzen, renk paleti ve karakterlerin yalnızlığı.', kategori: 'Deneme', slug: 'wes-anderson-estetik' },
  { baslik: 'Belgesel Sinemanın Politik Gücü', spot: 'Belgesel filmlerin toplumsal değişimdeki rolü ve etik sorumlulukları üzerine.', kategori: 'Kuram / Yorum', slug: 'belgesel-politik-guc' },
  // Çiçek Coşkun (1) - 10 yazı
  { baslik: 'Sessizliğin Dili: Minimalist Sinema', spot: 'Minimalist anlatının ustalarından örneklerle sessizliğin sinemadaki anlamı.', kategori: 'Kuram / Yorum', slug: 'sessizligin-dili' },
  { baslik: 'Kadın Bakışı ve Feminist Sinema Kuramı', spot: 'Laura Mulvey\'den günümüze feminist sinema eleştirisinin evrimi.', kategori: 'Kuram / Yorum', slug: 'kadin-bakisi-feminist' },
  { baslik: 'İran Sinemasının Şiirsel Gerçekçiliği', spot: 'Kiarostami, Panahi ve Farhadi üçgeninde İran sinemasının evrensel dili.', kategori: 'Çözümleme', slug: 'iran-sinemasi-siirsel' },
  { baslik: 'Travma ve Hafıza: Sinemanın Tanıklığı', spot: 'Kolektif travmaların sinemada nasıl temsil edildiği üzerine kuramsal bir inceleme.', kategori: 'Kuram / Yorum', slug: 'travma-hafiza-taniklik' },
  { baslik: 'Doğa ve İnsan: Ekolojik Sinema', spot: 'Çevresel krizlerin sinemadaki yansımaları ve ekolojik bilinç.', kategori: 'Deneme', slug: 'doga-insan-ekolojik' },
  { baslik: 'Beden Politikası ve Queer Sinema', spot: 'Queer sinemanın tarihsel gelişimi ve güncel temsil politikaları.', kategori: 'Kuram / Yorum', slug: 'beden-politikasi-queer' },
  { baslik: 'Akdeniz Sineması: Ortak Bir Hafıza', spot: 'Akdeniz coğrafyasının sinematik temsilinde göç, kimlik ve aidiyet.', kategori: 'Deneme', slug: 'akdeniz-sinemasi' },
  { baslik: 'Çocuk Karakterler ve Masumiyet Miti', spot: 'Sinemada çocuk temsilleri, masumiyet kavramı ve yetişkin dünyasının eleştirisi.', kategori: 'Çözümleme', slug: 'cocuk-karakterler-masumiyet' },
  { baslik: 'Renk Teorisi ve Sinematografi', spot: 'Rengin sinemadaki anlatısal ve duygusal işlevleri üzerine teknik bir inceleme.', kategori: 'Kuram / Yorum', slug: 'renk-teorisi-sinematografi' },
  { baslik: 'Slow Cinema: Yavaşlığın Estetiği', spot: 'Béla Tarr, Tsai Ming-liang ve Apichatpong Weerasethakul sinemasında zaman.', kategori: 'Çözümleme', slug: 'slow-cinema-yavaslik' },
  // Umut Morkoç (2) - 10 yazı
  { baslik: 'Wittgenstein ve Sinema Felsefesi', spot: 'Dil oyunları kavramının sinematik anlatıya uygulanması üzerine felsefi bir deneme.', kategori: 'Kuram / Yorum', slug: 'wittgenstein-sinema' },
  { baslik: 'Lynch\'in Labirentleri: Kayıp Otoyol\'dan Mulholland Drive\'a', spot: 'David Lynch\'in filmlerinde bilinçaltı, rüya mantığı ve anlatı yapıbozumu.', kategori: 'Çözümleme', slug: 'lynch-labirentleri' },
  { baslik: 'Sinemada Varoluşçuluk: Bergman\'dan Malick\'e', spot: 'Varoluşçu felsefenin sinemadaki izleri ve yönetmenlerin metafizik arayışları.', kategori: 'Kuram / Yorum', slug: 'varoluculuk-bergman-malick' },
  { baslik: 'Film Noir\'in Gölgeleri', spot: 'Kara filmin estetik kodları, toplumsal bağlamı ve günümüzdeki yansımaları.', kategori: 'Çözümleme', slug: 'film-noir-golgeleri' },
  { baslik: 'Deleuze ve Sinema: Hareket-İmge, Zaman-İmge', spot: 'Gilles Deleuze\'ün sinema felsefesinin temel kavramları ve güncel geçerliliği.', kategori: 'Kuram / Yorum', slug: 'deleuze-sinema' },
  { baslik: 'Terrence Malick\'in Doğa Şiirleri', spot: 'Malick\'in filmlerinde doğa, tin ve insanın evrendeki yeri üzerine.', kategori: 'Deneme', slug: 'malick-doga-siirleri' },
  { baslik: 'Fellini ve Groteskin Büyüsü', spot: 'Federico Fellini\'nin filmlerinde karnaval estetiği, grotesk ve otobyografik unsurlar.', kategori: 'Çözümleme', slug: 'fellini-grotesk' },
  { baslik: 'Görüntünün Fenomenolojisi', spot: 'Sinematik görüntünün algılanışı üzerine fenomenolojik bir yaklaşım.', kategori: 'Kuram / Yorum', slug: 'goruntunun-fenomenolojisi' },
  { baslik: 'Pasolini\'nin Şiirsel Sineması', spot: 'Pier Paolo Pasolini\'nin filmlerinde şiir, politika ve kutsal arasındaki gerilim.', kategori: 'Çözümleme', slug: 'pasolini-siirsel' },
  { baslik: 'Sinema ve Psikanaliz: Perdedeki Bilinçaltı', spot: 'Freud ve Lacan\'ın kuramlarının sinema okumasına katkıları.', kategori: 'Kuram / Yorum', slug: 'sinema-psikanaliz' },
  // Ayşe Naz Bulamur (3) - 10 yazı
  { baslik: 'Emilia Pérez: Müzikal Bir Dönüşüm', spot: 'Jacques Audiard\'ın cesur müzikalinde kimlik, cinsiyet ve adalet arayışı.', kategori: 'Eleştiri', slug: 'emilia-perez-muzikal' },
  { baslik: 'La La Land ve Nostalji Sineması', spot: 'Damien Chazelle\'in müzikalinde Hollywood altın çağına özlem ve modern aşk.', kategori: 'Çözümleme', slug: 'la-la-land-nostalji' },
  { baslik: 'Bollywood Müzikalleri ve Kültürel Kimlik', spot: 'Hint sinemasının müzikal geleneği ve toplumsal işlevleri üzerine.', kategori: 'Deneme', slug: 'bollywood-muzikalleri' },
  { baslik: 'West Side Story: İki Neslin Hikâyesi', spot: 'Bernstein ve Sondheim\'ın klasiğinin Spielberg yorumuyla yeniden doğuşu.', kategori: 'Eleştiri', slug: 'west-side-story' },
  { baslik: 'Sinema ve Opera: Görsel Müzik', spot: 'Operatik anlatının sinemadaki dönüşümü ve iki sanatın kesişim noktaları.', kategori: 'Kuram / Yorum', slug: 'sinema-opera-gorsel-muzik' },
  { baslik: 'Ses Tasarımının Görünmez Gücü', spot: 'Film seslerinin anlatıdaki kritik rolü ve ses tasarımcılarının yaratım süreci.', kategori: 'Çözümleme', slug: 'ses-tasarimi-guc' },
  { baslik: 'Jacques Demy\'nin Renkli Dünyası', spot: 'Şerburglu Şemsiyeleri\'nden Rochefort\'un Kızları\'na Demy estetiği.', kategori: 'Deneme', slug: 'jacques-demy-renkli' },
  { baslik: 'Film Müziğinde Leitmotif Kullanımı', spot: 'Wagner\'den John Williams\'a müzikal motiflerin karakter ve tema inşasındaki rolü.', kategori: 'Çözümleme', slug: 'film-muzigi-leitmotif' },
  { baslik: 'Sessiz Sinema Döneminin Müzikal Mirası', spot: 'Sessiz filmlerin canlı müzik eşliğinden talkies devrimine geçiş süreci.', kategori: 'Tarih', slug: 'sessiz-sinema-muzik' },
  { baslik: 'Anime Müzikalleri: Miyazaki ve Hisaishi', spot: 'Joe Hisaishi\'nin bestelerinin Miyazaki filmlerindeki büyülü etkisi.', kategori: 'Çözümleme', slug: 'anime-muzikalleri-miyazaki' },
  // Fatmagül Aslaner Gegeoğlu (4) - 10 yazı
  { baslik: 'Mekân ve Kimlik: Sinemada Şehir Temsilleri', spot: 'Sinematik şehirlerin inşası ve mekânın kimlik oluşumundaki rolü.', kategori: 'Sinema ve Mimarlık', slug: 'mekan-kimlik-sehir' },
  { baslik: 'Blade Runner\'ın Distopik Mimarisi', spot: 'Ridley Scott\'un filminde kentsel çürüme, gözetim ve gelecek vizyonu.', kategori: 'Sinema ve Mimarlık', slug: 'blade-runner-mimari' },
  { baslik: 'Fellini\'nin Roma\'sı: Sinematik Bir Şehir Portresi', spot: 'Federico Fellini filmlerinde Roma\'nın mitolojik ve kişisel temsili.', kategori: 'Sinema ve Mimarlık', slug: 'fellini-roma-portresi' },
  { baslik: 'Antonioni ve Boşluğun Mimarisi', spot: 'Michelangelo Antonioni filmlerinde mimari boşluk ve insani yabancılaşma.', kategori: 'Sinema ve Mimarlık', slug: 'antonioni-bosluk-mimarisi' },
  { baslik: 'İstanbul\'un Sinematik Coğrafyası', spot: 'Türk sinemasında İstanbul\'un değişen yüzü ve şehrin anlatısal işlevi.', kategori: 'Deneme', slug: 'istanbul-sinematik-cografya' },
  { baslik: 'Sinema Mimarisi: Salon Tasarımının Tarihi', spot: 'Sinema salonlarının mimari evrimi ve izleme deneyimi üzerindeki etkisi.', kategori: 'Tarih', slug: 'sinema-mimarisi-salon' },
  { baslik: 'Kubrick\'in Mekânları: Geometri ve Korku', spot: 'Stanley Kubrick filmlerinde mekânın psikolojik baskı aracı olarak kullanımı.', kategori: 'Çözümleme', slug: 'kubrick-mekanlari-geometri' },
  { baslik: 'Sınır Sineması ve Coğrafi Kimlik', spot: 'Sınır bölgelerinin sinematik temsili ve göç anlatılarında mekânın rolü.', kategori: 'Kuram / Yorum', slug: 'sinir-sinemasi-cografi' },
  { baslik: 'Jacques Tati\'nin Oyuncu Mekânları', spot: 'Tati filmlerinde modernist mimari, komedi ve gündelik hayatın absürtlüğü.', kategori: 'Çözümleme', slug: 'tati-oyuncu-mekanlari' },
  { baslik: 'Pandemi Sonrası Sinema Salonları', spot: 'COVID-19 sonrasında sinema salonlarının dönüşümü ve yeni izleme alışkanlıkları.', kategori: 'Deneme', slug: 'pandemi-sonrasi-salonlar' },
  // Gökhan Gökdoğan (5) - 10 yazı
  { baslik: 'Dijital Görüntünün Estetiği ve Etiği', spot: 'Film ve dijital arasındaki estetik tartışma ve görüntü etiği üzerine.', kategori: 'Deneme', slug: 'dijital-goruntu-estetik' },
  { baslik: 'Yapay Zekâ Çağında Sinema', spot: 'AI teknolojilerinin film yapımına etkileri ve sanatsal üretimin geleceği.', kategori: 'Deneme', slug: 'yapay-zeka-sinema' },
  { baslik: 'Sinema ve Müzik: Unutulmaz Film Müzikleri', spot: 'Ennio Morricone\'den Hans Zimmer\'a ikonik film müziklerinin analizi.', kategori: 'Deneme', slug: 'sinema-muzik-unutulmaz' },
  { baslik: 'VFX Devrimi: Pratik Efektlerden Dijitale', spot: 'Görsel efektlerin evrimi ve sinema estetiğindeki dönüşüm.', kategori: 'Çözümleme', slug: 'vfx-devrimi' },
  { baslik: 'Deepfake ve Sinemanın Etik Sınırları', spot: 'Derin sahte teknolojisinin sinema endüstrisine etkileri ve etik sorunlar.', kategori: 'Kuram / Yorum', slug: 'deepfake-etik-sinirlar' },
  { baslik: 'Akıllı Telefon Sineması: Yeni Bir Çağ', spot: 'Cep telefonuyla çekilen filmlerin sinema dilindeki yeri ve potansiyeli.', kategori: 'Deneme', slug: 'akilli-telefon-sinemasi' },
  { baslik: 'Sanal Gerçeklik ve İmmersiyon Sineması', spot: 'VR teknolojisinin sinematik anlatıya getirdiği yeni olanaklar.', kategori: 'Kuram / Yorum', slug: 'sanal-gerceklik-sinema' },
  { baslik: 'Streaming Platformları ve Auteur Sineması', spot: 'Netflix, MUBI ve diğer platformların auteur sinemaya etkisi.', kategori: 'Deneme', slug: 'streaming-auteur' },
  { baslik: 'Sinematografide Lens Seçiminin Anlatısal Etkisi', spot: 'Farklı lens kullanımlarının görsel anlatı üzerindeki belirleyici etkisi.', kategori: 'Çözümleme', slug: 'lens-secimi-anlatim' },
  { baslik: 'Renk Düzeltme ve Filmin Duygusal Tonu', spot: 'Post-prodüksiyonda renk grading\'in anlatıya kattığı duygusal boyut.', kategori: 'Çözümleme', slug: 'renk-duzeltme-duygusal' },
  // Nurten Bayraktar (6) - 10 yazı
  { baslik: 'Alice Guy-Blaché: Sinemanın Unutulan Annesi', spot: 'Sinema tarihinin ilk kadın yönetmeninin yeniden keşfedilmesi.', kategori: 'Tarih', slug: 'alice-guy-blache' },
  { baslik: 'Yeşilçam\'ın Altın Çağı: Nostalji ve Gerçeklik', spot: 'Türk sinemasının Yeşilçam döneminin yeniden değerlendirilmesi.', kategori: 'Tarih', slug: 'yesilcam-altin-cagi' },
  { baslik: 'Sinema Tarihinde Sansür ve Direniş', spot: 'Farklı ülkelerde sinema sansürünün tarihi ve sanatçıların direniş stratejileri.', kategori: 'Tarih', slug: 'sansur-direnis' },
  { baslik: 'Weimar Cumhuriyeti ve Ekspresyonist Sinema', spot: 'Alman Dışavurumculuğunun toplumsal bağlamı ve sinema estetiğine katkıları.', kategori: 'Tarih', slug: 'weimar-ekspresyonist' },
  { baslik: 'Sovyet Montaj Kuramcıları', spot: 'Eisenstein, Pudovkin ve Vertov\'un sinema diline katkıları.', kategori: 'Tarih', slug: 'sovyet-montaj' },
  { baslik: 'Hollywood\'un Stüdyo Sistemi: Yükseliş ve Çöküş', spot: 'Altın çağ Hollywood\'unun stüdyo sisteminin işleyişi ve sonu.', kategori: 'Tarih', slug: 'hollywood-studyo-sistemi' },
  { baslik: 'Üçüncü Sinema Manifestosu ve Mirası', spot: 'Solanas ve Getino\'nun devrimci sinema anlayışı ve güncel yansımaları.', kategori: 'Tarih', slug: 'ucuncu-sinema-manifesto' },
  { baslik: 'Dogme 95: Saflık Yemini ve Sonrası', spot: 'Lars von Trier ve Thomas Vinterberg\'in manifestosunun etkisi.', kategori: 'Tarih', slug: 'dogme-95-saflik' },
  { baslik: 'Türk Sinemasında Kadın Yönetmenler Tarihi', spot: 'Cumhuriyet\'ten günümüze Türk sinemasında kadın yönetmenlerin mücadelesi.', kategori: 'Tarih', slug: 'turk-kadin-yonetmenler' },
  { baslik: 'Sinema ve İkinci Dünya Savaşı', spot: 'Savaş döneminde propaganda sineması ve savaş sonrası sinematik tanıklık.', kategori: 'Tarih', slug: 'sinema-dunya-savasi' },
  // Can Ataç (7) - 10 yazı
  { baslik: 'Animasyon Sinemasının Sessiz Devrimi', spot: 'Bağımsız animasyonun yükselişi ve alternatif üretim modelleri.', kategori: 'Animasyon', slug: 'animasyon-sessiz-devrim' },
  { baslik: 'Miyazaki\'nin Büyülü Dünyaları', spot: 'Hayao Miyazaki animasyonlarında doğa, çocukluk ve fantezi.', kategori: 'Animasyon', slug: 'miyazaki-buyulu-dunyalar' },
  { baslik: 'Pixar\'ın Anlatı Formülü', spot: 'Pixar stüdyosunun hikâye anlatma tekniği ve duygusal zekâsı.', kategori: 'Animasyon', slug: 'pixar-anlati-formulu' },
  { baslik: 'Stop-Motion: Eller ve Sabır Sanatı', spot: 'Stop-motion animasyonun tarihçesi, teknikleri ve güncel ustaları.', kategori: 'Animasyon', slug: 'stop-motion-eller-sabir' },
  { baslik: 'Anime Estetiği ve Japon Kültürü', spot: 'Anime\'nin görsel dilinin kültürel kökleri ve küresel etkisi.', kategori: 'Animasyon', slug: 'anime-estetigi-japon' },
  { baslik: 'Yetişkin Animasyonu: Sınırları Zorlamak', spot: 'Animasyonun çocuklara özgü olmadığını kanıtlayan cesur yapımlar.', kategori: 'Animasyon', slug: 'yetiskin-animasyonu' },
  { baslik: 'Türk Animasyon Sineması: Tarih ve Gelecek', spot: 'Türkiye\'de animasyon sinemasının gelişimi ve potansiyeli.', kategori: 'Animasyon', slug: 'turk-animasyon' },
  { baslik: 'Rotoskopi Tekniği ve Rüya Estetiği', spot: 'Rotoskopi tekniğinin sinema tarihindeki yeri ve Linklater filmleri.', kategori: 'Animasyon', slug: 'rotoskopi-ruya' },
  { baslik: 'Laika Stüdyosu ve Karanlık Masallar', spot: 'Laika\'nın stop-motion filmlerinde gotik atmosfer ve cesur hikâyeler.', kategori: 'Animasyon', slug: 'laika-karanlik-masallar' },
  { baslik: 'Spider-Verse ve Animasyon Dilinin Geleceği', spot: 'Spider-Man: Into the Spider-Verse\'ün animasyon estetiğinde yarattığı devrim.', kategori: 'Animasyon', slug: 'spider-verse-gelecek' },
  // Süleyman Bölükbaş (8) - 10 yazı
  { baslik: 'B Korku Sinemasının Yaratıcı Gücü', spot: 'Düşük bütçeli korku filmlerinin kültürel önemi ve yaratıcı özgürlüğü.', kategori: 'Tür Sineması', slug: 'b-korku-yaratici' },
  { baslik: 'Slasher Filmlerin Anatomisi', spot: 'Slasher alt türünün kodları, evrimi ve toplumsal alt metinleri.', kategori: 'Tür Sineması', slug: 'slasher-anatomisi' },
  { baslik: 'Western\'in Ölümü ve Yeniden Doğuşu', spot: 'Klasik Western\'den Revisionist Western\'e türün dönüşüm hikâyesi.', kategori: 'Tür Sineması', slug: 'western-olum-yeniden' },
  { baslik: 'Film Noir\'dan Neo-Noir\'a', spot: 'Kara filmin evriminde toplumsal değişimin yansımaları.', kategori: 'Tür Sineması', slug: 'film-noir-neo-noir' },
  { baslik: 'Bilimkurgu Sinemasında Distopya ve Ütopya', spot: 'Gelecek vizyonlarının sinemadaki temsili ve toplumsal eleştiri işlevi.', kategori: 'Tür Sineması', slug: 'bilimkurgu-distopya-utopya' },
  { baslik: 'Gangster Filmlerinin Altın Çağı', spot: 'Scarface\'ten Godfather\'a gangster türünün Amerikan sinemasındaki yeri.', kategori: 'Tür Sineması', slug: 'gangster-altin-cagi' },
  { baslik: 'Giallo: İtalyan Gerilim Sineması', spot: 'Mario Bava ve Dario Argento\'nun giallo filmlerinde stil ve şiddet.', kategori: 'Tür Sineması', slug: 'giallo-italyan-gerilim' },
  { baslik: 'Zombi Sinemasının Toplumsal Alegorisi', spot: 'George Romero\'dan günümüze zombi filmlerinde tüketim toplumu eleştirisi.', kategori: 'Tür Sineması', slug: 'zombi-toplumsal-alegori' },
  { baslik: 'Wuxia: Uçan Kılıçların Şiiri', spot: 'Çin dövüş sanatları sinemasının estetik geleneği ve felsefi derinliği.', kategori: 'Tür Sineması', slug: 'wuxia-ucan-kiliclar' },
  { baslik: 'Kaiju Filmleri: Canavarlar ve Atom Çağı', spot: 'Godzilla\'dan Pacific Rim\'e dev canavar filmlerinin kültürel bağlamı.', kategori: 'Tür Sineması', slug: 'kaiju-canavarlar-atom' },
  // Esra Ballım (9) - 10 yazı
  { baslik: 'Kaybın Sineması: Yas ve Hafıza', spot: 'Sinema perdelerinde kayıp, yas tutma ve hatırlama ritüelleri.', kategori: 'Deneme', slug: 'kaybin-sinemasi-yas' },
  { baslik: 'Aşkın Sinematik Halleri', spot: 'Farklı kültürlerde aşkın sinemada nasıl anlatıldığı üzerine bir yolculuk.', kategori: 'Deneme', slug: 'askin-sinematik-halleri' },
  { baslik: 'Yalnızlığın Portresi: Sinemada İzolasyon', spot: 'Modern sinemanın en güçlü temalarından biri olan yalnızlığın farklı yüzleri.', kategori: 'Deneme', slug: 'yalnizligin-portresi' },
  { baslik: 'Çocukluk ve Sinema: Kayıp Cennetin Peşinde', spot: 'Sinemada çocukluk temsilleri ve nostalji arasındaki gerilim.', kategori: 'Deneme', slug: 'cocukluk-sinema-kayip' },
  { baslik: 'Hayvan Temsilleri ve Post-Hümanist Sinema', spot: 'Sinemada hayvanların temsili ve insan-merkezci bakışın sorgulanması.', kategori: 'Kuram / Yorum', slug: 'hayvan-temsilleri-posthumanist' },
  { baslik: 'Sinema ve Rüya: Görüntülerin Bilinçaltı', spot: 'Freud\'dan Lacan\'a rüya kuramının sinematik karşılıkları.', kategori: 'Kuram / Yorum', slug: 'sinema-ruya-bilincalti' },
  { baslik: 'Yaşlılık ve Sinema: Zamanın İzleri', spot: 'Yaşlanmanın sinemadaki temsili ve toplumsal önyargılarla mücadele.', kategori: 'Deneme', slug: 'yaslilik-sinema-zaman' },
  { baslik: 'Savaş Sinemasında İnsan Durumu', spot: 'Savaş filmlerinde şiddet, kahramanlık miti ve barış arayışı.', kategori: 'Çözümleme', slug: 'savas-sinemasi-insan' },
  { baslik: 'Yemek ve Sinema: Sofranın Anlatısı', spot: 'Yemek sahnelerinin sinemadaki kültürel ve duygusal işlevi.', kategori: 'Deneme', slug: 'yemek-sinema-sofra' },
  { baslik: 'Dans ve Sinema: Bedenin Şarkısı', spot: 'Sinemada dansın anlatısal gücü ve koreografinin görsel dili.', kategori: 'Deneme', slug: 'dans-sinema-beden' },
  // Eda Güngör Korçak (10) - 10 yazı
  { baslik: 'Söyleşi: Nuri Bilge Ceylan ile Sinema Üzerine', spot: 'Türkiye\'nin en önemli yönetmenlerinden biriyle sanat ve yaşam üzerine.', kategori: 'Söyleşi', slug: 'soylesi-nuri-bilge-ceylan' },
  { baslik: 'Söyleşi: Genç Yönetmen Perspektifleri', spot: 'Yeni nesil Türk sinemacılarla sinema yapma deneyimi üzerine.', kategori: 'Söyleşi', slug: 'soylesi-genc-yonetmenler' },
  { baslik: 'Festival Günlüğü: Cannes 2025', spot: 'Bu yılki Cannes Film Festivali\'nden izlenimler ve öne çıkan filmler.', kategori: 'Deneme', slug: 'festival-gunlugu-cannes-2025' },
  { baslik: 'Kadın Sinemacılarla Yuvarlak Masa', spot: 'Türkiye\'de kadın sinemacıların deneyimleri ve sektördeki konumları.', kategori: 'Söyleşi', slug: 'kadin-sinemaciler-yuvarlak' },
  { baslik: 'Bağımsız Sinema Yapımcılığı Üzerine', spot: 'Bağımsız film yapımının zorlukları ve ödüllendirici yanları.', kategori: 'Söyleşi', slug: 'bagimsiz-sinema-yapimciligi' },
  { baslik: 'Belgesel Yönetmeniyle Sohbet', spot: 'Belgesel sinema pratiğinin öznel ve nesnel boyutları üzerine.', kategori: 'Söyleşi', slug: 'belgesel-yonetmen-sohbet' },
  { baslik: 'Sinema Eğitimi: Okullar ve Atölyeler', spot: 'Türkiye\'de sinema eğitiminin durumu ve alternatif öğrenme yolları.', kategori: 'Deneme', slug: 'sinema-egitimi-okullar' },
  { baslik: 'Görüntü Yönetmeniyle Işık Üzerine', spot: 'Bir görüntü yönetmeninin ışık, renk ve kompozisyon anlayışı.', kategori: 'Söyleşi', slug: 'goruntu-yonetmeni-isik' },
  { baslik: 'Senaryo Yazarlığının İncelikleri', spot: 'Deneyimli bir senariste ile hikâye anlatma sanatının teknik boyutları.', kategori: 'Söyleşi', slug: 'senaryo-yazarliginin-incelikleri' },
  { baslik: 'Kısa Film Festivalleri ve Önemi', spot: 'Kısa filmlerin sinema ekosistemindeki yeri ve festival deneyimleri.', kategori: 'Deneme', slug: 'kisa-film-festivalleri' },
  // Muharrem Derin (11) - 10 yazı
  { baslik: 'Sinema ve Felsefe: Perdede Düşünmek', spot: 'Filmlerin felsefi soruları nasıl somutlaştırdığı üzerine.', kategori: 'Kuram / Yorum', slug: 'sinema-felsefe-perdede' },
  { baslik: 'Etik ve Sinema: Ahlaki İkilemlerin Perdedeki Yansıması', spot: 'Sinema filmlerinde etik soruların sunumu ve seyircinin konumu.', kategori: 'Kuram / Yorum', slug: 'etik-sinema-ahlaki' },
  { baslik: 'Sinematik Zaman: Bergson\'dan Deleuze\'e', spot: 'Zaman felsefesinin sinema kuramına etkileri üzerine.', kategori: 'Kuram / Yorum', slug: 'sinematik-zaman-bergson' },
  { baslik: 'Gözetim Toplumu ve Sinema', spot: 'Panoptikon\'dan sosyal medyaya gözetimin sinematik temsili.', kategori: 'Çözümleme', slug: 'gozetim-toplumu-sinema' },
  { baslik: 'Sinema ve Adalet Kavramı', spot: 'Hukuk, adalet ve intikamın sinematik temsillerindeki gerilim.', kategori: 'Kuram / Yorum', slug: 'sinema-adalet-kavrami' },
  { baslik: 'Absürt Tiyatro ve Sinema', spot: 'Beckett ve Ionesco\'nun absürt anlayışının sinemadaki yansımaları.', kategori: 'Çözümleme', slug: 'absurt-tiyatro-sinema' },
  { baslik: 'Otoriterizm ve Sinema: Direniş Anlatıları', spot: 'Otoriter rejimlerde sinemanın direniş aracı olarak kullanımı.', kategori: 'Kuram / Yorum', slug: 'otoriterizm-sinema-direnis' },
  { baslik: 'Hafıza Mekânları: Sinema ve Arşiv', spot: 'Film arşivlerinin kültürel hafızadaki rolü ve koruma politikaları.', kategori: 'Deneme', slug: 'hafiza-mekanlari-arsiv' },
  { baslik: 'Posthuman Sinema: İnsan Sonrası Anlatılar', spot: 'Yapay zekâ, siborg ve transhümanizm temalarının sinematik işlenişi.', kategori: 'Kuram / Yorum', slug: 'posthuman-sinema' },
  { baslik: 'Sinema ve Hakikat: Belgesel Etiği', spot: 'Belgesel sinemada nesnel gerçeklik arayışı ve etik sınırlar.', kategori: 'Kuram / Yorum', slug: 'sinema-hakikat-belgesel' },
  // Akın Tunç (12) - 10 yazı
  { baslik: 'Türkiye\'de Film Eleştirisi Geleneği', spot: 'Cumhuriyet\'ten günümüze Türkiye\'de sinema eleştirisinin serüveni.', kategori: 'Tarih', slug: 'turkiye-film-elestirisi' },
  { baslik: 'Eleştirmenin Rolü: Rehber mi Yargıç mı?', spot: 'Sinema eleştirmeninin işlevi ve sorumluluğu üzerine düşünceler.', kategori: 'Deneme', slug: 'elestirmenin-rolu' },
  { baslik: 'Auteur Kuramı Hâlâ Geçerli mi?', spot: 'Yönetmen odaklı sinema anlayışının günümüzdeki konumu ve eleştirisi.', kategori: 'Kuram / Yorum', slug: 'auteur-kurami-gecerli' },
  { baslik: 'Film Festivalleri Ekosistemi', spot: 'Uluslararası film festivallerinin sinema endüstrisindeki rolü.', kategori: 'Deneme', slug: 'film-festivalleri-ekosistemi' },
  { baslik: 'Sosyal Medya Çağında Sinema Eleştirisi', spot: 'Twitter, Letterboxd ve YouTube\'un sinema eleştirisine etkisi.', kategori: 'Deneme', slug: 'sosyal-medya-sinema-elestirisi' },
  { baslik: 'Cannes\'ın Altın Palmiyesi: Tarihsel Bir Bakış', spot: 'Cannes Film Festivali\'nin en prestijli ödülünün tarihçesi.', kategori: 'Tarih', slug: 'cannes-altin-palmiye' },
  { baslik: 'Oscar\'lar ve Sinema Politikası', spot: 'Akademi Ödülleri\'nin sinema endüstrisindeki politik boyutu.', kategori: 'Deneme', slug: 'oscarlar-sinema-politikasi' },
  { baslik: 'Cahiers du Cinéma ve Sinema Düşüncesi', spot: 'Dünyanın en etkili sinema dergisinin mirası ve önemi.', kategori: 'Tarih', slug: 'cahiers-du-cinema' },
  { baslik: 'Sight & Sound Anketi: En İyi Filmler', spot: 'Her on yılda bir güncellenen listedeki değişimler ve anlamları.', kategori: 'Deneme', slug: 'sight-sound-anketi' },
  { baslik: 'Sinema Yazarlığının Geleceği', spot: 'Değişen medya ortamında sinema yazarlığının dönüşümü.', kategori: 'Deneme', slug: 'sinema-yazarliginin-gelecegi' },
  // Emrah Günok (13) - 10 yazı
  { baslik: 'Kore Sinemasının Küresel Yükselişi', spot: 'Parasite\'tan Squid Game\'e Güney Kore sinemasının dünya çapındaki etkisi.', kategori: 'Çözümleme', slug: 'kore-sinemasi-yukselisi' },
  { baslik: 'Bong Joon-ho\'nun Sınıf Savaşları', spot: 'Kore\'li yönetmenin filmlerinde sınıfsal eşitsizliğin sinematik temsili.', kategori: 'Eleştiri', slug: 'bong-joon-ho-sinif' },
  { baslik: 'Park Chan-wook ve Şiddetin Estetiği', spot: 'İntikam Üçlemesi\'nden Karar Ver\'e şiddetin sinematik işlevi.', kategori: 'Çözümleme', slug: 'park-chan-wook-siddet' },
  { baslik: 'Japon Yeni Dalgası: Oshima ve Imamura', spot: 'Japon Yeni Dalga sinemasının kültürel bağlamı ve mirası.', kategori: 'Tarih', slug: 'japon-yeni-dalgasi' },
  { baslik: 'Wong Kar-wai\'ın Melankolik Dünyası', spot: 'Hong Kong\'lu yönetmenin filmlerinde zaman, aşk ve kayıp.', kategori: 'Çözümleme', slug: 'wong-kar-wai-melankolik' },
  { baslik: 'Bollywood\'un Ötesi: Bağımsız Hint Sineması', spot: 'Hint sinemasının ana akım dışındaki güçlü sesleri.', kategori: 'Deneme', slug: 'bollywoodun-otesi' },
  { baslik: 'İskandinav Sinemasının Karanlık Güzelliği', spot: 'Bergman\'dan Trier\'e İskandinav sinemasının evrensel temaları.', kategori: 'Çözümleme', slug: 'iskandinav-sinemasi' },
  { baslik: 'Romanya Yeni Dalgası', spot: 'Mungiu, Puiu ve Porumboiu ile Romanya sinemasının yeniden doğuşu.', kategori: 'Deneme', slug: 'romanya-yeni-dalgasi' },
  { baslik: 'Afrika Sineması: Bilinmeyen Kıta', spot: 'Afrika\'nın zengin sinema geleneği ve keşfedilmeyi bekleyen hazineler.', kategori: 'Deneme', slug: 'afrika-sinemasi' },
  { baslik: 'Latin Amerika Sinemasında Büyülü Gerçekçilik', spot: 'Edebiyattan sinemaya büyülü gerçekçiliğin yolculuğu.', kategori: 'Çözümleme', slug: 'latin-amerika-buyulu' },
  // Cem Kayalıgil (14) - 10 yazı
  { baslik: 'Türkiye Sinema Yazınında Sekans Dergisi', spot: 'Sekans\'ın yirmi yılı aşkın süredir sinema yazarlığına kattığı perspektif.', kategori: 'Deneme', slug: 'turkiye-sinema-yazininda-sekans' },
  { baslik: 'Yeni Türkiye Sineması: Bir Dönüşüm Hikayesi', spot: '2000\'lerden bu yana Türkiye sinemasında yaşanan dönüşüm.', kategori: 'Deneme', slug: 'yeni-turkiye-sinemasi' },
  { baslik: 'Ceylan Sinemasında Sessizlik ve Doğa', spot: 'Nuri Bilge Ceylan filmlerinde Anadolu coğrafyası ve insan doğası.', kategori: 'Çözümleme', slug: 'ceylan-sessizlik-doga' },
  { baslik: 'Demirkubuz ve Varoluşun Ağırlığı', spot: 'Zeki Demirkubuz filmlerinde suç, ceza ve ahlaki çöküş.', kategori: 'Çözümleme', slug: 'demirkubuz-varolusum' },
  { baslik: 'Sinema Dergiciliği: Dünü ve Bugünü', spot: 'Basılı sinema dergilerinin dijital çağdaki yeri ve geleceği.', kategori: 'Deneme', slug: 'sinema-dergiciligi' },
  { baslik: 'Türk Sinemasında Göç Anlatıları', spot: 'İç ve dış göçün Türk sinemasındaki temsillerinin değişimi.', kategori: 'Çözümleme', slug: 'turk-sinemasi-goc' },
  { baslik: 'Avrupa Sanat Sineması ve Türkiye', spot: 'Avrupa sanat filmi geleneğinin Türk sineması üzerindeki etkisi.', kategori: 'Kuram / Yorum', slug: 'avrupa-sanat-sinemasi' },
  { baslik: 'Sekans\'ın 20 Yılı: Bir Muhasebe', spot: 'Dergimizin yirmi yıllık yayın serüvenine geriye dönük bir bakış.', kategori: 'Deneme', slug: 'sekans-20-yili' },
  { baslik: 'Film Eleştirisi Yarışmasının Mirası', spot: 'On dört yıllık yarışma geleneğimizin sinema yazınına katkıları.', kategori: 'Deneme', slug: 'yarisma-mirasi' },
  { baslik: 'Sinema Kültürü ve Toplumsal Dönüşüm', spot: 'Sinemanın toplumsal değişimdeki rolü ve kültürel işlevi.', kategori: 'Kuram / Yorum', slug: 'sinema-kulturu-toplumsal' },
  // Zehra Yiğit (15) - 10 yazı
  { baslik: 'İşçi Filmleri Festivali ve Sinema Toplulukları', spot: 'Sinema topluluklarının karşılaştığı sorunlar ve dayanışma pratikleri.', kategori: 'Deneme', slug: 'isci-filmleri-festivali' },
  { baslik: 'Sabırsızlık Zamanı Çocukları', spot: 'Dijital çağda sinema izleme alışkanlıklarının dönüşümü.', kategori: 'Deneme', slug: 'sabirsizlik-zamani-cocuklari' },
  { baslik: 'Genç Sinemaseverler ve Cinefili Kültürü', spot: 'Z kuşağının sinemayla ilişkisi ve yeni izleme pratikleri.', kategori: 'Deneme', slug: 'genc-sinemaseverler-cinefili' },
  { baslik: 'Üniversite Sinema Kulüplerinin Önemi', spot: 'Kampüslerdeki sinema topluluklarının sinema kültürüne katkısı.', kategori: 'Deneme', slug: 'universite-sinema-kulupleri' },
  { baslik: 'Sinema ve Toplumsal Cinsiyet', spot: 'Toplumsal cinsiyet rollerinin sinemadaki temsili ve dönüşümü.', kategori: 'Kuram / Yorum', slug: 'sinema-toplumsal-cinsiyet' },
  { baslik: 'Film Okur-Yazarlığı: Neden Önemli?', spot: 'Sinema okuryazarlığının eğitimdeki yeri ve toplumsal gerekliliği.', kategori: 'Deneme', slug: 'film-okur-yazarligi' },
  { baslik: 'Festivaller Arası: Antalya\'dan Berlin\'e', spot: 'Farklı film festivallerinin karakterleri ve sinema ekosistemindeki rolleri.', kategori: 'Deneme', slug: 'festivaller-arasi' },
  { baslik: 'Sinema Arkeolojisi: Kayıp Filmler', spot: 'Sinema tarihinin kayıp hazineleri ve restorasyon çalışmaları.', kategori: 'Tarih', slug: 'sinema-arkeolojisi-kayip' },
  { baslik: 'Sinemada Temsil Politikaları', spot: 'Kimlik, etnisite ve toplumsal grupların perdedeki temsili.', kategori: 'Kuram / Yorum', slug: 'sinemada-temsil-politikalari' },
  { baslik: 'Pandemi Sonrası Sinema Dünyası', spot: 'COVID-19\'un sinema endüstrisi üzerindeki kalıcı etkileri.', kategori: 'Deneme', slug: 'pandemi-sonrasi-sinema' },
];

// Tarih üretici
function tarihUret(index: number): string {
  const baslangic = new Date('2023-01-15');
  baslangic.setDate(baslangic.getDate() + index * 11);
  return baslangic.toISOString().split('T')[0];
}

// Kapak görseli - 6 mevcut resim arasından döndür, bazılarına resim verme
function kapakSec(index: number): string | undefined {
  if (index % 7 === 0) return undefined; // Her 7. yazıda resim yok - default cover gösterilecek
  const resimler = ['/images/ara-yazi-01.jpg', '/images/ara-yazi-02.jpg', '/images/ara-yazi-03.jpg', '/images/ara-yazi-04.jpg', '/images/ara-yazi-05.jpg', '/images/ara-yazi-06.jpg'];
  return resimler[index % resimler.length];
}

// Ara Yazılar (Blog) - 160 yazı, her yazar 10 yazı
export const araYazilar: AraYazi[] = yaziBilgileri.map((yazi, index) => ({
  id: `ay-${String(index + 1).padStart(3, '0')}`,
  baslik: yazi.baslik,
  spot: yazi.spot,
  icerik: icerikUret(yazi.baslik, 12 + (index % 3)),
  yazar: yazarlar[Math.floor(index / 10)],
  kategori: yazi.kategori,
  kapakGorseli: kapakSec(index),
  yayinTarihi: tarihUret(index),
  slug: yazi.slug,
}));

// Hakkımızda İçeriği
export const hakkimizdaIcerik = {
  baslik: 'Sekans Sinema Grubu',
  icerik: `Sekans Sinema Grubu, 2005 yılında İstanbul'da kurulmuş, sinema kültürünü yaymayı ve sinema üzerine eleştirel düşünceyi geliştirmeyi amaçlayan bir kolektiftir.

**Misyonumuz**
Sekans olarak amacımız, sinema sanatının hem akademik hem de popüler boyutlarını bir arada tutarak, sinema kültürüne katkıda bulunmaktır. Dergimiz aracılığıyla sinema eleştirisi, çözümleme, kuram ve tarih alanlarında özgün içerikler üretiyoruz.

**Sekans Dergisi**
Yılda iki kez (Temmuz ve Aralık aylarında) yayınlanan dergimiz, her sayısında farklı bir tema etrafında sinemanın çok katmanlı dünyasına ışık tutuyor. Eleştiri, çözümleme, kuram/yorum, deneme, söyleşi ve tarih başlıkları altında sinema üzerine derinlemesine yazılar sunuyoruz.

**Film Eleştirisi ve Film Çözümlemesi Yarışması**
2009 yılından bu yana düzenlediğimiz yarışma, genç sinema yazarlarını desteklemeyi ve sinema yazınına yeni sesler kazandırmayı amaçlıyor.`,
  iletisim: {
    email: 'info@sekans.org',
    adres: 'İstanbul, Türkiye',
    sosyal: {
      twitter: 'https://twitter.com/sekansdergi',
      instagram: 'https://instagram.com/sekansdergi',
      facebook: 'https://facebook.com/sekansdergi',
    },
  },
};

// Yarışma Bilgileri
export const yarismasiBilgi = {
  baslik: 'Film Eleştirisi ve Film Çözümlemesi Yarışması',
  aciklama: `Sekans Sinema Grubu tarafından düzenlenen Film Eleştirisi ve Film Çözümlemesi Yarışması, genç sinema yazarlarını desteklemeyi ve sinema yazınına yeni sesler kazandırmayı amaçlamaktadır.

**Yarışma Kategorileri**
- Film Eleştirisi
- Film Çözümlemesi

**Ödüller**
Her iki kategoride birinci olan yazılara ödül ve dergimizde yayınlanma imkanı sunulmaktadır.

**Başvuru Koşulları**
- 30 yaşını doldurmamış olmak
- Daha önce kitap olarak yayınlanmamış yazılar
- Her kategori için en fazla bir başvuru`,
  gecmisKazananlar: [
    { yil: 2024, birinci: 'Ayşe Demir - "Sinema ve Zaman: Tarkovski\'nin Aynasında"', ikinci: 'Burak Yılmaz - "Korku Sinemasında Sesin Politikası"' },
    { yil: 2023, birinci: 'Ceren Kaya - "Yeni Gerçekçilik ve Türkiye Sineması"', ikinci: 'Deniz Aydın - "Animasyonun Sınırları"' },
    { yil: 2022, birinci: 'Efe Can - "Belgesel Sinema ve Hafıza"', ikinci: 'Gizem Yıldız - "Kadın Yönetmenler ve Özyaşamöyküsel Sinema"' },
  ],
};
