// CMS "Ara Yazılar vd." Listesi — ara yazıların yanında basılı sayılar, duyurular,
// Sinema Kitaplığı ve İngilizce metinler de bu ekrandan yönetilir.
// Görünüm durumu (sayfa/filtre/sıralama) üst bileşende tutulur; editöre girip
// çıkınca liste aynı yerden devam eder.
import { useMemo } from 'react';
import { useCMS } from '@/context/CMSContext';
import { araYaziKategorileri } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Eye,
} from 'lucide-react';
import type { AraYaziListeDurumu } from './index';
import { duzMetin } from '@/lib/zenginMetin';

const TUM_KATEGORILER = 'all';

const SIRALAMA_SECENEKLERI: { value: AraYaziListeDurumu['siralama']; label: string }[] = [
  { value: 'yeni', label: 'En yeni' },
  { value: 'eski', label: 'En eski' },
  { value: 'baslik', label: 'Başlık (A-Z)' },
  { value: 'yazar', label: 'Yazar (A-Z)' },
];

interface CMSAraYaziListesiProps {
  onEditYazi: (yaziId?: string) => void;
  onPreviewYazi?: (yaziId: string) => void;
  durum: AraYaziListeDurumu;
  onDurumChange: (durum: AraYaziListeDurumu) => void;
}

export function CMSAraYaziListesi({ onEditYazi, onPreviewYazi, durum, onDurumChange }: CMSAraYaziListesiProps) {
  const { araYazilar, kategoriler, deleteAraYazi } = useCMS();

  const { sayfa, sayfaBasina, arama, kategori: filterKategori, siralama } = durum;
  const yamala = (patch: Partial<AraYaziListeDurumu>) => onDurumChange({ ...durum, ...patch });

  // Kategori seçenekleri SABİT KODLU DEĞİL: içerikte fiilen kullanılan kategoriler
  // (çoklu kategori dahil) + CMS'te tanımlı kategoriler birleştirilir.
  const kategoriSecenekleri = useMemo(() => {
    const set = new Set<string>();
    araYazilar.forEach((y) => araYaziKategorileri(y).forEach((k) => { if (k) set.add(k); }));
    kategoriler.forEach((k) => { if (k.ad) set.add(k.ad); });
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [araYazilar, kategoriler]);

  // Filtreleme + sıralama (kategori eşleşmesi çoklu kategoriye göre)
  const filteredYazilar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr');
    const list = araYazilar.filter((yazi) => {
      const matchesSearch = !q
        || duzMetin(yazi.baslik).toLocaleLowerCase('tr').includes(q)
        || (yazi.yazar?.tamAd ?? '').toLocaleLowerCase('tr').includes(q);
      const matchesKategori = filterKategori === TUM_KATEGORILER
        || araYaziKategorileri(yazi).includes(filterKategori);
      return matchesSearch && matchesKategori;
    });
    const sorted = [...list];
    if (siralama === 'eski') {
      sorted.sort((a, b) => (a.yayinTarihi || '').localeCompare(b.yayinTarihi || ''));
    } else if (siralama === 'baslik') {
      sorted.sort((a, b) => duzMetin(a.baslik).localeCompare(duzMetin(b.baslik), 'tr'));
    } else if (siralama === 'yazar') {
      sorted.sort((a, b) => (a.yazar?.tamAd ?? '').localeCompare(b.yazar?.tamAd ?? '', 'tr'));
    } else {
      sorted.sort((a, b) => (b.yayinTarihi || '').localeCompare(a.yayinTarihi || ''));
    }
    return sorted;
  }, [araYazilar, arama, filterKategori, siralama]);

  // Sayfalama — kayıt silinince/filtre değişince sayfa aralık dışında kalabilir.
  const totalItems = filteredYazilar.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / sayfaBasina));
  const gecerliSayfa = Math.min(Math.max(1, sayfa), totalPages);
  const startIndex = (gecerliSayfa - 1) * sayfaBasina;
  const endIndex = startIndex + sayfaBasina;
  const currentItems = filteredYazilar.slice(startIndex, endIndex);

  const goToPage = (p: number) => yamala({ sayfa: Math.max(1, Math.min(p, totalPages)) });

  const handleDelete = async (id: string, baslik: string) => {
    try {
      await deleteAraYazi(id);
    } catch (e) {
      alert(`"${baslik}" silinemedi: ` + (e instanceof Error ? e.message : 'bilinmeyen hata'));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ara Yazılar vd.</h1>
          <p className="text-gray-600 mt-1">
            Ara yazılar, basılı sayılar, duyurular, Sinema Kitaplığı ve İngilizce metinler
          </p>
        </div>
        <Button onClick={() => onEditYazi()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Ara Yazı
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{araYazilar.length}</p>
                <p className="text-sm text-gray-500">Toplam İçerik</p>
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
                  {new Set(araYazilar.map(y => y.yazar?.id).filter(Boolean)).size}
                </p>
                <p className="text-sm text-gray-500">Farklı Yazar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kategoriSecenekleri.length}</p>
                <p className="text-sm text-gray-500">Farklı Kategori</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  value={arama}
                  onChange={(e) => yamala({ arama: e.target.value, sayfa: 1 })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-56">
              <Select
                value={filterKategori}
                onValueChange={(v) => yamala({ kategori: v, sayfa: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TUM_KATEGORILER}>Tüm Kategoriler</SelectItem>
                  {kategoriSecenekleri.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-44">
              <Select
                value={siralama}
                onValueChange={(v) => yamala({ siralama: v as AraYaziListeDurumu['siralama'], sayfa: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  {SIRALAMA_SECENEKLERI.map((s) => (
                    <SelectItem key={s.value} value={s.value}>Sırala: {s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yazılar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentItems.map((yazi) => (
          <Card key={yazi.id} className="overflow-hidden">
            {/* Kapak Görseli */}
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={yazi.kapakGorseli || '/images/default-cover.svg'}
                alt={duzMetin(yazi.baslik)}
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
                {duzMetin(yazi.baslik)}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {yazi.spot}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{yazi.yazar?.tamAd ?? ''}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {yazi.tarihEtiketi?.trim()
                    ? yazi.tarihEtiketi
                    : (yazi.yayinTarihi ? new Date(yazi.yayinTarihi).toLocaleDateString('tr-TR') : '')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onPreviewYazi?.(yazi.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Önizle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onEditYazi(yazi.id)}
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
                        "{duzMetin(yazi.baslik)}" yazısını silmek istediğinizden emin misiniz?
                        Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => { void handleDelete(yazi.id, duzMetin(yazi.baslik)); }}
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

        {currentItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {arama || filterKategori !== TUM_KATEGORILER
              ? 'Arama kriterlerine uygun yazı bulunamadı.'
              : 'Henüz ara yazı eklenmemiş.'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sayfa başına:</span>
                <Select
                  value={String(sayfaBasina)}
                  onValueChange={(v) => yamala({ sayfaBasina: Number(v), sayfa: 1 })}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                  </SelectContent>
                </Select>
                <span className="ml-4">
                  {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems} kayıt
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={gecerliSayfa === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(gecerliSayfa - 1)}
                  disabled={gecerliSayfa === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (gecerliSayfa <= 3) {
                      pageNum = i + 1;
                    } else if (gecerliSayfa >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = gecerliSayfa - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={gecerliSayfa === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(gecerliSayfa + 1)}
                  disabled={gecerliSayfa === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  disabled={gecerliSayfa === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
