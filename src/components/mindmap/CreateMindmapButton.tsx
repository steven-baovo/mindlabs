'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMindmap } from '@/app/(frontend)/mindmap/actions'
import { Plus } from 'lucide-react'

export default function CreateMindmapButton() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    setIsPending(true)
    const { data, error } = await createMindmap('Untitled Canvas')
    if (data && !error) {
      router.push(`/mindmap/${data.id}`)
    } else {
      console.error(error)
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="w-4 h-4" />
      {isPending ? 'Creating...' : 'New Canvas'}
    </button>
  )
}
