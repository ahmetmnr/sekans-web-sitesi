// CMS Yazı Editörü - Tam Sayfa
import { useState, useEffect, useRef } from 'react';
import { useCMS } from '@/context/CMSContext';
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
import { KAPAK_ACIKLAMA, DIZIN_ACIKLAMA } from '@/lib/gorselStandardi';
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
import type { Yazi, Sayi, Yazar } from '@/types';

interface CMSYaziEditorProps {
  yaziId?: string;
  preselectSayiId?: string; // "Yeni Yazı" açılırken önseçili sayı
  onBack: () => void;
  onSave: () => void;
}

export function CMSYaziEditor({ yaziId, preselectSayiId, onBack, onSave }: CMSYaziEditorProps) {
  const {
    sonSayi,
    sayilar,
    yazarlar,
    kategoriler,
    addYazi,
    updateYazi,
  } = useCMS();

  // Düzenlenebilir sayılar (taslak + yayında). Beklenmedik boşlukta yayındaki sayıya düş.
  const secilebilirSayilar: Sayi[] = sayilar.length ? sayilar : (sonSayi.id ? [sonSayi] : []);
  const yayindaki = secilebilirSayilar.find((s) => s.durum === 'yayinda') ?? secilebilirSayilar[0];
  const varsayilanSayiId = preselectSayiId || yayindaki?.id || '';
  const varsayilanSira =
    (secilebilirSayilar.find((s) => s.id === varsayilanSayiId)?.yazilar.length ?? 0) + 1;

  const [activeTab, setActiveTab] = useState('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Yazi>>({
    baslik: '',
    spot: '',
    icerik: '',
    siraNo: varsayilanSira,
    sayiId: varsayilanSayiId,
    pdfUrl: '',
    kapakGorseli: '',
    yayinTarihi: new Date().toISOString().split('T')[0],
  });

  useFootnotes(previewRef, [formData.icerik, activeTab]);

  // Mevcut yazıyı yükle (tüm düzenlenebilir sayılar arasında ara)
  useEffect(() => {
    if (!yaziId) return;
    const all = sayilar.length ? sayilar : (sonSayi.id ? [sonSayi] : []);
    for (const s of all) {
      const existingYazi = s.yazilar.find((y) => y.id === yaziId);
      if (existingYazi) {
        setFormData({ ...existingYazi, sayiId: existingYazi.sayiId || s.id });
        return;
      }
    }
  }, [yaziId, sayilar, sonSayi]);

  // Yeni yazıda sayılar sonradan yüklenirse varsayılan sayıyı ata (boş kalmasın).
  useEffect(() => {
    if (yaziId) return;
    setFormData((f) => {
      if (f.sayiId) return f;
      const list = sayilar.length ? sayilar : (sonSayi.id ? [sonSayi] : []);
      if (!list.length) return f;
      const def = preselectSayiId || list.find((s) => s.durum === 'yayinda')?.id || list[0].id;
      const sira = (list.find((s) => s.id === def)?.yazilar.length ?? 0) + 1;
      return { ...f, sayiId: def, siraNo: sira };
    });
  }, [sayilar, sonSayi, yaziId, preselectSayiId]);

  // Seçili yazarlar — ilk eleman birincil yazardır (çoklu yazar).
  const seciliYazarlar: Yazar[] =
    formData.yazarlar && formData.yazarlar.length > 0
      ? formData.yazarlar
      : (formData.yazar ? [formData.yazar] : []);

  const handleYazarChange = (yazarId: string) => {
    const yazar = yazarlar.find(y => y.id === yazarId);
    if (!yazar) return;
    // Birincil yazarı değiştir; varsa ek yazarlar korunur (yeni birincil ek
    // yazarlar arasındaysa oradan çıkarılır).
    const digerleri = seciliYazarlar.slice(1).filter((y) => y.id !== yazar.id);
    setFormData({ ...formData, yazar, yazarlar: [yazar, ...digerleri] });
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

    // Başlık artık satır içi HTML olabilir; boşluk kontrolü düz metne göre.
    if (!duzMetin(formData.baslik)) {
      alert('Lütfen başlık girin');
      return;
    }

    if (!seciliYazarlar[0]?.id || !formData.kategori?.id) {
      alert('Lütfen yazar ve kategori seçin');
      return;
    }

    if (!formData.sayiId) {
      alert('Lütfen bu yazının gireceği sayıyı seçin');
      return;
    }

    // Seçili sayıdaki yazı sayısına göre varsayılan sıra.
    const hedefSayi = secilebilirSayilar.find((s) => s.id === formData.sayiId);
    const varsayilanSonSira = (hedefSayi?.yazilar.length ?? 0) + 1;

    setIsSaving(true);

    const ortakAlanlar = {
      baslik: formData.baslik || '',
      spot: formData.spot,
      icerik: formData.icerik,
      yazarId: seciliYazarlar[0]?.id,
      yazarIds: seciliYazarlar.map((y) => y.id),
      kategoriId: formData.kategori?.id,
      sayiId: formData.sayiId, // yazı başka sayıya taşınabilir
      // Boş bırakılırsa sıra numarası verilmez -> yazı listenin sonuna eklenir
      siraNo: formData.siraNo || varsayilanSonSira,
      pdfUrl: formData.pdfUrl,
      kapakGorseli: formData.kapakGorseli,
      dizinGorseli: formData.dizinGorseli,
      kapakUstte: formData.kapakUstte !== false,
      kategoriGoster: formData.kategoriGoster !== false,
      yayinTarihi: formData.yayinTarihi,
    };

    try {
      if (yaziId) {
        await updateYazi(yaziId, ortakAlanlar);
      } else {
        // id sunucu tarafından atanır.
        await addYazi(ortakAlanlar);
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
                {/* Başlık — satır içi biçimlendirme (film adı italik vb.) */}
                <SatirIciEditor
                  value={formData.baslik || ''}
                  onChange={(html) => setFormData({ ...formData, baslik: html })}
                  placeholder="Yazı başlığını girin..."
                  // className: sitenin gerçek başlık fontu (.yazi-baslik) —
                  // editörde görülen font yayında da aynıdır.
                  className="text-3xl yazi-baslik"
                  kalinKapali
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
                <article className="bg-white rounded-lg shadow-sm p-8">
                  <header className="mb-8 pb-6 border-b">
                    <ZenginMetin
                      as="h1"
                      html={formData.baslik || 'Başlık'}
                      className="text-4xl font-serif font-bold text-gray-900 mb-4 block"
                    />
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
                      <ZenginMetin
                        as="p"
                        html={formData.spot}
                        // Spot DÜZ fonttadır. Önizleme eskiden `italic`
                        // uyguluyordu; editör düz yazdığı spotu italik görüp
                        // yanılıyordu. İtalik artık yalnızca metnin kendisinde
                        // <em> varsa görünür.
                        className="text-xl text-gray-600 leading-relaxed"
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

              {/* [1] Kategori adı içindekilerde görünsün mü.
                  Aynı kategoriden ardışık yazılarda "DOSYA: … / DOSYA: …"
                  tekrarını önlemek için: grubun İLK yazısında açık bırakın,
                  sonrakilerde kapatın. */}
              <div className="mt-3 flex items-center justify-between rounded-lg border p-3">
                <div className="pr-3">
                  <Label className="text-sm">Kategoriyi içindekilerde göster</Label>
                  <p className="text-xs text-gray-500">
                    Kapalıysa bu yazının üstünde kategori adı yazmaz. Aynı
                    kategoriden art arda gelen yazılarda kapatın; kategori adı
                    grubun ilk yazısında bir kez görünsün. Yazı başlığı ve yazar
                    adının girintisi DEĞİŞMEZ, hizalar bozulmaz. Yazının
                    kategorisi, filtreler, arama ve Sekans İndeks etkilenmez.
                  </p>
                </div>
                <Switch
                  checked={formData.kategoriGoster !== false}
                  onCheckedChange={(v) => setFormData({ ...formData, kategoriGoster: v })}
                />
              </div>
            </div>

            <hr />

            {/* Sayı — bu yazının hangi sayıya gireceği */}
            <div>
              <Label htmlFor="sayi" className="text-sm font-medium">
                Sayı *
              </Label>
              <Select
                value={formData.sayiId || ''}
                onValueChange={(sayiId) => setFormData({ ...formData, sayiId })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sayı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {secilebilirSayilar.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {(s.tamBaslik || `${s.ay} ${s.yil} — ${s.numara}`) +
                        (s.durum === 'yayinda' ? '  (yayında)' : '  (taslak)')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Yazının gireceği sayıyı buradan seçebilir, sonradan taşıyabilirsiniz.
              </p>
            </div>

            {/* Sıra Numarası */}
            <div>
              <Label htmlFor="siraNo" className="text-sm font-medium">
                Sıra Numarası
              </Label>
              <Input
                id="siraNo"
                type="number"
                min="1"
                value={formData.siraNo ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setFormData({
                    ...formData,
                    siraNo: v === '' ? undefined : parseInt(v),
                  });
                }}
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Boş bırakılırsa yazı listenin sonuna eklenir.
              </p>
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

            {/* Kapak Görseli — yazı detay sayfasının üstündeki geniş görsel */}
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

              {/* Kapak bandını gizleme seçeneği (varsayılan açık) */}
              <div className="mt-3 flex items-center justify-between rounded-lg border p-3">
                <div className="pr-3">
                  <Label className="text-sm">Yazının üstünde göster</Label>
                  <p className="text-xs text-gray-500">
                    Kapalıysa kapak görseli yazı sayfasının üst bandında çıkmaz;
                    listelerde ve dizin görseli olarak kullanılmaya devam eder.
                  </p>
                </div>
                <Switch
                  checked={formData.kapakUstte !== false}
                  onCheckedChange={(v) => setFormData({ ...formData, kapakUstte: v })}
                />
              </div>
            </div>

            {/* Dizin Görseli — içindekiler listesindeki küçük görsel */}
            <div>
              <FileUploadField
                label="Dizin Görseli"
                value={formData.dizinGorseli || ''}
                onChange={(url) => setFormData({ ...formData, dizinGorseli: url })}
                accept="image/*"
                kind="image"
                previewType="image"
              />
              <p className="text-xs text-gray-500 mt-1">{DIZIN_ACIKLAMA}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
