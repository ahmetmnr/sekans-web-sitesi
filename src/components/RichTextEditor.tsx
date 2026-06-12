// Zengin Metin Editörü - TipTap tabanlı
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
  Code,
  Pilcrow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* Geri Al / İleri Al */}
      <div className="flex gap-0.5 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Geri Al"
        >
          <Undo className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="İleri Al"
        >
          <Redo className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Başlıklar */}
      <div className="flex gap-0.5 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={editor.isActive('paragraph')}
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
          title="Paragraf"
        >
          <Pilcrow className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Başlık 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          title="Başlık 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Metin Biçimlendirme */}
      <div className="flex gap-0.5 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          title="Kalın"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          title="İtalik"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          title="Altı Çizili"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          title="Üstü Çizili"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          title="Kod"
        >
          <Code className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Hizalama */}
      <div className="flex gap-0.5 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('left').run()
          }
          title="Sola Hizala"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('center').run()
          }
          title="Ortala"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('right').run()
          }
          title="Sağa Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'justify' })}
          onPressedChange={() =>
            editor.chain().focus().setTextAlign('justify').run()
          }
          title="İki Yana Yasla"
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Listeler */}
      <div className="flex gap-0.5 mr-2 border-r pr-2">
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          title="Madde İşaretli Liste"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          title="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() =>
            editor.chain().focus().toggleBlockquote().run()
          }
          title="Alıntı"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() =>
            editor.chain().focus().setHorizontalRule().run()
          }
          title="Yatay Çizgi"
        >
          <Minus className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Link */}
      <div className="flex gap-0.5 mr-2 border-r pr-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={editor.isActive('link') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              title="Link Ekle"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div>
                <Label htmlFor="link-url">Link URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addLink}>
                  Ekle
                </Button>
                {editor.isActive('link') && (
                  <Button size="sm" variant="outline" onClick={removeLink}>
                    Kaldır
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Görsel */}
      <div className="flex gap-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Görsel Ekle"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <div>
                <Label htmlFor="image-url">Görsel URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/images/gorsel.jpg"
                />
              </div>
              <Button size="sm" onClick={addImage}>
                Ekle
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'İçeriğinizi buraya yazın...',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg max-w-none p-4 min-h-[300px] focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Content değiştiğinde editörü güncelle
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
