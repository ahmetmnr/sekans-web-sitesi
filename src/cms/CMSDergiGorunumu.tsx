// CMS Dergi Görünümü — içindekiler menüsünün punto/renk/kalınlık/düzen ayarları.
//
// Neden ayrı bir sayfa: bu ayarların her biri eskiden kod değişikliği + derleme
// + dağıtım gerektiriyordu. "Kategori puntosu bir kademe büyüsün" için o döngüyü
// çevirmek anlamsızdı. Ayarlar artık buradan yapılır, sonuç anında görünür.
//
// Kademeler HAZIRDIR, serbest değer girilmez (bkz. lib/icindekilerGorunum):
// her kademe masaüstü ve mobilde denenmiştir, bozuk sonuç üretilemez.
//
// ÖNİZLEME GERÇEKTİR, TAKLİT DEĞİLDİR:
//   • Sitenin KENDİ bölümleri render edilir: ana sayfa için <SonSayiSection>,
//     sayı sayfası için <SonSayiDetay>. Panelde ayrı bir kopya markup yoktur,
//     dolayısıyla ikisi zamanla birbirinden ayrışamaz. Kapak, künye paneli,
//     ayırıcı çizgiler, spot — hepsi yayındaki hâliyle görünür.
//   • Önizleme bir <iframe> içindedir; çerçeveye gerçek görüntü alanı genişliği
//     verilir (1280 / 390). Medya sorguları böylece gerçek cihazdaki gibi
//     çalışır. Panelin içine dar bir kutu koyup "mobil" demek YANLIŞ sonuç
//     verirdi: panel masaüstü genişliğinde açıldığı için masaüstü kuralları
//     devreye girer, dizin görseli 1,5 kat büyük çıkar ve başlıklar gerçekte
//     olmayacağı kadar çok satıra bölünürdü.
import { useEffect, useMemo, useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, RotateCcw, Save, Monitor, Smartphone } from 'lucide-react';
import SonSayiSection from '@/sections/SonSayiSection';
import SonSayiDetay from '@/pages/SonSayiDetay';
import { OnizlemeCercevesi } from './OnizlemeCercevesi';
import type { Sayi, Yazi } from '@/types';
import {
  AYAR_BOLUMLERI,
  VARSAYILAN_GORUNUM,
  gorunumDegiskenleri,
  type IcindekilerGorunum,
} from '@/lib/icindekilerGorunum';

/* --------------------------------------------------------------------------
   ÖNİZLEME GÖRÜNTÜ ALANLARI

   Bunlar sütun genişliği değil, TARAYICI GÖRÜNTÜ ALANI genişliğidir: önizleme
   bir <iframe> içinde açılır ve çerçeveye bu genişlik verilir. Böylece medya
   sorguları (`md:` kuralları) gerçek cihazdaki gibi çalışır; sütun genişliği,
   girintiler ve dizin görseli ölçüsü sitenin kendi hesabından çıkar.

   1280 : yaygın masaüstü genişliği (Tailwind container'ın xl kademesi)
    390 : yaygın telefon genişliği
   -------------------------------------------------------------------------- */
const GORUNUM_GENISLIGI = { masaustu: 1280, mobil: 390 } as const;

type Cihaz = 'masaustu' | 'mobil';
type Sayfa = 'anasayfa' | 'sayi';

