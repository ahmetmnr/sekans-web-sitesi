// CMS Menü Yönetimi — dinamik üst menüyü (menuler tablosu) yönet.
// Ekle / sil / yeniden adlandır / sırala / aktif-pasif / başka üst menüye taşı.
// Hedef türleri: site sayfası, grup, sabit sayfa, kategori, filtre listesi,
// dergi sayısı, "Sayılar" (otomatik) ve haricî bağlantı.
import { useEffect, useState, useCallback } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import type { MenuOgesi, MenuTur } from '@/types';
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
  Plus, Pencil, Trash2, ChevronUp, ChevronDown, Loader2, ExternalLink, CornerDownRight, Info,
} from 'lucide-react';

// Bağlantı türü seçenekleri (admin dostu etiketler).
const TUR_SECENEKLERI: { value: MenuTur; label: string }[] = [
  { value: 'dahili', label: 'Site sayfası' },
  { value: 'grup', label: 'Açılır menü başlığı (grup)' },
  { value: 'sabit_sayfa', label: 'Sabit sayfa' },
  { value: 'kategori', label: 'Kategori' },
  { value: 'filtre_liste', label: 'Filtrelenmiş liste' },
  { value: 'dergi_sayisi', label: 'Dergi sayısı' },
  { value: 'dergi_sayilari', label: 'Sayılar (otomatik liste)' },
  { value: 'harici_link', label: 'Haricî bağlantı' },
];

// tur='dahili' için yerleşik site sayfaları.
const DAHILI_SAYFALAR: { value: string; label: string }[] = [
  { value: 'anasayfa', label: 'Ana Sayfa' },
  { value: 'hakkimizda', label: 'Hakkımızda (Sekans Sinema Grubu)' },
  { value: 'duyurular', label: 'Duyurular' },
  { value: 'yarisma', label: 'Yarışma' },
  { value: 'indeks', label: 'Sekans İndeks' },
  { value: 'arayazilar', label: 'Blog (tüm ara yazılar)' },
  { value: 'arayazilar-arayazi', label: 'Blog — "Ara Yazı" filtresi' },
  { value: 'sinemakitapligi', label: 'Sinema Kitaplığı' },
  { value: 'textsinenglish', label: 'Texts in English' },
  { value: 'basilisayilar', label: 'Basılı Sayılar' },
  { value: 'yazarlar', label: 'Yazarlar' },
  { value: 'arsiv', label: 'Arşiv (e-Sayılar)' },
  { value: 'iletisim', label: 'İletişim' },
];

const turEtiketi = (tur: MenuTur) => TUR_SECENEKLERI.find((t) => t.value === tur)?.label ?? tur;

type FormState = Partial<MenuOgesi> & { parentId?: string | null };

