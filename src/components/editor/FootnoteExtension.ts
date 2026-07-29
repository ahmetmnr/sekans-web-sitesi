import { Extension, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import type { Node as PMNode } from '@tiptap/pm/model';

/**
 * Yazı içi referans işareti: [1], [2] vb.
 * Inline node olarak render edilir, TipTap tarafından korunur.
 *
 * NOT: `footnoteNum` / `targetId` / `refId` değerleri EDİTÖRÜN yazdığı değerler
 * değildir; FootnoteSync eklentisi bunları her belge değişiminde METİN İÇİNDEKİ
 * SIRAYA göre yeniden hesaplar. Ekleme sırasında geçici bir benzersiz kimlik
 * (targetId) verilir; eşleştirme bu kimlik üzerinden yapılır.
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
            footnoteNum: dom.getAttribute('data-footnote') || dom.textContent?.replace(/[[\]]/g, '').trim() || '1',
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
            footnoteNum: dom.getAttribute('data-footnote') || dom.textContent?.replace(/[[\]]/g, '').trim() || '1',
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
 * <div class="footnote-item" id="fn-1"><span class="footnote-num">[1]</span><span class="footnote-text">…</span></div>
 *
 * `marks`: not metnine YALNIZCA anlam taşıyan satır içi işaretler girebilir.
 * textStyle (font ailesi/renk) ve highlight kasıtlı olarak DIŞARIDA bırakıldı:
 * başka bir yerden kopyalanan not metni kaynağın fontunu/rengini taşımasın,
 * her zaman dipnot stilinde görünsün.
 */
export const FootnoteItem = Node.create({
  name: 'footnoteItem',
  group: 'block',
  content: 'inline*',
  marks: 'bold italic underline strike link superscript subscript',

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
        // Kaydedilmiş HTML'de numara ayrı bir <span class="footnote-num"> olarak
        // durur; yeniden ayrıştırırken metnin başına "[1]" olarak sızmamalı.
        // Yeni biçimde metin .footnote-text içindedir; eski biçimde (numara +
        // sarmalayıcısız metin) numara sökülmüş bir kopya üzerinden okunur.
        contentElement: (el) => {
          const dom = el as HTMLElement;
          const metin = dom.querySelector('.footnote-text') as HTMLElement | null;
          if (metin) return metin;
          const kopya = dom.cloneNode(true) as HTMLElement;
          kopya.querySelectorAll('.footnote-num').forEach((n) => n.remove());
          return kopya;
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
          contenteditable: 'false',
        },
        `[${num}]`,
      ],
      ['span', { class: 'footnote-text' }, 0],  // Editable content
    ];
  },
});

/**
 * Notlar bölümü container'ı.
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

/* ========================================================================== */

interface RefBilgi { pos: number; node: PMNode }
interface ItemBilgi { node: PMNode; id: string }

/** Belgedeki referans işaretlerini METİN SIRASINA göre topla. */
function refleriTopla(doc: PMNode): RefBilgi[] {
  const refs: RefBilgi[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === 'footnoteRef') refs.push({ pos, node });
    return true;
  });
  return refs;
}

/** İlk "Notlar" bölümünü bul. */
function bolumBul(doc: PMNode): { pos: number; node: PMNode } | null {
  let bulunan: { pos: number; node: PMNode } | null = null;
  doc.descendants((node, pos) => {
    if (bulunan) return false;
    if (node.type.name === 'footnotesSection') {
      bulunan = { pos, node };
      return false;
    }
    return true;
  });
  return bulunan;
}

/**
 * Dipnotları METİN İÇİNDEKİ SIRAYA göre senkronlar.
 *
 * Her belge değişiminden sonra:
 *   1. Referans işaretleri belge sırasına göre 1..n olarak yeniden numaralanır
 *      (eklenme sırasına göre DEĞİL — araya eklenen dipnot doğru numarayı alır).
 *   2. "Notlar" bölümündeki not öğeleri aynı sıraya dizilir; içerikleri korunur
 *      (eşleştirme, referansın targetId'si ile not öğesinin id'si üzerinden).
 *   3. Referansı silinmiş (öksüz) not öğeleri kaldırılır.
 *   4. Referansı olup notu olmayan işaretler için boş bir not öğesi açılır.
 *
 * Güvenlik önlemleri:
 *   - "Notlar" bölümünde tanımadığı blok varsa (eski/elle yazılmış biçim) hiç
 *     dokunmaz.
 *   - Belgede hiç referans yoksa bölümü ancak bu değişiklikte son referans
 *     silindiyse kaldırır; aksi halde (ör. referansları ayrıştırılamayan eski
 *     içerik) notlara dokunmaz.
 */
