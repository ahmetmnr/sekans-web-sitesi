// Yeniden kullanılabilir dosya yükleme alanı (yükle veya URL yapıştır).
// Kapak görselleri, yazar fotoğrafı ve PDF için.
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Link as LinkIcon, FileText } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

interface FileUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  accept: string;
  kind: 'image' | 'pdf' | 'foto';
  previewType?: 'image' | 'none';
}

export function FileUploadField({
  label,
  value,
  onChange,
  accept,
  kind,
  previewType = 'image',
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const { url } = await api.uploadFile(file, kind);
      onChange(url);
    } catch (e2) {
      const ae = e2 as ApiError;
      if (ae.status === 413) setErr('Dosya çok büyük.');
      else if (ae.code === 'INVALID_TYPE') setErr('Geçersiz dosya türü.');
      else setErr(ae.message || 'Yükleme başarısız.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
          {uploading ? 'Yükleniyor...' : 'Yükle'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrl((s) => !s)}>
          <LinkIcon className="h-4 w-4 mr-1.5" />
          URL
        </Button>
      </div>

      {showUrl && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={kind === 'pdf' ? '/uploads/dosya.pdf' : '/uploads/kapak.jpg'}
          className="mt-2"
        />
      )}

      {err && <p className="text-xs text-red-600 mt-1">{err}</p>}

      {value && previewType === 'image' && (
        <div className="mt-2 aspect-video bg-gray-100 rounded overflow-hidden">
          <img
            src={value}
            alt="Önizleme"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      {value && kind === 'pdf' && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <FileText className="h-3 w-3" /> {value}
        </p>
      )}
    </div>
  );
}
