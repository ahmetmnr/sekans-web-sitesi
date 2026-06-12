// CMS Layout - Ana düzen bileşeni
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
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
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CMSPage =
  | 'dashboard'
  | 'sayilar'
  | 'yazilar'
  | 'ara-yazilar'
  | 'yazarlar'
  | 'kategoriler'
  | 'yarismasi'
  | 'hakkimizda'
  | 'ayarlar';

interface CMSLayoutProps {
  children: React.ReactNode;
  currentPage: CMSPage;
  onNavigate: (page: CMSPage) => void;
  onExitCMS: () => void;
}

const menuItems: { id: CMSPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Kontrol Paneli', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'sayilar', label: 'Sayı Yönetimi', icon: <BookOpen className="h-5 w-5" /> },
  { id: 'yazilar', label: 'Yazı Yönetimi', icon: <FileText className="h-5 w-5" /> },
  { id: 'ara-yazilar', label: 'Ara Yazılar', icon: <FileText className="h-5 w-5" /> },
  { id: 'yazarlar', label: 'Yazarlar', icon: <Users className="h-5 w-5" /> },
  { id: 'kategoriler', label: 'Kategoriler', icon: <FolderOpen className="h-5 w-5" /> },
  { id: 'yarismasi', label: 'Yarışma', icon: <Trophy className="h-5 w-5" /> },
  { id: 'hakkimizda', label: 'Hakkımızda', icon: <Info className="h-5 w-5" /> },
  { id: 'ayarlar', label: 'Ayarlar', icon: <Settings className="h-5 w-5" /> },
];

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
            {menuItems.map((item) => (
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