export function CMSDergiGorunumu() {
  const { icindekilerGorunum, updateIcindekilerGorunum } = useCMS();

  // Taslak: kaydedilmeden önce önizlemede denenen ayarlar.
  const [taslak, setTaslak] = useState<IcindekilerGorunum>(icindekilerGorunum);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [sayfa, setSayfa] = useState<Sayfa>('anasayfa');

  useEffect(() => { setTaslak(icindekilerGorunum); }, [icindekilerGorunum]);

  const degisti = useMemo(
    () => JSON.stringify(taslak) !== JSON.stringify(icindekilerGorunum),
    [taslak, icindekilerGorunum]
  );

  // Önizlemeye uygulanacak CSS değişkenleri — site ile AYNI işlevden gelir.
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
          <Button variant="outline" onClick={() => setTaslak(VARSAYILAN_GORUNUM)} disabled={kaydediliyor}>
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

      {/* Ayarlar dar sütunda; kalan genişliğin tamamı önizlemeye ayrılır. */}
      <div className="grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">
        {/* --- Sol: ayarlar --- */}
        <div className="space-y-4">
          {AYAR_BOLUMLERI.map((bolum) => (
            <Card key={bolum.bolum}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{bolum.bolum}</CardTitle>
                <CardDescription>{bolum.aciklama}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bolum.alanlar.map((alan) => (
                  <div key={alan.alan}>
                    <Label className="text-sm">{alan.etiket}</Label>
                    <Select
                      value={taslak[alan.alan]}
                      onValueChange={(v) => setTaslak((t) => ({ ...t, [alan.alan]: v }))}
                    >
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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

        {/* --- Sağ: gerçek ölçekli önizlemeler --- */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-base">Önizleme</CardTitle>
                  <CardDescription>
                    Sitedeki gerçek genişlikte hesaplanır, panele sığması için
                    küçültülür. Satır sonları ve girintiler yayındakiyle aynıdır.
                  </CardDescription>
                </div>
                {/* Ana sayfa / sayı sayfası: düzenleri FARKLIDIR. */}
                <div className="flex rounded-lg border overflow-hidden flex-shrink-0">
                  {([
                    ['anasayfa', 'Ana sayfa'],
                    ['sayi', 'Sayı sayfası'],
                  ] as const).map(([deger, ad]) => (
                    <button
                      key={deger}
                      onClick={() => setSayfa(deger)}
                      className={`px-3 py-1.5 text-sm transition-colors ${
                        sayfa === deger ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {ad}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { cihaz: 'masaustu' as Cihaz, ad: 'Masaüstü', ikon: <Monitor className="h-4 w-4" /> },
                { cihaz: 'mobil' as Cihaz, ad: 'Mobil', ikon: <Smartphone className="h-4 w-4" /> },
              ].map(({ cihaz, ad, ikon }) => (
                <div key={cihaz}>
                  <div className="flex items-center gap-2 mb-2 text-sm">
                    {ikon}
                    <span className="font-medium text-gray-800">{ad}</span>
                    <span className="text-xs text-gray-500">
                      {GORUNUM_GENISLIGI[cihaz]} px görüntü alanı
                    </span>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <OnizlemeCercevesi
                      gorunumGenisligi={GORUNUM_GENISLIGI[cihaz]}
                      degiskenler={onizlemeStili}
                    >
                      {sayfa === 'anasayfa' ? (
                        <SonSayiSection sayi={ORNEK_SAYI} onYaziClick={() => {}} onSayiClick={() => {}} />
                      ) : (
                        <SonSayiDetay sayi={ORNEK_SAYI} onYaziClick={() => {}} onBackClick={() => {}} />
                      )}
                    </OnizlemeCercevesi>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   ÖRNEK SAYI — gerçek e29 yazılarından kurulmuş bir Sayi nesnesi.

   Site bölümleri gerçek veriyle çalıştığı için önizlemeye de gerçekçi bir sayı
   verilir. Seçilen üç yazı bilinçlidir:
     • biri italik film adı içerir  → kalınlık ayarının italik kısımda da doğru
       çalıştığı görülsün (font italik kademeleriyle birlikte yüklenir),
     • biri KATEGORİSİ GİZLİ satırdır → kategori kapalıyken girintilerin
       kaymadığı görülsün,
     • biri uzun başlıklıdır → kaç satıra bölündüğü gerçek genişlikte görülsün.
   -------------------------------------------------------------------------- */
const yazarYap = (tamAd: string) => {
  const p = tamAd.split(' ');
  return { id: tamAd, tamAd, ad: p.slice(0, -1).join(' '), soyad: p[p.length - 1] };
};
const kategoriYap = (ad: string) => ({ id: ad, ad, slug: ad.toLowerCase() });
const DIZIN_GORSELI = '/images/altyazilar/A_Single_Spark_302x415.jpg';

const ORNEK_YAZILAR: Yazi[] = [
  {
    id: 'onizleme-1',
    baslik: '<em>WR: Mysteries of the Organism</em>: Libidinal Montaj',
    spot: 'Makavejev’in filminin siyasiliğini biçiminde arıyoruz, fakat mümkün en radikal anlamıyla: Filmin biçiminin içeriğinden ayırt edilememesiyle ortaya çıkan bir siyasilik.',
    yazar: yazarYap('Hasan Cem Çal'),
    kategori: kategoriYap('Dosya: Sinemanın Politikası - Politikanın Sineması'),
    sayiId: 'onizleme', siraNo: 1, dizinGorseli: DIZIN_GORSELI,
  },
  {
    id: 'onizleme-2',
    baslik: 'Fırat’ın Doğusu: Cenazeler, Düğünler ve (Olmayan) Bir Sınır',
    spot: 'Kazım Öz’ün sinematik evreni, temelde hem anlatıya hem görselliğe yaslanan bir sınır anlatısı kurar; bu anlatı coğrafyayı da belleği de birlikte taşır.',
    yazar: yazarYap('Tayfun Luxembourgeus'),
    kategori: kategoriYap('Dosya: Sinemanın Politikası - Politikanın Sineması'),
    kategoriGoster: false,   // aynı gruptaki ikinci yazı ([1] anahtarı)
    sayiId: 'onizleme', siraNo: 2, dizinGorseli: DIZIN_GORSELI,
  },
  {
    id: 'onizleme-3',
    baslik: 'Sessizliğin Estetiği: Angelopoulos Sinemasında Politik Biçim ve <em>’36 Günleri</em>',
    spot: 'Sinema slogan atarak, propaganda yaparak bir ideolojiyi kitlelere taşımaz; biçimin kendisi politik bir tutumdur.',
    yazar: yazarYap('Akın Tunç'),
    kategori: kategoriYap('Söyleşi'),
    sayiId: 'onizleme', siraNo: 3, dizinGorseli: DIZIN_GORSELI,
  },
];

const ORNEK_SAYI: Sayi = {
  id: 'onizleme',
  numara: 'e29',
  ay: 'Ağustos',
  yil: 2026,
  tamBaslik: 'Ağustos 2026 | Sayı e29',
  menuEtiket: 'Sekans e29 - Politik Sinema Özel Sayısı',
  kapakGorseli: '/images/dergi/SEKANS_10_KAPAK.jpg',
  pdfUrl: '',
  // Künye akordiyon panelinin önizlemede de görünmesi için kısa bir metin.
  kunye: `Sekans Sinema Kültürü Dergisi
© Sekans Sinema Grubu
Tüm hakları saklıdır.`,
  yazilar: ORNEK_YAZILAR,
  yayinTarihi: '2026-08-01',
};

export default CMSDergiGorunumu;
