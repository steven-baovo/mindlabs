'use client'

import { Skill } from './MindAIClient'
import { Plus, Search } from 'lucide-react'

interface SkillSidebarProps {
  skills: Skill[]
  selectedId: string | null
  onSelect: (skill: Skill) => void
}

export default function SkillSidebar({ skills, selectedId, onSelect }: SkillSidebarProps) {
  return (
    <div className="w-64 border-r border-[#e5e5e5] bg-white flex flex-col h-full">
      <div className="p-4 border-b border-[#e5e5e5]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#242424] uppercase tracking-wider">Skill Library</h2>
          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search skills..." 
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#242424] transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
        {skills.map((skill) => (
          <button
            key={skill.id}
            onClick={() => onSelect(skill)}
            className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
              selectedId === skill.id 
                ? 'bg-[#242424] text-white shadow-lg shadow-gray-200' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`text-xl ${selectedId === skill.id ? '' : 'group-hover:scale-110 transition-transform'}`}>
                {skill.icon}
              </span>
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${selectedId === skill.id ? 'text-white' : 'text-[#242424]'}`}>
                  {skill.name}
                </div>
                <div className={`text-[11px] truncate opacity-70 ${selectedId === skill.id ? 'text-gray-300' : 'text-gray-500'}`}>
                  {skill.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-[#e5e5e5] bg-gray-50/50">
        <div className="text-[10px] text-gray-400 font-medium uppercase mb-2">System Status</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-gray-500">All systems operational</span>
        </div>
      </div>
    </div>
  )
}
