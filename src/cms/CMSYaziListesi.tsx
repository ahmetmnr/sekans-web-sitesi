// CMS Yazı Listesi — seçili sayının yazılarını listeler (çoklu sayı destekli).
import { useEffect } from 'react';
import { useCMS } from '@/context/CMSContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  GripVertical,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import type { YaziListeDurumu } from './index';
import { duzMetin } from '@/lib/zenginMetin';

interface CMSYaziListesiProps {
  onEditYazi: (yaziId?: string, sayiId?: string) => void;
  initialSayiId?: string;
  // Görünüm durumu üst bileşende tutulur: editöre girip çıkınca korunur.
  durum: YaziListeDurumu;
  onDurumChange: (durum: YaziListeDurumu) => void;
}

export function CMSYaziListesi({ onEditYazi, initialSayiId, durum, onDurumChange }: CMSYaziListesiProps) {
  const { sayilar, sonSayi, deleteYazi } = useCMS();
  const { user } = useAuth();
  const yoneticiMi = user?.role === 'admin';

  const { sayfa: currentPage, sayfaBasina: itemsPerPage, arama: searchTerm } = durum;
  const yamala = (patch: Partial<YaziListeDurumu>) => onDurumChange({ ...durum, ...patch });

  /* Düzenlenebilir sayılar.
     `sayilar` yetkiye göre SÜZÜLMÜŞ listedir (/cms/sayilar): yönetici hepsini,
     editör yalnızca kendisine ATANMIŞ olanları görür.

     `sonSayi` ise HERKESE AÇIK bootstrap verisidir, yetki süzgecinden geçmez.
     Eskiden liste boşken ona düşülüyordu; bu, hiçbir sayıya atanmamış bir
     editöre yayındaki sayının bütün yazılarını açıyordu. Yedek artık YALNIZCA
     YÖNETİCİ için geçerli (yönetici zaten hepsini görebilir). Editörün listesi
     boşsa hiçbir şey gösterilmez, açıklayıcı bir mesaj çıkar. */
  const secilebilir = sayilar.length
    ? sayilar
    : (yoneticiMi && sonSayi.id ? [sonSayi] : []);

  // Sayı Yönetimi'nden "Yazıları Yönet" ile gelince o sayıya odaklan.
  useEffect(() => {
    if (initialSayiId && initialSayiId !== durum.sayiId) {
      onDurumChange({ ...durum, sayiId: initialSayiId, sayfa: 1 });
    }
    // Yalnızca dışarıdan gelen seçim değiştiğinde çalışır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSayiId]);

  // Seçili sayı listede yoksa uygun bir sayıya düş (durum değişince).
  const aktifSayi =
    secilebilir.find((s) => s.id === durum.sayiId) ??
    secilebilir.find((s) => s.durum === 'yayinda') ??
    secilebilir[0];

  const yazilar = aktifSayi?.yazilar ?? [];

  // Filtreleme — yazar/kategori FK SET NULL ile null olabilir; güvenli erişim.
  const filteredYazilar = yazilar.filter((yazi) =>
    duzMetin(yazi.baslik).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (yazi.yazar?.tamAd ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (yazi.kategori?.ad ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedYazilar = [...filteredYazilar].sort((a, b) => (a.siraNo ?? 0) - (b.siraNo ?? 0));

  const totalItems = sortedYazilar.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const gecerliSayfa = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (gecerliSayfa - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedYazilar.slice(startIndex, endIndex);

  const goToPage = (page: number) => yamala({ sayfa: Math.max(1, Math.min(page, totalPages)) });
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(gecerliSayfa - 1);
  const goToNextPage = () => goToPage(gecerliSayfa + 1);

  const handleSearch = (value: string) => yamala({ arama: value, sayfa: 1 });

  const handleItemsPerPageChange = (value: string) => yamala({ sayfaBasina: Number(value), sayfa: 1 });

  const handleSayiChange = (value: string) => yamala({ sayiId: value, sayfa: 1, arama: '' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yazı Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            {yoneticiMi
              ? 'Bir sayı seçin ve yazılarını yönetin'
              : 'Yalnızca size atanmış sayıların yazıları listelenir.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sayı seçici */}
          <Select value={aktifSayi?.id ?? ''} onValueChange={handleSayiChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Sayı seçin" />
            </SelectTrigger>
            <SelectContent>
              {secilebilir.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {(s.tamBaslik || `${s.ay} ${s.yil} — ${s.numara}`) +
                    (s.durum === 'yayinda' ? '  — YAYINDA (canlı)' : '  — taslak')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => onEditYazi(undefined, aktifSayi?.id)} disabled={!aktifSayi}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Yazı Ekle
          </Button>
        </div>
      </div>

      {/* Editöre hiçbir sayı atanmamışsa: boş liste yerine sebebini söyle. */}
      {secilebilir.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Size atanmış bir sayı yok. Yazı düzenleyebilmeniz için yöneticinin
          Sayı Yönetimi’nden bir sayıya <b>sorumlu editör</b> olarak sizi ataması
          gerekir.
        </div>
      )}

      {/* Yayındaki sayı düzenleniyorsa: değişiklikler ANINDA canlıya gider. */}
      {aktifSayi?.durum === 'yayinda' && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          <b>Bu sayı yayında.</b> Buradaki değişiklikler siteye anında yansır —
          önce taslağa almanız gerekmez, ama yaptığınız her düzenlemeyi okurlar
          da görür.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{yazilar.length}</p>
                <p className="text-sm text-gray-500">Toplam Yazı</p>
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
                  {new Set(yazilar.map((y) => y.yazar?.id).filter(Boolean)).size}
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
                <p className="text-2xl font-bold">
                  {new Set(yazilar.map((y) => y.kategori?.id).filter(Boolean)).size}
                </p>
                <p className="text-sm text-gray-500">Farklı Kategori</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yazılar Tablosu */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>
                Yazılar {aktifSayi ? `— ${aktifSayi.tamBaslik || aktifSayi.numara}` : ''}
              </CardTitle>
              <CardDescription>Yazıyı düzenlemek için kalem ikonuna tıklayın</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Sıra</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Yazar</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((yazi) => (
                <TableRow key={yazi.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{yazi.siraNo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium text-gray-900 truncate">{duzMetin(yazi.baslik)}</p>
                      {yazi.spot && (
                        <p className="text-sm text-gray-500 truncate mt-1">{yazi.spot}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{yazi.yazar?.tamAd ?? '—'}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded">
                      {yazi.kategori?.ad ?? 'Kategori yok'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEditYazi(yazi.id, aktifSayi?.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                              onClick={() => {
                                // Sessiz başarısızlık olmasın: hata varsa kullanıcıya gösterilir.
                                void deleteYazi(yazi.id).catch((e) =>
                                  alert('Silinemedi: ' + (e instanceof Error ? e.message : 'bilinmeyen hata')));
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {currentItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? 'Arama kriterlerine uygun yazı bulunamadı.'
                      : 'Bu sayıda henüz yazı yok. Yeni yazı eklemek için yukarıdaki butonu kullanın.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sayfa başına:</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="ml-4">
                  {startIndex + 1}-{Math.min(endIndex, totalItems)} / {totalItems} kayıt
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={goToFirstPage} disabled={gecerliSayfa === 1} className="h-8 w-8 p-0">
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={gecerliSayfa === 1} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (gecerliSayfa <= 3) pageNum = i + 1;
                    else if (gecerliSayfa >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = gecerliSayfa - 2 + i;
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

                <Button variant="outline" size="sm" onClick={goToNextPage} disabled={gecerliSayfa === totalPages} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToLastPage} disabled={gecerliSayfa === totalPages} className="h-8 w-8 p-0">
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
