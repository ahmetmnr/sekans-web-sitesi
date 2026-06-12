// CMS Yarışma Yönetimi - Competition Management
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
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
  Trophy,
  Award,
  Medal,
} from 'lucide-react';

interface Kazanan {
  yil: number;
  birinci: string;
  ikinci: string;
}

export function CMSYarismaYonetimi() {
  const { yarismasiBilgi, updateYarismasiBilgi, addYarismaKazanan } = useCMS();

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    baslik: yarismasiBilgi.baslik,
    aciklama: yarismasiBilgi.aciklama,
  });

  const [showKazananDialog, setShowKazananDialog] = useState(false);
  const [editingKazanan, setEditingKazanan] = useState<Kazanan | null>(null);
  const [kazananForm, setKazananForm] = useState<Partial<Kazanan>>({});

  // Bilgi güncelleme
  const handleInfoSubmit = () => {
    updateYarismasiBilgi({
      baslik: infoForm.baslik,
      aciklama: infoForm.aciklama,
    });
    setEditingInfo(false);
  };

  // Kazanan ekleme/düzenleme
  const openNewKazanan = () => {
    setEditingKazanan(null);
    setKazananForm({
      yil: new Date().getFullYear(),
    });
    setShowKazananDialog(true);
  };

  const openEditKazanan = (kazanan: Kazanan) => {
    setEditingKazanan(kazanan);
    setKazananForm(kazanan);
    setShowKazananDialog(true);
  };

  const handleKazananSubmit = () => {
    if (!kazananForm.yil || !kazananForm.birinci || !kazananForm.ikinci) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    if (editingKazanan) {
      // Güncelleme: eski kaydı kaldır, yenisini ekle
      const updatedKazananlar = yarismasiBilgi.gecmisKazananlar
        .filter(k => k.yil !== editingKazanan.yil)
        .concat({
          yil: kazananForm.yil,
          birinci: kazananForm.birinci,
          ikinci: kazananForm.ikinci,
        })
        .sort((a, b) => b.yil - a.yil);

      updateYarismasiBilgi({ gecmisKazananlar: updatedKazananlar });
    } else {
      addYarismaKazanan({
        yil: kazananForm.yil,
        birinci: kazananForm.birinci,
        ikinci: kazananForm.ikinci,
      });
    }

    setShowKazananDialog(false);
    setEditingKazanan(null);
    setKazananForm({});
  };

  const handleDeleteKazanan = (yil: number) => {
    const updatedKazananlar = yarismasiBilgi.gecmisKazananlar.filter(k => k.yil !== yil);
    updateYarismasiBilgi({ gecmisKazananlar: updatedKazananlar });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Yarışma Yönetimi</h1>
        <p className="text-gray-600 mt-1">
          Film Eleştirisi ve Film Çözümlemesi Yarışması bilgilerini yönetin
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{yarismasiBilgi.gecmisKazananlar.length}</p>
                <p className="text-sm text-gray-500">Yarışma Yılı</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {yarismasiBilgi.gecmisKazananlar.length}
                </p>
                <p className="text-sm text-gray-500">Birincilik Ödülü</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Medal className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {yarismasiBilgi.gecmisKazananlar.length}
                </p>
                <p className="text-sm text-gray-500">İkincilik Ödülü</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yarışma Bilgileri */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Yarışma Bilgileri</CardTitle>
              <CardDescription>Yarışma başlığı ve açıklaması</CardDescription>
            </div>
            <Dialog open={editingInfo} onOpenChange={setEditingInfo}>
              <Button
                variant="outline"
                onClick={() => {
                  setInfoForm({
                    baslik: yarismasiBilgi.baslik,
                    aciklama: yarismasiBilgi.aciklama,
                  });
                  setEditingInfo(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Yarışma Bilgilerini Düzenle</DialogTitle>
                  <DialogDescription>
                    Yarışma başlığı ve açıklamasını güncelleyin
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="baslik">Başlık</Label>
                    <Input
                      id="baslik"
                      value={infoForm.baslik}
                      onChange={(e) => setInfoForm({ ...infoForm, baslik: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="aciklama">Açıklama (Markdown desteklenir)</Label>
                    <Textarea
                      id="aciklama"
                      value={infoForm.aciklama}
                      onChange={(e) => setInfoForm({ ...infoForm, aciklama: e.target.value })}
                      rows={12}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingInfo(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleInfoSubmit}>Kaydet</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700">Başlık</h3>
              <p className="text-gray-900 mt-1">{yarismasiBilgi.baslik}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Açıklama</h3>
              <div className="text-gray-600 mt-1 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                {yarismasiBilgi.aciklama}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geçmiş Kazananlar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Geçmiş Kazananlar</CardTitle>
              <CardDescription>Yıllara göre yarışma kazananları</CardDescription>
            </div>
            <Button onClick={openNewKazanan}>
              <Plus className="h-4 w-4 mr-2" />
              Kazanan Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Yıl</TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    Birincilik
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Medal className="h-4 w-4 text-gray-400" />
                    İkincilik
                  </div>
                </TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yarismasiBilgi.gecmisKazananlar
                .sort((a, b) => b.yil - a.yil)
                .map((kazanan) => (
                  <TableRow key={kazanan.yil}>
                    <TableCell className="font-bold text-lg">{kazanan.yil}</TableCell>
                    <TableCell>{kazanan.birinci}</TableCell>
                    <TableCell>{kazanan.ikinci}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditKazanan(kazanan)}
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
                              <AlertDialogTitle>Kaydı Sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                {kazanan.yil} yılı yarışma sonuçlarını silmek istediğinizden emin
                                misiniz? Bu işlem geri alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteKazanan(kazanan.yil)}
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
              {yarismasiBilgi.gecmisKazananlar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Henüz kazanan kaydı eklenmemiş.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Kazanan Dialog */}
      <Dialog open={showKazananDialog} onOpenChange={setShowKazananDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingKazanan ? 'Kazanan Düzenle' : 'Yeni Kazanan Ekle'}
            </DialogTitle>
            <DialogDescription>
              Yarışma kazananı bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="yil">Yıl *</Label>
              <Input
                id="yil"
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={kazananForm.yil || ''}
                onChange={(e) =>
                  setKazananForm({ ...kazananForm, yil: parseInt(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="birinci">Birincilik Ödülü *</Label>
              <Input
                id="birinci"
                value={kazananForm.birinci || ''}
                onChange={(e) => setKazananForm({ ...kazananForm, birinci: e.target.value })}
                placeholder='İsim - "Yazı Başlığı"'
              />
              <p className="text-xs text-gray-500 mt-1">
                Örn: Ayşe Demir - "Sinema ve Zaman: Tarkovski'nin Aynasında"
              </p>
            </div>
            <div>
              <Label htmlFor="ikinci">İkincilik Ödülü *</Label>
              <Input
                id="ikinci"
                value={kazananForm.ikinci || ''}
                onChange={(e) => setKazananForm({ ...kazananForm, ikinci: e.target.value })}
                placeholder='İsim - "Yazı Başlığı"'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKazananDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleKazananSubmit}>
              {editingKazanan ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
