// CMS Yazı Editörü - Tam Sayfa
import { useState, useEffect, useRef } from 'react';
import { useCMS } from '@/context/CMSContext';
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
  FolderOpen,
} from 'lucide-react';
import type { Yazi } from '@/types';

interface CMSYaziEditorProps {
  yaziId?: string;
  onBack: () => void;
  onSave: () => void;
}

export function CMSYaziEditor({ yaziId, onBack, onSave }: CMSYaziEditorProps) {
  const {
    sonSayi,
    yazarlar,
    kategoriler,
    addYazi,
    updateYazi,
  } = useCMS();

  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Yazi>>({
    baslik: '',
    spot: '',
    icerik: '',
    siraNo: sonSayi.yazilar.length + 1,
    sayiId: sonSayi.id,
    pdfUrl: '',
    kapakGorseli: '',
    yayinTarihi: new Date().toISOString().split('T')[0],
  });

  useFootnotes(previewRef, [formData.icerik, activeTab]);

  // Mevcut yazıyı yükle
  useEffect(() => {
    if (yaziId) {
      const existingYazi = sonSayi.yazilar.find(y => y.id === yaziId);
      if (existingYazi) {
        setFormData(existingYazi);
      }
    }
  }, [yaziId, sonSayi.yazilar]);

  const handleYazarChange = (yazarId: string) => {
    const yazar = yazarlar.find(y => y.id === yazarId);
    if (yazar) {
      setFormData({ ...formData, yazar });
    }
  };

  const handleKategoriChange = (kategoriId: string) => {
    const kategori = kategoriler.find(k => k.id === kategoriId);
    if (kategori) {
      setFormData({ ...formData, kategori });
    }
  };

  const handleSave = async () => {
    console.log('=== KAYDETME BAŞLADI ===');
    console.log('formData:', formData);
    console.log('formData.icerik uzunluğu:', formData.icerik?.length);

    if (!formData.baslik) {
      alert('Lütfen başlık girin');
      return;
    }

    if (!formData.yazar?.id || !formData.kategori?.id) {
      alert('Lütfen yazar ve kategori seçin');
      return;
    }

    setIsSaving(true);

    try {
      if (yaziId) {
        await updateYazi(yaziId, {
          baslik: formData.baslik || '',
          spot: formData.spot,
          icerik: formData.icerik,
          yazarId: formData.yazar?.id,
          kategoriId: formData.kategori?.id,
          siraNo: formData.siraNo,
          pdfUrl: formData.pdfUrl,
          kapakGorseli: formData.kapakGorseli,
          yayinTarihi: formData.yayinTarihi,
        });
      } else {
        // id sunucu tarafından atanır.
        await addYazi({
          baslik: formData.baslik || '',
          spot: formData.spot,
          icerik: formData.icerik,
          yazarId: formData.yazar?.id,
          kategoriId: formData.kategori?.id,
          sayiId: sonSayi.id,
          siraNo: formData.siraNo || sonSayi.yazilar.length + 1,
          pdfUrl: formData.pdfUrl,
          kapakGorseli: formData.kapakGorseli,
          yayinTarihi: formData.yayinTarihi,
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
              {yaziId ? 'Yazıyı Düzenle' : 'Yeni Yazı'}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
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
                    onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
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
                <article className="bg-white rounded-lg shadow-sm p-8">
                  <header className="mb-8 pb-6 border-b">
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
                        <FolderOpen className="h-4 w-4" />
                        {formData.kategori?.ad || 'Kategori seçilmedi'}
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

            {/* Kategori */}
            <div>
              <Label htmlFor="kategori" className="text-sm font-medium">
                Kategori *
              </Label>
              <Select
                value={formData.kategori?.id || ''}
                onValueChange={handleKategoriChange}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriler.map((kategori) => (
                    <SelectItem key={kategori.id} value={kategori.id}>
                      {kategori.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <hr />

            {/* Sıra Numarası */}
            <div>
              <Label htmlFor="siraNo" className="text-sm font-medium">
                Sıra Numarası
              </Label>
              <Input
                id="siraNo"
                type="number"
                min="1"
                value={formData.siraNo || ''}
                onChange={(e) =>
                  setFormData({ ...formData, siraNo: parseInt(e.target.value) })
                }
                className="mt-1.5"
              />
            </div>

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

            <hr />

            {/* PDF */}
            <FileUploadField
              label="PDF"
              value={formData.pdfUrl || ''}
              onChange={(url) => setFormData({ ...formData, pdfUrl: url })}
              accept="application/pdf"
              kind="pdf"
              previewType="none"
            />

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
