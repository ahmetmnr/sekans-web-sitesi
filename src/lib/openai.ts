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

/**
 * "Dergi Stillerini Otomatik Uygula".
 *
 * Metni AI'a gönderir; AI metni KELİMESİ KELİMESİNE koruyarak paragraflara böler
 * ve her paragrafı doğru stille (title/author/section/epigraf/filmkunye) veya
 * blok alıntı ile işaretleyip YAPISAL HTML döndürür. Tek dev paragraf (blob)
 * olarak yapıştırılmış içeriğe de çalışır — segmentasyonu AI yapar.
 *
 * Dönen HTML güvenlik + geçerli stiller için temizlenir. Kullanıcı Uygula'dan
 * önce sonucu modalde önizler.
 */
export async function aiDergiStilUygula(html: string): Promise<string> {
  let res: { content: string };
  try {
    res = await api.ai.edit(html, 'dergi-stil');
  } catch (e) {
    const err = e as ApiError;
    throw new Error(err.code && err.code !== 'ERROR' ? err.code : (err.message || 'AI_ERROR'));
  }

  const out = (res.content || '')
    .trim()
    .replace(/^```(?:html)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!out) throw new Error('AI boş yanıt döndürdü.');
  return sanitizeDergiHtml(out);
}

/**
 * AI'dan gelen HTML'i güvenli + geçerli hale getirir:
 *  - script/style/iframe vb. ile tüm on* ve gereksiz öznitelikleri kaldırır,
 *  - yalnızca <p> (geçerli data-style ile) ve <blockquote><p> bloklarını korur,
 *  - sarmalayıcı div/section/article içine iner (düzleştirir).
 */
function sanitizeDergiHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<div id="__r">${html}</div>`, 'text/html');
  const root = doc.getElementById('__r');
  if (!root) return html;

  root.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((n) => n.remove());
  root.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const izinli =
        name === 'data-style' ||
        (el.tagName === 'A' && (name === 'href' || name === 'title'));
      if (!izinli) el.removeAttribute(attr.name);
    }
  });

  const parcalar: string[] = [];
  collectBlocks(root, parcalar);
  return parcalar.join('') || html;
}

/** Üst-seviye blokları toplar; sarmalayıcıların içine iner, bilinmeyeni <p>'ye indirir. */
function collectBlocks(parent: HTMLElement, out: string[]): void {
  for (const el of Array.from(parent.children) as HTMLElement[]) {
    const tag = el.tagName.toLowerCase();
    if (tag === 'blockquote') {
      const inner = (el.querySelector('p')?.innerHTML ?? el.innerHTML).trim();
      if (inner) out.push(`<blockquote><p>${inner}</p></blockquote>`);
    } else if (tag === 'p' || /^h[1-6]$/.test(tag)) {
      const ds = el.getAttribute('data-style');
      const styleAttr = ds && IZINLI_STILLER.has(ds) ? ` data-style="${ds}"` : '';
      const inner = el.innerHTML.trim();
      if (inner) out.push(`<p${styleAttr}>${inner}</p>`);
    } else if (tag === 'div' || tag === 'section' || tag === 'article' || tag === 'main' || tag === 'body') {
      collectBlocks(el, out); // sarmalayıcı: içine in
    } else if (tag === 'ul' || tag === 'ol' || tag === 'figure' || tag === 'hr') {
      out.push(el.outerHTML); // olduğu gibi koru
    } else {
      const inner = el.innerHTML.trim();
      if (inner) out.push(`<p>${inner}</p>`);
    }
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
