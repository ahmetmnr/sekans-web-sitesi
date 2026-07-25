// CMS Kategori Yönetimi - Category Management
import { useCallback, useEffect, useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api, type KullanimSayaci } from '@/lib/api';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  FileText,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import type { Kategori } from '@/types';

const DEVIR_YOK = '__yok__';

export function CMSKategoriYonetimi() {
  const {
    kategoriler,
    addKategori,
    updateKategori,
    deleteKategori,
    reorderKategori,
  } = useCMS();

  // Gerçek kullanım sayıları (tüm sayılar + blog). Bootstrap yalnızca yayındaki
  // sayıyı taşıdığı için sayaçlar buradan çekilir.
  const [kullanim, setKullanim] = useState<Record<string, KullanimSayaci>>({});
  const kullanimYenile = useCallback(() => {
    api.kullanim()
      .then((d) => setKullanim(d.kategoriler ?? {}))
      .catch(() => { /* uç yoksa sayaçlar boş kalır */ });
  }, []);
  useEffect(() => { kullanimYenile(); }, [kullanimYenile]);

  const sayac = (id: string): KullanimSayaci => kullanim[id] ?? { dergi: 0, blog: 0 };

  // Sıralama (yukarı/aşağı) — komşu iki kategorinin sırasını değiştirip kaydeder.
  const moveKategori = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= kategoriler.length) return;
    const arr = [...kategoriler];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    try {
      await reorderKategori(arr.map((k, i) => ({ id: k.id, sira: i })));
    } catch (e) {
      alert('Sıralama kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  // Anahtarlar: aktif / Sekans İndeks'te görünsün / Blog'da sekme olarak görünsün
  const toggleAlan = async (kategori: Kategori, alan: 'aktif' | 'indeksGoster' | 'blogGoster') => {
    try {
      await updateKategori(kategori.id, { [alan]: !(kategori[alan] ?? true) });
    } catch (e) {
      alert('Güncellenemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  const [showDialog, setShowDialog] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
  const [formData, setFormData] = useState<Partial<Kategori>>({});

  // Silme akışı: bağlı içerik varsa devir seçeneği sunulur.
  const [silinecek, setSilinecek] = useState<Kategori | null>(null);
  const [devirHedef, setDevirHedef] = useState<string>(DEVIR_YOK);
  const [siliniyor, setSiliniyor] = useState(false);
  const [silmeHatasi, setSilmeHatasi] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (!formData.ad) {
      alert('Lütfen kategori adını girin');
      return;
    }
    const slug = formData.slug || generateSlug(formData.ad);
    try {
      if (editingKategori) {
        await updateKategori(editingKategori.id, { ...formData, slug });
      } else {
        await addKategori({
          ad: formData.ad,
          slug,
          indeksGoster: formData.indeksGoster ?? true,
          blogGoster: formData.blogGoster ?? true,
        });
      }
      setShowDialog(false);
      setEditingKategori(null);
      setFormData({});
    } catch (e) {
      alert('Kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  const openSilDialog = (kategori: Kategori) => {
    setSilinecek(kategori);
    setDevirHedef(DEVIR_YOK);
    setSilmeHatasi(null);
  };

  const handleSil = async () => {
    if (!silinecek) return;
    setSiliniyor(true);
    setSilmeHatasi(null);
    try {
      await deleteKategori(silinecek.id, devirHedef !== DEVIR_YOK ? devirHedef : undefined);
      setSilinecek(null);
      kullanimYenile();
    } catch (e) {
      // Sessiz başarısızlık yok: sunucunun açık mesajı diyalogda gösterilir.
      setSilmeHatasi(e instanceof Error ? e.message : 'Kategori silinemedi.');
    } finally {
      setSiliniyor(false);
    }
  };

  const silinecekSayac = silinecek ? sayac(silinecek.id) : { dergi: 0, blog: 0 };
  const silinecekBagli = silinecekSayac.dergi + silinecekSayac.blog;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
          <p className="text-gray-600 mt-1">Yazı kategorilerini ve görünürlüklerini yönetin</p>
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
                  {kategoriler.filter((k) => sayac(k.id).dergi + sayac(k.id).blog > 0).length}
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
            "Sekans İndeks" kapalıysa kategori ve içerikleri İndeks dökümünde görünmez.
            "Blog sekmesi" kapalıysa Blog sayfasında sekmesi çıkmaz ve yalnız bu kategorideki
            yazılar Blog akışında listelenmez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Sıra</TableHead>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">İçerik</TableHead>
                <TableHead className="text-center">Aktif</TableHead>
                <TableHead className="text-center">Sekans İndeks</TableHead>
                <TableHead className="text-center">Blog sekmesi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kategoriler.map((kategori, idx) => {
                const s = sayac(kategori.id);
                const toplam = s.dergi + s.blog;
                return (
                  <TableRow key={kategori.id} className={kategori.aktif === false ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex flex-col">
                        <button className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx <= 0} onClick={() => moveKategori(idx, -1)} title="Yukarı">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx >= kategoriler.length - 1} onClick={() => moveKategori(idx, 1)} title="Aşağı">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{kategori.ad}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {kategori.slug}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          toplam > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                        }`}
                        title={`${s.dergi} dergi yazısı · ${s.blog} ara yazı`}
                      >
                        {toplam}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center" title={kategori.aktif === false ? 'Pasif' : 'Aktif'}>
                        <Switch checked={kategori.aktif !== false} onCheckedChange={() => toggleAlan(kategori, 'aktif')} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center" title="Sekans İndeks'te görünsün">
                        <Switch
                          checked={kategori.indeksGoster !== false}
                          onCheckedChange={() => toggleAlan(kategori, 'indeksGoster')}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center" title="Blog'da sekme olarak görünsün">
                        <Switch
                          checked={kategori.blogGoster !== false}
                          onCheckedChange={() => toggleAlan(kategori, 'blogGoster')}
                        />
                      </div>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openSilDialog(kategori)}
                          title="Kategoriyi sil"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {kategoriler.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Sekans İndeks'te görünsün</Label>
                <p className="text-xs text-gray-500">Kapalıysa kategori ve içerikleri İndeks'te listelenmez.</p>
              </div>
              <Switch
                checked={formData.indeksGoster !== false}
                onCheckedChange={(v) => setFormData({ ...formData, indeksGoster: v })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="text-sm">Blog'da sekme olarak görünsün</Label>
                <p className="text-xs text-gray-500">Kapalıysa Blog sayfasında sekme açılmaz.</p>
              </div>
              <Switch
                checked={formData.blogGoster !== false}
                onCheckedChange={(v) => setFormData({ ...formData, blogGoster: v })}
              />
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

      {/* Silme Dialog — bağlı içerik varsa devir seçeneği */}
      <Dialog open={!!silinecek} onOpenChange={(acik) => { if (!acik) setSilinecek(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategoriyi Sil</DialogTitle>
            <DialogDescription>
              "{silinecek?.ad}" kategorisi silinecek. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {silinecekBagli > 0 ? (
              <>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Bu kategoriye bağlı <strong>{silinecekSayac.dergi} dergi yazısı</strong> ve{' '}
                  <strong>{silinecekSayac.blog} ara yazı</strong> var.
                  {silinecekSayac.dergi > 0 && ' Dergi yazıları bağlıyken kategori silinemez; önce başka bir kategoriye aktarın.'}
                </div>
                <div>
                  <Label>İçerikleri şu kategoriye aktar</Label>
                  <Select value={devirHedef} onValueChange={setDevirHedef}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DEVIR_YOK}>Aktarma (yalnızca sil)</SelectItem>
                      {kategoriler
                        .filter((k) => k.id !== silinecek?.id)
                        .map((k) => (
                          <SelectItem key={k.id} value={k.id}>{k.ad}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">Bu kategoriye bağlı içerik yok, güvenle silinebilir.</p>
            )}

            {silmeHatasi && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {silmeHatasi}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSilinecek(null)}>İptal</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSil}
              disabled={siliniyor}
            >
              {siliniyor
                ? 'Siliniyor...'
                : devirHedef !== DEVIR_YOK ? 'Aktar ve Sil' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
