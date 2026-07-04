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

// AI'ın döndürebileceği geçerli paragraf data-style değerleri.
const IZINLI_STILLER = new Set(['title', 'author', 'section', 'epigraf', 'filmkunye']);

interface Capa { start?: unknown; style?: unknown }

/**
 * "Dergi Stillerini Otomatik Uygula" — ÇAPA (anchor) yöntemi.
 *
 * AI'a yazının TAMAMINI yazdırmaz (bu uzun yazıda zaman aşımına uğruyordu).
 * Bunun yerine AI yalnızca her paragrafın BAŞLADIĞI yerin ilk birkaç kelimesini
 * ("start") ve o paragrafın stilini döndürür (minik çıktı -> hızlı, zaman aşımı
 * yok). Metni bu çapalardan YEREL olarak böleriz; kelimeler AI'dan geçmediği
 * için %100 korunur. Tek dev paragraf (blob) da böylece paragraflara ayrılır.
 *
 * Not: Bu yöntem düz metinle çalışır; içerikteki mevcut satır-içi biçimlendirme
 * (bold/italik) korunmaz — özellik zaten ham/yapıştırılmış metni ilk kez
 * biçimlemek içindir.
 */
export async function aiDergiStilUygula(html: string): Promise<string> {
  // İçeriğin düz metni; tüm boşlukları teke indir (blob olabilir).
  const doc = new DOMParser().parseFromString(`<div id="__r">${html}</div>`, 'text/html');
  const metin = (doc.getElementById('__r')?.textContent || '').replace(/\s+/g, ' ').trim();
  if (!metin) return html;

  let res: { content: string };
  try {
    res = await api.ai.edit(metin, 'dergi-stil');
  } catch (e) {
    const err = e as ApiError;
    throw new Error(err.code && err.code !== 'ERROR' ? err.code : (err.message || 'AI_ERROR'));
  }

  const raw = (res.content || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('AI yanıtı çözümlenemedi (geçersiz JSON).');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('AI yanıtı beklenen biçimde değil.');
  }

  // Çapaları metinde SIRAYLA bul; bulunamayan/geri giden çapa yok sayılır.
  const lc = metin.toLocaleLowerCase('tr');
  const sinirlar: { idx: number; style: string }[] = [];
  let ara = 0;
  for (const item of parsed as Capa[]) {
    const anchor = String(item?.start ?? '').replace(/\s+/g, ' ').trim();
    let style = String(item?.style ?? 'main');
    if (style !== 'main' && style !== 'blockquote' && !IZINLI_STILLER.has(style)) style = 'main';
    if (anchor.length < 3) continue;
    const idx = lc.indexOf(anchor.toLocaleLowerCase('tr'), ara);
    if (idx < 0) continue;
    sinirlar.push({ idx, style });
    ara = idx + 1;
  }

  // Hiç çapa eşleşmediyse metni bozma: tek paragraf olarak döndür.
  if (sinirlar.length === 0) return `<p>${escapeHtml(metin)}</p>`;

  const parcalar: { text: string; style: string }[] = [];
  if (sinirlar[0].idx > 0) {
    parcalar.push({ text: metin.slice(0, sinirlar[0].idx).trim(), style: 'main' });
  }
  for (let i = 0; i < sinirlar.length; i++) {
    const bas = sinirlar[i].idx;
    const son = i + 1 < sinirlar.length ? sinirlar[i + 1].idx : metin.length;
    parcalar.push({ text: metin.slice(bas, son).trim(), style: sinirlar[i].style });
  }

  return parcalar
    .filter((p) => p.text)
    .map((p) => blokHtml(p.text, p.style))
    .join('');
}

/** Bir metin parçasını stiline göre güvenli HTML bloğuna sarar (metin escape'lenir). */
function blokHtml(text: string, style: string): string {
  const safe = escapeHtml(text);
  if (style === 'blockquote') return `<blockquote><p>${safe}</p></blockquote>`;
  if (style === 'filmkunye') return `<p data-style="filmkunye">${kunyeSatirlari(safe)}</p>`;
  if (IZINLI_STILLER.has(style)) return `<p data-style="${style}">${safe}</p>`;
  return `<p>${safe}</p>`;
}

/** Künyede rol etiketlerinin (Senaryo:, Oyuncular: ...) önüne <br> koyar. */
function kunyeSatirlari(safe: string): string {
  return safe
    .replace(
      /\s+(?=(?:Senaryo|Görüntü\s*Yönetmeni|Kurgu|Müzik|Sanat\s*Yönetmeni|Yapımcı|Oyuncular|Ses|Kostüm|Yapım|Süre)\s*:)/g,
      '<br>',
    )
    .replace(/\s+(?=(?:19|20)\d{2}\s*\/)/g, '<br><br>');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Sunucuda AI anahtarının yapılandırılıp yapılandırılmadığını döndürür. */
export async function aiStatus(): Promise<{ configured: boolean; model: string }> {
  try {
    return await api.ai.status();
  } catch {
    return { configured: false, model: '' };
  }
}
