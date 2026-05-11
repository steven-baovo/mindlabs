'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Quote,
  Link as LinkIcon,
  Image as ImageIcon
} from 'lucide-react'

interface ZenEditorProps {
  initialContent?: any
  onChange?: (content: any) => void
  placeholder?: string
}

const ZenEditor = ({ initialContent, onChange, placeholder = 'Bắt đầu viết...' }: ZenEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // In v3, some extensions might be included that weren't in v2
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-4 cursor-pointer',
        },
      }),
      Underline,
    ],
    content: (initialContent && Object.keys(initialContent).length > 0) ? initialContent : undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[500px] py-12',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="relative w-full">
      {/* Bubble Menu for Text Selection */}
      <BubbleMenu 
        editor={editor} 
        options={{ offset: 10, placement: 'top' }}
        className="flex items-center gap-1 bg-white/80 backdrop-blur-md border border-border-medium p-1 rounded-lg shadow-xl"
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('underline') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-border-medium mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-secondary'}`}
        >
          <List className="w-4 h-4" />
        </button>
      </BubbleMenu>

      {/* Main Editor Area */}
      <EditorContent editor={editor} />

      {/* Floating Action Menu (Optional - but keeps it clean) */}
      <div className="fixed bottom-12 right-12 flex flex-col gap-3">
        <button 
          onClick={() => {
            const url = window.prompt('URL hình ảnh:')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
          className="p-3 bg-white border border-border-medium rounded-full shadow-lg hover:shadow-xl transition-all text-secondary hover:text-primary"
          title="Thêm hình ảnh"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default ZenEditor
