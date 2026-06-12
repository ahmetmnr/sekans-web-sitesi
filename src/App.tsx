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
import { CMS } from '@/cms';
import { CMSProvider, useCMS } from '@/context/CMSContext';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

import type { Yazi, AraYazi, Yazar } from '@/types';

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
  | 'cms';

// Canlı siteden taşınan bölümler: ara_yazilar.kategori değerine göre ayrışır.
const BOLUM_KATEGORILERI: Record<string, string> = {
  yazarlarimizdan: 'Yazarlarımızdan',
  sinemakitapligi: 'Sinema Kitaplığı',
  basilisayilar: 'Basılı Sayılar',
  duyurular: 'Duyuru',
};
const OZEL_BOLUMLER = new Set(Object.values(BOLUM_KATEGORILERI));

interface PageState {
  page: PageType;
  selectedYazi?: Yazi;
  selectedAraYazi?: AraYazi;
  selectedYazar?: Yazar;
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
  const { sonSayi, arsivSayilari, araYazilar, yazarlar, hakkimizdaIcerik, yarismasiBilgi, isLoading, error, refresh } = useCMS();

  // "Ara Yazılar" sayfası: özel bölümlere (Yazarlarımızdan vb.) ait OLMAYAN yazılar.
  const araYazilarListesi = araYazilar.filter((y) => !OZEL_BOLUMLER.has(y.kategori));
  // Bir bölüm sayfasının yazı listesi.
  const bolumListesi = (kategori: string) => araYazilar.filter((y) => y.kategori === kategori);
  // Bir yazının ait olduğu listeyi bul (önceki/sonraki gezinme bu liste içinde kalır).
  const getSectionList = useCallback((araYazi: AraYazi): AraYazi[] => {
    if (OZEL_BOLUMLER.has(araYazi.kategori)) {
      return araYazilar.filter((y) => y.kategori === araYazi.kategori);
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
    switch (pageId) {
      case 'anasayfa':
        navigateTo('anasayfa');
        break;
      case 'sonsayi':
        navigateTo('sonsayi');
        break;
      case 'arsiv':
        navigateTo('arsiv');
        break;
      case 'arayazilar':
        navigateTo('arayazilar');
        break;
      case 'hakkimizda':
        navigateTo('hakkimizda');
        break;
      case 'iletisim':
        navigateTo('iletisim');
        break;
      case 'yarisma':
        navigateTo('yarisma');
        break;
      case 'yazarlar':
        navigateTo('yazarlar');
        break;
      case 'yazarlarimizdan':
        navigateTo('yazarlarimizdan');
        break;
      case 'sinemakitapligi':
        navigateTo('sinemakitapligi');
        break;
      case 'basilisayilar':
        navigateTo('basilisayilar');
        break;
      case 'duyurular':
        navigateTo('duyurular');
        break;
      case 'cms':
        navigateTo('cms');
        break;
      default:
        navigateTo('anasayfa');
    }
  }, [navigateTo]);

  // Yazı tıklama handler'ı
  const handleYaziClick = useCallback((yazi: Yazi) => {
    navigateTo('yazidetay', { selectedYazi: yazi });
  }, [navigateTo]);

  // Son sayı tıklama handler'ı
  const handleSayiClick = useCallback(() => {
    navigateTo('sonsayi');
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

  // Önceki/Sonraki Yazı handler'ları (sayı içi)
  const getOncekiYazi = useCallback((currentYazi: Yazi): Yazi | undefined => {
    const yazilar = sonSayi.yazilar;
    const currentIndex = yazilar.findIndex(y => y.id === currentYazi.id);
    return currentIndex > 0 ? yazilar[currentIndex - 1] : undefined;
  }, [sonSayi]);

  const getSonrakiYazi = useCallback((currentYazi: Yazi): Yazi | undefined => {
    const yazilar = sonSayi.yazilar;
    const currentIndex = yazilar.findIndex(y => y.id === currentYazi.id);
    return currentIndex < yazilar.length - 1 ? yazilar[currentIndex + 1] : undefined;
  }, [sonSayi]);

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
            sonSayi={sonSayi}
            araYazilar={araYazilarListesi}
            onYaziClick={handleYaziClick}
            onSayiClick={handleSayiClick}
            onAraYaziClick={handleAraYaziClick}
            onTumAraYazilarClick={handleTumAraYazilarClick}
          />
        );

      case 'sonsayi':
        return (
          <SonSayiDetay
            sayi={sonSayi}
            onYaziClick={handleYaziClick}
            onBackClick={handleBackClick}
          />
        );

      case 'yazidetay':
        if (currentPage.selectedYazi) {
          const oncekiYazi = getOncekiYazi(currentPage.selectedYazi);
          const sonrakiYazi = getSonrakiYazi(currentPage.selectedYazi);

          return (
            <YaziDetay
              yazi={currentPage.selectedYazi}
              sayi={sonSayi}
              oncekiYazi={oncekiYazi}
              sonrakiYazi={sonrakiYazi}
              onBackClick={handleBackClick}
              onSayiClick={handleSayiClick}
              onOncekiYazi={oncekiYazi ? () => handleYaziClick(oncekiYazi) : undefined}
              onSonrakiYazi={sonrakiYazi ? () => handleYaziClick(sonrakiYazi) : undefined}
              onYazarClick={handleYazarClick}
              onYaziClick={handleYaziClick}
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
            araYazilar={araYazilarListesi}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
          />
        );

      case 'yazarlarimizdan':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi('Yazarlarımızdan')}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Yazarlarımızdan"
            aciklama="Sekans yazarlarının kaleminden sinema yazıları, söyleşiler ve çeviriler."
          />
        );

      case 'sinemakitapligi':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi('Sinema Kitaplığı')}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Sinema Kitaplığı"
            aciklama="Sinema üzerine kitap tanıtımları ve değerlendirmeleri."
          />
        );

      case 'basilisayilar':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi('Basılı Sayılar')}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Basılı Sayılar"
            aciklama="Sekans Sinema Yazıları Seçkisi ve diğer basılı yayınlarımız."
          />
        );

      case 'duyurular':
        return (
          <AraYazilarSayfasi
            araYazilar={bolumListesi('Duyuru')}
            onAraYaziClick={handleAraYaziClick}
            onBackClick={handleBackClick}
            baslik="Duyurular"
            aciklama="Yarışma duyuruları, sonuçlar ve Sekans'tan haberler."
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
