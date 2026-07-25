// CMS Sayfa Metinleri — yerleşik (kod içinde tanımlı) sayfaların başlık ve
// açıklama metinleri. Bu sayfalar "Sabit Sayfalar" gibi içerik sayfası değildir;
// listeleri kendileri üretir, yalnızca üstteki başlık/açıklama düzenlenebilir.
import { useEffect, useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Type } from 'lucide-react';
import type { SayfaMetinleri } from '@/types';

// Düzenlenebilir yerleşik sayfalar (anahtar -> ekranda görünen bilgi).
const SAYFALAR: { anahtar: keyof SayfaMetinleri; ad: string; yer: string }[] = [
  { anahtar: 'yazarlar', ad: 'Yazarlar', yer: 'Site > Yazarlar sayfasının üst başlığı ve açıklaması' },
  { anahtar: 'blog', ad: 'Blog', yer: 'Site > Blog (Ara Yazılar) sayfasının üst başlığı ve açıklaması' },
];

export function CMSSayfaMetinleri() {
  const { sayfaMetinleri, updateSayfaMetinleri } = useCMS();

  const [form, setForm] = useState<SayfaMetinleri>(sayfaMetinleri);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  // Bootstrap geldiğinde/yenilendiğinde formu tazele.
  useEffect(() => { setForm(sayfaMetinleri); }, [sayfaMetinleri]);

  const alanDegistir = (anahtar: keyof SayfaMetinleri, alan: 'baslik' | 'aciklama', deger: string) => {
    setForm((prev) => ({ ...prev, [anahtar]: { ...prev[anahtar], [alan]: deger } }));
    setKaydedildi(false);
  };

  const handleKaydet = async () => {
    setKaydediliyor(true);
    try {
      await updateSayfaMetinleri(form);
      setKaydedildi(true);
    } catch (e) {
      alert('Kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sayfa Metinleri</h1>
          <p className="text-gray-600 mt-1">
            Yerleşik sayfaların üst başlık ve açıklama metinlerini buradan düzenleyin
          </p>
        </div>
        <Button onClick={handleKaydet} disabled={kaydediliyor}>
          <Save className="h-4 w-4 mr-2" />
          {kaydediliyor ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>

      {kaydedildi && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Metinler kaydedildi. Site tarafında hemen görünür.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SAYFALAR.map(({ anahtar, ad, yer }) => (
          <Card key={anahtar}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-4 w-4 text-gray-400" />
                {ad}
              </CardTitle>
              <CardDescription>{yer}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`baslik-${anahtar}`}>Başlık</Label>
                <Input
                  id={`baslik-${anahtar}`}
                  value={form[anahtar]?.baslik ?? ''}
                  onChange={(e) => alanDegistir(anahtar, 'baslik', e.target.value)}
                  placeholder={ad}
                />
              </div>
              <div>
                <Label htmlFor={`aciklama-${anahtar}`}>Açıklama</Label>
                <Textarea
                  id={`aciklama-${anahtar}`}
                  value={form[anahtar]?.aciklama ?? ''}
                  onChange={(e) => alanDegistir(anahtar, 'aciklama', e.target.value)}
                  placeholder="Başlığın altında görünen kısa açıklama"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız açıklama satırı gösterilmez.</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4 text-sm text-gray-600">
          Diğer liste sayfalarının (Basılı Sayılar, Duyurular, Sinema Kitaplığı, Texts in English…)
          başlık ve açıklamaları <strong>Filtre Sayfaları</strong> ekranından; içerik sayfalarınınki
          <strong> Sabit Sayfalar</strong> ekranından düzenlenir.
        </CardContent>
      </Card>
    </div>
  );
}
