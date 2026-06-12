// CMS Ara Yazı Listesi - Blog Post List with Pagination
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
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

const araYaziKategorileri = [
  'Deneme',
  'Haber',
  'Duyuru',
  'İnceleme',
  'Söyleşi',
  'Etkinlik',
  'Yorum',
];

interface CMSAraYaziListesiProps {
  onEditYazi: (yaziId?: string) => void;
  onPreviewYazi?: (yaziId: string) => void;
}

export function CMSAraYaziListesi({ onEditYazi, onPreviewYazi }: CMSAraYaziListesiProps) {
  const { araYazilar, deleteAraYazi } = useCMS();

  // Pagination and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');

  // Filtreleme
  const filteredYazilar = araYazilar
    .filter(yazi => {
      const matchesSearch = yazi.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        yazi.yazar.tamAd.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKategori = filterKategori === 'all' || yazi.kategori === filterKategori;
      return matchesSearch && matchesKategori;
    })
    .sort((a, b) => new Date(b.yayinTarihi).getTime() - new Date(a.yayinTarihi).getTime());

  // Pagination calculations
  const totalItems = filteredYazilar.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredYazilar.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Reset to first page when filters change
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleKategoriChange = (value: string) => {
    setFilterKategori(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ara Yazılar</h1>
          <p className="text-gray-600 mt-1">Blog yazılarını yönetin</p>
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
                <p className="text-sm text-gray-500">Toplam Ara Yazı</p>
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
                  {new Set(araYazilar.map(y => y.yazar.id)).size}
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
                  {new Set(araYazilar.map(y => y.kategori)).size}
                </p>
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
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={filterKategori} onValueChange={handleKategoriChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {araYaziKategorileri.map((kategori) => (
                    <SelectItem key={kategori} value={kategori}>
                      {kategori}
                    </SelectItem>
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
                alt={yazi.baslik}
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
                {yazi.baslik}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {yazi.spot}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{yazi.yazar.tamAd}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(yazi.yayinTarihi).toLocaleDateString('tr-TR')}
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
                        "{yazi.baslik}" yazısını silmek istediğinizden emin misiniz?
                        Bu işlem geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAraYazi(yazi.id)}
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
            {searchTerm || filterKategori !== 'all'
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
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="9">9</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
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
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
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
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
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
