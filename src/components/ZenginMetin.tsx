import { temizZenginMetin } from '@/lib/zenginMetin';

interface ZenginMetinProps {
  html?: string | null;
  /** Sarmalayıcı etiket — varsayılan <span>. Başlıklarda h1/h2/h3 verilir. */
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

/**
 * Başlık/spot gösterimi. İçerik satır içi biçimlendirme taşıyabildiği için
 * HTML olarak basılır; etiketler beyaz listeden geçirilir.
 */
export function ZenginMetin({ html, as: Etiket = 'span', className }: ZenginMetinProps) {
  const temiz = temizZenginMetin(html ?? '');
  return <Etiket className={className} dangerouslySetInnerHTML={{ __html: temiz }} />;
}

export default ZenginMetin;
