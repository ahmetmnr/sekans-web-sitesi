// Çok yazarlı yazılar için yazar seçici.
//   - Birincil yazar: kartlarda/listelerde ve "yazarın diğer yazıları" gibi
//     yerlerde kullanılan yazar. Zorunludur.
//   - Ek yazarlar: yazı sayfasında birincil yazarın altında listelenir.
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import type { Yazar } from '@/types';

interface YazarSeciciProps {
  /** Seçilebilecek tüm yazarlar. */
  yazarlar: Yazar[];
  /** Seçili yazarlar; ilk eleman birincil yazardır. */
  secili: Yazar[];
  onBirincilChange: (yazarId: string) => void;
  onEkle: (yazar: Yazar) => void;
  onCikar: (yazarId: string) => void;
}

export function YazarSecici({
  yazarlar, secili, onBirincilChange, onEkle, onCikar,
}: YazarSeciciProps) {
  const [ekleAcik, setEkleAcik] = useState(false);
  const birincil = secili[0];
  const ekYazarlar = secili.slice(1);
  const eklenebilir = yazarlar.filter((y) => !secili.some((s) => s.id === y.id));

  return (
    <div>
      <Label className="text-sm font-medium">
        {ekYazarlar.length > 0 ? 'Yazarlar *' : 'Yazar *'}
      </Label>
      <Select value={birincil?.id || ''} onValueChange={onBirincilChange}>
        <SelectTrigger className="mt-1.5">
          <SelectValue placeholder="Yazar seçin" />
        </SelectTrigger>
        <SelectContent>
          {yazarlar.map((yazar) => (
            <SelectItem key={yazar.id} value={yazar.id}>
              {yazar.tamAd}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {ekYazarlar.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {ekYazarlar.map((y) => (
            <li
              key={y.id}
              className="flex items-center justify-between gap-2 rounded border bg-gray-50 px-2.5 py-1.5 text-sm"
            >
              <span className="truncate">{y.tamAd}</span>
              <button
                type="button"
                onClick={() => onCikar(y.id)}
                className="text-gray-400 hover:text-red-600"
                title="Yazarı çıkar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {ekleAcik ? (
        <Select
          value=""
          onValueChange={(id) => {
            const y = yazarlar.find((k) => k.id === id);
            if (y) onEkle(y);
            setEkleAcik(false);
          }}
        >
          <SelectTrigger className="mt-2 h-8 text-xs">
            <SelectValue placeholder="Eklenecek yazarı seçin" />
          </SelectTrigger>
          <SelectContent>
            {eklenebilir.map((y) => (
              <SelectItem key={y.id} value={y.id}>{y.tamAd}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        eklenebilir.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 w-full h-8 text-xs border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-400"
            onClick={() => setEkleAcik(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            İkinci yazar ekle
          </Button>
        )
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        {ekYazarlar.length > 0
          ? 'İlk sıradaki yazar birincildir; kartlarda ve listelerde o görünür. Yazının sayfasında hepsi listelenir.'
          : 'Çift yazarlı yazılar için aşağıdan ikinci (ve sonraki) yazarı ekleyebilirsiniz.'}
      </p>
    </div>
  );
}

export default YazarSecici;
