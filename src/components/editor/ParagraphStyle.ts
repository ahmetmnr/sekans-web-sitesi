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
 *  - title-author → Başlık / Yazar Adı (ortada, kalın)
 *  - section      → Bölüm Başlığı (ortada, kalın)
 *  - filmkunye    → Film Künye (ortada, küçük punto)
 *  - epigraf      → Epigraf (sağa yaslı, küçük punto)
 *
 * Blok alıntı ayrı bir düğüm (blockquote) olarak ele alınır.
 */
export type ParagraphStyleName =
  | 'title-author'
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
