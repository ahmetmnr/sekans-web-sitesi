// CMS Dergi Görünümü — içindekiler menüsünün punto/renk/kalınlık/düzen ayarları.
//
// Neden ayrı bir sayfa: bu ayarların her biri eskiden kod değişikliği + derleme
// + dağıtım gerektiriyordu. "Kategori puntosu bir kademe büyüsün" için o döngüyü
// çevirmek anlamsızdı. Ayarlar artık buradan yapılır, sonuç anında görünür.
//
// Kademeler HAZIRDIR, serbest değer girilmez (bkz. lib/icindekilerGorunum):
// her kademe masaüstü ve mobilde denenmiştir, bozuk sonuç üretilemez.
import { useEffect, useMemo, useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, RotateCcw, Save, Eye } from 'lucide-react';
import {
  AYAR_BOLUMLERI,
  VARSAYILAN_GORUNUM,
  gorunumDegiskenleri,
  type IcindekilerGorunum,
} from '@/lib/icindekilerGorunum';

export function CMSDergiGorunumu() {
  const { icindekilerGorunum, updateIcindekilerGorunum } = useCMS();

  // Taslak: kaydedilmeden önce önizlemede denenen ayarlar.
  const [taslak, setTaslak] = useState<IcindekilerGorunum>(icindekilerGorunum);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);

  // Sunucudan yeni ayar gelirse (ilk yükleme) taslağı tazele.
  useEffect(() => { setTaslak(icindekilerGorunum); }, [icindekilerGorunum]);

  const degisti = useMemo(
    () => JSON.stringify(taslak) !== JSON.stringify(icindekilerGorunum),
    [taslak, icindekilerGorunum]
  );

  // Önizleme kutusuna uygulanacak CSS değişkenleri — site ile AYNI işlevden
  // geldiği için önizlemede görülen, yayında çıkanla birebir aynıdır.
  const onizlemeStili = useMemo(
    () => gorunumDegiskenleri(taslak) as React.CSSProperties,
    [taslak]
  );

  const kaydet = async () => {
    setKaydediliyor(true);
    setMesaj(null);
    try {
      await updateIcindekilerGorunum(taslak);
      setMesaj('Kaydedildi. Sitede hemen geçerli.');
    } catch (e) {
      setMesaj(e instanceof Error ? e.message : 'Kaydedilemedi.');
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dergi Görünümü</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Ana sayfa ve sayı sayfasındaki <b>İçindekiler</b> menüsünün punto,
            renk, kalınlık ve düzen ayarları. Değişiklikler sağdaki önizlemede
            anında görünür; “Kaydet” demeden siteye yansımaz.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setTaslak(VARSAYILAN_GORUNUM)}
            disabled={kaydediliyor}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Varsayılana dön
          </Button>
          <Button onClick={kaydet} disabled={!degisti || kaydediliyor}>
            {kaydediliyor
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Save className="h-4 w-4 mr-2" />}
            Kaydet
          </Button>
        </div>
      </div>

      {mesaj && (
        <div className="rounded-lg border bg-blue-50 border-blue-200 text-blue-900 px-4 py-3 text-sm">
          {mesaj}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] gap-6 items-start">
        {/* --- Sol: ayarlar --- */}
        <div className="space-y-4">
          {AYAR_BOLUMLERI.map((bolum) => (
            <Card key={bolum.bolum}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{bolum.bolum}</CardTitle>
                <CardDescription>{bolum.aciklama}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bolum.alanlar.map((alan) => (
                  <div key={alan.alan}>
                    <Label className="text-sm">{alan.etiket}</Label>
                    <Select
                      value={taslak[alan.alan]}
                      onValueChange={(v) =>
                        setTaslak((t) => ({ ...t, [alan.alan]: v }))
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(alan.tablo).map(([kademe, { ad }]) => (
                          <SelectItem key={kademe} value={kademe}>{ad}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* --- Sağ: canlı önizleme (masaüstünde yapışkan) --- */}
        <div className="xl:sticky xl:top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" /> Önizleme
              </CardTitle>
              <CardDescription>
                Sayı sayfasındaki içindekiler görünümü (spot dahil). Ana sayfada
                spot çıkmaz, başlık bir tık küçüktür.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Önizleme, sitenin .ic-* sınıflarını ve aynı CSS değişkenlerini
                  kullanır; ayrı bir taklit düzen DEĞİLDİR. */}
              <div style={onizlemeStili} className="bg-white border rounded-lg p-5 space-y-6">
                {ORNEK_SATIRLAR.map((o, i) => (
                  <div key={i} className="ic-satir pb-5 border-b last:border-0 last:pb-0">
                    {o.kategori && (
                      <span className="ic-kategori col-span-2 block mb-1">{o.kategori}</span>
                    )}
                    <div className="min-w-0">
                      <h3 className="ic-girinti-1">
                        <span
                          className="block yazi-baslik ic-baslik-buyuk leading-snug"
                          dangerouslySetInnerHTML={{ __html: o.baslik }}
                        />
                      </h3>
                      <p className="mt-1 ic-yazar ic-girinti-2">{o.yazar}</p>
                      {o.spot && (
                        <p className="mt-2 ic-spot leading-relaxed text-justify ic-girinti-1">
                          {o.spot}
                        </p>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 aspect-[2/1] self-start flex items-center justify-center text-[10px] text-gray-500">
                      dizin görseli
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Önizleme içeriği — gerçek e29 başlıklarından. Biri italik film adı içerir
 * (kalınlık ayarının italik kısımda da doğru çalıştığı görülsün), biri
 * kategorisi gizli bir satırdır (girintilerin kaymadığı görülsün).
 */
const ORNEK_SATIRLAR: { kategori?: string; baslik: string; yazar: string; spot?: string }[] = [
  {
    kategori: 'DOSYA: SİNEMANIN POLİTİKASI - POLİTİKANIN SİNEMASI',
    baslik: '<em>WR: Mysteries of the Organism</em>: Libidinal Montaj',
    yazar: 'Hasan Cem Çal',
    spot: 'Makavejev’in filminin siyasiliğini biçiminde arıyoruz, fakat mümkün en radikal anlamıyla: Filmin biçiminin içeriğinden ayırt edilememesiyle ortaya çıkan bir siyasilik.',
  },
  {
    // Kategori kapalı: aynı gruptaki ikinci yazı ([1] anahtarı).
    baslik: 'Fırat’ın Doğusu: Cenazeler, Düğünler ve (Olmayan) Bir Sınır',
    yazar: 'Tayfun Luxembourgeus',
    spot: 'Kazım Öz’ün sinematik evreni, temelde hem anlatıya hem görselliğe yaslanan bir sınır anlatısı kurar.',
  },
  {
    kategori: 'SÖYLEŞİ',
    baslik: 'Sessizliğin Estetiği: Angelopoulos Sinemasında Politik Biçim ve <em>’36 Günleri</em>',
    yazar: 'Akın Tunç',
    spot: 'Sinema slogan atarak, propaganda yaparak bir ideolojiyi kitlelere taşımaz; biçimin kendisi politik bir tutumdur.',
  },
];

export default CMSDergiGorunumu;
