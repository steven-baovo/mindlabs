import { loadNote } from '../actions'
import NoteEditorClient from '@/components/mindnote/NoteEditorClient'
import { notFound } from 'next/navigation'

interface NotePageProps {
  params: Promise<{ id: string }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params
  const { data: note, error } = await loadNote(id)

  if (error || !note) {
    notFound()
  }

  return <NoteEditorClient note={note} />
}
