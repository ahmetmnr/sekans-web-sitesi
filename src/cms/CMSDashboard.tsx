// CMS Dashboard - Kontrol Paneli
import { useCMS } from '@/context/CMSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  FileText,
  Users,
  FolderOpen,
  TrendingUp,
  Calendar,
  Plus,
  Eye
} from 'lucide-react';
import type { CMSPage } from './CMSLayout';

interface CMSDashboardProps {
  onNavigate: (page: CMSPage) => void;
}

export function CMSDashboard({ onNavigate }: CMSDashboardProps) {
  const { sonSayi, sayilar, arsivSayilari, araYazilar, yazarlar, kategoriler } = useCMS();

  const hazirlananSayisi = sayilar.filter((s) => s.durum === 'taslak').length;
  const sonSayiYayin = sonSayi.yayinTarihi ? new Date(sonSayi.yayinTarihi) : null;
  const sonSayiYayinStr = sonSayiYayin && !isNaN(sonSayiYayin.getTime())
    ? sonSayiYayin.toLocaleDateString('tr-TR')
    : 'Belirtilmemiş';

  const stats = [
    {
      title: 'Yayındaki Sayı',
      value: sonSayi.numara || '—',
      description: sonSayi.numara ? `${sonSayi.ay} ${sonSayi.yil}` : 'Yayında sayı yok',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Hazırlanan Sayılar',
      value: hazirlananSayisi,
      description: 'Taslak durumunda',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Arşiv Sayısı',
      value: arsivSayilari.length,
      description: 'Toplam sayı',
      icon: <FolderOpen className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Son Sayı Yazıları',
      value: sonSayi.yazilar.length,
      description: 'Mevcut sayıda',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Ara Yazılar',
      value: araYazilar.length,
      description: 'Blog yazıları',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Yazarlar',
      value: yazarlar.length,
      description: 'Kayıtlı yazar',
      icon: <Users className="h-5 w-5" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Kategoriler',
      value: kategoriler.length,
      description: 'Yazı kategorisi',
      icon: <FolderOpen className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  const recentAraYazilar = [...araYazilar]
    .sort((a, b) => new Date(b.yayinTarihi).getTime() - new Date(a.yayinTarihi).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kontrol Paneli</h1>
        <p className="text-gray-600 mt-1">Sekans Dergisi içerik yönetimi</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan işlemlere hızlı erişim</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('yazilar')}
            >
              <Plus className="h-4 w-4" />
              Yeni Yazı Ekle
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('ara-yazilar')}
            >
              <Plus className="h-4 w-4" />
              Yeni Ara Yazı Ekle
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('yazarlar')}
            >
              <Plus className="h-4 w-4" />
              Yeni Yazar Ekle
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onNavigate('sayilar')}
            >
              <Eye className="h-4 w-4" />
              Son Sayıyı Görüntüle
            </Button>
          </CardContent>
        </Card>

        {/* Current Issue Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Güncel Sayı: {sonSayi.tamBaslik || '—'}
            </CardTitle>
            <CardDescription>
              Yayın Tarihi: {sonSayiYayinStr}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Toplam Yazı</span>
                <span className="font-medium">{sonSayi.yazilar.length}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Son eklenen yazılar:</p>
                <ul className="space-y-1">
                  {sonSayi.yazilar.slice(0, 3).map((yazi) => (
                    <li key={yazi.id} className="text-sm text-gray-800 truncate">
                      • {yazi.baslik}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => onNavigate('sayilar')}
              >
                Sayıyı Düzenle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ara Yazilar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Son Ara Yazılar
          </CardTitle>
          <CardDescription>En son yayınlanan blog yazıları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAraYazilar.map((yazi) => (
              <div
                key={yazi.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{yazi.baslik}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {yazi.yazar.tamAd} • {new Date(yazi.yayinTarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <span className="ml-4 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {yazi.kategori}
                </span>
              </div>
            ))}
            {recentAraYazilar.length === 0 && (
              <p className="text-center text-gray-500 py-4">Henüz ara yazı bulunmuyor.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
