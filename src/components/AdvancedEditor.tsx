// Gelişmiş Dergi Editörü - Word/Google Docs tarzı
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { ResizableImage } from './editor/ResizableImage';
import { ImageGallery } from './editor/ImageGallery';
import { FootnoteRef, FootnoteItem, FootnotesSection } from './editor/FootnoteExtension';
import { ParagraphStyle } from './editor/ParagraphStyle';
import { AIEditModal } from './editor/AIEditModal';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import FontFamily from '@tiptap/extension-font-family';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { api } from '@/lib/api';
import { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
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
  Heading1,
  Heading2,
  Pilcrow,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Highlighter,
  Table as TableIcon,
  Plus,
  Trash2,
  RemoveFormatting,
  Type,
  ChevronDown,
  LetterText,
  Indent,
  Outdent,
  FileCode,
  Rows,
  Columns,
  Maximize,
  Minimize,
  Upload,
  Link2,
  LayoutGrid,
  BookmarkPlus,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdvancedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Font aileleri
const fontFamilies = [
  { name: 'Varsayılan', value: '' },
  { name: 'Serif (Garamond)', value: 'Cormorant Garamond, Georgia, serif' },
  { name: 'Sans-serif (Inter)', value: 'Inter, system-ui, sans-serif' },
  { name: 'Monospace', value: 'ui-monospace, monospace' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
];

// Metin renkleri
const textColors = [
  { name: 'Siyah', value: '#000000' },
  { name: 'Koyu Gri', value: '#374151' },
  { name: 'Gri', value: '#6B7280' },
  { name: 'Açık Gri', value: '#9CA3AF' },
  { name: 'Beyaz', value: '#FFFFFF' },
  { name: 'Koyu Kırmızı', value: '#991B1B' },
  { name: 'Kırmızı', value: '#DC2626' },
  { name: 'Açık Kırmızı', value: '#F87171' },
  { name: 'Koyu Turuncu', value: '#9A3412' },
  { name: 'Turuncu', value: '#EA580C' },
  { name: 'Açık Turuncu', value: '#FB923C' },
  { name: 'Koyu Sarı', value: '#854D0E' },
  { name: 'Sarı', value: '#CA8A04' },
  { name: 'Açık Sarı', value: '#FACC15' },
  { name: 'Koyu Yeşil', value: '#166534' },
  { name: 'Yeşil', value: '#16A34A' },
  { name: 'Açık Yeşil', value: '#4ADE80' },
  { name: 'Koyu Mavi', value: '#1E40AF' },
  { name: 'Mavi', value: '#2563EB' },
  { name: 'Açık Mavi', value: '#60A5FA' },
  { name: 'Koyu Mor', value: '#6B21A8' },
  { name: 'Mor', value: '#9333EA' },
  { name: 'Açık Mor', value: '#C084FC' },
  { name: 'Koyu Pembe', value: '#9D174D' },
  { name: 'Pembe', value: '#DB2777' },
  { name: 'Açık Pembe', value: '#F472B6' },
];

// Vurgulama renkleri
const highlightColors = [
  { name: 'Sarı', value: '#FEF08A' },
  { name: 'Açık Sarı', value: '#FEF9C3' },
  { name: 'Yeşil', value: '#BBF7D0' },
  { name: 'Açık Yeşil', value: '#DCFCE7' },
  { name: 'Mavi', value: '#BFDBFE' },
  { name: 'Açık Mavi', value: '#DBEAFE' },
  { name: 'Mor', value: '#DDD6FE' },
  { name: 'Açık Mor', value: '#EDE9FE' },
  { name: 'Pembe', value: '#FBCFE8' },
  { name: 'Açık Pembe', value: '#FCE7F3' },
  { name: 'Turuncu', value: '#FED7AA' },
  { name: 'Açık Turuncu', value: '#FFEDD5' },
  { name: 'Kırmızı', value: '#FECACA' },
  { name: 'Açık Kırmızı', value: '#FEE2E2' },
  { name: 'Gri', value: '#E5E7EB' },
  { name: 'Açık Gri', value: '#F3F4F6' },
];

// Toolbar Butonu
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
  className = '',
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={onClick}
          disabled={disabled}
          className={`h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700 ${className}`}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

// Galeri Grid Seçici - Word tarzı satır/kolon seçimi
function GalleryGridPicker({ onSelect }: { onSelect: (rows: number, cols: number) => void }) {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const maxRows = 4;
  const maxCols = 4;

  return (
    <div className="p-3">
      <p className="text-xs font-medium text-gray-700 mb-2">Galeri Boyutu Seçin</p>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows * maxCols }).map((_, i) => {
          const row = Math.floor(i / maxCols) + 1;
          const col = (i % maxCols) + 1;
          const isHighlighted = row <= hoverRow && col <= hoverCol;
          return (
            <button
              key={i}
              className={`w-7 h-7 border-2 rounded transition-all ${
                isHighlighted
                  ? 'bg-blue-500 border-blue-600'
                  : 'bg-gray-100 border-gray-300 hover:border-gray-400'
              }`}
              onMouseEnter={() => { setHoverRow(row); setHoverCol(col); }}
              onClick={() => onSelect(row, col)}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {hoverRow > 0 && hoverCol > 0
          ? `${hoverCol}×${hoverRow} (${hoverCol * hoverRow} görsel)`
          : 'Satır ve kolon seçin'}
      </p>
    </div>
  );
}

// Ana Toolbar
function MainToolbar({ editor, isFullscreen, onToggleFullscreen, onAIClick, showInvisibles, onToggleInvisibles }: {
  editor: ReturnType<typeof useEditor>;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onAIClick: () => void;
  showInvisibles: boolean;
  onToggleInvisibles: () => void;
}) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Galeri state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryGrid, setGalleryGrid] = useState<{ rows: number; cols: number } | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setLinkOpen(false);
  };

  const addImage = () => {
    if (imageUrl) {
      // ResizableImage extension komutunu kullan
      editor.chain().focus().insertContent({
        type: 'resizableImage',
        attrs: {
          src: imageUrl,
          alt: imageAlt,
          alignment: 'center',
        },
      }).run();
      resetImageState();
    }
  };

  const resetImageState = () => {
    setImageUrl('');
    setImageAlt('');
    setImagePreview(null);
    setImageOpen(false);
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin.');
      return;
    }
    // Dosyayı sunucuya yükle; kalıcı URL'i kullan (base64 makaleyi/DB'yi şişirir).
    try {
      const { url } = await api.uploadFile(file, 'image');
      setImagePreview(url);
      setImageUrl(url);
    } catch (err) {
      alert((err as Error).message || 'Görsel yüklenemedi.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Stil menüsü etiketi - imlecin bulunduğu bloğun stilini gösterir
  const getCurrentStyle = () => {
    if (editor.isActive('blockquote')) return 'Blok Alıntı';
    if (editor.isActive('heading', { level: 1 })) return 'Başlık 1';
    if (editor.isActive('heading', { level: 2 })) return 'Başlık 2';
    const ds = editor.getAttributes('paragraph').dataStyle as string | null;
    if (ds === 'title' || ds === 'title-author') return 'Yazı Başlığı';
    if (ds === 'author') return 'Yazar Adı';
    if (ds === 'section') return 'Bölüm Başlığı';
    if (ds === 'filmkunye') return 'Künye';
    if (ds === 'epigraf') return 'Epigraf';
    return 'Ana Metin';
  };

  // Özel paragraf stilini uygula: paragrafa çevir, data-style ata ve
  // stile uygun varsayılan hizalamayı ver (editör sonradan değiştirebilir).
  const applyParagraphStyle = (
    style: 'title' | 'author' | 'section' | 'filmkunye' | 'epigraf' | null,
    align: 'left' | 'center' | 'right' | 'justify',
  ) => {
    editor
      .chain()
      .focus()
      .setParagraph()
      .updateAttributes('paragraph', { dataStyle: style })
      .setTextAlign(align)
      .run();
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="sticky top-0 z-40 bg-white border-b">
        {/* Birinci Satır - Temel İşlemler */}
        <div className="flex items-center gap-1 p-1.5 border-b bg-gray-50 flex-wrap">
          {/* Geri/İleri */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Geri Al (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="İleri Al (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Ailesi */}
          <Select
            value={editor.getAttributes('textStyle').fontFamily || ''}
            onValueChange={(value) => {
              if (value) {
                editor.chain().focus().setFontFamily(value).run();
              } else {
                editor.chain().focus().unsetFontFamily().run();
              }
            }}
          >
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Yazı Tipi" />
            </SelectTrigger>
            <SelectContent>
              {fontFamilies.map((font) => (
                <SelectItem key={font.value} value={font.value || 'default'} className="text-xs">
                  <span style={{ fontFamily: font.value || 'inherit' }}>{font.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Stil Dropdown - Dergi yazıları için özel paragraf stilleri */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs min-w-[120px] justify-start">
                <LetterText className="h-4 w-4" />
                <span className="hidden sm:inline">{getCurrentStyle()}</span>
                <ChevronDown className="h-3 w-3 ml-auto" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuItem onClick={() => applyParagraphStyle(null, 'justify')}>
                <Pilcrow className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Ana Metin</span>
                <span className="ml-auto text-[10px] text-gray-400">MAIN</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => applyParagraphStyle('title', 'center')}>
                <Type className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-center font-bold text-base">Yazı Başlığı</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyParagraphStyle('author', 'center')}>
                <Type className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-center font-bold">Yazar Adı</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyParagraphStyle('section', 'center')}>
                <Heading2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-center font-bold">Bölüm Başlığı</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyParagraphStyle('filmkunye', 'center')}>
                <AlignCenter className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-center text-sm text-gray-600">Künye</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => applyParagraphStyle('epigraf', 'right')}>
                <AlignRight className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-right text-sm text-gray-600">Epigraf</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="flex-1 text-sm text-gray-600">Blok Alıntı</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-xl font-bold">Başlık 1</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-lg font-bold">Başlık 2</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Biçimlendirmeyi Temizle */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            tooltip="Biçimlendirmeyi Temizle"
          >
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>

          {/* Sağ taraf - Tam Ekran */}
          <div className="ml-auto">
            <ToolbarButton
              onClick={onToggleFullscreen}
              tooltip={isFullscreen ? "Normal Görünüm" : "Tam Ekran"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </ToolbarButton>
          </div>
        </div>

        {/* İkinci Satır - Metin Biçimlendirme */}
        <div className="flex flex-wrap items-center gap-0.5 p-1.5">
          {/* Temel Metin Stili */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            tooltip="Kalın (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            tooltip="İtalik (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            tooltip="Altı Çizili (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            tooltip="Üstü Çizili"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alt/Üst Simge ve Kod */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            isActive={editor.isActive('subscript')}
            tooltip="Alt Simge"
          >
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            isActive={editor.isActive('superscript')}
            tooltip="Üst Simge"
          >
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            tooltip="Satır İçi Kod"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            tooltip="Kod Bloğu"
          >
            <FileCode className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Metin Rengi */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                <LetterText className="h-4 w-4" />
                <div
                  className="absolute bottom-0.5 left-1 right-1 h-1 rounded"
                  style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <Label className="text-xs font-medium mb-2 block">Metin Rengi</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => editor.chain().focus().setColor(color.value).run()}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform hover:shadow-md"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Rengi Kaldır
              </Button>
            </PopoverContent>
          </Popover>

          {/* Vurgulama */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <Label className="text-xs font-medium mb-2 block">Vurgulama Rengi</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => editor.chain().focus().toggleHighlight({ color: color.value }).run()}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform hover:shadow-md"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Vurgulamayı Kaldır
              </Button>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Hizalama */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            tooltip="Sola Hizala"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            tooltip="Ortala"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            tooltip="Sağa Hizala"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            tooltip="İki Yana Yasla"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Listeler */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            tooltip="Madde İşaretli Liste"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            tooltip="Numaralı Liste"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          {/* Girinti */}
          <ToolbarButton
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
            disabled={!editor.can().sinkListItem('listItem')}
            tooltip="Girintiyi Artır"
          >
            <Indent className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
            disabled={!editor.can().liftListItem('listItem')}
            tooltip="Girintiyi Azalt"
          >
            <Outdent className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alıntı ve Çizgi */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            tooltip="Alıntı"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Yatay Çizgi"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Tablo */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                <TableIcon className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Plus className="h-4 w-4 mr-2" />
                  Tablo Ekle
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()}>
                    2x2 Tablo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
                    3x3 Tablo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 4, cols: 4 }).run()}>
                    4x4 Tablo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 5, cols: 5 }).run()}>
                    5x5 Tablo
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                disabled={!editor.can().addColumnBefore()}
              >
                <Columns className="h-4 w-4 mr-2" />
                Sola Sütun Ekle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                disabled={!editor.can().addColumnAfter()}
              >
                <Columns className="h-4 w-4 mr-2" />
                Sağa Sütun Ekle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
                disabled={!editor.can().addRowBefore()}
              >
                <Rows className="h-4 w-4 mr-2" />
                Üste Satır Ekle
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
                disabled={!editor.can().addRowAfter()}
              >
                <Rows className="h-4 w-4 mr-2" />
                Alta Satır Ekle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
                disabled={!editor.can().deleteColumn()}
              >
                Sütunu Sil
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
                disabled={!editor.can().deleteRow()}
              >
                Satırı Sil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
              >
                Hücreleri Birleştir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
              >
                Hücreyi Böl
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
                disabled={!editor.can().deleteTable()}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tabloyu Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Link */}
          <Popover open={linkOpen} onOpenChange={setLinkOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="link-url" className="text-sm font-medium">Link URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
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

          {/* Görsel */}
          <Popover open={imageOpen} onOpenChange={(open) => {
            setImageOpen(open);
            if (!open) resetImageState();
          }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Dosya Yükle
                  </TabsTrigger>
                  <TabsTrigger value="url" className="text-xs">
                    <Link2 className="h-3 w-3 mr-1" />
                    URL ile Ekle
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-3 mt-3">
                  {/* Dosya Sürükle-Bırak Alanı */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Önizleme"
                          className="max-h-32 mx-auto rounded border"
                        />
                        <p className="text-xs text-gray-500">Değiştirmek için tıklayın veya sürükleyin</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Görsel sürükleyin veya <span className="text-blue-600">dosya seçin</span>
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF, WebP</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {/* Alternatif Metin */}
                  <div>
                    <Label htmlFor="image-alt-upload" className="text-sm font-medium">Alternatif Metin</Label>
                    <Input
                      id="image-alt-upload"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Görsel açıklaması (SEO için önemli)"
                      className="mt-1"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={addImage}
                    disabled={!imagePreview}
                    className="w-full"
                  >
                    Görseli Ekle
                  </Button>
                </TabsContent>

                <TabsContent value="url" className="space-y-3 mt-3">
                  <div>
                    <Label htmlFor="image-url" className="text-sm font-medium">Görsel URL</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(null);
                      }}
                      placeholder="https://example.com/gorsel.jpg"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image-alt-url" className="text-sm font-medium">Alternatif Metin</Label>
                    <Input
                      id="image-alt-url"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Görsel açıklaması"
                      className="mt-1"
                      onKeyDown={(e) => e.key === 'Enter' && addImage()}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={addImage}
                    disabled={!imageUrl}
                    className="w-full"
                  >
                    Görseli Ekle
                  </Button>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          {/* Görsel Galeri - Word tarzı grid seçici */}
          <Popover open={galleryOpen} onOpenChange={(open) => {
            setGalleryOpen(open);
            if (!open) {
              setGalleryGrid(null);
              setGalleryImages([]);
            }
          }}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                <LayoutGrid className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              {!galleryGrid ? (
                // Adım 1: Grid boyutu seç
                <GalleryGridPicker onSelect={(rows, cols) => {
                  setGalleryGrid({ rows, cols });
                  setGalleryImages([]);
                  // Otomatik olarak dosya seçici aç
                  setTimeout(() => galleryFileInputRef.current?.click(), 100);
                }} />
              ) : (
                // Adım 2: Resim seç ve onayla
                <div className="p-4 w-80">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      {galleryGrid.cols}×{galleryGrid.rows} Galeri
                      <span className="text-xs text-gray-400 ml-1">({galleryGrid.cols * galleryGrid.rows} görsel)</span>
                    </p>
                    <button
                      onClick={() => { setGalleryGrid(null); setGalleryImages([]); }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Boyutu Değiştir
                    </button>
                  </div>

                  {/* Seçilen görseller grid önizlemesi */}
                  <div
                    className="grid gap-1.5 mb-3"
                    style={{ gridTemplateColumns: `repeat(${galleryGrid.cols}, 1fr)` }}
                  >
                    {Array.from({ length: galleryGrid.cols * galleryGrid.rows }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center"
                      >
                        {galleryImages[i] ? (
                          <img src={galleryImages[i]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">{i + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    {galleryImages.length} / {galleryGrid.cols * galleryGrid.rows} görsel seçildi
                  </p>

                  {/* Dosya seçme butonu */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-2"
                    onClick={() => galleryFileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {galleryImages.length > 0 ? 'Daha Fazla Görsel Seç' : 'Görselleri Seç'}
                  </Button>

                  {/* Galeriye ekle butonu */}
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={galleryImages.length === 0}
                    onClick={() => {
                      const total = galleryGrid.cols * galleryGrid.rows;
                      const cols = galleryGrid.cols;
                      // Galeriyi imageGallery node olarak ekle
                      const images = Array.from({ length: total })
                        .map((_, i) => galleryImages[i] || '')
                        .filter(Boolean)
                        .map((src, i) => ({ src, alt: `Görsel ${i + 1}` }));

                      editor.chain().focus().insertContent({
                        type: 'imageGallery',
                        attrs: {
                          cols,
                          images: JSON.stringify(images),
                        },
                      }).run();

                      setGalleryOpen(false);
                      setGalleryGrid(null);
                      setGalleryImages([]);
                    }}
                  >
                    Galeriye Ekle ({galleryImages.length} görsel)
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Galeri çoklu dosya seçici (gizli) */}
          <input
            ref={galleryFileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (!files || !galleryGrid) return;
              const total = galleryGrid.cols * galleryGrid.rows;
              const remaining = total - galleryImages.length;
              const filesToProcess = Array.from(files)
                .filter((f) => f.type.startsWith('image/'))
                .slice(0, remaining);

              // Her dosyayı sunucuya yükle, kalıcı URL'leri ekle (base64 yok).
              (async () => {
                const uploaded: string[] = [];
                for (const file of filesToProcess) {
                  try {
                    const { url } = await api.uploadFile(file, 'image');
                    uploaded.push(url);
                  } catch {
                    // tek dosya hatasını atla
                  }
                }
                if (uploaded.length) {
                  setGalleryImages([...galleryImages, ...uploaded]);
                }
              })();

              // Input'u sıfırla ki aynı dosyalar tekrar seçilebilsin
              e.target.value = '';
            }}
          />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Referans/Dipnot Ekle */}
          <ToolbarButton
            onClick={() => {
              // Sıradaki dipnot numarası = mevcut referans düğümlerinin sayısı + 1
              let count = 0;
              editor.state.doc.descendants((node) => {
                if (node.type.name === 'footnoteRef') count++;
              });
              const num = count + 1;

              // 1) İmlecin bulunduğu yere referans işaretini DÜĞÜM olarak ekle
              editor
                .chain()
                .focus()
                .insertContent({
                  type: 'footnoteRef',
                  attrs: {
                    footnoteNum: String(num),
                    targetId: `fn-${num}`,
                    refId: `fnref-${num}`,
                  },
                })
                .run();

              // Yeni not öğesi — ipucu metni İTALİK DEĞİL (editör üzerine yazınca
              // metin otomatik italik kalmasın; italik tamamen editör inisiyatifinde).
              const newItem = {
                type: 'footnoteItem',
                attrs: { footnoteId: `fn-${num}` },
                content: [
                  {
                    type: 'text',
                    text: 'Not metnini buraya yazın',
                  },
                ],
              };

              // 2) Dipnot bölümünü bul (referans eklendikten sonraki güncel durumda)
              let sectionPos = -1;
              let sectionSize = 0;
              editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'footnotesSection') {
                  sectionPos = pos;
                  sectionSize = node.nodeSize;
                  return false;
                }
                return true;
              });

              if (sectionPos >= 0) {
                // Mevcut "Notlar" bölümünün sonuna ekle.
                // setContent KULLANILMAZ -> belge yeniden ayrıştırılmaz, imleç/içerik korunur.
                editor
                  .chain()
                  .insertContentAt(sectionPos + sectionSize - 1, newItem, {
                    updateSelection: false,
                  })
                  .run();
              } else {
                // Bölüm yoksa belgenin sonunda "Notlar" başlığıyla oluştur
                editor
                  .chain()
                  .insertContentAt(
                    editor.state.doc.content.size,
                    {
                      type: 'footnotesSection',
                      content: [
                        {
                          type: 'heading',
                          attrs: { level: 3 },
                          content: [{ type: 'text', text: 'Notlar' }],
                        },
                        newItem,
                      ],
                    },
                    { updateSelection: false },
                  )
                  .run();
              }
            }}
            tooltip="Referans/Dipnot Ekle"
          >
            <BookmarkPlus className="h-4 w-4" />
          </ToolbarButton>

          {/* Biçimlendirme İşaretleri (¶) - boşluk/enter göster */}
          <ToolbarButton
            onClick={onToggleInvisibles}
            isActive={showInvisibles}
            tooltip="Biçimlendirme İşaretlerini Göster/Gizle (¶)"
          >
            <Pilcrow className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* AI Düzenleme */}
          <ToolbarButton
            onClick={onAIClick}
            tooltip="AI ile Düzenle"
            className="text-purple-600 hover:text-purple-700"
          >
            <Sparkles className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>
    </TooltipProvider>
  );
}

// Karakter Sayacı
function CharacterCounter({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const characters = editor.storage.characterCount.characters();
  // Sözcük sayımı: yalnızca ANA GÖVDE sayılır — dipnot/"Notlar" bölümü ve [n]
  // referans işaretleri hariç. Ardışık boşluk/satır sonu tek ayraç sayılır,
  // böylece boş ENTER'lı satırlar sözcük olarak sayılmaz. Bu, Word'ün durum
  // çubuğundaki sözcük sayısıyla (dipnotları saymaz) daha tutarlıdır.
  let bodyText = '';
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'footnotesSection') return false; // dipnot bölümünü atla
    if (node.isText) bodyText += node.text + ' ';
    return true;
  });
  const words = (bodyText.match(/\S+/g) || []).length;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
      <span>{characters} karakter</span>
      <span>{words} kelime</span>
    </div>
  );
}

export function AdvancedEditor({
  content,
  onChange,
  placeholder = 'İçeriğinizi buraya yazın...',
  onAyarlaraGit,
}: AdvancedEditorProps & { onAyarlaraGit?: () => void }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [showInvisibles, setShowInvisibles] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
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
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      ResizableImage,
      ImageGallery,
      ParagraphStyle,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Typography,
      CharacterCount,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      FootnoteRef,
      FootnoteItem,
      FootnotesSection,
      TableCell,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-4xl mx-auto p-6 min-h-[400px] focus:outline-none',
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`border rounded-lg bg-white shadow-sm flex flex-col ${
      isFullscreen ? 'fixed inset-4 z-50' : 'h-[700px]'
    }`}>
      {/* Toolbar - Her zaman üstte sabit */}
      <div className="flex-shrink-0">
        <MainToolbar
          editor={editor}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onAIClick={() => setAiModalOpen(true)}
          showInvisibles={showInvisibles}
          onToggleInvisibles={() => setShowInvisibles((v) => !v)}
        />
      </div>

      {/* İçerik alanı - Scroll edilebilir */}
      <div className={`flex-1 overflow-y-auto ${showInvisibles ? 'show-invisibles' : ''}`}>
        <EditorContent editor={editor} />
      </div>

      {/* Alt bilgi çubuğu - Her zaman altta sabit */}
      <div className="flex-shrink-0">
        <CharacterCounter editor={editor} />
      </div>

      {/* AI Düzenleme Modalı */}
      <AIEditModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        selectedText={editor ? editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          ' '
        ) : ''}
        fullContent={editor ? editor.getHTML() : ''}
        onApply={(newContent, isFullContent) => {
          if (!editor) return;
          if (isFullContent) {
            editor.commands.setContent(newContent);
          } else {
            editor.chain().focus().insertContent(newContent).run();
          }
        }}
        onAyarlaraGit={onAyarlaraGit}
      />
    </div>
  );
}

export default AdvancedEditor;
