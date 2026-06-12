// Gelişmiş Blok Editörü - BlockNote tabanlı (Notion tarzı)
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import type { Block } from '@blocknote/core';
import { BlockNoteEditor as BlockNoteEditorType } from '@blocknote/core';
import { useEffect, useCallback, useState } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { api } from '@/lib/api';

interface BlockNoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// HTML'den BlockNote bloklarına dönüştür
async function htmlToBlocks(html: string, editor: BlockNoteEditorType): Promise<Block[]> {
  if (!html || html.trim() === '') {
    return [];
  }
  try {
    const blocks = await editor.tryParseHTMLToBlocks(html);
    return blocks;
  } catch (e) {
    console.warn('HTML dönüştürme hatası:', e);
    return [];
  }
}

// BlockNote bloklarından HTML'e dönüştür
async function blocksToHtml(editor: BlockNoteEditorType): Promise<string> {
  try {
    const html = await editor.blocksToHTMLLossy(editor.document);
    return html;
  } catch (e) {
    console.warn('HTML oluşturma hatası:', e);
    return '';
  }
}

// Mantine tema özelleştirmesi
const mantineTheme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  components: {
    Menu: {
      styles: {
        dropdown: {
          zIndex: 10000,
        },
      },
    },
    Popover: {
      styles: {
        dropdown: {
          zIndex: 10000,
        },
      },
    },
  },
});

export function BlockNoteEditor({
  content,
  onChange,
}: BlockNoteEditorProps) {
  const [isReady, setIsReady] = useState(false);

  // Editörü oluştur
  const editor = useCreateBlockNote({
    defaultStyles: true,
    uploadFile: async (file: File) => {
      // Dosyayı sunucuya yükle ve kalıcı URL döndür (blob: yenilemede ölür).
      const { url } = await api.uploadFile(file, 'image');
      return url;
    },
  });

  // İlk yükleme - mevcut HTML içeriğini bloklara dönüştür
  useEffect(() => {
    if (editor && content && !isReady) {
      htmlToBlocks(content, editor).then((blocks) => {
        if (blocks.length > 0) {
          editor.replaceBlocks(editor.document, blocks);
        }
        setIsReady(true);
      });
    } else if (editor && !content) {
      setIsReady(true);
    }
  }, [editor, content, isReady]);

  // Değişiklikleri izle
  const handleChange = useCallback(async () => {
    if (editor && isReady) {
      const html = await blocksToHtml(editor);
      onChange(html);
    }
  }, [editor, onChange, isReady]);

  return (
    <MantineProvider theme={mantineTheme}>
      <div className="blocknote-editor-wrapper">
        <BlockNoteView
          editor={editor}
          onChange={handleChange}
          theme="light"
          data-theming-css-variables-demo
        />
      </div>
      <style>{`
        .blocknote-editor-wrapper {
          min-height: 400px;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          background: white;
        }

        .blocknote-editor-wrapper .bn-editor {
          padding: 1.5rem;
          font-family: 'Merriweather', Georgia, serif;
        }

        .blocknote-editor-wrapper .bn-block-content {
          font-size: 1.125rem;
          line-height: 1.75;
        }

        .blocknote-editor-wrapper h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }

        .blocknote-editor-wrapper h2 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
        }

        .blocknote-editor-wrapper h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        .blocknote-editor-wrapper blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
        }

        .blocknote-editor-wrapper code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Fira Code', monospace;
          font-size: 0.875em;
        }

        .blocknote-editor-wrapper pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        .blocknote-editor-wrapper pre code {
          background: transparent;
          padding: 0;
          color: inherit;
        }

        .blocknote-editor-wrapper img {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .blocknote-editor-wrapper a {
          color: #2563eb;
          text-decoration: underline;
        }

        .blocknote-editor-wrapper a:hover {
          color: #1d4ed8;
        }

        .blocknote-editor-wrapper ul,
        .blocknote-editor-wrapper ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .blocknote-editor-wrapper li {
          margin: 0.25rem 0;
        }

        .blocknote-editor-wrapper table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .blocknote-editor-wrapper th,
        .blocknote-editor-wrapper td {
          border: 1px solid #e5e7eb;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }

        .blocknote-editor-wrapper th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        /* Placeholder stilleri */
        .blocknote-editor-wrapper [data-placeholder]::before {
          color: #9ca3af;
          font-style: italic;
        }

        /* Slash menü stilleri */
        .bn-slash-menu {
          max-height: 400px;
          overflow-y: auto;
        }

        /* Toolbar stilleri */
        .bn-toolbar {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        /* Side menu stilleri */
        .bn-side-menu {
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .bn-side-menu:hover {
          opacity: 1;
        }
      `}</style>
    </MantineProvider>
  );
}

export default BlockNoteEditor;
