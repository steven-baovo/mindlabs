'use client'

import { useState, useRef, useEffect } from 'react'
import { Message, Skill } from './MindAIClient'
import { Send, Sparkles, Loader2, Search, Brain, BarChart3, Maximize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => void
  selectedSkill: Skill | null
  onOpenArtifact: () => void
  hasArtifact: boolean
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  selectedSkill, 
  onOpenArtifact,
  hasArtifact 
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Header */}
      <header className="h-14 border-b border-[#e5e5e5] px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#242424]">mindAI</h1>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Active Skill:</span>
              <span className="text-[10px] text-[#242424] font-bold uppercase">{selectedSkill?.name || 'General Intelligence'}</span>
            </div>
          </div>
        </div>
        
        {hasArtifact && (
          <button 
            onClick={onOpenArtifact}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-[#242424] transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            View Result
          </button>
        )}
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-2">
              <Brain className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-[#242424]">How can I help you today?</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Load a skill from the sidebar or just start chatting. I can help you plan, research, and execute your viral content strategy.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full pt-4">
              {['Lên kế hoạch tuần này', 'Tìm trend tâm lý', 'Viết kịch bản video', 'Phân tích đối thủ'].map((hint) => (
                <button 
                  key={hint}
                  onClick={() => onSendMessage(hint)}
                  className="px-4 py-2 bg-white border border-[#e5e5e5] rounded-xl text-xs font-medium text-gray-600 hover:border-[#242424] hover:text-[#242424] transition-all"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-gray-100' : 'bg-[#242424]'
              }`}>
                {msg.role === 'user' ? (
                  <span className="text-[10px] font-bold">ME</span>
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
              
              <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.content && (
                  <div className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-[#242424] text-white' 
                      : 'bg-gray-100 text-[#242424]'
                  }`}>
                    <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {msg.status && msg.status !== 'done' && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2">
                    {msg.status === 'thinking' && (
                      <>
                        <Brain className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                        <span className="text-[11px] font-medium text-gray-500">Analyzing skill requirements...</span>
                      </>
                    )}
                    {msg.status === 'searching' && (
                      <>
                        <Search className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                        <span className="text-[11px] font-medium text-gray-500">Searching for current trends...</span>
                      </>
                    )}
                    {msg.status === 'analyzing' && (
                      <>
                        <BarChart3 className="w-3.5 h-3.5 text-green-500 animate-spin" />
                        <span className="text-[11px] font-medium text-gray-500">Structuring content plan...</span>
                      </>
                    )}
                    <Loader2 className="w-3 h-3 text-gray-300 animate-spin ml-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-[#e5e5e5]">
        <form 
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedSkill ? `Ask ${selectedSkill.name}...` : "Choose a skill or ask me anything..."}
            className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-[#e5e5e5] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#242424]/10 focus:border-[#242424] transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#242424] text-white rounded-xl hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-3 font-medium uppercase tracking-wider">
          mindAI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  )
}
