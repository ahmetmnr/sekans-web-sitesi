// CMS Kategori Yönetimi - Category Management
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
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
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  FileText,
} from 'lucide-react';
import type { Kategori } from '@/types';

export function CMSKategoriYonetimi() {
  const {
    kategoriler,
    sonSayi,
    addKategori,
    updateKategori,
    deleteKategori
  } = useCMS();

  const [showDialog, setShowDialog] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
  const [formData, setFormData] = useState<Partial<Kategori>>({});

  const generateSlug = (ad: string): string => {
    return ad
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const openNewKategori = () => {
    setEditingKategori(null);
    setFormData({});
    setShowDialog(true);
  };

  const openEditKategori = (kategori: Kategori) => {
    setEditingKategori(kategori);
    setFormData(kategori);
    setShowDialog(true);
  };

  const handleAdChange = (ad: string) => {
    setFormData({
      ...formData,
      ad,
      slug: generateSlug(ad),
    });
  };

  const handleSubmit = () => {
    if (!formData.ad) {
      alert('Lütfen kategori adını girin');
      return;
    }

    const slug = formData.slug || generateSlug(formData.ad);

    if (editingKategori) {
      updateKategori(editingKategori.id, {
        ...formData,
        slug,
      });
    } else {
      const newId = String(Date.now());
      addKategori({
        id: newId,
        ad: formData.ad,
        slug,
      });
    }
    setShowDialog(false);
    setEditingKategori(null);
    setFormData({});
  };

  // Kategori yazı sayılarını hesapla
  const getKategoriStats = (kategoriId: string) => {
    const yaziSayisi = sonSayi.yazilar.filter(y => y.kategori.id === kategoriId).length;
    return yaziSayisi;
  };

  // Kategori silinebilir mi kontrol et
  const canDeleteKategori = (kategoriId: string): boolean => {
    return getKategoriStats(kategoriId) === 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
          <p className="text-gray-600 mt-1">Yazı kategorilerini yönetin</p>
        </div>
        <Button onClick={openNewKategori}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kategoriler.length}</p>
                <p className="text-sm text-gray-500">Toplam Kategori</p>
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
                  {new Set(sonSayi.yazilar.map(y => y.kategori.id)).size}
                </p>
                <p className="text-sm text-gray-500">Kullanılan Kategori</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kategoriler Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Kategoriler</CardTitle>
          <CardDescription>
            Tüm kategorilerin listesi ve kullanım durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Yazı Sayısı</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kategoriler.map((kategori) => {
                const yaziSayisi = getKategoriStats(kategori.id);
                return (
                  <TableRow key={kategori.id}>
                    <TableCell className="font-medium">{kategori.ad}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {kategori.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          yaziSayisi > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {yaziSayisi}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditKategori(kategori)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!canDeleteKategori(kategori.id)}
                              title={
                                canDeleteKategori(kategori.id)
                                  ? 'Kategoriyi sil'
                                  : 'Bu kategoriye ait yazılar var, silinemez'
                              }
                            >
                              <Trash2
                                className={`h-4 w-4 ${
                                  canDeleteKategori(kategori.id)
                                    ? 'text-red-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{kategori.ad}" kategorisini silmek istediğinizden emin misiniz?
                                Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteKategori(kategori.id)}
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
              {kategoriler.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Henüz kategori eklenmemiş.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kategori Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKategori ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
            </DialogTitle>
            <DialogDescription>
              Kategori bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="ad">Kategori Adı *</Label>
              <Input
                id="ad"
                value={formData.ad || ''}
                onChange={(e) => handleAdChange(e.target.value)}
                placeholder="Örn: Eleştiri"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="elestiri"
              />
              <p className="text-xs text-gray-500 mt-1">
                Otomatik oluşturulur, değiştirebilirsiniz
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingKategori ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
