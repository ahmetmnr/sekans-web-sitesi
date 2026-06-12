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
import { CMSYarismaYonetimi } from './CMSYarismaYonetimi';
import { CMSHakkimizdaYonetimi } from './CMSHakkimizdaYonetimi';
import { CMSAyarlar } from './CMSAyarlar';
import { Loader2 } from 'lucide-react';

interface CMSProps {
  onExitCMS: () => void;
}

type EditorState =
  | { type: 'none' }
  | { type: 'yazi'; yaziId?: string }
  | { type: 'ara-yazi'; yaziId?: string; initialTab?: 'edit' | 'preview' };

export function CMS({ onExitCMS }: CMSProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<CMSPage>('dashboard');
  const [editorState, setEditorState] = useState<EditorState>({ type: 'none' });

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

  // Yazı editörünü aç
  const openYaziEditor = (yaziId?: string) => {
    setEditorState({ type: 'yazi', yaziId });
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
      case 'sayilar':
        return <CMSSayiYonetimi />;
      case 'yazilar':
        return <CMSYaziListesi onEditYazi={openYaziEditor} />;
      case 'ara-yazilar':
        return <CMSAraYaziListesi onEditYazi={openAraYaziEditor} onPreviewYazi={openAraYaziPreview} />;
      case 'yazarlar':
        return <CMSYazarYonetimi />;
      case 'kategoriler':
        return <CMSKategoriYonetimi />;
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
