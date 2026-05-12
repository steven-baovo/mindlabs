'use client'

import { useState } from 'react'
import SkillSidebar from './SkillSidebar'
import ChatInterface from './ChatInterface'
import ArtifactPanel from './ArtifactPanel'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  status?: 'thinking' | 'searching' | 'analyzing' | 'done'
  artifacts?: string // Markdown content for the artifact panel
}

export type Skill = {
  id: string
  name: string
  icon: string
  description: string
}

const MOCK_SKILLS: Skill[] = [
  {
    id: 'tiktok-marketing',
    name: 'TikTok Marketing',
    icon: '📱',
    description: 'Expert in viral TikTok content strategy and scripting.'
  },
  {
    id: 'psychology-expert',
    name: 'Psychology Expert',
    icon: '🧠',
    description: 'Deep understanding of human behavior and cognitive patterns.'
  },
  {
    id: 'seo-audit',
    name: 'SEO Audit',
    icon: '🔍',
    description: 'Technical SEO and content optimization specialist.'
  }
]

export default function MindAIClient() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeArtifact, setActiveArtifact] = useState<string | null>(null)
  const [isArtifactOpen, setIsArtifactOpen] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    }
    
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    // Call Real AI API
    await callMindAI(newMessages)
  }

  const callMindAI = async (currentMessages: Message[]) => {
    const aiMessageId = (Date.now() + 1).toString()
    
    // Initial thinking state
    const initialAIResponse: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      status: 'thinking'
    }
    
    setMessages(prev => [...prev, initialAIResponse])

    try {
      // Step 1: Thinking simulation for UI
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, status: 'searching' } : m))
      }, 1000)

      const response = await fetch('/api/mindai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages,
          skillId: selectedSkill?.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect to mindAI')
      }

      // Step 2: Final state
      const rawContent = data.content
      // Capture artifact even if the closing ::: is missing
      const artifactMatch = rawContent.match(/:::artifact\n?([\s\S]*?)(?:\n?:::|$)/)
      const artifactContent = artifactMatch ? artifactMatch[1].trim() : undefined
      const chatContent = rawContent.replace(/:::artifact\n?([\s\S]*?)(?:\n?:::|$)/g, '').trim()

      setMessages(prev => prev.map(m => m.id === aiMessageId ? { 
        ...m, 
        status: 'done', 
        content: chatContent,
        artifacts: artifactContent
      } : m))

      if (artifactContent) {
        setActiveArtifact(artifactContent)
        setIsArtifactOpen(true)
      }

    } catch (error: any) {
      setMessages(prev => prev.map(m => m.id === aiMessageId ? { 
        ...m, 
        status: 'done', 
        content: `Lỗi: ${error.message}. Vui lòng kiểm tra API Key trong file .env.local`
      } : m))
    }
  }

  return (
    <div className="flex h-full bg-[#fcfcfc] overflow-hidden">
      {/* Left: Skills Sidebar */}
      <SkillSidebar 
        skills={MOCK_SKILLS} 
        selectedId={selectedSkill?.id || null} 
        onSelect={setSelectedSkill} 
      />

      {/* Center: Chat Interface */}
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        selectedSkill={selectedSkill}
        onOpenArtifact={() => setIsArtifactOpen(true)}
        hasArtifact={!!activeArtifact}
      />

      {/* Right: Artifact Panel */}
      <ArtifactPanel 
        content={activeArtifact} 
        isOpen={isArtifactOpen} 
        onClose={() => setIsArtifactOpen(false)} 
      />
    </div>
  )
}
