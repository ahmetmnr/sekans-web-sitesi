// CMS Yazar Yönetimi - Author Management
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  User,
  FileText,
  Upload,
  Camera,
} from 'lucide-react';
import type { Yazar } from '@/types';

export function CMSYazarYonetimi() {
  const {
    yazarlar,
    sonSayi,
    araYazilar,
    addYazar,
    updateYazar,
    deleteYazar
  } = useCMS();

  const [showDialog, setShowDialog] = useState(false);
  const [editingYazar, setEditingYazar] = useState<Yazar | null>(null);
  const [formData, setFormData] = useState<Partial<Yazar>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const openNewYazar = () => {
    setEditingYazar(null);
    setFormData({});
    setShowDialog(true);
  };

  const openEditYazar = (yazar: Yazar) => {
    setEditingYazar(yazar);
    setFormData(yazar);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.ad || !formData.soyad) {
      alert('Lütfen ad ve soyad alanlarını doldurun');
      return;
    }

    const tamAd = `${formData.ad} ${formData.soyad}`;

    try {
      if (editingYazar) {
        await updateYazar(editingYazar.id, { ...formData, tamAd });
      } else {
        // id sunucu tarafından atanır.
        await addYazar({
          ad: formData.ad,
          soyad: formData.soyad,
          tamAd,
          fotograf: formData.fotograf,
          biyografi: formData.biyografi,
        });
      }
      setShowDialog(false);
      setEditingYazar(null);
      setFormData({});
    } catch (error) {
      alert((error as Error).message || 'Kaydetme sırasında hata oluştu');
    }
  };

  // Yazar yazı sayılarını hesapla
  const getYazarStats = (yazarId: string) => {
    const sayiYazilari = sonSayi.yazilar.filter(y => y.yazar.id === yazarId).length;
    const blogYazilari = araYazilar.filter(y => y.yazar.id === yazarId).length;
    return { sayiYazilari, blogYazilari, toplam: sayiYazilari + blogYazilari };
  };

  // Filtreleme
  const filteredYazarlar = yazarlar.filter(yazar =>
    yazar.tamAd.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Yazar silinebilir mi kontrol et
  const canDeleteYazar = (yazarId: string): boolean => {
    const stats = getYazarStats(yazarId);
    return stats.toplam === 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yazar Yönetimi</h1>
          <p className="text-gray-600 mt-1">Yazarları yönetin</p>
        </div>
        <Button onClick={openNewYazar}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yazar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{yazarlar.length}</p>
                <p className="text-sm text-gray-500">Toplam Yazar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(sonSayi.yazilar.map(y => y.yazar.id)).size}
                </p>
                <p className="text-sm text-gray-500">Son Sayıda Yazar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(araYazilar.map(y => y.yazar.id)).size}
                </p>
                <p className="text-sm text-gray-500">Blog Yazarı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Yazar ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Yazarlar Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Yazarlar</CardTitle>
          <CardDescription>
            Tüm yazarların listesi ve yazı sayıları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Ad</TableHead>
                <TableHead>Soyad</TableHead>
                <TableHead>Tam Ad</TableHead>
                <TableHead className="text-center">Sayı Yazıları</TableHead>
                <TableHead className="text-center">Blog Yazıları</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredYazarlar.map((yazar) => {
                const stats = getYazarStats(yazar.id);
                return (
                  <TableRow key={yazar.id}>
                    <TableCell>
                      {yazar.fotograf ? (
                        <img
                          src={yazar.fotograf}
                          alt={yazar.tamAd}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{yazar.ad}</TableCell>
                    <TableCell>{yazar.soyad}</TableCell>
                    <TableCell className="font-medium">{yazar.tamAd}</TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        {stats.sayiYazilari}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        {stats.blogYazilari}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditYazar(yazar)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!canDeleteYazar(yazar.id)}
                              title={
                                canDeleteYazar(yazar.id)
                                  ? 'Yazarı sil'
                                  : 'Bu yazarın yazıları var, silinemez'
                              }
                            >
                              <Trash2
                                className={`h-4 w-4 ${
                                  canDeleteYazar(yazar.id)
                                    ? 'text-red-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Yazarı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{yazar.tamAd}" yazarını silmek istediğinizden emin misiniz?
                                Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteYazar(yazar.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredYazarlar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? 'Arama kriterlerine uygun yazar bulunamadı.'
                      : 'Henüz yazar eklenmemiş.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Yazar Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingYazar ? 'Yazarı Düzenle' : 'Yeni Yazar'}
            </DialogTitle>
            <DialogDescription>
              Yazar bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Fotoğraf */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {formData.fotograf ? (
                  <img
                    src={formData.fotograf}
                    alt="Yazar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                    <Camera className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Fotoğraf</Label>
                <Input
                  value={formData.fotograf || ''}
                  onChange={(e) => setFormData({ ...formData, fotograf: e.target.value })}
                  placeholder="Fotoğraf URL veya dosya yükle"
                  className="mt-1"
                />
                <div className="mt-1">
                  <label className="text-xs text-blue-600 cursor-pointer hover:underline">
                    <Upload className="h-3 w-3 inline mr-1" />
                    Dosya yükle
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { url } = await api.uploadFile(file, 'foto');
                          setFormData((prev) => ({ ...prev, fotograf: url }));
                        } catch (err) {
                          alert((err as Error).message || 'Fotoğraf yüklenemedi.');
                        } finally {
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ad">Ad *</Label>
                <Input
                  id="ad"
                  value={formData.ad || ''}
                  onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                  placeholder="Adı"
                />
              </div>
              <div>
                <Label htmlFor="soyad">Soyad *</Label>
                <Input
                  id="soyad"
                  value={formData.soyad || ''}
                  onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                  placeholder="Soyadı"
                />
              </div>
            </div>

            {/* Biyografi */}
            <div>
              <Label htmlFor="biyografi">Biyografi</Label>
              <Textarea
                id="biyografi"
                value={formData.biyografi || ''}
                onChange={(e) => setFormData({ ...formData, biyografi: e.target.value })}
                placeholder="Yazar hakkında kısa biyografi..."
                rows={4}
                className="mt-1"
              />
            </div>

            {formData.ad && formData.soyad && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Tam Ad Önizleme:</p>
                <p className="font-medium">{formData.ad} {formData.soyad}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingYazar ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
