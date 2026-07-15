import { useState, useCallback, useEffect } from 'react';
import { useGlobalFootnotes } from '@/hooks/useFootnotes';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnaSayfa from '@/pages/AnaSayfa';
import SonSayiDetay from '@/pages/SonSayiDetay';
import YaziDetay from '@/pages/YaziDetay';
import ArsivSayfasi from '@/pages/ArsivSayfasi';
import AraYazilarSayfasi from '@/pages/AraYazilarSayfasi';
import AraYaziDetay from '@/pages/AraYaziDetay';
import YazarlarSayfasi from '@/pages/YazarlarSayfasi';
import YazarDetaySayfasi from '@/pages/YazarDetay';
import HakkimizdaSayfasi from '@/pages/HakkimizdaSayfasi';
import IletisimSayfasi from '@/pages/IletisimSayfasi';
import YarismaSayfasi from '@/pages/YarismaSayfasi';
import SekansIndeksSayfasi from '@/pages/SekansIndeksSayfasi';
import StatikSayfa from '@/pages/StatikSayfa';
import { CMS } from '@/cms';
import { CMSProvider, useCMS } from '@/context/CMSContext';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

import type { Yazi, AraYazi, Yazar, Sayi, AramaYaziSonuc } from '@/types';

type PageType =
  | 'anasayfa'
  | 'sonsayi'
  | 'yazidetay'
  | 'arsiv'
  | 'arayazilar'
  | 'arayazidetay'
  | 'hakkimizda'
  | 'iletisim'
  | 'yarisma'
  | 'yazarlar'
  | 'yazardetay'
  | 'yazarlarimizdan'
  | 'sinemakitapligi'
  | 'basilisayilar'
  | 'duyurular'
  | 'textsinenglish'
  | 'indeks'
  | 'yazistandartlari'
  | 'statik'
  | 'cms';

// Özel bölüm sayfaları: ara_yazilar.kategori değerine göre ayrışır.
// Eski adlar da (migration öncesi veriyle uyum için) kabul edilir.
const BOLUM_KATEGORILERI: Record<string, string[]> = {
  yazarlarimizdan: ['Yazarlarımızdan'],
  sinemakitapligi: ['Sinema Kitaplığı'],
  basilisayilar: ['Basılı Sayılar'],
  duyurular: ['Duyurular', 'Sekans Sinema Grubu', 'Duyuru'],
  textsinenglish: ['Texts in English', 'Arşiv Yazıları'],
};
// Blog listesinin DIŞINDA tutulan kategoriler. Duyurular blog akışında KALIR
// (müşteri isteği: eski "Sekans Sinema Grubu" kategorisi blogda "Duyurular" adıyla görünsün).
const OZEL_BOLUMLER = new Set([
  ...BOLUM_KATEGORILERI.yazarlarimizdan,
  ...BOLUM_KATEGORILERI.sinemakitapligi,
  ...BOLUM_KATEGORILERI.basilisayilar,
  ...BOLUM_KATEGORILERI.textsinenglish,
]);

interface PageState {
  page: PageType;
  selectedYazi?: Yazi;
  selectedAraYazi?: AraYazi;
  selectedYazar?: Yazar;
  selectedSayi?: Sayi;      // yazidetay/sonsayi için sayı bağlamı (çoklu sayı desteği)
  blogKategori?: string;    // Blog sayfası ön-seçili kategori filtresi
  statikSlug?: string;      // 'statik' sayfası için slug (dinamik menü: sabit_sayfa hedefi)
  statikBaslik?: string;    // içerik yüklenene kadar gösterilecek başlık
}

