'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ZenEditor from './ZenEditor'
import { updateNote } from '@/app/(frontend)/mindnote/actions'
import { useWorkspace } from '@/contexts/WorkspaceContext'

interface NoteEditorClientProps {
  note: any
}

const NoteEditorClient = ({ note }: NoteEditorClientProps) => {
  const { setTitle, setIsSaving } = useWorkspace()
  const [title, setLocalTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)

  // Sync title vào WorkspaceContext khi mở note mới
  useEffect(() => {
    setLocalTitle(note.title)
    setTitle(note.title)
    return () => {
      setTitle('')
      setIsSaving(false)
    }
  }, [note.id, setTitle, setIsSaving])

  // Khi user thay đổi title từ sidebar (WorkspaceContext), đồng bộ về local
  // WorkspaceContext.setTitle được gọi từ sidebar → NoteEditorClient phải nhận lại

  const handleTitleChange = useCallback((newTitle: string) => {
    setLocalTitle(newTitle)
    setTitle(newTitle)
  }, [setTitle])

  // Auto-save
  const handleSave = useCallback(async (currentTitle: string, currentContent: any) => {
    setIsSaving(true)
    await updateNote(note.id, { title: currentTitle, content: currentContent })
    setIsSaving(false)
  }, [note.id, setIsSaving])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || JSON.stringify(content) !== JSON.stringify(note.content)) {
        handleSave(title, content)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [title, content, note.title, note.content, handleSave])

  return (
    <div className="bg-white h-full">
      <main className="flex-1 px-6 pt-12 pb-32 min-w-0">
        <div className="max-w-4xl mx-auto">
          <ZenEditor
            initialContent={content}
            onChange={setContent}
          />
        </div>
      </main>
    </div>
  )
}

export default NoteEditorClient
