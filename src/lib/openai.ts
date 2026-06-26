// AI Editöryal Düzenleme — artık sunucu PHP proxy'si üzerinden (/api/ai/edit).
// OpenAI anahtarı SUNUCUDA (config.php) tutulur; tarayıcıya ASLA gelmez.
// İşlem promptları sunucu tarafındadır (api/lib/prompts.php). Burada yalnızca
// modal için işlem listesi (id/ad/aciklama) ve AIIslem tipi kalır.

import { api, ApiError } from '@/lib/api';

export type AIIslem =
  | 'dergi-stil'
  | 'yazim-duzelt'
  | 'paragraf-duzenle'
  | 'sadelestir'
  | 'akademik-ton'
  | 'baslik-oner'
  | 'spot-yaz'
  | 'resim-yerlesim'
  | 'genel';

interface IslemMeta {
  id: AIIslem;
  ad: string;
  aciklama: string;
}

const ISLEM_LISTESI: IslemMeta[] = [
  { id: 'dergi-stil',      ad: 'Dergi Stillerini Uygula', aciklama: 'Başlık, yazar, epigraf, künye, bölüm başlığı ve blok alıntıyı otomatik tanıyıp biçimle' },
  { id: 'yazim-duzelt',    ad: 'Yazım ve İmla Düzelt', aciklama: 'Gramer, noktalama ve Türkçe yazım hatalarını düzelt' },
  { id: 'paragraf-duzenle',ad: 'Paragraf Düzenle',     aciklama: 'Paragraf yapısını iyileştir, gerekirse böl veya birleştir' },
  { id: 'sadelestir',      ad: 'Cümleleri Sadeleştir', aciklama: 'Karmaşık ve uzun cümleleri kısalt, anlaşılır hale getir' },
  { id: 'akademik-ton',    ad: 'Akademik Tona Dönüştür',aciklama: 'Daha resmi ve akademik bir dil kullan' },
  { id: 'baslik-oner',     ad: 'Başlık Öner',          aciklama: 'İçerikten 3-5 başlık önerisi üret' },
  { id: 'spot-yaz',        ad: 'Spot Yaz',             aciklama: 'İçerikten kısa bir özet/spot cümlesi üret' },
  { id: 'resim-yerlesim',  ad: 'Resim Yerleşimini Düzenle', aciklama: 'Resimlerin boyut, hizalama ve metin sarma ayarlarını optimize et' },
  { id: 'genel',           ad: 'Genel Düzenleme',      aciklama: 'Kendi talimatınla düzenleme yap' },
];

export function getIslemListesi(): { id: AIIslem; ad: string; aciklama: string }[] {
  return ISLEM_LISTESI.map(({ id, ad, aciklama }) => ({ id, ad, aciklama }));
}

/**
 * Sunucu AI proxy'sini çağırır. Hata kodları (AIEditModal'ın beklediği biçimde)
 * fırlatılır: AI_NOT_CONFIGURED / API_KEY_INVALID / RATE_LIMIT / AI_TIMEOUT / UNAUTHORIZED.
 */
export async function aiDuzenle(
  icerik: string,
  islem: AIIslem,
  ekTalimat?: string
): Promise<string> {
  try {
    const res = await api.ai.edit(icerik, islem, islem === 'genel' ? ekTalimat : undefined);
    // Model bazen yanıtı ```html ... ``` kod bloğuyla sarabiliyor; temizle.
    const content = (res.content || '')
      .trim()
      .replace(/^```(?:html)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return content;
  } catch (e) {
    const err = e as ApiError;
    // Sunucu hata kodlarını koru; bilinmeyenleri mesaja indir.
    throw new Error(err.code && err.code !== 'ERROR' ? err.code : (err.message || 'AI_ERROR'));
  }
}

/** Sunucuda AI anahtarının yapılandırılıp yapılandırılmadığını döndürür. */
export async function aiStatus(): Promise<{ configured: boolean; model: string }> {
  try {
    return await api.ai.status();
  } catch {
    return { configured: false, model: '' };
  }
}
