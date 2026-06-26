// CMS Yazı Yönetimi - Article Management (Sayı içindeki yazılar)
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/RichTextEditor';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  FileText,
  Eye,
} from 'lucide-react';
import type { Yazi } from '@/types';

export function CMSYaziYonetimi() {
  const {
    sonSayi,
    yazarlar,
    kategoriler,
    addYazi,
    updateYazi,
    deleteYazi
  } = useCMS();

  const [showDialog, setShowDialog] = useState(false);
  const [editingYazi, setEditingYazi] = useState<Yazi | null>(null);
  const [formData, setFormData] = useState<Partial<Yazi>>({});
  const [activeTab, setActiveTab] = useState('edit');

  const openNewYazi = () => {
    setEditingYazi(null);
    setFormData({
      siraNo: sonSayi.yazilar.length + 1,
      sayiId: sonSayi.id,
      icerik: '',
    });
    setActiveTab('edit');
    setShowDialog(true);
  };

  const openEditYazi = (yazi: Yazi) => {
    setEditingYazi(yazi);
    setFormData(yazi);
    setActiveTab('edit');
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const selectedYazar = yazarlar.find(y => y.id === formData.yazar?.id);
    const selectedKategori = kategoriler.find(k => k.id === formData.kategori?.id);

    if (!selectedYazar || !selectedKategori) {
      alert('Lütfen yazar ve kategori seçin');
      return;
    }

    if (!formData.baslik) {
      alert('Lütfen başlık girin');
      return;
    }

    if (editingYazi) {
      updateYazi(editingYazi.id, {
        ...formData,
        yazar: selectedYazar,
        kategori: selectedKategori,
      });
    } else {
      const newId = `${sonSayi.id}-${String(sonSayi.yazilar.length + 1).padStart(2, '0')}`;
      addYazi({
        id: newId,
        baslik: formData.baslik || '',
        spot: formData.spot,
        icerik: formData.icerik,
        yazar: selectedYazar,
        kategori: selectedKategori,
        sayiId: sonSayi.id,
        siraNo: formData.siraNo || sonSayi.yazilar.length + 1,
        pdfUrl: formData.pdfUrl,
        kapakGorseli: formData.kapakGorseli,
        yayinTarihi: formData.yayinTarihi,
      });
    }
    setShowDialog(false);
    setEditingYazi(null);
    setFormData({});
  };

  const handleYazarChange = (yazarId: string) => {
    const yazar = yazarlar.find(y => y.id === yazarId);
    if (yazar) {
      setFormData({ ...formData, yazar });
    }
  };

  const handleKategoriChange = (kategoriId: string) => {
    const kategori = kategoriler.find(k => k.id === kategoriId);
    if (kategori) {
      setFormData({ ...formData, kategori });
    }
  };

  const sortedYazilar = [...sonSayi.yazilar].sort((a, b) => a.siraNo - b.siraNo);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yazı Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            {sonSayi.tamBaslik} sayısındaki yazıları yönetin
          </p>
        </div>
        <Button onClick={openNewYazi}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Yazı Ekle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sonSayi.yazilar.length}</p>
                <p className="text-sm text-gray-500">Toplam Yazı</p>
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
                <p className="text-sm text-gray-500">Farklı Yazar</p>
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
                  {new Set(sonSayi.yazilar.map(y => y.kategori.id)).size}
                </p>
                <p className="text-sm text-gray-500">Farklı Kategori</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yazılar Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Yazılar</CardTitle>
          <CardDescription>
            Yazıları sıralamak için sıra numarasını değiştirin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Sıra</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Yazar</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedYazilar.map((yazi) => (
                <TableRow key={yazi.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{yazi.siraNo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium text-gray-900 truncate">{yazi.baslik}</p>
                      {yazi.spot && (
                        <p className="text-sm text-gray-500 truncate mt-1">{yazi.spot}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{yazi.yazar.tamAd}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
                      {yazi.kategori.ad}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditYazi(yazi)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Yazıyı Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{yazi.baslik}" yazısını silmek istediğinizden emin misiniz?
                              Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteYazi(yazi.id)}
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
              ))}
              {sortedYazilar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Henüz yazı eklenmemiş. Yeni yazı eklemek için yukarıdaki butonu kullanın.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Yazı Dialog - Tam Ekran */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingYazi ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
            </DialogTitle>
            <DialogDescription>
              Yazı bilgilerini girin ve içeriği zengin metin editörü ile düzenleyin
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Düzenle
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Önizleme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="flex-1 overflow-y-auto mt-4">
              <div className="grid gap-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="baslik">Başlık *</Label>
                    <Input
                      id="baslik"
                      value={formData.baslik || ''}
                      onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
                      placeholder="Yazı başlığı"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="yazar">Yazar *</Label>
                    <Select
                      value={formData.yazar?.id || ''}
                      onValueChange={handleYazarChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yazar seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {yazarlar.map((yazar) => (
                          <SelectItem key={yazar.id} value={yazar.id}>
                            {yazar.tamAd}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="kategori">Kategori *</Label>
                    <Select
                      value={formData.kategori?.id || ''}
                      onValueChange={handleKategoriChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriler.map((kategori) => (
                          <SelectItem key={kategori.id} value={kategori.id}>
                            {kategori.ad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Spot */}
                <div>
                  <Label htmlFor="spot">Spot (Özet)</Label>
                  <Textarea
                    id="spot"
                    value={formData.spot || ''}
                    onChange={(e) => setFormData({ ...formData, spot: e.target.value })}
                    placeholder="Yazının kısa özeti - ana sayfada görünür"
                    rows={2}
                  />
                </div>

                {/* Rich Text Editor */}
                <div>
                  <Label>İçerik</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      content={formData.icerik || ''}
                      onChange={(content) => setFormData({ ...formData, icerik: content })}
                      placeholder="Yazınızı buraya yazın..."
                    />
                  </div>
                </div>

                {/* Ek Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="siraNo">Sıra No</Label>
                    <Input
                      id="siraNo"
                      type="number"
                      min="1"
                      value={formData.siraNo ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({
                          ...formData,
                          siraNo: v === '' ? undefined : parseInt(v),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yayinTarihi">Yayın Tarihi</Label>
                    <Input
                      id="yayinTarihi"
                      type="date"
                      value={formData.yayinTarihi || ''}
                      onChange={(e) => setFormData({ ...formData, yayinTarihi: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pdfUrl">PDF URL</Label>
                    <Input
                      id="pdfUrl"
                      value={formData.pdfUrl || ''}
                      onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                      placeholder="/pdfs/yazi.pdf"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kapakGorseli">Kapak Görseli</Label>
                    <Input
                      id="kapakGorseli"
                      value={formData.kapakGorseli || ''}
                      onChange={(e) => setFormData({ ...formData, kapakGorseli: e.target.value })}
                      placeholder="/images/kapak.jpg"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
              <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto">
                {/* Önizleme */}
                <article className="prose prose-lg max-w-none">
                  <header className="mb-8 pb-6 border-b">
                    <h1 className="text-4xl font-serif font-bold mb-4">
                      {formData.baslik || 'Başlık'}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>{formData.yazar?.tamAd || 'Yazar'}</span>
                      <span>•</span>
                      <span>{formData.kategori?.ad || 'Kategori'}</span>
                    </div>
                    {formData.spot && (
                      <p className="mt-4 text-xl text-gray-600 italic">
                        {formData.spot}
                      </p>
                    )}
                  </header>
                  <div
                    className="prose-content"
                    dangerouslySetInnerHTML={{ __html: formData.icerik || '<p>İçerik henüz eklenmedi...</p>' }}
                  />
                </article>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingYazi ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
