import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ReadingIndicatorProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentDep?: string; // içerik değişiminde yeniden hesap (geriye dönük uyum)
}

/**
 * Okuma ilerleme göstergesi — minimal sürüm.
 * Sağ kenarda ince bir çizgi; yazı okundukça yukarıdan aşağı dolar.
 * Yüzde, süre, bölüm listesi gibi teknik öğeler bilinçli olarak yok.
 */
export default function ReadingIndicator({ contentRef }: ReadingIndicatorProps) {
  const [progress, setProgress] = useState(0);

  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const rect = el.getBoundingClientRect();
    const elTop = rect.top + window.scrollY;
    const elHeight = el.offsetHeight;
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    const start = elTop;
    const end = elTop + elHeight - windowHeight;

    let prog = 0;
    if (end <= start) {
      prog = 100;
    } else if (scrollY <= start) {
      prog = 0;
    } else if (scrollY >= end) {
      prog = 100;
    } else {
      prog = ((scrollY - start) / (end - start)) * 100;
    }
    setProgress(prog);
  }, [contentRef]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  return createPortal(
    <div
      className="fixed right-0 z-40 hidden md:block"
      style={{
        top: 73, // header yüksekliği
        height: 'calc(100vh - 73px)',
        width: 3,
        background: 'hsl(var(--border) / 0.6)',
      }}
      aria-hidden="true"
    >
      <div
        className="w-full origin-top"
        style={{
          height: `${progress}%`,
          background: 'hsl(var(--foreground) / 0.75)',
          transition: 'height 80ms linear',
        }}
      />
    </div>,
    document.body
  );
}
