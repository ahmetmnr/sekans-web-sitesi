// CMS Ana Sayfa Yönetimi — ana sayfa panellerini (anasayfa_bloklar) yönet.
// Hangi paneller gösterilecek, sıraları ve başlıkları buradan ayarlanır.
import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import type { AnasayfaBlok, AnasayfaBlokTip } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, Info, BookOpen, FileText, FolderOpen,
} from 'lucide-react';

const TIP_SECENEKLERI: { value: AnasayfaBlokTip; label: string; icon: ReactNode }[] = [
  { value: 'sayilar', label: 'Dergi sayıları', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'blog', label: 'Blog (ara yazılar)', icon: <FileText className="h-4 w-4" /> },
  { value: 'kategori', label: 'Kategori paneli', icon: <FolderOpen className="h-4 w-4" /> },
];

const tipEtiketi = (t: AnasayfaBlokTip) => TIP_SECENEKLERI.find((x) => x.value === t)?.label ?? t;
const tipIcon = (t: AnasayfaBlokTip) => TIP_SECENEKLERI.find((x) => x.value === t)?.icon ?? null;

type FormState = Partial<AnasayfaBlok>;

export function CMSAnasayfaYonetimi() {
  const { anasayfaBloklar, kategoriler, refresh } = useCMS();
  const [bloklar, setBloklar] = useState<AnasayfaBlok[]>(anasayfaBloklar);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<AnasayfaBlok | null>(null);
  const [form, setForm] = useState<FormState>({});

  const reload = useCallback(async () => {
    try {
      setBloklar(await api.anasayfaBlok.listCms());
    } catch {
      /* yetki/hata — mevcut listeyi koru */
    }
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    reload().finally(() => setYukleniyor(false));
  }, [reload]);

  const openNew = () => {
    setEditing(null);
    setForm({ tip: 'blog', baslik: '', aktif: true, ayar: { adet: 6 } });
    setShowDialog(true);
  };

  const openEdit = (blok: AnasayfaBlok) => {
    setEditing(blok);
    setForm({ ...blok, ayar: { ...blok.ayar } });
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    const tip = (form.tip as AnasayfaBlokTip) ?? 'blog';
    if (tip === 'kategori' && !form.ayar?.kategori) {
      alert('Lütfen bir kategori seçin.');
      return;
    }
    const payload: Partial<AnasayfaBlok> = {
      tip,
      baslik: (form.baslik ?? '').trim(),
      ayar: {
        ...(tip === 'kategori' ? { kategori: form.ayar?.kategori } : {}),
        ...(tip !== 'sayilar' ? { adet: form.ayar?.adet ?? 6 } : {}),
      },
    };
    setKaydediliyor(true);
    try {
      if (editing) await api.anasayfaBlok.update(editing.id, payload);
      else await api.anasayfaBlok.create(payload);
      setShowDialog(false);
      setEditing(null);
      setForm({});
      await reload();
      await refresh();
    } catch (e) {
      alert('Kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    } finally {
      setKaydediliyor(false);
    }
  };

  const handleDelete = async (blok: AnasayfaBlok) => {
    try {
      await api.anasayfaBlok.remove(blok.id);
      await reload();
      await refresh();
    } catch (e) {
      alert('Silinemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  const toggleAktif = async (blok: AnasayfaBlok) => {
    try {
      await api.anasayfaBlok.update(blok.id, { aktif: !blok.aktif });
      await reload();
      await refresh();
    } catch (e) {
      alert('Güncellenemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = bloklar.findIndex((s) => s.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= bloklar.length) return;
    const arr = [...bloklar];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    try {
      await api.anasayfaBlok.reorder(arr.map((s, i) => ({ id: s.id, sira: i })));
      await reload();
      await refresh();
    } catch (e) {
      alert('Sıralama kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  const blokOzet = (blok: AnasayfaBlok): string => {
    if (blok.tip === 'sayilar') return 'Sayılar Sayı Yönetimi\'nden seçilir';
    const parca: string[] = [];
    if (blok.tip === 'kategori') parca.push(`Kategori: ${blok.ayar?.kategori ?? '—'}`);
    if (blok.ayar?.adet) parca.push(`${blok.ayar.adet} yazı`);
    return parca.join(' · ') || '—';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ana Sayfa Yönetimi</h1>
          <p className="text-gray-600 mt-1">Ana sayfa panellerini yönetin — değişiklikler siteye anında yansır.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Panel Ekle
        </Button>
      </div>

      {/* Bilgi kutusu */}
      <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p><strong>"Dergi sayıları"</strong> paneli, ana sayfada hangi sayıların görüneceğini
            <strong> Sayı Yönetimi</strong>'nden ("ana sayfada göster" anahtarı) alır. Buradan sadece panelin
            başlığını, sırasını ve gösterilip gösterilmeyeceğini ayarlarsınız.</p>
        </div>
      </div>

      {/* Panel listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Ana Sayfa Panelleri</CardTitle>
          <CardDescription>Ok tuşlarıyla sırala, anahtarla aç/kapat, başlıkları Düzenle ile değiştir.</CardDescription>
        </CardHeader>
        <CardContent>
          {yukleniyor ? (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : bloklar.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>Henüz panel yok.</p>
              <p className="text-sm mt-1">Migration (2026-07-16_anasayfa_bloklar.sql) uygulanana kadar site varsayılan düzeni gösterir.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bloklar.map((blok, idx) => (
                <div key={blok.id} className={`flex items-center gap-3 py-3 ${!blok.aktif ? 'opacity-50' : ''}`}>
                  <div className="text-gray-400 shrink-0">{tipIcon(blok.tip)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {blok.baslik?.trim() ? blok.baslik : (blok.tip === 'blog' ? 'Blog' : tipEtiketi(blok.tip))}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">{tipEtiketi(blok.tip)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{blokOzet(blok)}</p>
                  </div>

                  {/* Sırala */}
                  <div className="flex flex-col shrink-0">
                    <button className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx <= 0} onClick={() => move(blok.id, -1)} title="Yukarı">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx >= bloklar.length - 1} onClick={() => move(blok.id, 1)} title="Aşağı">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Aktif */}
                  <div className="shrink-0" title={blok.aktif ? 'Görünür' : 'Gizli'}>
                    <Switch checked={blok.aktif} onCheckedChange={() => toggleAktif(blok)} />
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => openEdit(blok)} title="Düzenle">
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" title="Sil">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Paneli sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu paneli ana sayfadan kaldırmak istediğinizden emin misiniz? İçerik silinmez, yalnızca panel kaldırılır.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(blok)} className="bg-red-600 hover:bg-red-700">Sil</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ekle/Düzenle Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Paneli Düzenle' : 'Yeni Panel'}</DialogTitle>
            <DialogDescription>Panel türü, başlığı ve ayarlarını belirleyin.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Tür */}
            <div>
              <Label>Panel türü</Label>
              <Select
                value={form.tip ?? 'blog'}
                onValueChange={(v) => setForm({ ...form, tip: v as AnasayfaBlokTip })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIP_SECENEKLERI.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Başlık */}
            <div>
              <Label htmlFor="baslik">
                Panel başlığı {form.tip === 'sayilar' ? '(opsiyonel)' : ''}
              </Label>
              <Input
                id="baslik"
                value={form.baslik ?? ''}
                onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                placeholder={form.tip === 'blog' ? 'Blog' : form.tip === 'sayilar' ? '(boş bırakılabilir)' : 'Örn: Sinema Kitaplığı'}
              />
            </div>

            {/* Kategori (yalnızca kategori paneli) */}
            {form.tip === 'kategori' && (
              <div>
                <Label>Kategori</Label>
                <Select
                  value={form.ayar?.kategori ?? ''}
                  onValueChange={(v) => setForm({ ...form, ayar: { ...form.ayar, kategori: v } })}
                >
                  <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                  <SelectContent>
                    {kategoriler.map((k) => (
                      <SelectItem key={k.id} value={k.ad}>{k.ad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Adet (blog + kategori) */}
            {form.tip !== 'sayilar' && (
              <div>
                <Label htmlFor="adet">Gösterilecek yazı sayısı</Label>
                <Input
                  id="adet"
                  type="number"
                  min={1}
                  max={48}
                  value={form.ayar?.adet ?? 6}
                  onChange={(e) => setForm({ ...form, ayar: { ...form.ayar, adet: Number(e.target.value) || 6 } })}
                />
              </div>
            )}

            {form.tip === 'sayilar' && (
              <p className="text-xs text-gray-500 -mt-1">
                Hangi sayıların görüneceğini <strong>Sayı Yönetimi</strong> ekranından ayarlayın.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} disabled={kaydediliyor}>İptal</Button>
            <Button onClick={handleSubmit} disabled={kaydediliyor}>
              {kaydediliyor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editing ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
