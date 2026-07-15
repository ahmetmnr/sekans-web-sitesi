// CMS Sekans İndeks Yönetimi — indekste hangi kategoriler, hangi sırada gösterilsin.
// Kategori sırası ve görünürlüğü ayarlar tablosunda saklanır (indeks_kategoriler).
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { IndeksKategoriAyar } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ChevronUp, ChevronDown, Loader2, Info, ListOrdered } from 'lucide-react';

export function CMSIndeksYonetimi() {
  const [kategoriler, setKategoriler] = useState<IndeksKategoriAyar[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const reload = useCallback(async () => {
    try { setKategoriler(await api.indeksKategoriler.listCms()); } catch { /* yetki/hata */ }
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    reload().finally(() => setYukleniyor(false));
  }, [reload]);

  // Verilen listeyi sira'ları yeniden numaralandırıp kaydet.
  const kaydet = async (liste: IndeksKategoriAyar[]) => {
    const norm = liste.map((k, i) => ({ ...k, sira: i }));
    setKategoriler(norm);
    setKaydediliyor(true);
    try {
      await api.indeksKategoriler.update(norm.map(({ ad, goster, sira }) => ({ ad, goster, sira })));
    } catch (e) {
      alert('Kaydedilemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata'));
      await reload();
    } finally {
      setKaydediliyor(false);
    }
  };

  const toggle = (ad: string) => {
    kaydet(kategoriler.map((k) => (k.ad === ad ? { ...k, goster: !k.goster } : k)));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= kategoriler.length) return;
    const arr = [...kategoriler];
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    kaydet(arr);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sekans İndeks</h1>
          <p className="text-gray-600 mt-1">İndekste hangi kategorilerin, hangi sırada gösterileceğini yönetin.</p>
        </div>
        {kaydediliyor && <span className="text-sm text-gray-500 flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Kaydediliyor…</span>}
      </div>

      <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <p>Kategoriler içerikten otomatik keşfedilir. Ok tuşlarıyla sırayı değiştirin, anahtarla indekste gizleyin/gösterin.
          Okuyucular ayrıca yazıları En yeni / En eski / Alfabetik / Dergi sayısına göre sıralayabilir.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListOrdered className="h-5 w-5 text-gray-500" />Kategori Sırası ve Görünürlüğü</CardTitle>
          <CardDescription>Değişiklikler anında kaydedilir ve siteye yansır.</CardDescription>
        </CardHeader>
        <CardContent>
          {yukleniyor ? (
            <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" /></div>
          ) : kategoriler.length === 0 ? (
            <p className="py-12 text-center text-gray-500">Henüz indekslenecek içerik/kategori yok.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {kategoriler.map((k, idx) => (
                <div key={k.ad} className={`flex items-center gap-3 py-3 ${!k.goster ? 'opacity-50' : ''}`}>
                  <div className="flex flex-col shrink-0">
                    <button className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx <= 0} onClick={() => move(idx, -1)} title="Yukarı">
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-700 disabled:opacity-30" disabled={idx >= kategoriler.length - 1} onClick={() => move(idx, 1)} title="Aşağı">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-900">{k.ad}</span>
                    <span className="ml-2 text-xs text-gray-500">{k.adet ?? 0} yazı</span>
                  </div>
                  <div className="shrink-0" title={k.goster ? 'İndekste görünür' : 'Gizli'}>
                    <Switch checked={k.goster} onCheckedChange={() => toggle(k.ad)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
