'use client'

import { useState, useEffect, useCallback } from 'react'
import ZenEditor from './ZenEditor'
import NoteSidebar from './NoteSidebar'
import { updateNote } from '@/app/(frontend)/mindnote/actions'

interface NoteEditorClientProps {
  note: any
}

const NoteEditorClient = ({ note }: NoteEditorClientProps) => {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-save logic
  const handleSave = useCallback(async (currentTitle: string, currentContent: any) => {
    setIsSaving(true)
    await updateNote(note.id, {
      title: currentTitle,
      content: currentContent
    })
    setIsSaving(false)
  }, [note.id])

  // Debounce saving
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || JSON.stringify(content) !== JSON.stringify(note.content)) {
        handleSave(title, content)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [title, content, note.title, note.content, handleSave])

  return (
    <div className="bg-white">
      <div className="flex w-full items-start">
        <main className="flex-1 px-6 pt-12 pb-32">
          <div className="max-w-4xl mx-auto">
            <ZenEditor 
              initialContent={content} 
              onChange={setContent} 
            />
          </div>
        </main>
        
        <div className="sticky top-0 h-[calc(100vh-56px)] shrink-0 border-l border-border-medium/20">
          <NoteSidebar 
            activeTitle={title} 
            onTitleChange={setTitle} 
            isSaving={isSaving} 
          />
        </div>
      </div>
    </div>
  )
}

export default NoteEditorClient