export function CMSMenuYonetimi() {
  const { menu, kategoriler, arsivSayilari, refresh } = useCMS();
  const [agac, setAgac] = useState<MenuOgesi[]>(menu);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<MenuOgesi | null>(null);
  const [form, setForm] = useState<FormState>({});

  // Düzenleme için TÜM öğeleri (pasifler dahil) getir; public menü de tazelensin.
  const reload = useCallback(async () => {
    try {
      const m = await api.menu.listCms();
      setAgac(m);
    } catch {
      /* yetki yoksa / hata — mevcut ağacı koru */
    }
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    reload().finally(() => setYukleniyor(false));
  }, [reload]);

  const topLevel = agac;

  const openNew = (parentId?: string | null) => {
    setEditing(null);
    setForm({ tur: 'dahili', parentId: parentId ?? null, aktif: true });
    setShowDialog(true);
  };

  const openEdit = (item: MenuOgesi) => {
    setEditing(item);
    setForm({ ...item });
    setShowDialog(true);
  };

  // Seçilen türe göre hedef alanının değerini belirle (grup/dergi_sayilari => yok).
  const hedefForTur = (f: FormState): string | null => {
    if (f.tur === 'grup' || f.tur === 'dergi_sayilari') return null;
    const h = (f.hedef ?? '').trim();
    return h !== '' ? h : null;
  };

  const handleSubmit = async () => {
    const gorunen = (form.gorunenBaslik ?? '').trim();
    if (!gorunen) { alert('Lütfen menü başlığını girin.'); return; }
    const payload: Partial<MenuOgesi> = {
      gorunenBaslik: gorunen,
      tur: (form.tur as MenuTur) ?? 'dahili',
      hedef: hedefForTur(form),
      parentId: form.parentId ?? null,
      yeniSekme: !!form.yeniSekme,
    };
    setKaydediliyor(true);
    try {
      if (editing) await api.menu.update(editing.id, payload);
      else await api.menu.create(payload);
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

  const handleDelete = async (item: MenuOgesi) => {
    try {
      await api.menu.remove(item.id);
      await reload();
      await refresh();
    } catch (e) {
      alert('Silinemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  const toggleAktif = async (item: MenuOgesi) => {
    try {
      await api.menu.update(item.id, { aktif: !item.aktif });
      await reload();
      await refresh();
    } catch (e) {
      alert('Güncellenemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  // Aynı seviyedeki (siblings) öğeyi yukarı/aşağı taşı ve yeni sırayı kaydet.
  const move = async (siblings: MenuOgesi[], id: string, dir: -1 | 1) => {
    const idx = siblings.findIndex((s) => s.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= siblings.length) return;
    const arr = [...siblings];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    try {
      await api.menu.reorder(arr.map((s, i) => ({ id: s.id, sira: i })));
      await reload();
      await refresh();
    } catch (e) {
      alert('Sıralama kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  // Bir menü satırı (üst düzey veya alt) — işlem butonlarıyla.
  const renderRow = (item: MenuOgesi, siblings: MenuOgesi[], isChild: boolean) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const hedefOzet =
      item.tur === 'grup' ? '—' :
      item.tur === 'dergi_sayilari' ? 'Sayılar otomatik listelenir' :
      item.tur === 'harici_link' ? (item.hedef ?? '') :
      (item.hedef ?? '—');
    return (
      <div
        key={item.id}
        className={`flex items-center gap-3 py-2.5 ${isChild ? 'pl-9' : 'px-1'} ${!item.aktif ? 'opacity-50' : ''}`}
      >
        {isChild && <CornerDownRight className="h-4 w-4 text-gray-300 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{item.gorunenBaslik}</span>
            {item.tur === 'harici_link' && <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">{turEtiketi(item.tur)}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{hedefOzet}</p>
        </div>

        {/* Sırala */}
        <div className="flex flex-col shrink-0">
          <button
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
            disabled={idx <= 0}
            onClick={() => move(siblings, item.id, -1)}
            title="Yukarı taşı"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
            disabled={idx >= siblings.length - 1}
            onClick={() => move(siblings, item.id, 1)}
            title="Aşağı taşı"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Aktif */}
        <div className="shrink-0" title={item.aktif ? 'Menüde görünür' : 'Gizli'}>
          <Switch checked={item.aktif} onCheckedChange={() => toggleAktif(item)} />
        </div>

        {/* Alt öğe ekle (yalnızca üst düzey) */}
        {!isChild && (
          <Button variant="ghost" size="sm" onClick={() => openNew(item.id)} title="Alt menü ekle">
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Düzenle */}
        <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Düzenle">
          <Pencil className="h-4 w-4" />
        </Button>

        {/* Sil */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" title="Sil">
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Menü öğesini sil</AlertDialogTitle>
              <AlertDialogDescription>
                "{item.gorunenBaslik}" öğesini silmek istediğinizden emin misiniz?
                {(item.children?.length ?? 0) > 0 && ' Alt menüleri de birlikte silinir.'}
                {' '}Bu işlem geri alınamaz. (İçerik/sayfalar silinmez, yalnızca menü bağlantısı kaldırılır.)
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDelete(item)} className="bg-red-600 hover:bg-red-700">
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menü Yönetimi</h1>
          <p className="text-gray-600 mt-1">Üst menüyü buradan yönetin — değişiklikler siteye anında yansır.</p>
        </div>
        <Button onClick={() => openNew(null)}>
          <Plus className="h-4 w-4 mr-2" />
          Üst Menü Öğesi
        </Button>
      </div>

      {/* Bilgi kutusu */}
      <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p><strong>"Sayılar"</strong> menüsü otomatiktir: yeni dergi sayıları burada kendiliğinden görünür.
            Görünen adı değiştirmek veya gizlemek için <strong>Sayı Yönetimi</strong> ekranını kullanın
            (her sayının "menü etiketi" ve "menüde göster" ayarı vardır).</p>
        </div>
      </div>

      {/* Menü ağacı */}
      <Card>
        <CardHeader>
          <CardTitle>Üst Menü Yapısı</CardTitle>
          <CardDescription>
            Ok tuşlarıyla sırala, anahtarla aç/kapat, + ile alt menü ekle. Bir öğeyi başka bir üst menünün
            altına taşımak için Düzenle → "Üst menü" alanını değiştirin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {yukleniyor ? (
            <div className="py-12 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
            </div>
          ) : topLevel.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>Henüz menü öğesi yok.</p>
              <p className="text-sm mt-1">
                Menü tablosu boş görünüyor — migration (2026-07-15_menuler.sql) uygulanana kadar site geçici olarak
                varsayılan menüyü gösterir.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topLevel.map((item) => (
                <div key={item.id}>
                  {renderRow(item, topLevel, false)}
                  {(item.children?.length ?? 0) > 0 && (
                    <div className="divide-y divide-gray-50 border-l-2 border-gray-100 ml-2">
                      {item.children.map((c) => renderRow(c, item.children, true))}
                    </div>
                  )}
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
            <DialogTitle>{editing ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi'}</DialogTitle>
            <DialogDescription>Görünen ad, bağlantı türü ve hedefi belirleyin.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Görünen başlık */}
            <div>
              <Label htmlFor="gorunen">Görünen ad *</Label>
              <Input
                id="gorunen"
                value={form.gorunenBaslik ?? ''}
                onChange={(e) => setForm({ ...form, gorunenBaslik: e.target.value })}
                placeholder="Örn: Lynch Sayısı"
              />
              <p className="text-xs text-gray-500 mt-1">Kullanıcıya menüde bu ad görünür.</p>
            </div>

            {/* Üst menü */}
            <div>
              <Label>Üst menü</Label>
              <Select
                value={form.parentId ?? 'root'}
                onValueChange={(v) => setForm({ ...form, parentId: v === 'root' ? null : v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">— En üst düzey —</SelectItem>
                  {topLevel
                    .filter((t) => t.id !== editing?.id)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.gorunenBaslik}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bağlantı türü */}
            <div>
              <Label>Bağlantı türü</Label>
              <Select
                value={form.tur ?? 'dahili'}
                onValueChange={(v) => setForm({ ...form, tur: v as MenuTur, hedef: '' })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TUR_SECENEKLERI.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Hedef — türe göre değişir */}
            {form.tur === 'dahili' && (
              <div>
                <Label>Hedef sayfa</Label>
                <Select value={form.hedef ?? ''} onValueChange={(v) => setForm({ ...form, hedef: v })}>
                  <SelectTrigger><SelectValue placeholder="Sayfa seçin" /></SelectTrigger>
                  <SelectContent>
                    {DAHILI_SAYFALAR.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.tur === 'kategori' && (
              <div>
                <Label>Kategori</Label>
                <Select value={form.hedef ?? ''} onValueChange={(v) => setForm({ ...form, hedef: v })}>
                  <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                  <SelectContent>
                    {kategoriler.map((k) => (
                      <SelectItem key={k.id} value={k.ad}>{k.ad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Seçilen kategorinin yazıları listelenir.</p>
              </div>
            )}

            {form.tur === 'dergi_sayisi' && (
              <div>
                <Label>Dergi sayısı</Label>
                <Select value={form.hedef ?? ''} onValueChange={(v) => setForm({ ...form, hedef: v })}>
                  <SelectTrigger><SelectValue placeholder="Sayı seçin" /></SelectTrigger>
                  <SelectContent>
                    {arsivSayilari.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {(s.menuEtiket?.trim() ? s.menuEtiket : `Sayı ${s.numara}`)} — {s.ay} {s.yil}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">PDF'i varsa yeni sekmede açılır.</p>
              </div>
            )}

            {form.tur === 'sabit_sayfa' && (
              <div>
                <Label htmlFor="slug">Sayfa adresi (slug)</Label>
                <Input
                  id="slug"
                  value={form.hedef ?? ''}
                  onChange={(e) => setForm({ ...form, hedef: e.target.value })}
                  placeholder="yazi-standartlari"
                />
                <p className="text-xs text-gray-500 mt-1">Statik sayfanın URL adresi. (Sabit sayfa yönetimi Faz 3'te genişletilecek.)</p>
              </div>
            )}

            {form.tur === 'filtre_liste' && (
              <div>
                <Label htmlFor="filtreSlug">Filtre sayfası adresi (slug)</Label>
                <Input
                  id="filtreSlug"
                  value={form.hedef ?? ''}
                  onChange={(e) => setForm({ ...form, hedef: e.target.value })}
                  placeholder="sinema-kitapligi"
                />
                <p className="text-xs text-gray-500 mt-1">Admin tanımlı filtre sayfaları Faz 4'te gelir; o zamana dek blog listesine yönlendirir.</p>
              </div>
            )}

            {form.tur === 'harici_link' && (
              <>
                <div>
                  <Label htmlFor="url">Bağlantı adresi (URL)</Label>
                  <Input
                    id="url"
                    value={form.hedef ?? ''}
                    onChange={(e) => setForm({ ...form, hedef: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!form.yeniSekme}
                    onCheckedChange={(v) => setForm({ ...form, yeniSekme: v })}
                    id="yeniSekme"
                  />
                  <Label htmlFor="yeniSekme" className="cursor-pointer">Yeni sekmede aç</Label>
                </div>
              </>
            )}

            {(form.tur === 'grup' || form.tur === 'dergi_sayilari') && (
              <p className="text-xs text-gray-500 -mt-1">
                {form.tur === 'grup'
                  ? 'Bu bir açılır menü başlığıdır; alt öğelerini + ile ekleyin.'
                  : '"Sayılar" düğümü dergi sayılarını otomatik listeler; ayrı hedef gerekmez.'}
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