function AppContent() {
  useGlobalFootnotes();

  // URL'den başlangıç sayfasını belirle
  const getInitialPage = (): PageState => {
    const path = window.location.pathname;
    if (path === '/cms' || path === '/cms/') {
      return { page: 'cms' };
    }
    return { page: 'anasayfa' };
  };

  const [currentPage, setCurrentPage] = useState<PageState>(getInitialPage);

  // URL değişikliklerini dinle
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/cms' || path === '/cms/') {
        setCurrentPage({ page: 'cms' });
      } else if (path === '/' || path === '') {
        setCurrentPage({ page: 'anasayfa' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // CMS'den verileri al
  const { sonSayi, anasayfaSayilari, arsivSayilari, araYazilar, yazarlar, hakkimizdaIcerik, yarismasiBilgi, isLoading, error, refresh } = useCMS();

  // "Blog" sayfası: özel bölümlere (Sinema Kitaplığı vb.) ait OLMAYAN yazılar.
  const araYazilarListesi = araYazilar.filter((y) => !OZEL_BOLUMLER.has(y.kategori));
  // Bir bölüm sayfasının yazı listesi (eski + yeni kategori adları birlikte).
  const bolumListesi = (kategoriler: string[]) =>
    araYazilar.filter((y) => kategoriler.includes(y.kategori));
  // Bir yazının ait olduğu listeyi bul (önceki/sonraki gezinme bu liste içinde kalır).
  const getSectionList = useCallback((araYazi: AraYazi): AraYazi[] => {
    for (const kategoriler of Object.values(BOLUM_KATEGORILERI)) {
      if (kategoriler.includes(araYazi.kategori) && OZEL_BOLUMLER.has(araYazi.kategori)) {
        return araYazilar.filter((y) => kategoriler.includes(y.kategori));
      }
    }
    return araYazilar.filter((y) => !OZEL_BOLUMLER.has(y.kategori));
  }, [araYazilar]);

  // Navigasyon handler'ları
  const navigateTo = useCallback((page: PageType, extra?: Partial<PageState>) => {
    setCurrentPage({ page, ...extra });

    // URL'yi güncelle
    if (page === 'cms') {
      window.history.pushState({}, '', '/cms');
    } else if (page === 'anasayfa') {
      window.history.pushState({}, '', '/');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Ana sayfa navigasyonu
  const handleNavigate = useCallback((pageId: string) => {
    // Dinamik menü hedefleri (önekli): sabit_sayfa / kategori / filtre_liste.
    if (pageId.startsWith('statik:')) {
      navigateTo('statik', { statikSlug: pageId.slice('statik:'.length) });
      return;
    }
    if (pageId.startsWith('kategori:')) {
      // Kategori adına göre blog filtresi (özel bölüm değilse "Blog" listesinde açılır).
      navigateTo('arayazilar', { blogKategori: pageId.slice('kategori:'.length) });
      return;
    }
    if (pageId.startsWith('filtre:')) {
      // Faz 4'e kadar geçici: özel filtre sayfası henüz yok -> blog listesine düş.
      navigateTo('arayazilar');
      return;
    }
    switch (pageId) {
      case 'anasayfa':
      case 'sonsayi':
      case 'arsiv':
      case 'arayazilar':
      case 'hakkimizda':
      case 'iletisim':
      case 'yarisma':
      case 'yazarlar':
      case 'yazarlarimizdan':
      case 'sinemakitapligi':
      case 'basilisayilar':
      case 'duyurular':
      case 'textsinenglish':
      case 'indeks':
      case 'yazistandartlari':
      case 'cms':
        navigateTo(pageId);
        break;
      case 'arayazilar-arayazi':
        // Üst menü "Yazılar > Ara Yazılar": Blog'u "Ara Yazı" filtresiyle aç.
        navigateTo('arayazilar', { blogKategori: 'Ara Yazı' });
        break;
      default:
        navigateTo('anasayfa');
    }
  }, [navigateTo]);

  // Yazı tıklama handler'ı — sayı bağlamıyla (çoklu sayı: ana sayfada 2 sayı olabilir)
  const handleYaziClick = useCallback((yazi: Yazi, sayi?: Sayi) => {
    navigateTo('yazidetay', { selectedYazi: yazi, selectedSayi: sayi });
  }, [navigateTo]);

  // Sayı tıklama handler'ı (kapağa tıklanınca sayı detayına git)
  const handleSayiClick = useCallback((sayi?: Sayi) => {
    navigateTo('sonsayi', { selectedSayi: sayi });
  }, [navigateTo]);

  // Ara yazı tıklama handler'ı — bootstrap listesi icerik içermez; tam içeriği API'den çek.
  const handleAraYaziClick = useCallback((araYazi: AraYazi) => {
    if (araYazi.icerik) {
      navigateTo('arayazidetay', { selectedAraYazi: araYazi });
      return;
    }
    api.araYazi.get(araYazi.id)
      .then((full) => navigateTo('arayazidetay', { selectedAraYazi: full }))
      .catch(() => navigateTo('arayazidetay', { selectedAraYazi: araYazi }));
  }, [navigateTo]);

  // Tüm ara yazılar sayfasına git
  const handleTumAraYazilarClick = useCallback(() => {
    navigateTo('arayazilar');
  }, [navigateTo]);

  // Yazar tıklama handler'ı
  const handleYazarClick = useCallback((yazar: Yazar) => {
    navigateTo('yazardetay', { selectedYazar: yazar });
  }, [navigateTo]);

  // Yazarlar sayfasına git
  const handleYazarlarClick = useCallback(() => {
    navigateTo('yazarlar');
  }, [navigateTo]);

  // Geri dönme handler'ı
  const handleBackClick = useCallback(() => {
    navigateTo('anasayfa');
  }, [navigateTo]);

  // CMS'den çıkış handler'ı
  const handleExitCMS = useCallback(() => {
    navigateTo('anasayfa');
  }, [navigateTo]);

  // Arama / indeks sonucundan dergi yazısı aç (yazı başka bir sayıda olabilir).
  const handleAramaYaziAc = useCallback((sonuc: AramaYaziSonuc) => {
    api.yazi.get(sonuc.id)
      .then((full) => {
        const bilinen = [sonSayi, ...anasayfaSayilari].find((s) => s && s.id === full.sayiId);
        const sayi: Sayi = bilinen ?? {
          id: sonuc.sayiId,
          numara: sonuc.sayiNumara,
          ay: sonuc.sayiAy,
          yil: sonuc.sayiYil,
          tamBaslik: `${sonuc.sayiAy} ${sonuc.sayiYil} | Sayı ${sonuc.sayiNumara}`,
          kapakGorseli: '',
          pdfUrl: '',
          yazilar: [full],
          yayinTarihi: '',
        };
        navigateTo('yazidetay', { selectedYazi: full, selectedSayi: sayi });
      })
      .catch(() => { /* yazı yüklenemedi — sessiz geç */ });
  }, [navigateTo, sonSayi, anasayfaSayilari]);

  // Aramadan yazar aç
  const handleAramaYazarAc = useCallback((yazarId: string) => {
    const yazar = yazarlar.find((y) => y.id === yazarId);
    if (yazar) {
      navigateTo('yazardetay', { selectedYazar: yazar });
    }
  }, [navigateTo, yazarlar]);

  // Önceki/Sonraki Ara Yazı handler'ları — gezinme, yazının ait olduğu bölüm içinde kalır.
  const getOncekiAraYazi = useCallback((currentAraYazi: AraYazi): AraYazi | undefined => {
    const liste = getSectionList(currentAraYazi);
    const currentIndex = liste.findIndex(ay => ay.id === currentAraYazi.id);
    return currentIndex > 0 ? liste[currentIndex - 1] : undefined;
  }, [getSectionList]);

  const getSonrakiAraYazi = useCallback((currentAraYazi: AraYazi): AraYazi | undefined => {
    const liste = getSectionList(currentAraYazi);
    const currentIndex = liste.findIndex(ay => ay.id === currentAraYazi.id);
    return currentIndex >= 0 && currentIndex < liste.length - 1 ? liste[currentIndex + 1] : undefined;
  }, [getSectionList]);

  // Önceki/Sonraki Yazı handler'ları (yazının ait olduğu sayı içinde)
  const yaziSayisiBaglami = currentPage.selectedSayi ?? sonSayi;

  const getOncekiYazi = useCallback((currentYazi: Yazi): Yazi | undefined => {
    const yazilar = yaziSayisiBaglami.yazilar;
    const currentIndex = yazilar.findIndex(y => y.id === currentYazi.id);
    return currentIndex > 0 ? yazilar[currentIndex - 1] : undefined;
  }, [yaziSayisiBaglami]);

  const getSonrakiYazi = useCallback((currentYazi: Yazi): Yazi | undefined => {
    const yazilar = yaziSayisiBaglami.yazilar;
    const currentIndex = yazilar.findIndex(y => y.id === currentYazi.id);
    return currentIndex >= 0 && currentIndex < yazilar.length - 1 ? yazilar[currentIndex + 1] : undefined;
  }, [yaziSayisiBaglami]);

  // CMS sayfasını render et (CMS kendi yükleme/oturum durumunu yönetir)
  if (currentPage.page === 'cms') {
    return <CMS onExitCMS={handleExitCMS} />;
  }

  // Genel site: veri yüklenirken spinner, hata olursa yeniden dene ekranı.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">İçerik yüklenemedi</h1>
          <p className="text-gray-600 mb-6">Sunucuya bağlanırken bir sorun oluştu.</p>
          <button
            onClick={() => { void refresh(); }}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            Yeniden dene
          </button>
        </div>
      </div>
    );
  }

  // Geçerli sayfayı render et
  const renderPage = () => {
    switch (currentPage.page) {
      case 'anasayfa':
        return (
          <AnaSayfa
            sayilar={anasayfaSayilari.length > 0 ? anasayfaSayilari : [sonSayi]}
            araYazilar={araYazilarListesi}
            onYaziClick={handleYaziClick}
            onSayiClick={handleSayiClick}
            onAraYaziClick={handleAraYaziClick}
            onTumAraYazilarClick={handleTumAraYazilarClick}
          />
        );

      case 'sonsayi': {
        const gosterilenSayi = currentPage.selectedSayi ?? sonSayi;
        return (
          <SonSayiDetay
            sayi={gosterilenSayi}
            onYaziClick={(y) => handleYaziClick(y, gosterilenSayi)}
            onBackClick={handleBackClick}
          />
        );
      }

      case 'yazidetay':
        if (currentPage.selectedYazi) {
          const oncekiYazi = getOncekiYazi(currentPage.selectedYazi);
          const sonrakiYazi = getSonrakiYazi(currentPage.selectedYazi);

          return (
            <YaziDetay
              yazi={currentPage.selectedYazi}
              sayi={yaziSayisiBaglami}
              oncekiYazi={oncekiYazi}
              sonrakiYazi={sonrakiYazi}
              onBackClick={handleBackClick}
              onSayiClick={() => handleSayiClick(yaziSayisiBaglami)}
              onOncekiYazi={oncekiYazi ? () => handleYaziClick(oncekiYazi, yaziSayisiBaglami) : undefined}
              onSonrakiYazi={sonrakiYazi ? () => handleYaziClick(sonrakiYazi, yaziSayisiBaglami) : undefined}
              onYazarClick={handleYazarClick}
              onYaziClick={(y) => handleYaziClick(y, yaziSayisiBaglami)}
            />
          );
        }
        return null;

      case 'arsiv':
        return (
          <ArsivSayfasi
            arsivSayilari={arsivSayilari}
          />
        );

      case 'arayazilar':
        return (
          <AraYazilarSayfasi
            key={currentPage.blogKategori ?? 'tumu'}
            araYazilar={araYazilarListesi}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            initialKategori={currentPage.blogKategori}
          />
        );

      case 'yazarlarimizdan':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi(BOLUM_KATEGORILERI.yazarlarimizdan)}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Yazarlarımızdan"
            aciklama="Sekans yazarlarının kaleminden sinema yazıları, söyleşiler ve çeviriler."
          />
        );

      case 'sinemakitapligi':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi(BOLUM_KATEGORILERI.sinemakitapligi)}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Sinema Kitaplığı"
            aciklama="Sinema üzerine kitap tanıtımları ve değerlendirmeleri."
          />
        );

      case 'basilisayilar':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi(BOLUM_KATEGORILERI.basilisayilar)}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Basılı Sayılar"
            aciklama="Sekans Sinema Yazıları Seçkisi ve diğer basılı yayınlarımız."
          />
        );

      case 'duyurular':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi(BOLUM_KATEGORILERI.duyurular)}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Duyurular"
            aciklama="Yarışma duyuruları, sonuçlar ve Sekans'tan haberler."
          />
        );

      case 'textsinenglish':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi(BOLUM_KATEGORILERI.textsinenglish)}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Texts in English"
            aciklama="English translations of selected Sekans texts."
          />
        );

      case 'indeks':
        return (
          <SekansIndeksSayfasi
            onDergiYaziClick={handleAramaYaziAc}
            onBlogYaziClick={(id) => {
              const mevcut = araYazilar.find((a) => a.id === id);
              if (mevcut) {
                handleAraYaziClick(mevcut);
              } else {
                api.araYazi.get(id)
                  .then((full) => navigateTo('arayazidetay', { selectedAraYazi: full }))
                  .catch(() => { /* sessiz geç */ });
              }
            }}
            onBackClick={handleBackClick}
          />
        );

      case 'yazistandartlari':
        return (
          <StatikSayfa
            slug="yazi-standartlari"
            varsayilanBaslik="Sekans Yazı Standartları"
            onBackClick={handleBackClick}
          />
        );

      case 'statik':
        // Dinamik menüden (sabit_sayfa) açılan herhangi bir statik sayfa.
        return (
          <StatikSayfa
            key={currentPage.statikSlug}
            slug={currentPage.statikSlug ?? ''}
            varsayilanBaslik={currentPage.statikBaslik ?? ''}
            onBackClick={handleBackClick}
          />
        );

      case 'arayazidetay':
        if (currentPage.selectedAraYazi) {
          const onceki = getOncekiAraYazi(currentPage.selectedAraYazi);
          const sonraki = getSonrakiAraYazi(currentPage.selectedAraYazi);

          return (
            <AraYaziDetay
              araYazi={currentPage.selectedAraYazi}
              oncekiAraYazi={onceki}
              sonrakiAraYazi={sonraki}
              onBackClick={handleBackClick}
              onOncekiAraYazi={onceki ? () => handleAraYaziClick(onceki) : undefined}
              onSonrakiAraYazi={sonraki ? () => handleAraYaziClick(sonraki) : undefined}
              tumAraYazilar={getSectionList(currentPage.selectedAraYazi)}
              onAraYaziClick={handleAraYaziClick}
              onYazarClick={handleYazarClick}
            />
          );
        }
        return null;

      case 'hakkimizda':
        return (
          <HakkimizdaSayfasi
            hakkimizda={hakkimizdaIcerik}
            onBackClick={handleBackClick}
          />
        );

      case 'iletisim':
        return (
          <IletisimSayfasi
            onBackClick={handleBackClick}
            onYaziStandartlariClick={() => navigateTo('yazistandartlari')}
          />
        );

      case 'yarisma':
        return (
          <YarismaSayfasi
            yarismasi={yarismasiBilgi}
            onBackClick={handleBackClick}
          />
        );

      case 'yazarlar':
        return (
          <YazarlarSayfasi
            yazarlar={yazarlar}
            araYazilar={araYazilar}
            sonSayi={sonSayi}
            onYazarClick={handleYazarClick}
            onBackClick={handleBackClick}
          />
        );

      case 'yazardetay':
        if (currentPage.selectedYazar) {
          return (
            <YazarDetaySayfasi
              yazar={currentPage.selectedYazar}
              araYazilar={araYazilar}
              sonSayi={sonSayi}
              onBackClick={handleBackClick}
              onAraYaziClick={handleAraYaziClick}
              onYazarlarClick={handleYazarlarClick}
            />
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage.page === 'anasayfa' ? 'anasayfa' : currentPage.page}
        onYaziAc={handleAramaYaziAc}
        onAraYaziAc={handleAraYaziClick}
        onYazarAc={handleAramaYazarAc}
      />

      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CMSProvider>
          <AppContent />
        </CMSProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
