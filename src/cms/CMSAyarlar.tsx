// CMS Ayarlar - Settings Management (sunucu tabanlı)
import React, { useState, useRef, useEffect } from 'react';
import { useCMS } from '@/context/CMSContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Download,
  Upload,
  RotateCcw,
  Database,
  AlertTriangle,
  CheckCircle,
  Copy,
  Sparkles,
} from 'lucide-react';
import { aiStatus } from '@/lib/openai';

export function CMSAyarlar() {
  const { exportData, importData, resetToDefaults } = useCMS();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportedData, setExportedData] = useState<string>('');
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState<string>('');

  // AI durumu (sunucudan; anahtar burada GİRİLMEZ)
  const [ai, setAi] = useState<{ configured: boolean; model: string } | null>(null);
  useEffect(() => {
    aiStatus().then(setAi).catch(() => setAi({ configured: false, model: '' }));
  }, []);

  const handleExport = async () => {
    const data = await exportData();
    setExportedData(data);
  };

  const handleDownload = async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sekans-cms-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedData);
  };

  const handleImportFromText = async () => {
    if (!importText.trim()) {
      setImportStatus('error');
      setImportMessage('Lütfen JSON verisini girin');
      return;
    }
    const success = await importData(importText);
    if (success) {
      setImportStatus('success');
      setImportMessage('Veriler başarıyla içe aktarıldı!');
      setImportText('');
    } else {
      setImportStatus('error');
      setImportMessage('Geçersiz JSON formatı veya içe aktarma hatası.');
    }
    setTimeout(() => { setImportStatus('idle'); setImportMessage(''); }, 3000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const success = await importData(content);
      if (success) {
        setImportStatus('success');
        setImportMessage('Veriler başarıyla içe aktarıldı!');
      } else {
        setImportStatus('error');
        setImportMessage('Geçersiz dosya formatı veya içe aktarma hatası.');
      }
      setTimeout(() => { setImportStatus('idle'); setImportMessage(''); }, 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-1">CMS ayarları ve veri yönetimi</p>
      </div>

      {/* AI Durumu (salt okunur) */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Sparkles className="h-5 w-5" />
            AI Durumu
          </CardTitle>
          <CardDescription>
            AI düzenleme özelliğinin sunucu yapılandırması
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ai === null ? (
            <p className="text-sm text-gray-500">Durum kontrol ediliyor...</p>
          ) : ai.configured ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              <CheckCircle className="h-4 w-4" />
              AI yapılandırılmış (model: {ai.model || 'gpt-4o-mini'}). Editörde
              <Sparkles className="h-3 w-3 inline text-purple-600 mx-1" /> butonuyla kullanılabilir.
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              AI anahtarı sunucuda ayarlanmamış. Sunucu yöneticisiyle iletişime geçin.
            </div>
          )}
          <div className="bg-purple-50/50 rounded-lg p-3 text-xs text-gray-600">
            <p>
              <strong>Güvenlik:</strong> OpenAI API anahtarı sunucuda, web erişimine kapalı bir
              yapılandırma dosyasında (config.php) saklanır; tarayıcıya hiçbir zaman gönderilmez.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Veri Dışa Aktarma */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Veri Dışa Aktarma
          </CardTitle>
          <CardDescription>
            Tüm CMS verilerini JSON formatında dışa aktarın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Veriyi Göster
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Dosya Olarak İndir
            </Button>
          </div>

          {exportedData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Dışa aktarılan veri:</p>
                <Button variant="ghost" size="sm" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Kopyala
                </Button>
              </div>
              <Textarea value={exportedData} readOnly rows={10} className="font-mono text-xs" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Veri İçe Aktarma — sadece admin */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Veri İçe Aktarma
            </CardTitle>
            <CardDescription>
              Daha önce dışa aktarılmış verileri geri yükleyin (yalnızca yönetici)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {importStatus !== 'idle' && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  importStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {importStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span>{importMessage}</span>
              </div>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                JSON Dosyası Yükle
              </Button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">veya JSON verisini yapıştırın:</p>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={6}
                className="font-mono text-xs"
                placeholder='{"sonSayi": {...}, "arsivSayilari": [...], ...}'
              />
              <Button onClick={handleImportFromText} className="mt-3" disabled={!importText.trim()}>
                İçe Aktar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sıfırla — sadece admin */}
      {isAdmin && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <RotateCcw className="h-5 w-5" />
              İçeriği Sıfırla
            </CardTitle>
            <CardDescription>Tüm içeriği siler (kullanıcılar korunur)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Dikkat!</p>
                  <p className="text-sm text-red-700 mt-1">
                    Bu işlem tüm yazıları, sayıları, yazarları ve kategorileri siler.
                    Geri alınamaz. Önce verilerinizi dışa aktarmanızı öneririz.
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  İçeriği Sıfırla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem tüm CMS içeriğini silecektir. Bu işlem geri alınamaz!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => { void resetToDefaults(); }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Evet, Sıfırla
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      {/* Bilgi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Veri Depolama Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Depolama Yöntemi:</strong> Tüm veriler sunucudaki MySQL veritabanında saklanır
              ve tüm ziyaretçiler için ortaktır.
            </p>
            <p>
              <strong>Yedekleme:</strong> Önemli değişikliklerden önce verilerinizi dışa aktarmanızı
              öneririz. phpMyAdmin üzerinden de düzenli veritabanı yedeği alabilirsiniz.
            </p>
            <p>
              <strong>Taşınabilirlik:</strong> Dışa aktarılan JSON, içe aktarma ile geri yüklenebilir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
