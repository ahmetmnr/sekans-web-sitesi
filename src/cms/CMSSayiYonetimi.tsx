// CMS Sayı Yönetimi - Issue Management
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { FileUploadField } from '@/components/cms/FileUploadField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Archive,
  Send,
} from 'lucide-react';
import type { Sayi, ArsivSayi } from '@/types';

const aylar = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export function CMSSayiYonetimi() {
  const {
    sonSayi,
    arsivSayilari,
    setSonSayi,
    publishSonSayi,
    addArsivSayi,
    updateArsivSayi,
    deleteArsivSayi
  } = useCMS();

  const [editingSonSayi, setEditingSonSayi] = useState(false);
  const [sonSayiForm, setSonSayiForm] = useState<Partial<Sayi>>(sonSayi);

  const [showArsivDialog, setShowArsivDialog] = useState(false);
  const [editingArsiv, setEditingArsiv] = useState<ArsivSayi | null>(null);
  const [arsivForm, setArsivForm] = useState<Partial<ArsivSayi>>({});

  // Son sayı düzenleme
  const handleSonSayiSubmit = async () => {
    try {
      await setSonSayi({
        ...sonSayi,
        ...sonSayiForm,
        tamBaslik: `${sonSayiForm.ay} ${sonSayiForm.yil} | Sayı ${sonSayiForm.numara}`,
      } as Sayi);
      setEditingSonSayi(false);
    } catch (error) {
      alert((error as Error).message || 'Kaydetme sırasında hata oluştu');
    }
  };

  // Arşiv sayı ekleme/düzenleme
  const handleArsivSubmit = async () => {
    try {
      if (editingArsiv) {
        await updateArsivSayi(editingArsiv.id, arsivForm);
      } else {
        // id sunucu tarafından atanır.
        await addArsivSayi({
          numara: arsivForm.numara || '',
          ay: arsivForm.ay || 'Ocak',
          yil: arsivForm.yil || new Date().getFullYear(),
          kapakGorseli: arsivForm.kapakGorseli || '/images/default-kapak.jpg',
          pdfUrl: arsivForm.pdfUrl || '',
          yayinTarihi: arsivForm.yayinTarihi || new Date().toISOString().split('T')[0],
        });
      }
      setShowArsivDialog(false);
      setEditingArsiv(null);
      setArsivForm({});
    } catch (error) {
      alert((error as Error).message || 'Kaydetme sırasında hata oluştu');
    }
  };

  const openEditArsiv = (sayi: ArsivSayi) => {
    setEditingArsiv(sayi);
    setArsivForm(sayi);
    setShowArsivDialog(true);
  };

  const openNewArsiv = () => {
    setEditingArsiv(null);
    setArsivForm({
      ay: 'Ocak',
      yil: new Date().getFullYear(),
    });
    setShowArsivDialog(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sayı Yönetimi</h1>
          <p className="text-gray-600 mt-1">Dergi sayılarını yönetin</p>
        </div>
      </div>

      <Tabs defaultValue="son-sayi">
        <TabsList>
          <TabsTrigger value="son-sayi" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Son Sayı
          </TabsTrigger>
          <TabsTrigger value="arsiv" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Arşiv ({arsivSayilari.length})
          </TabsTrigger>
        </TabsList>

        {/* Son Sayı Tab */}
        <TabsContent value="son-sayi" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{sonSayi.tamBaslik}</CardTitle>
                  <CardDescription>
                    Yayın Tarihi: {new Date(sonSayi.yayinTarihi).toLocaleDateString('tr-TR')} •
                    {sonSayi.yazilar.length} yazı
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={editingSonSayi} onOpenChange={setEditingSonSayi}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSonSayiForm(sonSayi)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Son Sayıyı Düzenle</DialogTitle>
                        <DialogDescription>
                          Güncel sayının bilgilerini düzenleyin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="numara">Sayı Numarası</Label>
                            <Input
                              id="numara"
                              value={sonSayiForm.numara || ''}
                              onChange={(e) =>
                                setSonSayiForm({ ...sonSayiForm, numara: e.target.value })
                              }
                              placeholder="e27"
                            />
                          </div>
                          <div>
                            <Label htmlFor="ay">Ay</Label>
                            <select
                              id="ay"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={sonSayiForm.ay || ''}
                              onChange={(e) =>
                                setSonSayiForm({ ...sonSayiForm, ay: e.target.value })
                              }
                            >
                              {aylar.map((ay) => (
                                <option key={ay} value={ay}>
                                  {ay}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="yil">Yıl</Label>
                            <Input
                              id="yil"
                              type="number"
                              value={sonSayiForm.yil || ''}
                              onChange={(e) =>
                                setSonSayiForm({ ...sonSayiForm, yil: parseInt(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <FileUploadField
                          label="Kapak Görseli"
                          value={sonSayiForm.kapakGorseli || ''}
                          onChange={(url) => setSonSayiForm({ ...sonSayiForm, kapakGorseli: url })}
                          accept="image/*"
                          kind="image"
                          previewType="image"
                        />
                        <FileUploadField
                          label="PDF"
                          value={sonSayiForm.pdfUrl || ''}
                          onChange={(url) => setSonSayiForm({ ...sonSayiForm, pdfUrl: url })}
                          accept="application/pdf"
                          kind="pdf"
                          previewType="none"
                        />
                        <div>
                          <Label htmlFor="yayinTarihi">Yayın Tarihi</Label>
                          <Input
                            id="yayinTarihi"
                            type="date"
                            value={sonSayiForm.yayinTarihi || ''}
                            onChange={(e) =>
                              setSonSayiForm({ ...sonSayiForm, yayinTarihi: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="kunye">Künye</Label>
                          <Textarea
                            id="kunye"
                            value={sonSayiForm.kunye || ''}
                            onChange={(e) =>
                              setSonSayiForm({ ...sonSayiForm, kunye: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="onsoz">Önsöz</Label>
                          <Textarea
                            id="onsoz"
                            value={sonSayiForm.onsoz || ''}
                            onChange={(e) =>
                              setSonSayiForm({ ...sonSayiForm, onsoz: e.target.value })
                            }
                            rows={4}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSonSayi(false)}>
                          İptal
                        </Button>
                        <Button onClick={handleSonSayiSubmit}>Kaydet</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default">
                        <Send className="h-4 w-4 mr-2" />
                        Arşive Taşı
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sayıyı Arşive Taşı</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu sayı ({sonSayi.tamBaslik}) arşive taşınacak. Yeni bir sayı oluşturmak
                          için hazır olduğunuzdan emin misiniz?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={publishSonSayi}>
                          Arşive Taşı
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cover Preview */}
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={sonSayi.kapakGorseli}
                    alt={sonSayi.tamBaslik}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Künye</h3>
                    <p className="text-gray-600 whitespace-pre-line mt-1">
                      {sonSayi.kunye || 'Belirtilmemiş'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Önsöz</h3>
                    <p className="text-gray-600 mt-1">{sonSayi.onsoz || 'Belirtilmemiş'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">PDF</h3>
                    <a
                      href={sonSayi.pdfUrl}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {sonSayi.pdfUrl}
                    </a>
                  </div>

                  {/* Yazılar Listesi */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Yazılar ({sonSayi.yazilar.length})
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {sonSayi.yazilar.map((yazi, index) => (
                        <div
                          key={yazi.id}
                          className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {index + 1}. {yazi.baslik}
                            </p>
                            <p className="text-sm text-gray-500">
                              {yazi.yazar.tamAd} • {yazi.kategori.ad}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arşiv Tab */}
        <TabsContent value="arsiv" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Arşiv Sayıları</CardTitle>
                  <CardDescription>Geçmiş sayıları yönetin</CardDescription>
                </div>
                <Button onClick={openNewArsiv}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Arşiv Sayısı
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kapak</TableHead>
                    <TableHead>Numara</TableHead>
                    <TableHead>Dönem</TableHead>
                    <TableHead>Yayın Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arsivSayilari.map((sayi) => (
                    <TableRow key={sayi.id}>
                      <TableCell>
                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={sayi.kapakGorseli}
                            alt={sayi.numara}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{sayi.numara}</TableCell>
                      <TableCell>
                        {sayi.ay} {sayi.yil}
                      </TableCell>
                      <TableCell>
                        {new Date(sayi.yayinTarihi).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditArsiv(sayi)}
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
                                <AlertDialogTitle>Sayıyı Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {sayi.numara} sayısını silmek istediğinizden emin misiniz? Bu
                                  işlem geri alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteArsivSayi(sayi.id)}
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
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Arşiv Dialog */}
      <Dialog open={showArsivDialog} onOpenChange={setShowArsivDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArsiv ? 'Arşiv Sayısını Düzenle' : 'Yeni Arşiv Sayısı'}
            </DialogTitle>
            <DialogDescription>
              Arşiv sayısı bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="arsiv-numara">Numara</Label>
                <Input
                  id="arsiv-numara"
                  value={arsivForm.numara || ''}
                  onChange={(e) => setArsivForm({ ...arsivForm, numara: e.target.value })}
                  placeholder="e26"
                />
              </div>
              <div>
                <Label htmlFor="arsiv-ay">Ay</Label>
                <select
                  id="arsiv-ay"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={arsivForm.ay || ''}
                  onChange={(e) => setArsivForm({ ...arsivForm, ay: e.target.value })}
                >
                  {aylar.map((ay) => (
                    <option key={ay} value={ay}>
                      {ay}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="arsiv-yil">Yıl</Label>
                <Input
                  id="arsiv-yil"
                  type="number"
                  value={arsivForm.yil || ''}
                  onChange={(e) => setArsivForm({ ...arsivForm, yil: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <FileUploadField
              label="Kapak Görseli"
              value={arsivForm.kapakGorseli || ''}
              onChange={(url) => setArsivForm({ ...arsivForm, kapakGorseli: url })}
              accept="image/*"
              kind="image"
              previewType="image"
            />
            <FileUploadField
              label="PDF"
              value={arsivForm.pdfUrl || ''}
              onChange={(url) => setArsivForm({ ...arsivForm, pdfUrl: url })}
              accept="application/pdf"
              kind="pdf"
              previewType="none"
            />
            <div>
              <Label htmlFor="arsiv-tarih">Yayın Tarihi</Label>
              <Input
                id="arsiv-tarih"
                type="date"
                value={arsivForm.yayinTarihi || ''}
                onChange={(e) => setArsivForm({ ...arsivForm, yayinTarihi: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArsivDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleArsivSubmit}>
              {editingArsiv ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
