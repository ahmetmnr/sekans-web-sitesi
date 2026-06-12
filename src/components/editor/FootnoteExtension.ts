import { Node } from '@tiptap/core';

/**
 * Yazı içi referans işareti: [1], [2] vb.
 * Inline node olarak render edilir, TipTap tarafından korunur.
 */
export const FootnoteRef = Node.create({
  name: 'footnoteRef',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      footnoteNum: {
        default: '1',
      },
      targetId: {
        default: '',
      },
      refId: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.footnote-ref',
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            footnoteNum: dom.getAttribute('data-footnote') || dom.textContent?.replace(/[\[\]]/g, '').trim() || '1',
            targetId: dom.getAttribute('data-target') || '',
            refId: dom.id || '',
          };
        },
      },
      {
        tag: 'a.footnote-ref',
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            footnoteNum: dom.getAttribute('data-footnote') || dom.textContent?.replace(/[\[\]]/g, '').trim() || '1',
            targetId: dom.getAttribute('data-target') || dom.getAttribute('href')?.replace('#', '') || '',
            refId: dom.id || '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const num = node.attrs.footnoteNum;
    const targetId = node.attrs.targetId || `fn-${num}`;
    const refId = node.attrs.refId || `fnref-${num}`;

    return [
      'span',
      {
        class: 'footnote-ref',
        'data-footnote': num,
        'data-target': targetId,
        id: refId,
        role: 'button',
        tabindex: '0',
      },
      `[${num}]`,
    ];
  },
});

/**
 * Dipnot bölümündeki tek bir dipnot öğesi.
 * <div class="footnote-item" id="fn-1">...</div>
 */
export const FootnoteItem = Node.create({
  name: 'footnoteItem',
  group: 'block',
  content: 'inline*',

  addAttributes() {
    return {
      footnoteId: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.footnote-item',
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            footnoteId: dom.id || '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const id = node.attrs.footnoteId;
    const num = id.replace('fn-', '');

    return [
      'div',
      {
        class: 'footnote-item',
        id: id,
      },
      [
        'span',
        {
          class: 'footnote-num',
          'data-target': `fnref-${num}`,
          role: 'button',
          tabindex: '0',
        },
        `[${num}]`,
      ],
      ['span', {}, 0],  // Editable content
    ];
  },
});

/**
 * Kaynaklar bölümü container'ı.
 * <div class="footnotes-section">...</div>
 */
export const FootnotesSection = Node.create({
  name: 'footnotesSection',
  group: 'block',
  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'div.footnotes-section',
      },
    ];
  },

  renderHTML() {
    return ['div', { class: 'footnotes-section' }, 0];
  },
});
