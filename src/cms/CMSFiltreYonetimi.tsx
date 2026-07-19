// CMS Filtre Sayfası Yönetimi — belirli bir kategoriye bağlı listeleme sayfaları.
// Ayarlar: başlık, açıklama, kategori, sıralama, sayfa başına içerik,
// kapak/yazar-tarih gösterimi. "Menüye ekle" ile üst menüye bağlanır.
import { useEffect, useState, useCallback } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import type { FiltreSayfa, FiltreSiralama } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Plus, Pencil, Trash2, Loader2, Filter, ListPlus } from 'lucide-react';

const SIRALAMA_SECENEKLERI: { value: FiltreSiralama; label: string }[] = [
  { value: 'yeni', label: 'En yeni' },
  { value: 'eski', label: 'En eski' },
  { value: 'alfabetik', label: 'Alfabetik (A-Z)' },
];

const slugYap = (s: string): string =>
  s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Kategori alanı '|' ile ayrılmış birden çok kategori adı tutar (çoklu seçim).
const parseKategoriler = (s?: string): string[] =>
  (s ?? '').split('|').map((x) => x.trim()).filter(Boolean);
const joinKategoriler = (list: string[]): string => list.join('|');

type FormState = Partial<FiltreSayfa>;

export function CMSFiltreYonetimi() {
  const { kategoriler, refresh } = useCMS();
  const [filtreler, setFiltreler] = useState<FiltreSayfa[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<FiltreSayfa | null>(null);
  const [form, setForm] = useState<FormState>({});

  const reload = useCallback(async () => {
    try { setFiltreler(await api.filtre.listCms()); } catch { /* yetki/hata */ }
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    reload().finally(() => setYukleniyor(false));
  }, [reload]);

  const openNew = () => {
    setEditing(null);
    setForm({ siralama: 'yeni', sayfaBasina: 12, kapakGoster: true, yazarTarihGoster: true, aktif: true });
    setShowDialog(true);
  };

  const openEdit = (f: FiltreSayfa) => {
    setEditing(f);
    setForm({ ...f });
    setShowDialog(true);
  };

  const handleBaslikChange = (baslik: string) => {
    setForm((f) => ({ ...f, baslik, slug: editing ? f.slug : slugYap(baslik) }));
  };

  const handleSubmit = async () => {
    const baslik = (form.baslik ?? '').trim();
    if (!baslik) { alert('Lütfen başlık girin.'); return; }
    const payload: Partial<FiltreSayfa> = {
      baslik,
      aciklama: form.aciklama ?? '',
      kategori: form.kategori ?? '',
      siralama: (form.siralama as FiltreSiralama) ?? 'yeni',
      sayfaBasina: form.sayfaBasina ?? 12,
      kapakGoster: form.kapakGoster ?? true,
      yazarTarihGoster: form.yazarTarihGoster ?? true,
      aktif: form.aktif ?? true,
    };
    setKaydediliyor(true);
    try {
      if (editing) await api.filtre.update(editing.id, payload);
      else await api.filtre.create({ ...payload, slug: form.slug ? slugYap(form.slug) : undefined });
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

  const handleDelete = async (f: FiltreSayfa) => {
    try { await api.filtre.remove(f.id); await reload(); }
    catch (e) { alert('Silinemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata')); }
  };

  const menuyeEkle = async (f: FiltreSayfa) => {
    try {
      await api.menu.create({ gorunenBaslik: f.baslik, tur: 'filtre_liste', hedef: f.slug, parentId: null });
      await refresh();
      alert(`"${f.baslik}" üst menüye eklendi. Menü Yönetimi'nden düzenleyebilirsiniz.`);
    } catch (e) {
      alert('Menüye eklenemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Filtre Sayfaları</h1>
          <p className="text-gray-600 mt-1">Belirli bir kategoriye bağlı içerik listeleme sayfaları oluşturun.</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Yeni Filtre Sayfası</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtre Sayfaları</CardTitle>
          <CardDescription>Her sayfa bir kategoriyi listeler. Menüye ekleyerek üst menüde gösterebilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          {yukleniyor ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-center">Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtreler.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-gray-400" />{f.baslik}</div>
                    </TableCell>
                    <TableCell>
                      {f.kategori
                        ? parseKategoriler(f.kategori).join(', ')
                        : <span className="text-gray-400">—</span>}
                    </TableCell>
                    <TableCell><code className="px-2 py-1 bg-gray-100 rounded text-xs">/{f.slug}</code></TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${f.aktif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {f.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => menuyeEkle(f)} title="Üst menüye ekle">
                          <ListPlus className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(f)} title="Düzenle"><Pencil className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Sil"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Filtre sayfasını sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                "{f.baslik}" sayfasını silmek istediğinizden emin misiniz? İçerik silinmez, yalnızca listeleme sayfası kaldırılır.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(f)} className="bg-red-600 hover:bg-red-700">Sil</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtreler.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Henüz filtre sayfası yok.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ekle/Düzenle Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Filtre Sayfasını Düzenle' : 'Yeni Filtre Sayfası'}</DialogTitle>
            <DialogDescription>Bir kategoriyi listeleyen sayfa oluşturun.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="f-baslik">Başlık *</Label>
              <Input id="f-baslik" value={form.baslik ?? ''} onChange={(e) => handleBaslikChange(e.target.value)} placeholder="Örn: Sinema Kitaplığı" />
            </div>
            <div>
              <Label htmlFor="f-slug">URL adresi (slug)</Label>
              <Input id="f-slug" value={form.slug ?? ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="sinema-kitapligi" disabled={!!editing} />
              <p className="text-xs text-gray-500 mt-1">{editing ? 'URL sonradan değiştirilemez.' : 'Başlıktan otomatik üretilir.'}</p>
            </div>
            <div>
              <Label htmlFor="f-aciklama">Açıklama</Label>
              <Input id="f-aciklama" value={form.aciklama ?? ''} onChange={(e) => setForm({ ...form, aciklama: e.target.value })} placeholder="Sayfa açıklaması" />
            </div>
            <div>
              <Label>Kategoriler</Label>
              <p className="text-xs text-gray-500 mb-2">
                Bu sayfada listelenecek kategori(ler)i seçin. Birden fazla seçebilirsiniz — seçili
                kategorilerden herhangi birine ait içerikler listelenir.
              </p>
              <div className="max-h-44 overflow-y-auto rounded-md border p-2 space-y-0.5">
                {kategoriler.map((k) => {
                  const secili = parseKategoriler(form.kategori).includes(k.ad);
                  return (
                    <label
                      key={k.id}
                      className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={secili}
                        onCheckedChange={(v) => {
                          const mevcut = parseKategoriler(form.kategori);
                          const yeni = v
                            ? [...mevcut, k.ad]
                            : mevcut.filter((x) => x !== k.ad);
                          setForm({ ...form, kategori: joinKategoriler(yeni) });
                        }}
                      />
                      <span>{k.ad}</span>
                    </label>
                  );
                })}
                {kategoriler.length === 0 && (
                  <p className="text-xs text-gray-400 px-1.5 py-2">Kategori bulunamadı.</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sıralama</Label>
                <Select value={form.siralama ?? 'yeni'} onValueChange={(v) => setForm({ ...form, siralama: v as FiltreSiralama })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIRALAMA_SECENEKLERI.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="f-adet">Sayfa başına içerik</Label>
                <Input id="f-adet" type="number" min={1} max={96} value={form.sayfaBasina ?? 12} onChange={(e) => setForm({ ...form, sayfaBasina: Number(e.target.value) || 12 })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="f-kapak" checked={form.kapakGoster ?? true} onCheckedChange={(v) => setForm({ ...form, kapakGoster: v })} />
              <Label htmlFor="f-kapak" className="cursor-pointer">Kapak görseli göster</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="f-yazar" checked={form.yazarTarihGoster ?? true} onCheckedChange={(v) => setForm({ ...form, yazarTarihGoster: v })} />
              <Label htmlFor="f-yazar" className="cursor-pointer">Yazar ve tarih göster</Label>
            </div>
            <div className="flex items-center gap-2 border-t pt-4">
              <Switch id="f-aktif" checked={form.aktif ?? true} onCheckedChange={(v) => setForm({ ...form, aktif: v })} />
              <Label htmlFor="f-aktif" className="cursor-pointer">Aktif (kapatırsanız sayfa erişilemez)</Label>
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
