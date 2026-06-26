// Resizable Image Extension for TipTap
import { Node } from '@tiptap/core';
import type { RawCommands } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useState, useRef } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Trash2,
  Edit3,
  WrapText,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ImageEditor } from './ImageEditor';

interface ImageNodeProps {
  node: {
    attrs: {
      src: string;
      alt: string;
      title: string;
      width: string | number | null;
      height: string | number | null;
      alignment: 'left' | 'center' | 'right';
      float: 'none' | 'left' | 'right';
      caption: string;
    };
  };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
  selected: boolean;
}

// Görsel Bileşeni
function ImageComponent({ node, updateAttributes, deleteNode, selected }: ImageNodeProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const { src, alt, width, height, alignment, float: imageFloat, caption } = node.attrs;

  // Düzenlenmiş görseli kaydet
  const handleEditorSave = (editedSrc: string) => {
    updateAttributes({ src: editedSrc });
    setIsEditorOpen(false);
  };

  // Yüzde genişlik kontrolü
  const isPercentWidth = typeof width === 'string' && width.includes('%');

  // Boyut hesaplama
  const getStyle = () => {
    const style: React.CSSProperties = {};
    if (isPercentWidth) {
      // Yüzde genişlikte wrapper zaten boyutu ayarlıyor, resim %100 olsun
      style.width = '100%';
    } else if (width) {
      style.width = `${width}px`;
    }
    if (height) {
      style.height = typeof height === 'string' && height.includes('%') ? height : `${height}px`;
    }
    return style;
  };

  // Hizalama ve float için wrapper style
  const getWrapperStyle = (): React.CSSProperties => {
    // Float aktifse
    if (imageFloat === 'left') {
      const style: React.CSSProperties = {
        float: 'left',
        marginRight: isPercentWidth ? '0.5%' : '1rem',
        marginBottom: '0.5rem',
      };
      if (isPercentWidth) {
        style.width = width as string;
      }
      return style;
    }
    if (imageFloat === 'right') {
      const style: React.CSSProperties = {
        float: 'right',
        marginLeft: isPercentWidth ? '0.5%' : '1rem',
        marginBottom: '0.5rem',
      };
      if (isPercentWidth) {
        style.width = width as string;
      }
      return style;
    }

    // Float yoksa normal hizalama
    switch (alignment) {
      case 'left':
        return { display: 'flex', justifyContent: 'flex-start' };
      case 'right':
        return { display: 'flex', justifyContent: 'flex-end' };
      case 'center':
      default:
        return { display: 'flex', justifyContent: 'center' };
    }
  };

  // Resize başlat
  const startResize = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const img = imageRef.current;
    if (!img) return;

    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: img.offsetWidth,
      height: img.offsetHeight,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startPos.current.x;
      const deltaY = moveEvent.clientY - startPos.current.y;

      let newWidth = startPos.current.width;
      let newHeight = startPos.current.height;

      // Köşeye göre boyut hesapla
      if (corner.includes('e')) newWidth = startPos.current.width + deltaX;
      if (corner.includes('w')) newWidth = startPos.current.width - deltaX;
      if (corner.includes('s')) newHeight = startPos.current.height + deltaY;
      if (corner.includes('n')) newHeight = startPos.current.height - deltaY;

      // En/boy oranını koru (Shift tuşu ile serbest)
      if (!moveEvent.shiftKey) {
        const aspectRatio = startPos.current.width / startPos.current.height;
        if (corner === 'se' || corner === 'nw') {
          newHeight = newWidth / aspectRatio;
        } else if (corner === 'sw' || corner === 'ne') {
          newHeight = newWidth / aspectRatio;
        }
      }

      // Minimum boyut
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      updateAttributes({ width: Math.round(newWidth), height: Math.round(newHeight) });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Hızlı boyut presetleri
  const setPresetSize = (preset: 'small' | 'medium' | 'large' | 'full') => {
    const img = imageRef.current;
    if (!img) return;

    const containerWidth = containerRef.current?.parentElement?.offsetWidth || 800;
    const naturalRatio = img.naturalWidth / img.naturalHeight;

    let newWidth: number;
    switch (preset) {
      case 'small':
        newWidth = Math.min(200, containerWidth * 0.25);
        break;
      case 'medium':
        newWidth = Math.min(400, containerWidth * 0.5);
        break;
      case 'large':
        newWidth = Math.min(600, containerWidth * 0.75);
        break;
      case 'full':
        newWidth = containerWidth - 48; // padding için
        break;
      default:
        newWidth = 400;
    }

    updateAttributes({
      width: Math.round(newWidth),
      height: Math.round(newWidth / naturalRatio),
    });
  };

  // Orijinal boyuta dön
  const resetSize = () => {
    const img = imageRef.current;
    if (img) {
      updateAttributes({ width: null, height: null });
    }
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`relative ${imageFloat === 'none' ? 'my-4' : 'my-2'}`}
      style={getWrapperStyle()}
      data-float={imageFloat}
    >
      <div
        className={`relative inline-block group ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        onMouseEnter={() => setShowToolbar(true)}
        onMouseLeave={() => !isResizing && setShowToolbar(false)}
      >
        {/* Görsel */}
        <img
          ref={imageRef}
          src={src}
          alt={alt || ''}
          style={getStyle()}
          className={`max-w-full rounded-lg transition-shadow ${
            selected ? 'shadow-lg' : 'hover:shadow-md'
          }`}
          draggable={false}
        />

        {/* Üst Toolbar */}
        {(showToolbar || selected) && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg border p-1 z-10">
            {/* Hizalama */}
            <Button
              variant={alignment === 'left' && imageFloat === 'none' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateAttributes({ alignment: 'left', float: 'none' })}
              title="Sola Hizala"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={alignment === 'center' && imageFloat === 'none' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateAttributes({ alignment: 'center', float: 'none' })}
              title="Ortala"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={alignment === 'right' && imageFloat === 'none' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => updateAttributes({ alignment: 'right', float: 'none' })}
              title="Sağa Hizala"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Metin Akışı (Text Wrap) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={imageFloat !== 'none' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  title="Metin Akışı"
                >
                  <WrapText className="h-3 w-3 mr-1" />
                  Sarma
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 mb-2">Metin Akışı</p>
                  <Button
                    variant={imageFloat === 'none' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => updateAttributes({ float: 'none' })}
                  >
                    <Square className="h-3 w-3 mr-2" />
                    Satır İçi (Sarma Yok)
                  </Button>
                  <Button
                    variant={imageFloat === 'left' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => updateAttributes({ float: 'left', alignment: 'left' })}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded flex items-center justify-start p-0.5">
                        <div className="w-1.5 h-3 bg-blue-500 rounded-sm" />
                      </div>
                      Solda - Metin Sağda
                    </div>
                  </Button>
                  <Button
                    variant={imageFloat === 'right' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => updateAttributes({ float: 'right', alignment: 'right' })}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border rounded flex items-center justify-end p-0.5">
                        <div className="w-1.5 h-3 bg-blue-500 rounded-sm" />
                      </div>
                      Sağda - Metin Solda
                    </div>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Boyut Presetleri */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" title="Boyut">
                  <Maximize2 className="h-3 w-3 mr-1" />
                  Boyut
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => setPresetSize('small')}
                  >
                    Küçük (25%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => setPresetSize('medium')}
                  >
                    Orta (50%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => setPresetSize('large')}
                  >
                    Büyük (75%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => setPresetSize('full')}
                  >
                    Tam Genişlik
                  </Button>
                  <div className="border-t my-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={resetSize}
                  >
                    <Minimize2 className="h-3 w-3 mr-1" />
                    Orijinal Boyut
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Düzenle */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIsEditorOpen(true)}
              title="Görseli Düzenle"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Düzenle
            </Button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Sil */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={deleteNode}
              title="Görseli Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Resize Handle'lar */}
        {(showToolbar || selected) && (
          <>
            {/* Köşeler */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'nw')}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'ne')}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'sw')}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'se')}
            />

            {/* Kenarlar */}
            <div
              className="absolute top-1/2 -left-1 w-2 h-6 -translate-y-1/2 bg-blue-500 rounded cursor-w-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'w')}
            />
            <div
              className="absolute top-1/2 -right-1 w-2 h-6 -translate-y-1/2 bg-blue-500 rounded cursor-e-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'e')}
            />
            <div
              className="absolute -top-1 left-1/2 w-6 h-2 -translate-x-1/2 bg-blue-500 rounded cursor-n-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 'n')}
            />
            <div
              className="absolute -bottom-1 left-1/2 w-6 h-2 -translate-x-1/2 bg-blue-500 rounded cursor-s-resize hover:bg-blue-600 transition-colors"
              onMouseDown={(e) => startResize(e, 's')}
            />
          </>
        )}

        {/* Boyut Göstergesi */}
        {isResizing && width && height && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {Math.round(Number(width))} × {Math.round(Number(height))}
          </div>
        )}
      </div>

      {/* Caption — yalnızca açıklama varsa ya da görsel seçiliyken/üzerine gelince göster.
          Böylece boş "Açıklama ekleyin" metni her görselin (örn. yapıştırılan) altında durmaz. */}
      {(caption || selected || showToolbar) && (
        <input
          type="text"
          value={caption || ''}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Açıklama ekleyin (isteğe bağlı)…"
          className="w-full text-center text-sm text-gray-500 italic mt-1 bg-transparent border-0 outline-none focus:text-gray-700 placeholder:text-gray-300"
        />
      )}

      {/* Görsel Düzenleme Modal */}
      <ImageEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageSrc={src}
        onSave={handleEditorSave}
      />
    </NodeViewWrapper>
  );
}

// TipTap Extension
export const ResizableImage = Node.create({
  name: 'resizableImage',

  // Block olarak davran ama float ile inline gibi görünsün
  group: 'block',

  atom: true,

  draggable: true,

  // Inline mod için gerekli - float çalışması için
  inline: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      alignment: {
        default: 'center',
      },
      float: {
        default: 'none',
      },
      caption: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="resizable-image"]',
        getAttrs: (element) => {
          const img = element.querySelector('img');
          if (!img) return false;
          const figcaption = element.querySelector('figcaption');
          // Figure veya img'den genişlik al (yüzde dahil)
          const figWidth = element.style.width;
          const imgWidth = img.style.width;
          let width: string | number | null = null;
          if (figWidth && figWidth.includes('%')) {
            width = figWidth;
          } else if (imgWidth && imgWidth.includes('%')) {
            width = imgWidth;
          } else if (imgWidth) {
            width = parseInt(imgWidth) || null;
          }
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width,
            height: img.style.height ? parseInt(img.style.height) : null,
            alignment: element.getAttribute('data-alignment') || 'center',
            float: element.getAttribute('data-float') || 'none',
            caption: figcaption?.textContent || '',
          };
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => ({
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          title: element.getAttribute('title'),
          width: element.style.width ? parseInt(element.style.width) : null,
          height: element.style.height ? parseInt(element.style.height) : null,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, height, alignment, float: imageFloat, caption } = HTMLAttributes;

    const isPercent = typeof width === 'string' && width.includes('%');

    // Figure style hesapla
    let figureStyle = '';
    let figureClass = 'resizable-image';

    if (imageFloat === 'left') {
      figureStyle = `float: left; margin-right: ${isPercent ? '0.5%' : '1rem'}; margin-bottom: 0.5rem;`;
      if (isPercent) figureStyle += ` width: ${width};`;
      figureClass += ' float-left';
    } else if (imageFloat === 'right') {
      figureStyle = `float: right; margin-left: ${isPercent ? '0.5%' : '1rem'}; margin-bottom: 0.5rem;`;
      if (isPercent) figureStyle += ` width: ${width};`;
      figureClass += ' float-right';
    } else {
      if (alignment === 'left') {
        figureStyle = 'display: flex; flex-direction: column; align-items: flex-start;';
      } else if (alignment === 'right') {
        figureStyle = 'display: flex; flex-direction: column; align-items: flex-end;';
      } else {
        figureStyle = 'display: flex; flex-direction: column; align-items: center;';
      }
    }

    // Img style hesapla
    let imgStyle = 'max-width: 100%; border-radius: 0.5rem;';
    if (isPercent) {
      imgStyle += ' width: 100%;';
    } else if (width) {
      imgStyle += ` width: ${width}px;`;
    }
    if (height) {
      imgStyle += typeof height === 'string' && height.includes('%') ? ` height: ${height};` : ` height: ${height}px;`;
    }

    const children: unknown[] = [
      [
        'img',
        {
          src,
          alt: alt || '',
          title: title || '',
          style: imgStyle,
        },
      ],
    ];

    // Caption varsa ekle
    if (caption) {
      children.push([
        'figcaption',
        { style: 'text-align: center; font-size: 0.875rem; color: #6B7280; font-style: italic; margin-top: 0.5rem;' },
        caption,
      ]);
    }

    return [
      'figure',
      {
        'data-type': 'resizable-image',
        'data-alignment': alignment || 'center',
        'data-float': imageFloat || 'none',
        style: figureStyle,
        class: figureClass,
      },
      ...children,
    ];
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(ImageComponent as any);
  },

  addCommands() {
    return {
      setResizableImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }: { commands: { insertContent: (content: Record<string, unknown>) => boolean } }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    } as Partial<RawCommands>;
  },
});

export default ResizableImage;
