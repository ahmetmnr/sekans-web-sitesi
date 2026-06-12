// Image Gallery Extension for TipTap - CSS Grid tabanlı galeri
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GalleryNodeProps {
  node: {
    attrs: {
      cols: number;
      images: string; // JSON encoded array of {src, alt}
    };
  };
  updateAttributes: (attrs: Record<string, unknown>) => void;
  deleteNode: () => void;
  selected: boolean;
}

interface GalleryImage {
  src: string;
  alt: string;
}

// Galeri Bileşeni (editör içinde)
function GalleryComponent({ node, deleteNode, selected }: GalleryNodeProps) {
  const { cols, images: imagesJson } = node.attrs;
  const images: GalleryImage[] = JSON.parse(imagesJson || '[]');

  return (
    <NodeViewWrapper className={`my-4 relative group ${selected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`}>
      <div
        className="image-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {images.map((img, i) => (
          <figure key={i} style={{ margin: 0 }}>
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '0.5rem',
                aspectRatio: '4/3',
              }}
              draggable={false}
            />
          </figure>
        ))}
      </div>

      {/* Silme butonu */}
      {selected && (
        <div className="absolute -top-3 -right-3 z-10">
          <Button
            variant="destructive"
            size="sm"
            className="h-7 w-7 p-0 rounded-full shadow-lg"
            onClick={deleteNode}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </NodeViewWrapper>
  );
}

// TipTap Extension
export const ImageGallery = Node.create({
  name: 'imageGallery',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      cols: {
        default: 2,
      },
      images: {
        default: '[]',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.image-grid',
        getAttrs: (element) => {
          // Kolon sayısını class'tan al
          let cols = 2;
          if (element.classList.contains('cols-3')) cols = 3;
          else if (element.classList.contains('cols-4')) cols = 4;
          else if (element.classList.contains('cols-2')) cols = 2;

          // Resimleri al
          const imgElements = element.querySelectorAll('img');
          const images: GalleryImage[] = Array.from(imgElements).map((img) => ({
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
          }));

          return {
            cols,
            images: JSON.stringify(images),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { cols, images: imagesJson } = HTMLAttributes;
    const images: GalleryImage[] = JSON.parse(imagesJson || '[]');

    const children = images.map((img) => [
      'figure',
      { style: 'margin: 0;' },
      [
        'img',
        {
          src: img.src,
          alt: img.alt,
          style: 'width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem; aspect-ratio: 4/3;',
        },
      ],
    ]);

    return [
      'div',
      {
        class: `image-grid cols-${cols}`,
      },
      ...children,
    ];
  },

  addNodeView() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ReactNodeViewRenderer(GalleryComponent as any);
  },
});

export default ImageGallery;
