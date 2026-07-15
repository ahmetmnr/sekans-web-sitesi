// CMS Sabit Sayfa Yönetimi — admin panelden statik sayfalar oluştur/düzenle/sil.
// Alanlar: başlık, URL (slug), kısa açıklama, içerik, SEO başlık/açıklama, yayın durumu.
// "Menüye ekle" ile sayfa üst menüye (Menü Yönetimi'ne) bağlanır.
import { useEffect, useState, useCallback } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import type { StatikSayfaIcerik } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Pencil, Trash2, Loader2, FileText, ListPlus } from 'lucide-react';

const slugYap = (s: string): string =>
  s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type FormState = Partial<StatikSayfaIcerik>;

export function CMSSayfaYonetimi() {
  const { refresh } = useCMS();
  const [sayfalar, setSayfalar] = useState<StatikSayfaIcerik[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<StatikSayfaIcerik | null>(null);
  const [form, setForm] = useState<FormState>({});

  const reload = useCallback(async () => {
    try {
      setSayfalar(await api.sayfa.listCms());
    } catch {
      /* yetki/hata */
    }
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    reload().finally(() => setYukleniyor(false));
  }, [reload]);

  const openNew = () => {
    setEditing(null);
    setForm({ yayinDurumu: 'yayinda' });
    setShowDialog(true);
  };

  const openEdit = (s: StatikSayfaIcerik) => {
    setEditing(s);
    setForm({ ...s });
    setShowDialog(true);
  };

  const handleBaslikChange = (baslik: string) => {
    // Yeni sayfada slug'ı başlıktan otomatik üret (kullanıcı elle değiştirebilir).
    setForm((f) => ({
      ...f,
      baslik,
      slug: editing ? f.slug : slugYap(baslik),
    }));
  };

  const handleSubmit = async () => {
    const baslik = (form.baslik ?? '').trim();
    if (!baslik) { alert('Lütfen sayfa başlığını girin.'); return; }
    const payload: Partial<StatikSayfaIcerik> & { baslik: string } = {
      baslik,
      kisaAciklama: form.kisaAciklama ?? '',
      icerik: form.icerik ?? '',
      seoBaslik: form.seoBaslik ?? '',
      seoAciklama: form.seoAciklama ?? '',
      yayinDurumu: form.yayinDurumu === 'taslak' ? 'taslak' : 'yayinda',
    };
    setKaydediliyor(true);
    try {
      if (editing) {
        await api.sayfa.update(editing.slug, { ...payload, icerik: payload.icerik ?? '' });
      } else {
        await api.sayfa.create({ ...payload, slug: form.slug ? slugYap(form.slug) : undefined });
      }
      setShowDialog(false);
      setEditing(null);
      setForm({});
      await reload();
    } catch (e) {
      alert('Kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    } finally {
      setKaydediliyor(false);
    }
  };

  const handleDelete = async (s: StatikSayfaIcerik) => {
    try {
      await api.sayfa.remove(s.slug);
      await reload();
    } catch (e) {
      alert('Silinemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  // Sayfayı üst menüye "Sabit sayfa" türünde bir öğe olarak ekle.
  const menuyeEkle = async (s: StatikSayfaIcerik) => {
    try {
      await api.menu.create({ gorunenBaslik: s.baslik, tur: 'sabit_sayfa', hedef: s.slug, parentId: null });
      await refresh();
      alert(`"${s.baslik}" üst menüye eklendi. Menü Yönetimi'nden konumunu/başlığını düzenleyebilirsiniz.`);
    } catch (e) {
      alert('Menüye eklenemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sabit Sayfalar</h1>
          <p className="text-gray-600 mt-1">Yarışma, standartlar, bilgilendirme gibi sabit sayfaları buradan yönetin.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sayfa
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sayfalar</CardTitle>
          <CardDescription>Tüm sabit sayfalar. Taslak sayfalar sitede görünmez.</CardDescription>
        </CardHeader>
        <CardContent>
          {yukleniyor ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-center">Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sayfalar.map((s) => (
                  <TableRow key={s.slug}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        {s.baslik}
                      </div>
                    </TableCell>
                    <TableCell><code className="px-2 py-1 bg-gray-100 rounded text-xs">/{s.slug}</code></TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${s.yayinDurumu === 'taslak' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                        {s.yayinDurumu === 'taslak' ? 'Taslak' : 'Yayında'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => menuyeEkle(s)} title="Üst menüye ekle">
                          <ListPlus className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)} title="Düzenle">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Sil"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Sayfayı sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{s.baslik}" sayfasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                (Bu sayfaya bağlı menü öğeleri varsa Menü Yönetimi'nden ayrıca kaldırın.)
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(s)} className="bg-red-600 hover:bg-red-700">Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sayfalar.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">Henüz sabit sayfa yok.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ekle/Düzenle Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sayfayı Düzenle' : 'Yeni Sayfa'}</DialogTitle>
            <DialogDescription>Sayfa bilgilerini ve içeriğini girin.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="s-baslik">Başlık *</Label>
              <Input id="s-baslik" value={form.baslik ?? ''} onChange={(e) => handleBaslikChange(e.target.value)} placeholder="Örn: Yarışma" />
            </div>

            <div>
              <Label htmlFor="s-slug">URL adresi (slug)</Label>
              <Input
                id="s-slug"
                value={form.slug ?? ''}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="yarisma"
                disabled={!!editing}
              />
              <p className="text-xs text-gray-500 mt-1">
                {editing ? 'URL oluşturulduktan sonra değiştirilemez (bağlantılar bozulmasın diye).' : 'Başlıktan otomatik üretilir; değiştirebilirsiniz.'}
              </p>
            </div>

            <div>
              <Label htmlFor="s-kisa">Kısa açıklama</Label>
              <Input id="s-kisa" value={form.kisaAciklama ?? ''} onChange={(e) => setForm({ ...form, kisaAciklama: e.target.value })} placeholder="Sayfanın kısa özeti (başlığın altında görünür)" />
            </div>

            <div>
              <Label htmlFor="s-icerik">İçerik (Markdown desteklenir)</Label>
              <Textarea id="s-icerik" value={form.icerik ?? ''} onChange={(e) => setForm({ ...form, icerik: e.target.value })} rows={12} />
            </div>

            <div className="border-t pt-4 grid gap-4">
              <p className="font-medium text-sm text-gray-700">SEO</p>
              <div>
                <Label htmlFor="s-seob">SEO başlığı</Label>
                <Input id="s-seob" value={form.seoBaslik ?? ''} onChange={(e) => setForm({ ...form, seoBaslik: e.target.value })} placeholder="(boşsa sayfa başlığı kullanılır)" />
              </div>
              <div>
                <Label htmlFor="s-seoa">SEO açıklaması</Label>
                <Input id="s-seoa" value={form.seoAciklama ?? ''} onChange={(e) => setForm({ ...form, seoAciklama: e.target.value })} placeholder="Arama motorlarında görünecek açıklama" />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t pt-4">
              <Switch
                id="s-yayin"
                checked={form.yayinDurumu !== 'taslak'}
                onCheckedChange={(v) => setForm({ ...form, yayinDurumu: v ? 'yayinda' : 'taslak' })}
              />
              <Label htmlFor="s-yayin" className="cursor-pointer">Yayında (kapatırsanız taslak olur, sitede görünmez)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={kaydediliyor}>İptal</Button>
            <Button onClick={handleSubmit} disabled={kaydediliyor}>
              {kaydediliyor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
