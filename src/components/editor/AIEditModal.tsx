// AI Editöryal Düzenleme Modalı
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  SpellCheck,
  AlignLeft,
  Scissors,
  GraduationCap,
  Heading,
  FileText,
  Image,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Sparkles,
  RotateCcw,
  Wand2,
} from 'lucide-react';
import { aiDuzenle, aiDergiStilUygula, aiStatus, type AIIslem } from '@/lib/openai';

interface AIEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  fullContent: string;
  onApply: (newContent: string, isFullContent: boolean) => void;
  onAyarlaraGit?: () => void;
}

const ISLEM_BUTONLARI: {
  id: AIIslem;
  ad: string;
  aciklama: string;
  ikon: React.ReactNode;
}[] = [
  {
    id: 'dergi-stil',
    ad: 'Dergi Stillerini Uygula',
    aciklama: 'Başlık, yazar, epigraf, künye, bölüm başlığı ve blok alıntıyı otomatik tanıyıp biçimle',
    ikon: <Wand2 className="h-5 w-5" />,
  },
  {
    id: 'yazim-duzelt',
    ad: 'Yazım Düzelt',
    aciklama: 'Gramer ve imla hatalarını düzelt',
    ikon: <SpellCheck className="h-5 w-5" />,
  },
  {
    id: 'paragraf-duzenle',
    ad: 'Paragraf Düzenle',
    aciklama: 'Paragraf yapısını iyileştir',
    ikon: <AlignLeft className="h-5 w-5" />,
  },
  {
    id: 'sadelestir',
    ad: 'Sadeleştir',
    aciklama: 'Cümleleri kısalt ve netleştir',
    ikon: <Scissors className="h-5 w-5" />,
  },
  {
    id: 'akademik-ton',
    ad: 'Akademik Ton',
    aciklama: 'Resmi/akademik dile dönüştür',
    ikon: <GraduationCap className="h-5 w-5" />,
  },
  {
    id: 'baslik-oner',
    ad: 'Başlık Öner',
    aciklama: '3-5 başlık önerisi üret',
    ikon: <Heading className="h-5 w-5" />,
  },
  {
    id: 'spot-yaz',
    ad: 'Spot Yaz',
    aciklama: 'Kısa özet/spot cümlesi üret',
    ikon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'resim-yerlesim',
    ad: 'Resim Yerleşimi',
    aciklama: 'Resim boyut ve hizalamalarını düzenle',
    ikon: <Image className="h-5 w-5" />,
  },
  {
    id: 'genel',
    ad: 'Serbest Düzenleme',
    aciklama: 'Kendi talimatınla düzenleme yap',
    ikon: <MessageSquare className="h-5 w-5" />,
  },
];

type Durum = 'secim' | 'yukleniyor' | 'sonuc' | 'hata';

