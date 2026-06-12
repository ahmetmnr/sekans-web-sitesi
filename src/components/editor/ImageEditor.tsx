// Görsel Düzenleme Modal Bileşeni
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Sun,
  Contrast,
  Droplets,
  Palette,
  Undo2,
  Check,
  X,
} from 'lucide-react';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSave: (editedImageSrc: string) => void;
}

interface ImageTransform {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  scale: number;
}

const defaultTransform: ImageTransform = {
  rotation: 0,
  flipX: false,
  flipY: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,
  scale: 100,
};

export function ImageEditor({ isOpen, onClose, imageSrc, onSave }: ImageEditorProps) {
  const [transform, setTransform] = useState<ImageTransform>(defaultTransform);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const cropStartRef = useRef({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [activeTab, setActiveTab] = useState('transform');

  // Görsel yükle
  useEffect(() => {
    if (isOpen && imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        renderCanvas();
      };
      img.src = imageSrc;
    }
  }, [isOpen, imageSrc]);

  // Canvas'ı render et
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas boyutunu ayarla
    const maxSize = 500;
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dönüşümleri uygula
    ctx.save();

    // Merkeze taşı
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Döndür
    ctx.rotate((transform.rotation * Math.PI) / 180);

    // Yansıt
    ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);

    // Ölçekle
    const scale = transform.scale / 100;
    ctx.scale(scale, scale);

    // Filtreler
    ctx.filter = `
      brightness(${transform.brightness}%)
      contrast(${transform.contrast}%)
      saturate(${transform.saturation}%)
      blur(${transform.blur}px)
    `;

    // Görseli çiz
    ctx.drawImage(
      img,
      -canvas.width / 2 / scale,
      -canvas.height / 2 / scale,
      canvas.width / scale,
      canvas.height / scale
    );

    ctx.restore();
  }, [transform]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Döndürme
  const rotate = (degrees: number) => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360,
    }));
  };

  // Yansıtma
  const flip = (axis: 'x' | 'y') => {
    setTransform((prev) => ({
      ...prev,
      [axis === 'x' ? 'flipX' : 'flipY']: !prev[axis === 'x' ? 'flipX' : 'flipY'],
    }));
  };

  // Sıfırla
  const reset = () => {
    setTransform(defaultTransform);
    setIsCropping(false);
    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  };

  // Kaydet
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Kırpma uygula
    if (isCropping) {
      const cropCanvas = document.createElement('canvas');
      const ctx = cropCanvas.getContext('2d');
      if (!ctx) return;

      const cropX = (cropArea.x / 100) * canvas.width;
      const cropY = (cropArea.y / 100) * canvas.height;
      const cropW = (cropArea.width / 100) * canvas.width;
      const cropH = (cropArea.height / 100) * canvas.height;

      cropCanvas.width = cropW;
      cropCanvas.height = cropH;

      ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      onSave(cropCanvas.toDataURL('image/png'));
    } else {
      onSave(canvas.toDataURL('image/png'));
    }

    onClose();
  };

  // Kırpma başlat
  const handleCropMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCropping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    cropStartRef.current = { x, y };
    setIsDraggingCrop(true);
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCrop || !isCropping) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const startX = Math.min(cropStartRef.current.x, x);
    const startY = Math.min(cropStartRef.current.y, y);
    const width = Math.abs(x - cropStartRef.current.x);
    const height = Math.abs(y - cropStartRef.current.y);

    setCropArea({
      x: Math.max(0, startX),
      y: Math.max(0, startY),
      width: Math.min(100 - startX, width),
      height: Math.min(100 - startY, height),
    });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Görsel Düzenle</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Önizleme */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg p-4 relative min-h-[400px]">
            <div
              className="relative"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            >
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[400px] rounded shadow-lg"
              />

              {/* Kırpma Alanı */}
              {isCropping && (
                <>
                  {/* Karartma */}
                  <div
                    className="absolute inset-0 bg-black/50 pointer-events-none"
                    style={{
                      clipPath: `polygon(
                        0 0,
                        100% 0,
                        100% 100%,
                        0 100%,
                        0 0,
                        ${cropArea.x}% ${cropArea.y}%,
                        ${cropArea.x}% ${cropArea.y + cropArea.height}%,
                        ${cropArea.x + cropArea.width}% ${cropArea.y + cropArea.height}%,
                        ${cropArea.x + cropArea.width}% ${cropArea.y}%,
                        ${cropArea.x}% ${cropArea.y}%
                      )`,
                    }}
                  />
                  {/* Kırpma Çerçevesi */}
                  <div
                    className="absolute border-2 border-white border-dashed pointer-events-none"
                    style={{
                      left: `${cropArea.x}%`,
                      top: `${cropArea.y}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`,
                    }}
                  >
                    {/* Köşe işaretleri */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Kontroller */}
          <div className="w-72 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transform" className="text-xs">Dönüşüm</TabsTrigger>
                <TabsTrigger value="adjust" className="text-xs">Ayarlar</TabsTrigger>
                <TabsTrigger value="crop" className="text-xs">Kırp</TabsTrigger>
              </TabsList>

              {/* Dönüşüm */}
              <TabsContent value="transform" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Döndür</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotate(-90)}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      -90°
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotate(90)}
                      className="flex-1"
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      +90°
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Açı</span>
                      <span>{transform.rotation}°</span>
                    </div>
                    <Slider
                      value={[transform.rotation]}
                      onValueChange={([value]) =>
                        setTransform((prev) => ({ ...prev, rotation: value }))
                      }
                      min={0}
                      max={360}
                      step={1}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Yansıt</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={transform.flipX ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => flip('x')}
                      className="flex-1"
                    >
                      <FlipHorizontal className="h-4 w-4 mr-1" />
                      Yatay
                    </Button>
                    <Button
                      variant={transform.flipY ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => flip('y')}
                      className="flex-1"
                    >
                      <FlipVertical className="h-4 w-4 mr-1" />
                      Dikey
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Ölçek</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Boyut</span>
                      <span>{transform.scale}%</span>
                    </div>
                    <Slider
                      value={[transform.scale]}
                      onValueChange={([value]) =>
                        setTransform((prev) => ({ ...prev, scale: value }))
                      }
                      min={50}
                      max={200}
                      step={5}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Ayarlar */}
              <TabsContent value="adjust" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium flex-1">Parlaklık</Label>
                    <span className="text-xs text-gray-500">{transform.brightness}%</span>
                  </div>
                  <Slider
                    value={[transform.brightness]}
                    onValueChange={([value]) =>
                      setTransform((prev) => ({ ...prev, brightness: value }))
                    }
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium flex-1">Kontrast</Label>
                    <span className="text-xs text-gray-500">{transform.contrast}%</span>
                  </div>
                  <Slider
                    value={[transform.contrast]}
                    onValueChange={([value]) =>
                      setTransform((prev) => ({ ...prev, contrast: value }))
                    }
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium flex-1">Doygunluk</Label>
                    <span className="text-xs text-gray-500">{transform.saturation}%</span>
                  </div>
                  <Slider
                    value={[transform.saturation]}
                    onValueChange={([value]) =>
                      setTransform((prev) => ({ ...prev, saturation: value }))
                    }
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm font-medium flex-1">Bulanıklık</Label>
                    <span className="text-xs text-gray-500">{transform.blur}px</span>
                  </div>
                  <Slider
                    value={[transform.blur]}
                    onValueChange={([value]) =>
                      setTransform((prev) => ({ ...prev, blur: value }))
                    }
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>
              </TabsContent>

              {/* Kırpma */}
              <TabsContent value="crop" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Button
                    variant={isCropping ? 'secondary' : 'outline'}
                    onClick={() => setIsCropping(!isCropping)}
                    className="w-full"
                  >
                    <Crop className="h-4 w-4 mr-2" />
                    {isCropping ? 'Kırpma Aktif' : 'Kırpmayı Başlat'}
                  </Button>

                  {isCropping && (
                    <p className="text-xs text-gray-500 text-center">
                      Görsel üzerinde fare ile kırpma alanı seçin
                    </p>
                  )}
                </div>

                {/* Hazır Oranlar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hazır Oranlar</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCropping(true);
                        setCropArea({ x: 10, y: 10, width: 80, height: 80 });
                      }}
                    >
                      1:1 Kare
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCropping(true);
                        setCropArea({ x: 0, y: 15, width: 100, height: 56 });
                      }}
                    >
                      16:9
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCropping(true);
                        setCropArea({ x: 0, y: 12.5, width: 100, height: 75 });
                      }}
                    >
                      4:3
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsCropping(true);
                        setCropArea({ x: 10, y: 0, width: 67, height: 100 });
                      }}
                    >
                      2:3 Portre
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Sıfırla Butonu */}
            <Button variant="outline" onClick={reset} className="w-full">
              <Undo2 className="h-4 w-4 mr-2" />
              Tümünü Sıfırla
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Değişiklikleri Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImageEditor;
