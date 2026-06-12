import { useEffect } from 'react';

let initialized = false;

/**
 * Global footnote handler - document seviyesinde çalışır.
 * Sayfanın neresinde olursa olsun footnote tıklama ve hover yakalar.
 */
export function useGlobalFootnotes() {
  useEffect(() => {
    if (initialized) return;
    initialized = true;

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'footnote-tooltip';
    document.body.appendChild(tooltip);

    // Tüm tıklamaları yakala
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // 1) Yeni format: <span class="footnote-ref">
      // 2) Eski format: <a href="#fn-..."> veya <a href="#_ftn...">
      // 3) Alttaki geri dönüş: <span class="footnote-num"> veya <a href="#fnref-...">

      let scrollToId = '';

      // Yeni footnote-ref span
      if (target.closest('.footnote-ref')) {
        const el = target.closest('.footnote-ref') as HTMLElement;
        const num = el.getAttribute('data-footnote') || el.textContent?.replace(/[\[\]]/g, '').trim();
        if (num) scrollToId = 'fn-' + num;
      }
      // Yeni footnote-num span (alttaki geri dönüş)
      else if (target.closest('.footnote-num')) {
        const el = target.closest('.footnote-num') as HTMLElement;
        const dt = el.getAttribute('data-target');
        if (dt) {
          scrollToId = dt;
        } else {
          const num = el.textContent?.replace(/[\[\]]/g, '').trim();
          if (num) scrollToId = 'fnref-' + num;
        }
      }
      // Eski <a> format - href'e bak
      else if (target.closest('a')) {
        const a = target.closest('a') as HTMLAnchorElement;
        const href = a.getAttribute('href') || '';
        // #fn- #_ftn #fnref- #_ftnref pattern'ları
        if (href.match(/^#(fn-|_ftn|fnref-|_ftnref)/)) {
          scrollToId = href.substring(1);
        }
      }

      if (!scrollToId) return;

      e.preventDefault();
      e.stopPropagation();

      const el = document.getElementById(scrollToId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('footnote-highlight');
        setTimeout(() => el.classList.remove('footnote-highlight'), 2000);
      }
    }, true); // capture phase

    // Hover tooltip
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      let num = '';

      // footnote-ref span
      const refSpan = target.closest('.footnote-ref') as HTMLElement;
      if (refSpan) {
        num = refSpan.getAttribute('data-footnote') || refSpan.textContent?.replace(/[\[\]]/g, '').trim() || '';
      }
      // eski <a> format
      else {
        const a = target.closest('a') as HTMLAnchorElement;
        if (a) {
          const href = a.getAttribute('href') || '';
          const match = href.match(/^#(?:fn-|_ftn)(\d+)/);
          if (match) num = match[1];
        }
      }

      if (!num) return;

      // Dipnot öğesini bul
      const item = document.getElementById('fn-' + num)
        || document.getElementById('_ftn' + num)
        || document.querySelector(`[id="fn-${num}"]`);
      if (!item) return;

      // Metin al - numara kısmını çıkar
      let text = item.textContent || '';
      text = text.replace(/^\s*\[\d+\]\s*/, '').trim();
      if (!text) return;

      const triggerEl = refSpan || target.closest('a') || target;
      const rect = triggerEl.getBoundingClientRect();

      tooltip.textContent = text;
      tooltip.style.display = 'block';
      tooltip.style.left = rect.left + rect.width / 2 + 'px';
      tooltip.style.top = (rect.top - 8) + 'px';
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('.footnote-ref') || target.closest('a')) {
        tooltip.style.display = 'none';
      }
    });
  }, []);
}

// Eski API uyumluluğu - artık ref'e gerek yok
export function useFootnotes(_ref: unknown, _deps: unknown[] = []) {
  useGlobalFootnotes();
}
