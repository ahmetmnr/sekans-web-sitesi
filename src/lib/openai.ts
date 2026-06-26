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

// Dergi stillerinin geçerli listesi (AI haritasını doğrulamak için).
const DERGI_STILLER = ['main', 'title-author', 'section', 'epigraf', 'filmkunye', 'blockquote'];

/**
 * "Dergi Stillerini Otomatik Uygula" — AI'a yazının TAMAMINI yazdırmaz.
 * Bunun yerine paragrafları numaralı listeye çevirir, AI'dan yalnızca
 * "indeks -> stil" JSON haritası ister (minik çıktı -> hızlı, zaman aşımı yok),
 * ve stilleri DOM üzerinde uygular. Metin hiç AI'dan geçmediği için %100 korunur.
 */
export async function aiDergiStilUygula(html: string): Promise<string> {
  const doc = new DOMParser().parseFromString(`<div id="__sekans_root">${html}</div>`, 'text/html');
  const root = doc.getElementById('__sekans_root');
  if (!root) return html;
  const blocks = Array.from(root.children) as HTMLElement[];
  if (blocks.length === 0) return html;

  // Numaralı liste: her bloğun düz metni (kısaltılmış), AI sınıflandırsın diye.
  const liste = blocks
    .map((el, i) => `[${i}] ${(el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 220)}`)
    .join('\n');

  let res: { content: string };
  try {
    res = await api.ai.edit(liste, 'dergi-stil');
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

  const styleByIndex = new Map<number, string>();
  for (const item of parsed as Array<{ i?: unknown; style?: unknown }>) {
    const i = typeof item?.i === 'number' ? item.i : Number(item?.i);
    const style = String(item?.style ?? '');
    if (Number.isInteger(i) && DERGI_STILLER.includes(style)) {
      styleByIndex.set(i, style);
    }
  }

  blocks.forEach((el, i) => applyDergiStil(doc, el, styleByIndex.get(i) || 'main'));
  return root.innerHTML;
}

/** Tek bir bloğa stil uygular; metni/iç HTML'i korur, yalnızca etiket/sarmalama değişir. */
function applyDergiStil(doc: Document, el: HTMLElement, style: string): void {
  const tag = el.tagName.toLowerCase();
  el.removeAttribute('data-style'); // önceki stili temizle

  if (style === 'main') return;

  if (style === 'blockquote') {
    if (tag === 'blockquote') return;
    const bq = doc.createElement('blockquote');
    const p = doc.createElement('p');
    p.innerHTML = el.innerHTML;
    bq.appendChild(p);
    el.replaceWith(bq);
    return;
  }

  // Paragraf stilleri: title-author, section, filmkunye, epigraf
  if (tag === 'p') {
    el.setAttribute('data-style', style);
  } else if (/^h[1-6]$/.test(tag)) {
    const p = doc.createElement('p');
    p.innerHTML = el.innerHTML;
    p.setAttribute('data-style', style);
    el.replaceWith(p);
  }
  // liste/figure/görsel vb. bloklara paragraf stili uygulanmaz (dokunulmaz).
}

/** Sunucuda AI anahtarının yapılandırılıp yapılandırılmadığını döndürür. */
export async function aiStatus(): Promise<{ configured: boolean; model: string }> {
  try {
    return await api.ai.status();
  } catch {
    return { configured: false, model: '' };
  }
}
