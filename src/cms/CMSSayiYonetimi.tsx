// CMS Sayı Yönetimi — birden çok sayının PARALEL hazırlanabildiği model.
//  Hazırlanan (taslak + yayında) sayılar burada listelenir; her birine sorumlu
//  editör atanır, yazıları yönetilir ve hazır olan "yayına alınır".
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { FileUploadField } from '@/components/cms/FileUploadField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Pencil, Trash2, BookOpen, Archive, Send, Undo2, Files, FileText, UserCircle,
} from 'lucide-react';
import type { Sayi, ArsivSayi } from '@/types';

const aylar = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const NONE = '__none__'; // "atanmadı" sentinel (radix Select boş değere izin vermez)

interface CMSSayiYonetimiProps {
  onManageArticles: (sayiId: string) => void; // "Yazıları Yönet" -> yazı listesini o sayıya odakla
  onNewYazi: (sayiId: string) => void;        // "Yeni Yazı" -> editörü o sayı önseçili aç
}

export function CMSSayiYonetimi({ onManageArticles, onNewYazi }: CMSSayiYonetimiProps) {
  const {
    sayilar,
    editorler,
    arsivSayilari,
    addSayi,
    updateSayi,
    setSayiDurum,
    deleteSayi,
    addArsivSayi,
    updateArsivSayi,
    deleteArsivSayi,
  } = useCMS();

  // --- Sayı (taslak/yayında) meta dialog ---
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Sayi | null>(null);
  const [issueForm, setIssueForm] = useState<Partial<Sayi>>({});

  // --- Arşiv dialog ---
  const [showArsivDialog, setShowArsivDialog] = useState(false);
  const [editingArsiv, setEditingArsiv] = useState<ArsivSayi | null>(null);
  const [arsivForm, setArsivForm] = useState<Partial<ArsivSayi>>({});

  const openNewIssue = () => {
    setEditingIssue(null);
    setIssueForm({ ay: 'Ocak', yil: new Date().getFullYear(), editorId: null });
    setShowIssueDialog(true);
  };

  const openEditIssue = (s: Sayi) => {
    setEditingIssue(s);
    setIssueForm(s);
    setShowIssueDialog(true);
  };

  const handleIssueSubmit = async () => {
    if (!issueForm.numara?.trim()) {
      alert('Lütfen sayı numarası girin (örn. e28).');
      return;
    }
    try {
      const tamBaslik = `${issueForm.ay ?? ''} ${issueForm.yil ?? ''} | Sayı ${issueForm.numara}`;
      const payload = {
        numara: issueForm.numara,
        ay: issueForm.ay,
        yil: issueForm.yil,
        tamBaslik,
        kapakGorseli: issueForm.kapakGorseli,
        pdfUrl: issueForm.pdfUrl,
        kunye: issueForm.kunye,
        onsoz: issueForm.onsoz,
        yayinTarihi: issueForm.yayinTarihi,
        editorId: issueForm.editorId ?? null,
      };
      if (editingIssue) {
        await updateSayi(editingIssue.id, payload);
      } else {
        await addSayi(payload);
      }
      setShowIssueDialog(false);
      setEditingIssue(null);
      setIssueForm({});
    } catch (error) {
      alert((error as Error).message || 'Kaydetme sırasında hata oluştu');
    }
  };

  const handleAssignEditor = async (s: Sayi, value: string) => {
    try {
      await updateSayi(s.id, { editorId: value === NONE ? null : value });
    } catch (error) {
      alert((error as Error).message || 'Editör atanamadı');
    }
  };

  const handleDurum = async (s: Sayi, durum: 'taslak' | 'yayinda' | 'arsiv') => {
    try {
      await setSayiDurum(s.id, durum);
    } catch (error) {
      alert((error as Error).message || 'Durum güncellenemedi');
    }
  };

  const handleDeleteIssue = async (s: Sayi) => {
    try {
      await deleteSayi(s.id);
    } catch (error) {
      alert((error as Error).message || 'Silme başarısız');
    }
  };

  // --- Arşiv ekle/düzenle ---
  const handleArsivSubmit = async () => {
    try {
      if (editingArsiv) {
        await updateArsivSayi(editingArsiv.id, arsivForm);
      } else {
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
    setArsivForm({ ay: 'Ocak', yil: new Date().getFullYear() });
    setShowArsivDialog(true);
  };

  const durumBadge = (durum?: string) => {
    if (durum === 'yayinda') {
      return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">Yayında</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">Taslak (hazırlanıyor)</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sayı Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            Birden çok sayıyı paralel hazırlayın; hazır olanı yayına alın.
          </p>
        </div>
      </div>

      <Tabs defaultValue="hazirlanan">
        <TabsList>
          <TabsTrigger value="hazirlanan" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Hazırlanan Sayılar ({sayilar.length})
          </TabsTrigger>
          <TabsTrigger value="arsiv" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Arşiv ({arsivSayilari.length})
          </TabsTrigger>
        </TabsList>

        {/* Hazırlanan Sayılar (taslak + yayında) */}
        <TabsContent value="hazirlanan" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Button onClick={openNewIssue}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Sayı Oluştur
            </Button>
          </div>

          {sayilar.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                Henüz hazırlanan sayı yok. "Yeni Sayı Oluştur" ile bir taslak sayı açın.
              </CardContent>
            </Card>
          )}

          {sayilar.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {s.tamBaslik || `${s.ay} ${s.yil} | Sayı ${s.numara}`}
                      {durumBadge(s.durum)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {s.yayinTarihi ? `Yayın Tarihi: ${new Date(s.yayinTarihi).toLocaleDateString('tr-TR')} • ` : ''}
                      {s.yazilar.length} yazı
                    </CardDescription>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditIssue(s)}>
                      <Pencil className="h-4 w-4 mr-1" /> Düzenle
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sorumlu editör + hızlı işlemler */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-gray-400" />
                    <Label className="text-sm text-gray-600">Sorumlu editör:</Label>
                    <Select
                      value={s.editorId ?? NONE}
                      onValueChange={(v) => handleAssignEditor(s, v)}
                    >
                      <SelectTrigger className="h-8 w-52">
                        <SelectValue placeholder="Atanmadı" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>— Atanmadı —</SelectItem>
                        {editorler.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name}{e.role === 'admin' ? ' (yönetici)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onManageArticles(s.id)}>
                    <Files className="h-4 w-4 mr-1" /> Yazıları Yönet ({s.yazilar.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onNewYazi(s.id)}>
                    <FileText className="h-4 w-4 mr-1" /> Bu Sayıya Yazı Ekle
                  </Button>

                  {s.durum !== 'yayinda' ? (
                    <>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm">
                            <Send className="h-4 w-4 mr-1" /> Yayına Al
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Sayıyı Yayına Al</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{s.tamBaslik || s.numara}" canlıya alınacak ve sitede güncel sayı olarak
                              görünecek. O an yayında olan sayı otomatik olarak arşive taşınır. Onaylıyor musunuz?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDurum(s, 'yayinda')}>
                              Yayına Al
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4 mr-1" /> Sil
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Taslak Sayıyı Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{s.tamBaslik || s.numara}" ve içindeki tüm yazılar silinecek. Bu işlem geri alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteIssue(s)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Undo2 className="h-4 w-4 mr-1" /> Taslağa Al
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Yayından Kaldır</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{s.tamBaslik || s.numara}" tekrar taslağa alınacak ve siteden kaldırılacak.
                            Site geçici olarak yayında sayısız kalabilir. Onaylıyor musunuz?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDurum(s, 'taslak')}>
                            Taslağa Al
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Arşiv */}
        <TabsContent value="arsiv" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Arşiv Sayıları</CardTitle>
                  <CardDescription>Geçmiş (yayımlanmış) sayıları yönetin</CardDescription>
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
                      <TableCell>{sayi.ay} {sayi.yil}</TableCell>
                      <TableCell>{new Date(sayi.yayinTarihi).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditArsiv(sayi)}>
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
                                  {sayi.numara} sayısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                  {arsivSayilari.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Henüz arşiv sayısı yok.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sayı (taslak/yayında) meta dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIssue ? 'Sayıyı Düzenle' : 'Yeni Sayı Oluştur'}</DialogTitle>
            <DialogDescription>
              {editingIssue ? 'Sayı bilgilerini güncelleyin.' : 'Yeni bir taslak sayı oluşturun ve sorumlu editör atayın.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="i-numara">Sayı Numarası *</Label>
                <Input
                  id="i-numara"
                  value={issueForm.numara || ''}
                  onChange={(e) => setIssueForm({ ...issueForm, numara: e.target.value })}
                  placeholder="e28"
                />
              </div>
              <div>
                <Label htmlFor="i-ay">Ay</Label>
                <select
                  id="i-ay"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={issueForm.ay || ''}
                  onChange={(e) => setIssueForm({ ...issueForm, ay: e.target.value })}
                >
                  {aylar.map((ay) => <option key={ay} value={ay}>{ay}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="i-yil">Yıl</Label>
                <Input
                  id="i-yil"
                  type="number"
                  value={issueForm.yil || ''}
                  onChange={(e) => setIssueForm({ ...issueForm, yil: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Sorumlu Editör</Label>
              <Select
                value={issueForm.editorId ?? NONE}
                onValueChange={(v) => setIssueForm({ ...issueForm, editorId: v === NONE ? null : v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Atanmadı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>— Atanmadı —</SelectItem>
                  {editorler.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}{e.role === 'admin' ? ' (yönetici)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FileUploadField
              label="Kapak Görseli"
              value={issueForm.kapakGorseli || ''}
              onChange={(url) => setIssueForm({ ...issueForm, kapakGorseli: url })}
              accept="image/*"
              kind="image"
              previewType="image"
            />
            <FileUploadField
              label="PDF"
              value={issueForm.pdfUrl || ''}
              onChange={(url) => setIssueForm({ ...issueForm, pdfUrl: url })}
              accept="application/pdf"
              kind="pdf"
              previewType="none"
            />
            <div>
              <Label htmlFor="i-tarih">Yayın Tarihi</Label>
              <Input
                id="i-tarih"
                type="date"
                value={issueForm.yayinTarihi || ''}
                onChange={(e) => setIssueForm({ ...issueForm, yayinTarihi: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="i-kunye">Künye</Label>
              <Textarea
                id="i-kunye"
                value={issueForm.kunye || ''}
                onChange={(e) => setIssueForm({ ...issueForm, kunye: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="i-onsoz">Önsöz</Label>
              <Textarea
                id="i-onsoz"
                value={issueForm.onsoz || ''}
                onChange={(e) => setIssueForm({ ...issueForm, onsoz: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueDialog(false)}>İptal</Button>
            <Button onClick={handleIssueSubmit}>{editingIssue ? 'Kaydet' : 'Oluştur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Arşiv Dialog */}
      <Dialog open={showArsivDialog} onOpenChange={setShowArsivDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingArsiv ? 'Arşiv Sayısını Düzenle' : 'Yeni Arşiv Sayısı'}</DialogTitle>
            <DialogDescription>Arşiv sayısı bilgilerini girin</DialogDescription>
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
                  {aylar.map((ay) => <option key={ay} value={ay}>{ay}</option>)}
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
            <Button variant="outline" onClick={() => setShowArsivDialog(false)}>İptal</Button>
            <Button onClick={handleArsivSubmit}>{editingArsiv ? 'Güncelle' : 'Ekle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
