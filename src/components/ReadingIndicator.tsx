import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Section {
  id: string;
  title: string;
  element: HTMLElement;
}

interface ReadingIndicatorProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentDep?: string;
}

export default function ReadingIndicator({ contentRef, contentDep }: ReadingIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const liquidFillRef = useRef<HTMLDivElement>(null);

  // Paragrafları bölüm olarak bul
  useEffect(() => {
    if (!contentRef.current) return;
    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      const pEls = contentRef.current.querySelectorAll('p');
      const items: Section[] = [];
      pEls.forEach((p, i) => {
        const text = p.textContent?.trim() || '';
        if (text.length < 20) return;
        const id = `reading-sec-${i}`;
        p.id = id;
        let snippet = text.substring(0, 30);
        const lastSpace = snippet.lastIndexOf(' ');
        if (lastSpace > 10) snippet = snippet.substring(0, lastSpace);
        items.push({ id, title: snippet + '…', element: p as HTMLElement });
      });
      setSections(items);
    }, 300);
    return () => clearTimeout(timer);
  }, [contentRef, contentDep]);

  // Scroll — yazı içeriğine göre ilerleme
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
      prog = Math.round(((scrollY - start) / (end - start)) * 100);
    }
    setProgress(prog);

    // Aktif bölüm
    if (sections.length === 0) return;
    let current = 0;
    const mid = windowHeight / 2;
    sections.forEach((sec, i) => {
      const secRect = sec.element.getBoundingClientRect();
      if (secRect.top <= mid) current = i;
    });
    setActiveSection(current);
  }, [contentRef, sections]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Baloncuk efekti
  useEffect(() => {
    const interval = setInterval(() => {
      if (!liquidFillRef.current) return;
      const bubble = document.createElement('div');
      const size = Math.random() * 6 + 3;
      Object.assign(bubble.style, {
        position: 'absolute',
        background: 'rgba(255,255,255,0.35)',
        borderRadius: '50%',
        width: size + 'px',
        height: size + 'px',
        left: Math.random() * 100 + '%',
        bottom: '0',
        animation: `bubble-rise ${Math.random() * 3 + 3}s ease-in forwards`,
      });
      liquidFillRef.current.appendChild(bubble);
      setTimeout(() => bubble.remove(), 6000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (index: number) => {
    const sec = sections[index];
    if (sec) {
      const top = sec.element.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const remaining = Math.max(1, Math.ceil((100 - progress) / 20));

  return createPortal(
    <>
      {/* CSS Animasyonları */}
      <style>{`
        @keyframes bubble-rise {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-80px) scale(1); opacity: 0; }
        }
        @keyframes indicator-wave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-4px) scaleY(1.2); }
        }
      `}</style>

      {/* Sağ — Liquid Sidebar (header altından başlar) */}
      <div
        className="fixed right-0 z-[999] overflow-hidden cursor-pointer border-l transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          top: 73, // header yüksekliği
          height: 'calc(100vh - 73px)',
          width: isHovered ? 280 : 50,
          background: isHovered ? '#0f0f0f' : 'rgba(250,250,250,0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: isHovered ? '#0f0f0f' : 'rgba(0,0,0,0.08)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Liquid fill */}
        <div
          ref={liquidFillRef}
          className="absolute bottom-0 left-0 w-full transition-[height] duration-100"
          style={{
            height: `${progress}%`,
            background: '#1a1a1a',
            boxShadow: '0 0 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Dalga */}
          <div
            className="absolute -top-[10px] left-0 w-full h-5"
            style={{
              background: 'inherit',
              borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
              animation: 'indicator-wave 3s ease-in-out infinite',
            }}
          />
        </div>

        {/* Minimal yazı — hover öncesi */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-[10px] tracking-[3px] font-semibold text-muted-foreground transition-opacity duration-300"
          style={{
            right: 16,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            opacity: isHovered ? 0 : 1,
          }}
        >
          KAYDIR
        </div>

        {/* Hover içerik */}
        <div
          className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-6 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'all' : 'none',
          }}
        >
          <div className="text-[2.5rem] font-extrabold text-white mb-1 tabular-nums">
            {progress}%
          </div>
          <div className="text-[10px] uppercase tracking-[2px] text-white/50 mb-6">
            Tamamlandı
          </div>

          {/* Kalan süre */}
          <div className="flex items-center gap-2 text-white/60 text-xs mb-6 pb-4 border-b border-white/10">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Kalan: <span className="text-white font-semibold">{remaining} dk</span></span>
          </div>

          <ul className="space-y-0 max-h-[40vh] overflow-y-auto">
            {sections.map((sec, i) => (
              <li
                key={sec.id}
                onClick={(e) => { e.stopPropagation(); scrollToSection(i); }}
                className="py-2.5 border-b border-white/10 cursor-pointer transition-all duration-300 text-[12px] truncate"
                style={{
                  color: i === activeSection ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontWeight: i === activeSection ? 600 : 400,
                }}
              >
                {i === activeSection && <span className="mr-2">→</span>}
                {sec.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Dot Navigation — sağda ortada */}
      <div
        className="fixed -translate-y-1/2 z-[1001] flex flex-col gap-3"
        style={{
          top: 'calc(50% + 36px)', // header offset
          right: isHovered ? 20 : 18,
        }}
      >
        {sections.map((sec, i) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(i)}
            title={sec.title}
            className="relative transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] rounded-full"
            style={{
              width: i === activeSection ? 8 : 5,
              height: i === activeSection ? 8 : 5,
              background: isHovered
                ? (i === activeSection ? '#fff' : 'rgba(255,255,255,0.25)')
                : (i === activeSection ? '#000' : 'rgba(0,0,0,0.15)'),
              transform: i === activeSection ? 'scale(1.3)' : 'scale(1)',
              boxShadow: i === activeSection
                ? (isHovered ? '0 0 15px rgba(255,255,255,0.3)' : '0 0 10px rgba(0,0,0,0.15)')
                : 'none',
            }}
          />
        ))}
      </div>
    </>,
    document.body
  );
}
