import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/* ---------------------------------------------------------------------------
   ÖNİZLEME ÇERÇEVESİ — gerçek görüntü alanı genişliğinde, ölçeklenmiş.

   NEDEN <iframe>:
   Site duyarlıdır; punto, girinti ve dizin görseli genişliği `@media
   (min-width: 768px)` kurallarıyla masaüstünde büyür. Medya sorguları
   KAPSAYICININ değil, GÖRÜNTÜ ALANININ genişliğine bakar.

   Bu yüzden panele 358 piksellik bir kutu koyup "mobil görünüm" demek yanlış
   sonuç verir: panel masaüstü genişliğinde açıldığı için masaüstü kuralları
   devreye girer, dizin görseli 1,5 kat büyük çıkar ve başlıklar gerçekte
   olmayacağı kadar çok satıra bölünür. (Ölçüldü: kelime kelime bölünüyordu.)

   <iframe> kendi görüntü alanına sahiptir. Genişliği 390 verildiğinde tarayıcı
   gerçekten 390 piksellik bir ekran görür; medya sorguları da telefondaki gibi
   davranır. Ölçekleme (transform) yerleşimden SONRA uygulandığı için satır
   sonlarını değiştirmez, yalnızca sonucu küçültür.

   Stil sayfaları üst belgeden kopyalanır: geliştirmede <style>, üretimde
   <link rel="stylesheet"> olarak gelir; ikisi de taşınır.
   --------------------------------------------------------------------------- */

interface OnizlemeCercevesiProps {
  /** Taklit edilecek görüntü alanı genişliği (px). Ör. 1280 veya 390. */
  gorunumGenisligi: number;
  /** İçeriğe uygulanacak CSS değişkenleri (görünüm ayarları). */
  degiskenler?: React.CSSProperties;
  children: ReactNode;
}

export function OnizlemeCercevesi({
  gorunumGenisligi, degiskenler, children,
}: OnizlemeCercevesiProps) {
  const disRef = useRef<HTMLDivElement>(null);
  const cerceveRef = useRef<HTMLIFrameElement>(null);
  const [govde, setGovde] = useState<HTMLElement | null>(null);
  const [olcek, setOlcek] = useState(1);
  const [yukseklik, setYukseklik] = useState(400);

  // Çerçeve hazır olunca stilleri kopyala ve gövdeyi portala aç.
  useEffect(() => {
    const cerceve = cerceveRef.current;
    if (!cerceve) return;

    const hazirla = () => {
      const belge = cerceve.contentDocument;
      if (!belge) return;
      belge.documentElement.lang = 'tr';
      // Üst belgedeki stilleri taşı (yalnızca bir kez).
      if (!belge.head.querySelector('[data-onizleme-stil]')) {
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach((d) => {
          const kopya = d.cloneNode(true) as HTMLElement;
          kopya.setAttribute('data-onizleme-stil', '');
          belge.head.appendChild(kopya);
        });
        const temel = belge.createElement('style');
        temel.setAttribute('data-onizleme-stil', '');
        // Önizleme tıklanabilir olmasın: içindeki başlıklar gerçek bağlantıdır.
        temel.textContent = 'html,body{margin:0;padding:0;background:#fff;pointer-events:none}';
        belge.head.appendChild(temel);
      }
      setGovde(belge.body);
    };

    if (cerceve.contentDocument?.readyState === 'complete') hazirla();
    cerceve.addEventListener('load', hazirla);
    return () => cerceve.removeEventListener('load', hazirla);
  }, []);

  // Ölçek: panele sığdır. Yükseklik: çerçeve içeriğinden ölç.
  useEffect(() => {
    const dis = disRef.current;
    if (!dis || !govde) return;

    const olc = () => {
      const k = Math.min(1, dis.clientWidth / gorunumGenisligi);
      setOlcek(k);
      setYukseklik(Math.max(200, govde.scrollHeight));
    };
    olc();
    const izleyici = new ResizeObserver(olc);
    izleyici.observe(dis);
    izleyici.observe(govde);
    // Görseller yüklendikçe yükseklik değişir.
    const zamanlayici = window.setInterval(olc, 400);
    return () => { izleyici.disconnect(); window.clearInterval(zamanlayici); };
  }, [govde, gorunumGenisligi, children]);

  return (
    <div ref={disRef} style={{ height: yukseklik * olcek }} className="overflow-hidden">
      <iframe
        ref={cerceveRef}
        title="Önizleme"
        // Genişlik ÖZNİTELİK olarak verilir: çerçevenin görüntü alanı budur,
        // medya sorguları buna göre çalışır.
        width={gorunumGenisligi}
        height={yukseklik}
        style={{
          border: 0,
          transform: `scale(${olcek})`,
          transformOrigin: 'top left',
          display: 'block',
        }}
      >
      </iframe>
      {govde && createPortal(
        <div style={degiskenler}>{children}</div>,
        govde
      )}
    </div>
  );
}

export default OnizlemeCercevesi;
