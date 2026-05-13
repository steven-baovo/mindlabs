'use client'

import { createContext, useContext, useState } from 'react'

interface WorkspaceContextType {
  title: string
  setTitle: (title: string) => void
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  title: '',
  setTitle: () => {},
  isSaving: false,
  setIsSaving: () => {},
})

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  return (
    <WorkspaceContext.Provider value={{ title, setTitle, isSaving, setIsSaving }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
