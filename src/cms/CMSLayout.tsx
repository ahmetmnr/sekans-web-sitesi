// CMS Layout - Ana düzen bileşeni
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Home,
  FileText,
  BookOpen,
  Users,
  FolderOpen,
  Trophy,
  Info,
  Settings,
  ArrowLeft,
  Database,
  LogOut,
  User,
  UserCog,
  Menu as MenuIcon,
  Files,
  Filter,
  ListOrdered,
  Type
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CMSPage =
  | 'dashboard'
  | 'anasayfa'
  | 'sayilar'
  | 'yazilar'
  | 'ara-yazilar'
  | 'yazarlar'
  | 'kategoriler'
  | 'menu'
  | 'sayfalar'
  | 'sayfa-metinleri'
  | 'filtreler'
  | 'indeks'
  | 'kullanicilar'
  | 'yarismasi'
  | 'hakkimizda'
  | 'ayarlar';

interface CMSLayoutProps {
  children: React.ReactNode;
  currentPage: CMSPage;
  onNavigate: (page: CMSPage) => void;
  onExitCMS: () => void;
}

/* [15] YETKİ AYRIMI — panel menüsü.

   EDİTÖR (içerik üretir):
     Kontrol Paneli, Sayı Yönetimi (yalnızca sorumlusu olduğu sayılar),
     Yazı Yönetimi, Ara Yazılar vd., Yazarlar.

   YÖNETİCİ (yukarıdakiler + sitenin YAPISI):
     Ana Sayfa panelleri, Kategoriler, Menü, Sabit Sayfalar, Sayfa Metinleri,
     Filtre Sayfaları, Sekans İndeks, Kullanıcılar, Yarışma, Hakkımızda, Ayarlar.

   Menüyü gizlemek TEK BAŞINA yeterli değildir; aynı ayrım sunucuda da
   uygulanır (bkz. api/index.php rota tablosu + api/lib/auth_guard.php).
   Buradaki gizleme yalnızca editöre yapamayacağı işleri göstermemek içindir. */
const menuItems: { id: CMSPage; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Kontrol Paneli', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'sayilar', label: 'Sayı Yönetimi', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'yazilar', label: 'Yazı Yönetimi', icon: <FileText className="h-5 w-5" /> },
  // Bu bölüm yalnızca ara yazıları değil, basılı sayılar / duyurular /
  // Sinema Kitaplığı / İngilizce metinleri de yönetir — adı bu yüzden "vd.".
  { id: 'ara-yazilar', label: 'Ara Yazılar vd.', icon: <FileText className="h-5 w-5" /> },
  { id: 'yazarlar', label: 'Yazarlar', icon: <Users className="h-5 w-5" /> },

  // --- Buradan aşağısı sitenin YAPISI: yalnızca yönetici ---
  { id: 'anasayfa', label: 'Ana Sayfa', icon: <Home className="h-5 w-5" />, adminOnly: true },
  { id: 'kategoriler', label: 'Kategoriler', icon: <FolderOpen className="h-5 w-5" />, adminOnly: true },
  { id: 'menu', label: 'Menü Yönetimi', icon: <MenuIcon className="h-5 w-5" />, adminOnly: true },
  { id: 'sayfalar', label: 'Sabit Sayfalar', icon: <Files className="h-5 w-5" />, adminOnly: true },
  { id: 'sayfa-metinleri', label: 'Sayfa Metinleri', icon: <Type className="h-5 w-5" />, adminOnly: true },
  { id: 'filtreler', label: 'Filtre Sayfaları', icon: <Filter className="h-5 w-5" />, adminOnly: true },
  { id: 'indeks', label: 'Sekans İndeks', icon: <ListOrdered className="h-5 w-5" />, adminOnly: true },
  { id: 'kullanicilar', label: 'Kullanıcılar', icon: <UserCog className="h-5 w-5" />, adminOnly: true },
  { id: 'yarismasi', label: 'Yarışma', icon: <Trophy className="h-5 w-5" />, adminOnly: true },
  { id: 'hakkimizda', label: 'Hakkımızda', icon: <Info className="h-5 w-5" />, adminOnly: true },
  { id: 'ayarlar', label: 'Ayarlar', icon: <Settings className="h-5 w-5" />, adminOnly: true },
];

/** Editörün açabileceği panel sayfaları (adminOnly olmayanlar). */
export const EDITOR_SAYFALARI: CMSPage[] = menuItems
  .filter((m) => !m.adminOnly)
  .map((m) => m.id);

export function CMSLayout({ children, currentPage, onNavigate, onExitCMS }: CMSLayoutProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="font-bold text-lg text-gray-900">Sekans CMS</h1>
              <p className="text-xs text-gray-500">İçerik Yönetim Sistemi</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 bg-gray-50 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role === 'admin' ? 'Yönetici' : 'Editör'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems
              .filter((item) => !item.adminOnly || user?.role === 'admin')
              .map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={onExitCMS}
          >
            <ArrowLeft className="h-5 w-5" />
            Siteye Dön
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
