// CMS Ara Yazı Editörü - Tam Sayfa
import { useState, useEffect, useRef, useMemo } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import { useFootnotes } from '@/hooks/useFootnotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdvancedEditor } from '@/components/AdvancedEditor';
import { FileUploadField } from '@/components/cms/FileUploadField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Eye,
  Pencil,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import type { AraYazi } from '@/types';

// Blog için sık kullanılan kategoriler (gerçek kategorilerle birleştirilir).
const SABIT_BLOG_KATEGORILERI = [
  'Ara Yazı', 'Sinema Kitaplığı', 'Texts in English', 'Duyurular',
  'Eleştiri', 'Çözümleme', 'Deneme', 'Söyleşi', 'Haber', 'İnceleme',
];

interface CMSAraYaziEditorProps {
  yaziId?: string;
  onBack: () => void;
  onSave: () => void;
  initialTab?: 'edit' | 'preview';
}

export function CMSAraYaziEditor({ yaziId, onBack, onSave, initialTab = 'edit' }: CMSAraYaziEditorProps) {
  const {
    araYazilar,
    yazarlar,
    kategoriler,
    addAraYazi,
    updateAraYazi,
  } = useCMS();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<AraYazi>>({
    baslik: '',
    spot: '',
    icerik: '',
    kategori: 'Deneme',
    yayinTarihi: new Date().toISOString().split('T')[0],
    slug: '',
    kapakGorseli: '',
  });

  useFootnotes(previewRef, [formData.icerik, activeTab]);

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

  // Mevcut yazıyı yükle. ÖNEMLİ: /bootstrap ara yazıları GÖVDESİZ döndürür
  // (liste hafif kalsın diye), o yüzden düzenlerken TAM içeriği (icerik dahil)
  // sunucudan ayrı çekiyoruz — aksi halde içerik DB'de olsa bile editör boş görünür.
  useEffect(() => {
    if (!yaziId) return;
    let cancelled = false;
    // Listedeki özetle başlığı/spotu hemen doldur, sonra tam içeriği çek.
    const summary = araYazilar.find(y => y.id === yaziId);
    if (summary) setFormData(summary);
    api.araYazi.get(yaziId)
      .then((full) => { if (!cancelled) setFormData(full); })
      .catch(() => { /* çekilemezse listedeki özet kalır */ });
    return () => { cancelled = true; };
    // araYazilar'ı bağımlılığa koymuyoruz ki liste yenilenince içeriği ezmesin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yaziId]);

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

  // Çoklu kategori: seçili kategoriler (yoksa birincil kategoriye düşer).
  const seciliKategoriler = useMemo(
    () => formData.kategoriler ?? (formData.kategori ? [formData.kategori] : []),
    [formData.kategoriler, formData.kategori],
  );
  // Seçenek listesi: gerçek kategoriler + sık blog kategorileri + hâlihazırda seçili olanlar.
  const kategoriSecenekleri = useMemo(() => {
    const set = new Set<string>();
    kategoriler.forEach((k) => set.add(k.ad));
    SABIT_BLOG_KATEGORILERI.forEach((k) => set.add(k));
    seciliKategoriler.forEach((k) => set.add(k));
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [kategoriler, seciliKategoriler]);

  const toggleKategori = (ad: string) => {
    const set = new Set(seciliKategoriler);
    if (set.has(ad)) set.delete(ad); else set.add(ad);
    const arr = [...set];
    // Birincil kategori (kart etiketi) = ilk seçilen.
    setFormData({ ...formData, kategoriler: arr, kategori: arr[0] ?? '' });
  };

  const handleSave = async () => {
    if (!formData.baslik) {
      alert('Lütfen başlık girin');
      return;
    }

    if (!formData.yazar?.id) {
      alert('Lütfen yazar seçin');
      return;
    }

    if (!formData.icerik) {
      alert('Lütfen içerik girin');
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.slug || generateSlug(formData.baslik);

      const kategoriPayload = seciliKategoriler.length > 0 ? seciliKategoriler : ['Ara Yazı'];
      if (yaziId) {
        await updateAraYazi(yaziId, {
          baslik: formData.baslik,
          spot: formData.spot || '',
          icerik: formData.icerik,
          yazarId: formData.yazar!.id,
          kategori: kategoriPayload[0],
          kategoriler: kategoriPayload,
          kapakGorseli: formData.kapakGorseli,
          yayinTarihi: formData.yayinTarihi || new Date().toISOString().split('T')[0],
          slug,
        });
      } else {
        // id sunucu tarafından atanır.
        await addAraYazi({
          baslik: formData.baslik,
          spot: formData.spot || '',
          icerik: formData.icerik,
          yazarId: formData.yazar!.id,
          kategori: kategoriPayload[0],
          kategoriler: kategoriPayload,
          kapakGorseli: formData.kapakGorseli,
          yayinTarihi: formData.yayinTarihi || new Date().toISOString().split('T')[0],
          slug,
        });
      }

      setLastSaved(new Date());
      setIsSaving(false);
      onSave();
    } catch (error) {
      setIsSaving(false);
      alert((error as Error).message || 'Kaydetme sırasında hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">
              {yaziId ? 'Ara Yazıyı Düzenle' : 'Yeni Ara Yazı'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Son kayıt: {lastSaved.toLocaleTimeString('tr-TR')}
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-57px)]">
        {/* Sol Panel - Editör */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="flex-1 flex flex-col min-h-0">
            <div className="bg-white border-b px-6 py-2">
              <TabsList>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Önizleme
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 min-h-0 overflow-y-auto p-6 mt-0">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Başlık */}
                <div>
                  <Input
                    value={formData.baslik || ''}
                    onChange={(e) => handleBaslikChange(e.target.value)}
                    placeholder="Yazı başlığını girin..."
                    className="text-3xl font-serif font-bold border-0 border-b rounded-none px-0 py-4 focus-visible:ring-0 focus-visible:border-gray-400"
                  />
                </div>

                {/* Spot */}
                <div>
                  <Textarea
                    value={formData.spot || ''}
                    onChange={(e) => setFormData({ ...formData, spot: e.target.value })}
                    placeholder="Yazının kısa özetini girin (spot)..."
                    className="text-lg text-gray-600 border-0 border-b rounded-none px-0 py-2 resize-none focus-visible:ring-0 focus-visible:border-gray-400"
                    rows={2}
                  />
                </div>

                {/* Gelişmiş Dergi Editörü */}
                <AdvancedEditor
                  content={formData.icerik || ''}
                  onChange={(content) => setFormData({ ...formData, icerik: content })}
                  placeholder="Yazınızı buraya yazın..."
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto p-6 mt-0">
              <div className="max-w-4xl mx-auto pb-16">
                <article className="bg-white rounded-lg shadow-sm">
                  {/* Kapak Görseli */}
                  {formData.kapakGorseli && (
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={formData.kapakGorseli}
                        alt={formData.baslik}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-8">
                    <header className="mb-8 pb-6 border-b">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4">
                        {formData.kategori || 'Kategori'}
                      </span>
                      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
                        {formData.baslik || 'Başlık'}
                      </h1>
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {formData.yazar?.tamAd || 'Yazar seçilmedi'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formData.yayinTarihi
                            ? new Date(formData.yayinTarihi).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Tarih seçilmedi'}
                        </span>
                      </div>
                      {formData.spot && (
                        <p className="text-xl text-gray-600 italic leading-relaxed">
                          {formData.spot}
                        </p>
                      )}
                    </header>
                    <div
                      ref={previewRef}
                      className="prose prose-lg max-w-none cms-content-preview"
                      dangerouslySetInnerHTML={{
                        __html: formData.icerik || '<p class="text-gray-400">İçerik henüz eklenmedi...</p>'
                      }}
                    />
                    {/* Float temizleme için */}
                    <div className="clear-both" />
                  </div>
                </article>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sağ Panel - Ayarlar */}
        <aside className="w-80 bg-white border-l overflow-y-auto">
          <div className="p-6 space-y-6">
            <h2 className="font-semibold text-gray-900">Yazı Ayarları</h2>

            {/* Yazar */}
            <div>
              <Label htmlFor="yazar" className="text-sm font-medium">
                Yazar *
              </Label>
              <Select
                value={formData.yazar?.id || ''}
                onValueChange={handleYazarChange}
              >
                <SelectTrigger className="mt-1.5">
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

            {/* Kategoriler (çoklu seçim) */}
            <div>
              <Label className="text-sm font-medium">
                Kategoriler *
              </Label>
              <p className="text-xs text-gray-500 mt-0.5 mb-2">
                Bir veya birden fazla kategori seçebilirsiniz. İlk seçilen, kart etiketi olarak görünür.
              </p>
              <div className="flex flex-wrap gap-2">
                {kategoriSecenekleri.map((ad) => {
                  const secili = seciliKategoriler.includes(ad);
                  return (
                    <button
                      key={ad}
                      type="button"
                      onClick={() => toggleKategori(ad)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                        secili
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {ad}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr />

            {/* Yayın Tarihi */}
            <div>
              <Label htmlFor="yayinTarihi" className="text-sm font-medium">
                Yayın Tarihi
              </Label>
              <Input
                id="yayinTarihi"
                type="date"
                value={formData.yayinTarihi || ''}
                onChange={(e) => setFormData({ ...formData, yayinTarihi: e.target.value })}
                className="mt-1.5"
              />
            </div>

            {/* URL Slug */}
            <div>
              <Label htmlFor="slug" className="text-sm font-medium">
                URL Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="yazi-basligi"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Otomatik oluşturulur
              </p>
            </div>

            <hr />

            {/* Kapak Görseli */}
            <FileUploadField
              label="Kapak Görseli"
              value={formData.kapakGorseli || ''}
              onChange={(url) => setFormData({ ...formData, kapakGorseli: url })}
              accept="image/*"
              kind="image"
              previewType="image"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
