// CMS Ara Yazı Editörü - Tam Sayfa
import { useState, useEffect, useRef, useMemo } from 'react';
import { useCMS } from '@/context/CMSContext';
import { api } from '@/lib/api';
import { useFootnotes } from '@/hooks/useFootnotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdvancedEditor } from '@/components/AdvancedEditor';
import { FileUploadField } from '@/components/cms/FileUploadField';
import { YazarSecici } from '@/components/cms/YazarSecici';
import { SatirIciEditor } from '@/components/cms/SatirIciEditor';
import { ZenginMetin } from '@/components/ZenginMetin';
import { duzMetin } from '@/lib/zenginMetin';
import { Switch } from '@/components/ui/switch';
import { KAPAK_ACIKLAMA, GORSEL_ORAN_SINIFI } from '@/lib/gorselStandardi';
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
import type { AraYazi, Yazar } from '@/types';

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
    tarihEtiketi: '',
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

  // Seçili yazarlar — ilk eleman birincil yazardır (çoklu yazar).
  const seciliYazarlar: Yazar[] =
    formData.yazarlar && formData.yazarlar.length > 0
      ? formData.yazarlar
      : (formData.yazar ? [formData.yazar] : []);

  const handleYazarChange = (yazarId: string) => {
    const yazar = yazarlar.find(y => y.id === yazarId);
    if (!yazar) return;
    const digerleri = seciliYazarlar.slice(1).filter((y) => y.id !== yazar.id);
    setFormData({ ...formData, yazar, yazarlar: [yazar, ...digerleri] });
  };

  const handleBaslikChange = (baslik: string) => {
    // baslik satır içi HTML olabilir; slug her zaman DÜZ metinden üretilir.
    setFormData({
      ...formData,
      baslik,
      slug: generateSlug(duzMetin(baslik)),
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
    if (!duzMetin(formData.baslik)) {
      alert('Lütfen başlık girin');
      return;
    }

    if (!seciliYazarlar[0]?.id) {
      alert('Lütfen yazar seçin');
      return;
    }

    if (!formData.icerik) {
      alert('Lütfen içerik girin');
      return;
    }

    setIsSaving(true);

    try {
      const slug = formData.slug || generateSlug(duzMetin(formData.baslik));

      const kategoriPayload = seciliKategoriler.length > 0 ? seciliKategoriler : ['Ara Yazı'];
      const ortakAlanlar = {
        baslik: formData.baslik,
        spot: formData.spot || '',
        icerik: formData.icerik,
        yazarId: seciliYazarlar[0].id,
        yazarIds: seciliYazarlar.map((y) => y.id),
        kategori: kategoriPayload[0],
        kategoriler: kategoriPayload,
        kapakGorseli: formData.kapakGorseli,
        kapakUstte: formData.kapakUstte !== false,
        yayinTarihi: formData.yayinTarihi || new Date().toISOString().split('T')[0],
        tarihEtiketi: formData.tarihEtiketi || '',
        slug,
      };
      if (yaziId) {
        await updateAraYazi(yaziId, ortakAlanlar);
      } else {
        // id sunucu tarafından atanır.
        await addAraYazi(ortakAlanlar);
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
                {/* Başlık — satır içi biçimlendirme (film adı italik vb.) */}
                <SatirIciEditor
                  value={formData.baslik || ''}
                  onChange={handleBaslikChange}
                  placeholder="Yazı başlığını girin..."
                  className="text-3xl font-serif font-bold"
                />

                {/* Spot — satır içi biçimlendirme */}
                <SatirIciEditor
                  value={formData.spot || ''}
                  onChange={(html) => setFormData({ ...formData, spot: html })}
                  placeholder="Yazının kısa özetini girin (spot)..."
                  className="text-lg text-gray-600"
                  cokSatir
                />

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
                  {/* Kapak Görseli — sitedeki bantla aynı oran ve görünürlük kuralı */}
                  {formData.kapakGorseli && formData.kapakUstte !== false && (
                    <div className={`${GORSEL_ORAN_SINIFI} overflow-hidden rounded-t-lg`}>
                      <img
                        src={formData.kapakGorseli}
                        alt={duzMetin(formData.baslik)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-8">
                    <header className="mb-8 pb-6 border-b">
                      <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4">
                        {formData.kategori || 'Kategori'}
                      </span>
                      <ZenginMetin
                        as="h1"
                        html={formData.baslik || 'Başlık'}
                        className="text-4xl font-serif font-bold text-gray-900 mb-4 block"
                      />
                      <div className="flex items-center gap-4 text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {seciliYazarlar.map((y) => y.tamAd).join(', ') || 'Yazar seçilmedi'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formData.tarihEtiketi?.trim()
                            ? formData.tarihEtiketi
                            : formData.yayinTarihi
                            ? new Date(formData.yayinTarihi).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Tarih seçilmedi'}
                        </span>
                      </div>
                      {formData.spot && (
                        <ZenginMetin
                          as="p"
                          html={formData.spot}
                          className="text-xl text-gray-600 italic leading-relaxed"
                        />
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

            {/* Yazar(lar) — çok yazarlı yazı için ek yazar eklenebilir */}
            <YazarSecici
              yazarlar={yazarlar}
              secili={seciliYazarlar}
              onBirincilChange={handleYazarChange}
              onEkle={(yzr) => setFormData({ ...formData, yazarlar: [...seciliYazarlar, yzr] })}
              onCikar={(id) =>
                setFormData({ ...formData, yazarlar: seciliYazarlar.filter((y) => y.id !== id) })
              }
            />

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

            {/* Tarih Etiketi (serbest metin — kartta tarih yerine bu görünür) */}
            <div>
              <Label htmlFor="tarihEtiketi" className="text-sm font-medium">
                Tarih Etiketi
              </Label>
              <Input
                id="tarihEtiketi"
                value={formData.tarihEtiketi || ''}
                onChange={(e) => setFormData({ ...formData, tarihEtiketi: e.target.value })}
                placeholder="örn. Şubat - Mart 2005"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Doldurursanız kartta/detayda tarih yerine bu metin görünür (aralık yazabilirsiniz).
                Boşsa yukarıdaki Yayın Tarihi biçimlenir. Sıralama her zaman Yayın Tarihi'ne göredir.
              </p>
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
            <div>
              <FileUploadField
                label="Kapak Görseli"
                value={formData.kapakGorseli || ''}
                onChange={(url) => setFormData({ ...formData, kapakGorseli: url })}
                accept="image/*"
                kind="image"
                previewType="image"
              />
              <p className="text-xs text-gray-500 mt-1">{KAPAK_ACIKLAMA}</p>

              <div className="mt-3 flex items-center justify-between rounded-lg border p-3">
                <div className="pr-3">
                  <Label className="text-sm">Yazının üstünde göster</Label>
                  <p className="text-xs text-gray-500">
                    Kapalıysa kapak görseli yazı sayfasının üst bandında çıkmaz;
                    kartlarda ve listelerde kullanılmaya devam eder.
                  </p>
                </div>
                <Switch
                  checked={formData.kapakUstte !== false}
                  onCheckedChange={(v) => setFormData({ ...formData, kapakUstte: v })}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
