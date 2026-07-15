// CMS Ana Bileşen - Auth korumalı
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CMSLogin } from './CMSLogin';
import { CMSLayout } from './CMSLayout';
import type { CMSPage } from './CMSLayout';
import { CMSDashboard } from './CMSDashboard';
import { CMSSayiYonetimi } from './CMSSayiYonetimi';
import { CMSYaziListesi } from './CMSYaziListesi';
import { CMSYaziEditor } from './CMSYaziEditor';
import { CMSAraYaziListesi } from './CMSAraYaziListesi';
import { CMSAraYaziEditor } from './CMSAraYaziEditor';
import { CMSYazarYonetimi } from './CMSYazarYonetimi';
import { CMSKategoriYonetimi } from './CMSKategoriYonetimi';
import { CMSMenuYonetimi } from './CMSMenuYonetimi';
import { CMSAnasayfaYonetimi } from './CMSAnasayfaYonetimi';
import { CMSSayfaYonetimi } from './CMSSayfaYonetimi';
import { CMSFiltreYonetimi } from './CMSFiltreYonetimi';
import { CMSIndeksYonetimi } from './CMSIndeksYonetimi';
import { CMSKullaniciYonetimi } from './CMSKullaniciYonetimi';
import { CMSYarismaYonetimi } from './CMSYarismaYonetimi';
import { CMSHakkimizdaYonetimi } from './CMSHakkimizdaYonetimi';
import { CMSAyarlar } from './CMSAyarlar';
import { Loader2 } from 'lucide-react';

interface CMSProps {
  onExitCMS: () => void;
}

type EditorState =
  | { type: 'none' }
  | { type: 'yazi'; yaziId?: string; sayiId?: string }
  | { type: 'ara-yazi'; yaziId?: string; initialTab?: 'edit' | 'preview' };

export function CMS({ onExitCMS }: CMSProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<CMSPage>('dashboard');
  const [editorState, setEditorState] = useState<EditorState>({ type: 'none' });
  // "Sayı Yönetimi -> Yazıları Yönet" ile açılan yazı listesinin önseçili sayısı.
  const [yaziListSayiId, setYaziListSayiId] = useState<string | undefined>(undefined);

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa login sayfasını göster
  if (!isAuthenticated) {
    return <CMSLogin />;
  }

  // Yazı editörünü aç (yeni yazıda önseçili sayı geçirilebilir)
  const openYaziEditor = (yaziId?: string, sayiId?: string) => {
    setEditorState({ type: 'yazi', yaziId, sayiId });
  };

  // Ara yazı editörünü aç
  const openAraYaziEditor = (yaziId?: string) => {
    setEditorState({ type: 'ara-yazi', yaziId, initialTab: 'edit' });
  };

  // Ara yazı önizlemesini aç
  const openAraYaziPreview = (yaziId: string) => {
    setEditorState({ type: 'ara-yazi', yaziId, initialTab: 'preview' });
  };

  // Editörden çık
  const closeEditor = () => {
    setEditorState({ type: 'none' });
  };

  // Editör açıksa tam sayfa editör göster
  if (editorState.type === 'yazi') {
    return (
      <CMSYaziEditor
        yaziId={editorState.yaziId}
        preselectSayiId={editorState.sayiId}
        onBack={closeEditor}
        onSave={closeEditor}
      />
    );
  }

  if (editorState.type === 'ara-yazi') {
    return (
      <CMSAraYaziEditor
        yaziId={editorState.yaziId}
        onBack={closeEditor}
        onSave={closeEditor}
        initialTab={editorState.initialTab}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <CMSDashboard onNavigate={setCurrentPage} />;
      case 'anasayfa':
        return <CMSAnasayfaYonetimi />;
      case 'sayilar':
        return (
          <CMSSayiYonetimi
            onManageArticles={(sayiId) => {
              setYaziListSayiId(sayiId);
              setCurrentPage('yazilar');
            }}
            onNewYazi={(sayiId) => openYaziEditor(undefined, sayiId)}
          />
        );
      case 'yazilar':
        return <CMSYaziListesi onEditYazi={openYaziEditor} initialSayiId={yaziListSayiId} />;
      case 'ara-yazilar':
        return <CMSAraYaziListesi onEditYazi={openAraYaziEditor} onPreviewYazi={openAraYaziPreview} />;
      case 'yazarlar':
        return <CMSYazarYonetimi />;
      case 'kategoriler':
        return <CMSKategoriYonetimi />;
      case 'menu':
        return <CMSMenuYonetimi />;
      case 'sayfalar':
        return <CMSSayfaYonetimi />;
      case 'filtreler':
        return <CMSFiltreYonetimi />;
      case 'indeks':
        return <CMSIndeksYonetimi />;
      case 'kullanicilar':
        return <CMSKullaniciYonetimi />;
      case 'yarismasi':
        return <CMSYarismaYonetimi />;
      case 'hakkimizda':
        return <CMSHakkimizdaYonetimi />;
      case 'ayarlar':
        return <CMSAyarlar />;
      default:
        return <CMSDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <CMSLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onExitCMS={onExitCMS}
    >
      {renderPage()}
    </CMSLayout>
  );
}

export default CMS;