export const FootnoteSync = Extension.create({
  name: 'footnoteSync',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('footnoteSync'),
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some((t) => t.docChanged)) return null;
          return dipnotlariSenkronla(oldState, newState);
        },
      }),
    ];
  },
});

/**
 * Senkron adımının saf (test edilebilir) gövdesi. Değişiklik gerekmiyorsa null
 * döner — aksi halde sonsuz appendTransaction döngüsü oluşurdu.
 */
export function dipnotlariSenkronla(
  oldState: EditorState,
  newState: EditorState,
): Transaction | null {
  const { doc, schema } = newState;
  const refs = refleriTopla(doc);
  const bolum = bolumBul(doc);

  // Bölüm yok: yalnızca numaralandırmayı düzelt.
  if (!bolum) {
    return refleriNumarala(newState, refs);
  }

  // Bölüm içeriğini ayrıştır: başlık(lar) + not öğeleri.
  const basliklar: PMNode[] = [];
  const items: ItemBilgi[] = [];
  let tanimsizBlok = false;
  bolum.node.forEach((child) => {
    if (child.type.name === 'footnoteItem') {
      items.push({ node: child, id: String(child.attrs.footnoteId || '') });
    } else if (child.type.name === 'heading') {
      basliklar.push(child);
    } else {
      tanimsizBlok = true;
    }
  });
  // Tanımadığımız biçim — riske girme, dokunma.
  if (tanimsizBlok) return refleriNumarala(newState, refs);

  if (refs.length === 0) {
    // Son referans BU değişiklikte mi silindi? Öyleyse bölümü kaldır.
    const eskiRefSayisi = refleriTopla(oldState.doc).length;
    if (eskiRefSayisi === 0) return null;
    const tr = newState.tr;
    tr.delete(bolum.pos, bolum.pos + bolum.node.nodeSize);
    return tr;
  }

  // --- Eşleştirme: referans sırasına göre not öğelerini diz ---
  const kalanlar = [...items];
  const yeniItems: PMNode[] = [];
  let degisti = false;

  refs.forEach((ref, i) => {
    const hedef = String(ref.node.attrs.targetId || '');
    const idx = hedef ? kalanlar.findIndex((it) => it.id === hedef) : -1;
    const eslesen = idx >= 0 ? kalanlar.splice(idx, 1)[0] : null;
    const yeniId = `fn-${i + 1}`;
    if (eslesen) {
      yeniItems.push(
        eslesen.node.attrs.footnoteId === yeniId
          ? eslesen.node
          : eslesen.node.type.create({ footnoteId: yeniId }, eslesen.node.content, eslesen.node.marks),
      );
    } else {
      // Notu olmayan referans (ör. yapıştırılmış) — boş not öğesi aç.
      yeniItems.push(schema.nodes.footnoteItem.create({ footnoteId: yeniId }));
      degisti = true;
    }
  });
  if (kalanlar.length > 0) degisti = true; // öksüz notlar kaldırılacak

  // Sıra veya id değişti mi?
  if (!degisti) {
    degisti =
      yeniItems.length !== items.length ||
      yeniItems.some((n, i) => n !== items[i]?.node);
  }

  const tr = newState.tr;
  const refDegisti = refAttrleriniYaz(tr, refs);

  if (degisti) {
    const yeniIcerik = [...basliklar, ...yeniItems];
    tr.replaceWith(
      bolum.pos + 1,
      bolum.pos + bolum.node.nodeSize - 1,
      yeniIcerik,
    );
  }

  if (!refDegisti && !degisti) return null;
  return tr;
}

/** Referans düğümlerinin numara/id özniteliklerini belge sırasına göre yaz. */
function refAttrleriniYaz(tr: Transaction, refs: RefBilgi[]): boolean {
  let degisti = false;
  refs.forEach((ref, i) => {
    const num = String(i + 1);
    const targetId = `fn-${num}`;
    const refId = `fnref-${num}`;
    if (
      ref.node.attrs.footnoteNum === num &&
      ref.node.attrs.targetId === targetId &&
      ref.node.attrs.refId === refId
    ) {
      return;
    }
    tr.setNodeMarkup(ref.pos, undefined, {
      ...ref.node.attrs,
      footnoteNum: num,
      targetId,
      refId,
    });
    degisti = true;
  });
  return degisti;
}

/** Yalnızca referans numaralarını düzelten transaction (bölüm yok / eski biçim). */
function refleriNumarala(state: EditorState, refs: RefBilgi[]): Transaction | null {
  const tr = state.tr;
  if (!refAttrleriniYaz(tr, refs)) return null;
  return tr;
}