export function AIEditModal({
  open,
  onOpenChange,
  selectedText,
  fullContent,
  onApply,
}: AIEditModalProps) {
  const [durum, setDurum] = useState<Durum>('secim');
  const [secilenIslem, setSecilenIslem] = useState<AIIslem | null>(null);
  const [ekTalimat, setEkTalimat] = useState('');
  const [sonuc, setSonuc] = useState('');
  const [hataMesaji, setHataMesaji] = useState('');
  const [isFullContentMode, setIsFullContentMode] = useState(false);

  const [apiKeyVar, setApiKeyVar] = useState(false);
  const hedefIcerik = selectedText || fullContent;
  const isSeciliMetin = !!selectedText;

  // Modal açıldığında sunucudan AI yapılandırma durumunu al.
  useEffect(() => {
    if (open) {
      aiStatus().then((s) => setApiKeyVar(s.configured)).catch(() => setApiKeyVar(false));
    }
  }, [open]);

  const sifirla = () => {
    setDurum('secim');
    setSecilenIslem(null);
    setEkTalimat('');
    setSonuc('');
    setHataMesaji('');
    setIsFullContentMode(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      sifirla();
    }
    onOpenChange(open);
  };

  const islemCalistir = async (islem: AIIslem) => {
    if (!hedefIcerik.trim()) {
      setHataMesaji('Düzenlenecek içerik bulunamadı.');
      setDurum('hata');
      return;
    }

    setSecilenIslem(islem);
    setDurum('yukleniyor');
    setIsFullContentMode(!isSeciliMetin);

    try {
      const result = islem === 'dergi-stil'
        ? await aiDergiStilUygula(hedefIcerik)
        : await aiDuzenle(
            hedefIcerik,
            islem,
            islem === 'genel' ? ekTalimat : undefined
          );
      setSonuc(result);
      setDurum('sonuc');
    } catch (error: unknown) {
      const err = error as Error;
      switch (err.message) {
        case 'AI_NOT_CONFIGURED':
          setHataMesaji('AI özelliği sunucu yöneticisi tarafından yapılandırılmamış.');
          break;
        case 'API_KEY_INVALID':
          setHataMesaji('OpenAI API anahtarı geçersiz. Sunucu yöneticisiyle iletişime geçin.');
          break;
        case 'RATE_LIMIT':
          setHataMesaji('Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.');
          break;
        case 'AI_TIMEOUT':
          setHataMesaji('AI yanıtı zaman aşımına uğradı. Lütfen tekrar deneyin.');
          break;
        case 'UNAUTHORIZED':
          setHataMesaji('Oturumunuz sona ermiş, lütfen tekrar giriş yapın.');
          break;
        default:
          setHataMesaji(err.message || 'Bir hata oluştu.');
      }
      setDurum('hata');
    }
  };

  const handleUygula = () => {
    if (sonuc) {
      onApply(sonuc, isFullContentMode);
      handleClose(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Editör Asistanı
          </DialogTitle>
        </DialogHeader>

        {/* AI Yapılandırma Uyarısı (anahtar sunucuda) */}
        {!apiKeyVar && durum === 'secim' && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">AI Sunucuda Yapılandırılmamış</p>
              <p className="text-xs text-amber-700 mt-1">
                AI düzenleme özelliği için OpenAI API anahtarının sunucu yöneticisi tarafından
                yapılandırılması gerekir. Lütfen sunucu yöneticinizle iletişime geçin.
              </p>
            </div>
          </div>
        )}

        {/* Seçim Durumu */}
        {durum === 'secim' && (
          <div className="space-y-4">
            {/* İçerik Bilgisi */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {isSeciliMetin ? (
                <span>Seçili metin üzerinde işlem yapılacak ({selectedText.length} karakter)</span>
              ) : (
                <span>Tüm içerik üzerinde işlem yapılacak ({fullContent.length} karakter)</span>
              )}
            </div>

            {/* Öne çıkan işlem: Dergi Stillerini Otomatik Uygula */}
            <button
              onClick={() => islemCalistir('dergi-stil')}
              disabled={!apiKeyVar}
              className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-purple-600 flex-shrink-0"><Wand2 className="h-6 w-6" /></div>
              <div>
                <p className="text-sm font-semibold text-purple-900">Dergi Stillerini Otomatik Uygula</p>
                <p className="text-xs text-purple-700">
                  Başlık, yazar adı, epigraf, künye, bölüm başlığı ve blok alıntıyı AI tanıyıp biçimler — metni değiştirmeden.
                </p>
              </div>
            </button>

            {/* Diğer İşlem Butonları */}
            <div className="grid grid-cols-2 gap-2">
              {ISLEM_BUTONLARI.filter(b => b.id !== 'genel' && b.id !== 'dergi-stil').map((islem) => (
                <button
                  key={islem.id}
                  onClick={() => islemCalistir(islem.id)}
                  disabled={!apiKeyVar}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-purple-600 mt-0.5">{islem.ikon}</div>
                  <div>
                    <p className="text-sm font-medium">{islem.ad}</p>
                    <p className="text-xs text-gray-500">{islem.aciklama}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Serbest Düzenleme */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Serbest Düzenleme</span>
              </div>
              <Textarea
                value={ekTalimat}
                onChange={(e) => setEkTalimat(e.target.value)}
                placeholder="AI'a ne yapmasını istediğinizi yazın... Örn: 'Giriş paragrafını daha çekici yap', 'Alt başlıklar ekle', 'Sonuç paragrafı yaz'"
                rows={3}
                className="text-sm"
              />
              <Button
                onClick={() => islemCalistir('genel')}
                disabled={!apiKeyVar || !ekTalimat.trim()}
                className="mt-2 bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Düzenle
              </Button>
            </div>
          </div>
        )}

        {/* Yükleniyor */}
        {durum === 'yukleniyor' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-700">AI düzenliyor...</p>
            <p className="text-xs text-gray-500 mt-1">
              {secilenIslem && ISLEM_BUTONLARI.find(b => b.id === secilenIslem)?.ad}
            </p>
          </div>
        )}

        {/* Sonuç */}
        {durum === 'sonuc' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <Check className="h-4 w-4" />
              <span>
                {secilenIslem && ISLEM_BUTONLARI.find(b => b.id === secilenIslem)?.ad} tamamlandı
              </span>
            </div>

            {/* Sonuç Önizleme */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b">
                <span className="text-xs font-medium text-gray-600">Sonuç Önizlemesi</span>
              </div>
              <div
                className="p-4 max-h-[300px] overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sonuc }}
              />
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={sifirla}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Başka İşlem
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleClose(false)}
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  İptal
                </Button>
                <Button
                  size="sm"
                  onClick={handleUygula}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Uygula
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hata */}
        {durum === 'hata' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Hata Oluştu</p>
                <p className="text-xs text-red-700 mt-1">{hataMesaji}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={sifirla}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Tekrar Dene
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
