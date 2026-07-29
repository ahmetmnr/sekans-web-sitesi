// Başlık ve spot için SATIR İÇİ biçimlendirme editörü.
//
// Neden ayrı bir editör: bu alanlar tek bir satır/paragraftır; paragraf stili,
// başlık seviyesi, görsel, tablo gibi blok işlemler burada anlamsız. Punto ve
// yazı tipi de sitenin sabit başlık tipografisinden gelir, editöre bırakılmaz.
// Bırakılanlar: kalın, italik, altı çizili, üstü çizili, alt/üst simge, bağlantı.
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Document } from '@tiptap/extension-document';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Link as LinkIcon,
  RemoveFormatting,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

/** Tek paragrafla sınırlı belge: ENTER yeni blok açamaz. */
const TekParagraf = Document.extend({ content: 'paragraph' });

interface SatirIciEditorProps {
  /** Satır içi HTML (dış <p> sarmalayıcısı OLMADAN). */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Metin alanının görünüm sınıfı (başlık büyük, spot orta vb.). */
  className?: string;
  /** Çok satıra yayılabilir mi (spot) — yalnızca görsel yükseklik farkı. */
  cokSatir?: boolean;
}

function AracButonu({
  aktif, onClick, ipucu, children,
}: {
  aktif?: boolean;
  onClick: () => void;
  ipucu: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={!!aktif}
          onPressedChange={onClick}
          className="h-7 w-7 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{ipucu}</TooltipContent>
    </Tooltip>
  );
}

/** getHTML() tek paragraf döndürür; dış <p> kabuğunu soy. */
function pKabugunuSoy(html: string): string {
  const m = html.match(/^\s*<p[^>]*>([\s\S]*)<\/p>\s*$/i);
  const ic = (m ? m[1] : html).trim();
  return ic === '<br>' || ic === '<br/>' || ic === '<br />' ? '' : ic;
}

export function SatirIciEditor({
  value, onChange, placeholder, className, cokSatir = false,
}: SatirIciEditorProps) {
  const [linkAcik, setLinkAcik] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      TekParagraf,
      // StarterKit'ten yalnızca satır içi işaretler + paragraf/metin kalır;
      // tüm blok düğümleri (başlık, liste, alıntı, kod, çizgi) kapatılır.
      StarterKit.configure({
        document: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        heading: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
        dropcursor: false,
        gapcursor: false,
        trailingNode: false,
        link: false,          // aşağıda kendi ayarımızla ekleniyor
        underline: false,     // aşağıda ayrıca ekleniyor
      }),
      Underline,
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value ? `<p>${value}</p>` : '',
    editorProps: {
      attributes: {
        class: `focus:outline-none ${cokSatir ? 'min-h-[3.5rem]' : 'min-h-[2rem]'}`,
      },
      // Yapıştırılan başlık/spot kaynağın fontunu, puntosunu, rengini TAŞIMAZ:
      // bu alanların tipografisi sitenin sabit başlık stilinden gelir.
      transformPastedHTML: (html) =>
        html.replace(/\sstyle="[^"]*"/gi, '').replace(/<\/?(font|span)[^>]*>/gi, ''),
    },
    onUpdate: ({ editor }) => onChange(pKabugunuSoy(editor.getHTML())),
    shouldRerenderOnTransaction: true,
  });

  // Dışarıdan gelen değer değişirse (kayıt yükleme) editörü tazele.
  useEffect(() => {
    if (!editor) return;
    const mevcut = pKabugunuSoy(editor.getHTML());
    if (value !== mevcut) editor.commands.setContent(value ? `<p>${value}</p>` : '');
    // value dışındaki bağımlılık editörün kendisi; içerik döngüsü olmasın.
  }, [value, editor]);

  if (!editor) return null;

  const linkEkle = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl('');
    setLinkAcik(false);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="group">
        <EditorContent
          editor={editor}
          className={`satirici-editor border-0 border-b rounded-none px-0 py-2 focus-within:border-gray-400 ${className ?? ''}`}
        />

        {/* Biçimlendirme çubuğu — alan odaklanınca belirginleşir */}
        <div className="flex items-center gap-0.5 mt-1 opacity-60 group-focus-within:opacity-100 transition-opacity">
          <AracButonu
            aktif={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            ipucu="Kalın (Ctrl+B)"
          >
            <BoldIcon className="h-3.5 w-3.5" />
          </AracButonu>
          <AracButonu
            aktif={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            ipucu="İtalik (Ctrl+I) — film/kitap adları için"
          >
            <ItalicIcon className="h-3.5 w-3.5" />
          </AracButonu>
          <AracButonu
            aktif={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            ipucu="Altı Çizili"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </AracButonu>
          <AracButonu
            aktif={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            ipucu="Üstü Çizili"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </AracButonu>
          <AracButonu
            aktif={editor.isActive('subscript')}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            ipucu="Alt Simge"
          >
            <SubscriptIcon className="h-3.5 w-3.5" />
          </AracButonu>
          <AracButonu
            aktif={editor.isActive('superscript')}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            ipucu="Üst Simge"
          >
            <SuperscriptIcon className="h-3.5 w-3.5" />
          </AracButonu>

          <Popover open={linkAcik} onOpenChange={setLinkAcik}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <Label className="text-xs font-medium">Bağlantı adresi</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && linkEkle()}
              />
              <div className="flex gap-2 mt-2">
                <Button type="button" size="sm" onClick={linkEkle}>Ekle</Button>
                {editor.isActive('link') && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => { editor.chain().focus().unsetLink().run(); setLinkAcik(false); }}
                  >
                    Kaldır
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <AracButonu
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            ipucu="Biçimlendirmeyi Temizle"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </AracButonu>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default SatirIciEditor;
