'use client'

import { useState, useEffect, useCallback } from 'react'
import ZenEditor from './ZenEditor'
import NoteHeader from './NoteHeader'
import { updateNote } from '@/app/(frontend)/mindnote/actions'
import { useDebounce } from '@/hooks/use-debounce' // I should create this hook if it doesn't exist

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
    <div className="min-h-screen bg-white">
      <NoteHeader 
        title={title} 
        onTitleChange={setTitle} 
        isSaving={isSaving} 
      />
      <main className="max-w-4xl mx-auto px-6">
        <ZenEditor 
          initialContent={content} 
          onChange={setContent} 
        />
      </main>
    </div>
  )
}

export default NoteEditorClient
