import { useCallback, useEffect, useRef, useState } from 'react'
import { Handle, Position, useReactFlow, NodeResizer, NodeToolbar } from '@xyflow/react'
import { Check, Trash2, Palette, Edit2 } from 'lucide-react'

export default function TextNode({ id, data, selected }: { id: string; data: any; selected: boolean }) {
  const { setNodes } = useReactFlow()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'color' | null>(null)

  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: evt.target.value } }
        }
        return node
      })
    )
  }, [id, setNodes])

  // Auto-resize on initial load and when data changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [data.label])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      // Move cursor to end
      const length = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(length, length)
    }
  }, [isEditing])

  useEffect(() => {
    if (!selected) setIsEditing(false)
  }, [selected])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const onBlur = useCallback(() => {
    setIsEditing(false)
  }, [])

  const nodeColors = [
    { name: 'Default', border: '#94A3B8', bg: '#ffffff' },
    { name: 'Red', border: '#ef4444', bg: '#fef2f2' },
    { name: 'Blue', border: '#3b82f6', bg: '#eff6ff' },
    { name: 'Green', border: '#22c55e', bg: '#f0fdf4' },
    { name: 'Yellow', border: '#eab308', bg: '#fefce8' },
    { name: 'Purple', border: '#a855f7', bg: '#faf5ff' },
  ]

  const updateNodeColor = (color: { name: string, border: string, bg: string }) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, color: color.name === 'Default' ? undefined : color } }
        }
        return node
      })
    )
  }

  const deleteNode = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id))
  }

  return (
    <>
      <NodeToolbar isVisible={selected} position={Position.Top} offset={10}>
        <div className="flex items-center gap-0.5 bg-white border border-gray-200 shadow-xl rounded-lg p-0.5 animate-in fade-in zoom-in duration-200">
          <button
            onClick={deleteNode}
            className="p-1 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-md transition-colors"
            title="Delete Card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'color' ? null : 'color')}
              className={`p-1 rounded-md transition-colors ${activeMenu === 'color' ? 'bg-gray-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Change Color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            {activeMenu === 'color' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 shadow-lg rounded-lg p-2 flex gap-1.5 z-50 animate-in fade-in zoom-in duration-150">
                {nodeColors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      updateNodeColor(c)
                      setActiveMenu(null)
                    }}
                    className={`w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform flex items-center justify-center`}
                    style={{ backgroundColor: c.border }}
                    title={c.name}
                  >
                    {(data.color?.name === c.name || (!data.color && c.name === 'Default')) && <Check className="w-3 h-3 text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-gray-200 mx-0.5" />

          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded-md transition-colors text-gray-500 hover:bg-gray-100"
            title="Edit Text"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </NodeToolbar>

      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={48}
        handleClassName="opacity-0"
        lineClassName="opacity-0"
      />

      <div
        onDoubleClick={handleDoubleClick}
        className={`group relative w-full h-full min-w-[200px] min-h-[48px] flex items-center justify-center rounded-lg transition-colors py-2 px-4 ${selected ? 'border-2 shadow-md' : 'border hover:border-gray-400'}`}
        style={{
          borderColor: selected ? (data.color?.border || '#8b5cf6') : (data.color?.border || '#94A3B8'),
          backgroundColor: data.color?.bg || '#ffffff',
          boxShadow: selected ? `0 0 0 4px ${(data.color?.border || '#8b5cf6')}20` : undefined
        }}
      >
        {/* Handles - Use only source handles with Loose mode to allow dragging from any side */}
        <Handle id="top" type="source" position={Position.Top} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: data.color?.border || '#94A3B8', width: '10px', height: '10px' }} />
        <Handle id="bottom" type="source" position={Position.Bottom} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: data.color?.border || '#94A3B8', width: '10px', height: '10px' }} />
        <Handle id="left" type="source" position={Position.Left} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: data.color?.border || '#94A3B8', width: '10px', height: '10px' }} />
        <Handle id="right" type="source" position={Position.Right} className={`border-2 border-white transition-all z-50 hover:scale-125 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ backgroundColor: data.color?.border || '#94A3B8', width: '10px', height: '10px' }} />

        <textarea
          ref={textareaRef}
          readOnly={!isEditing}
          className={`w-full resize-none outline-none bg-transparent text-gray-800 text-sm leading-relaxed overflow-hidden ${!isEditing ? 'cursor-default select-none pointer-events-none' : 'cursor-text'}`}
          value={data.label}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={isEditing ? "Type something..." : ""}
          rows={1}
          onPointerDownCapture={(e) => {
            if (isEditing) {
              // Allow text selection inside the textarea only when editing
              e.stopPropagation()
            }
          }}
        />
      </div>
    </>
  )
}
