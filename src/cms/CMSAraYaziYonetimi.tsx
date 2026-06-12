// CMS Ara Yazı Yönetimi - Blog Post Management
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Card, CardContent } from '@/components/ui/card';
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
  Calendar,
  Eye,
  Search,
} from 'lucide-react';
import type { AraYazi } from '@/types';

const araYaziKategorileri = [
  'Deneme',
  'Haber',
  'Duyuru',
  'İnceleme',
  'Söyleşi',
  'Etkinlik',
  'Yorum',
];

export function CMSAraYaziYonetimi() {
  const {
    araYazilar,
    yazarlar,
    addAraYazi,
    updateAraYazi,
    deleteAraYazi
  } = useCMS();

  const [showDialog, setShowDialog] = useState(false);
  const [editingYazi, setEditingYazi] = useState<AraYazi | null>(null);
  const [formData, setFormData] = useState<Partial<AraYazi>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('edit');

  const generateSlug = (baslik: string): string => {
    return baslik
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

  const openNewYazi = () => {
    setEditingYazi(null);
    setFormData({
      yayinTarihi: new Date().toISOString().split('T')[0],
      kategori: 'Deneme',
      icerik: '',
    });
    setActiveTab('edit');
    setShowDialog(true);
  };

  const openEditYazi = (yazi: AraYazi) => {
    setEditingYazi(yazi);
    setFormData(yazi);
    setActiveTab('edit');
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const selectedYazar = yazarlar.find(y => y.id === formData.yazar?.id);

    if (!selectedYazar) {
      alert('Lütfen yazar seçin');
      return;
    }

    if (!formData.baslik || !formData.icerik) {
      alert('Lütfen başlık ve içerik alanlarını doldurun');
      return;
    }

    const slug = formData.slug || generateSlug(formData.baslik);

    if (editingYazi) {
      updateAraYazi(editingYazi.id, {
        ...formData,
        yazar: selectedYazar,
        slug,
      });
    } else {
      const newId = `ay-${Date.now()}`;
      addAraYazi({
        id: newId,
        baslik: formData.baslik,
        spot: formData.spot || '',
        icerik: formData.icerik,
        yazar: selectedYazar,
        kategori: formData.kategori || 'Deneme',
        kapakGorseli: formData.kapakGorseli,
        yayinTarihi: formData.yayinTarihi || new Date().toISOString().split('T')[0],
        slug,
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

  const handleBaslikChange = (baslik: string) => {
    setFormData({
      ...formData,
      baslik,
      slug: generateSlug(baslik),
    });
  };

  // Filtreleme
  const filteredYazilar = araYazilar
    .filter(yazi => {
      const matchesSearch = yazi.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        yazi.yazar.tamAd.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKategori = filterKategori === 'all' || yazi.kategori === filterKategori;
      return matchesSearch && matchesKategori;
    })
    .sort((a, b) => new Date(b.yayinTarihi).getTime() - new Date(a.yayinTarihi).getTime());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ara Yazılar</h1>
          <p className="text-gray-600 mt-1">Blog yazılarını yönetin</p>
        </div>
        <Button onClick={openNewYazi}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ara Yazı
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Başlık veya yazar ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {araYaziKategorileri.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yazılar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredYazilar.map((yazi) => (
          <Card key={yazi.id} className="overflow-hidden">
            {/* Kapak Görseli */}
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={yazi.kapakGorseli || '/images/default-cover.svg'}
                alt={yazi.baslik}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-cover.svg';
                }}
              />
              <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-white/90 rounded">
                {yazi.kategori}
              </span>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                {yazi.baslik}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {yazi.spot}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{yazi.yazar.tamAd}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(yazi.yayinTarihi).toLocaleDateString('tr-TR')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditYazi(yazi)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
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
                        onClick={() => deleteAraYazi(yazi.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredYazilar.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {searchTerm || filterKategori !== 'all'
              ? 'Arama kriterlerine uygun yazı bulunamadı.'
              : 'Henüz ara yazı eklenmemiş.'}
          </div>
        )}
      </div>

      {/* Yazı Dialog - Tam Ekran */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingYazi ? 'Ara Yazıyı Düzenle' : 'Yeni Ara Yazı'}
            </DialogTitle>
            <DialogDescription>
              Blog yazısı bilgilerini girin ve içeriği zengin metin editörü ile düzenleyin
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
                      onChange={(e) => handleBaslikChange(e.target.value)}
                      placeholder="Yazı başlığı"
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="yazi-basligi"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Otomatik oluşturulur
                    </p>
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
                      value={formData.kategori || ''}
                      onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {araYaziKategorileri.map((kategori) => (
                          <SelectItem key={kategori} value={kategori}>
                            {kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>

                {/* Spot */}
                <div>
                  <Label htmlFor="spot">Spot (Özet) *</Label>
                  <Textarea
                    id="spot"
                    value={formData.spot || ''}
                    onChange={(e) => setFormData({ ...formData, spot: e.target.value })}
                    placeholder="Yazının kısa özeti - anasayfada görünür"
                    rows={2}
                  />
                </div>

                {/* Kapak Görseli */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kapakGorseli">Kapak Görseli URL</Label>
                    <Input
                      id="kapakGorseli"
                      value={formData.kapakGorseli || ''}
                      onChange={(e) => setFormData({ ...formData, kapakGorseli: e.target.value })}
                      placeholder="/images/yazi-kapak.jpg"
                    />
                  </div>
                  {formData.kapakGorseli && (
                    <div>
                      <Label>Önizleme</Label>
                      <div className="mt-2 aspect-video w-40 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={formData.kapakGorseli}
                          alt="Kapak önizleme"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Rich Text Editor */}
                <div>
                  <Label>İçerik *</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      content={formData.icerik || ''}
                      onChange={(content) => setFormData({ ...formData, icerik: content })}
                      placeholder="Yazınızı buraya yazın..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-y-auto mt-4">
              <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto">
                {/* Kapak Görseli */}
                {formData.kapakGorseli && (
                  <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                    <img
                      src={formData.kapakGorseli}
                      alt={formData.baslik}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Önizleme */}
                <article className="prose prose-lg max-w-none">
                  <header className="mb-8 pb-6 border-b">
                    <span className="text-sm text-blue-600 font-medium">
                      {formData.kategori || 'Kategori'}
                    </span>
                    <h1 className="text-4xl font-serif font-bold mt-2 mb-4">
                      {formData.baslik || 'Başlık'}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span>{formData.yazar?.tamAd || 'Yazar'}</span>
                      <span>•</span>
                      <span>
                        {formData.yayinTarihi
                          ? new Date(formData.yayinTarihi).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Tarih'}
                      </span>
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
              {editingYazi ? 'Güncelle' : 'Yayınla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
