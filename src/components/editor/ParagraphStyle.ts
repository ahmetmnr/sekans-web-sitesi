import { Extension } from '@tiptap/core';

/**
 * Dergi yazıları için özel paragraf stilleri.
 *
 * Paragraf düğümüne `data-style` özniteliği ekler. Stil sadece görsel olup
 * kaydedilen HTML içinde korunur; hem editörde (.ProseMirror) hem de yayın/
 * önizleme tarafında (.cms-content-preview) aynı CSS ile biçimlendirilir.
 *
 * Tanımlı stiller:
 *  - (boş)        → Ana Metin (MAIN), varsayılan paragraf
 *  - title        → Yazı Başlığı (ortada, kalın, büyük punto)
 *  - author       → Yazar Adı (ortada, kalın, başlıktan küçük)
 *  - section      → Bölüm Başlığı (ortada, kalın)
 *  - filmkunye    → Künye (ortada, küçük punto, sıkı satır aralığı)
 *  - epigraf      → Epigraf (sağa yaslı, küçük punto)
 *
 * Not: 'title-author' eski birleşik stildir; artık title/author olarak ayrıldı.
 * Eski içerik CSS'te başlık gibi render edilmeye devam eder (geriye dönük uyum).
 *
 * Blok alıntı ayrı bir düğüm (blockquote) olarak ele alınır.
 */
export type ParagraphStyleName =
  | 'title'
  | 'author'
  | 'section'
  | 'filmkunye'
  | 'epigraf';

export const ParagraphStyle = Extension.create({
  name: 'paragraphStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          dataStyle: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-style'),
            renderHTML: (attributes) => {
              if (!attributes.dataStyle) return {};
              return { 'data-style': attributes.dataStyle };
            },
          },
        },
      },
    ];
  },
});

export default ParagraphStyle;
