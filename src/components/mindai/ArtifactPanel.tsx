'use client'

import { X, Copy, Download, Share2, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArtifactPanelProps {
  content: string | null
  isOpen: boolean
  onClose: () => void
}

export default function ArtifactPanel({ content, isOpen, onClose }: ArtifactPanelProps) {
  if (!isOpen) return null

  return (
    <div className="w-[600px] border-l border-[#e5e5e5] bg-white flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl z-20">
      {/* Header */}
      <header className="h-14 border-b border-[#e5e5e5] px-6 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-bold text-[#242424]">Generated Plan</h2>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[#fcfcfc]">
        {content ? (
          <div className="max-w-none">
            <div className="bg-white border border-[#e5e5e5] rounded-2xl shadow-sm overflow-hidden p-8">
              <div className="prose prose-sm prose-slate max-w-none 
                  prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:tracking-wider
                  prose-td:px-4 prose-td:py-3 prose-td:text-xs prose-td:border-b prose-td:border-gray-50
                  table:w-full table:border-collapse">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
            <FileText className="w-12 h-12 opacity-10" />
            <p className="text-xs font-medium">No artifact generated yet.<br/>Start a conversation to see results here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
