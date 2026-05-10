import { useCallback, useEffect, useRef } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'

export default function TextNode({ id, data, selected }: { id: string; data: any; selected: boolean }) {
  const { setNodes } = useReactFlow()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div
      className={`group relative min-w-[160px] max-w-[320px] bg-white rounded-xl border p-4 transition-all ${selected ? 'ring-1 ring-blue-500/50' : ''}`}
      style={{ borderColor: selected ? '#3b82f6' : '#94A3B8' }}
    >

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="target" position={Position.Left} id="left-target" className="w-2 h-2 !bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-source" className="w-2 h-2 !bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />

      <textarea
        ref={textareaRef}
        className="w-full resize-none outline-none bg-transparent text-gray-800 text-sm leading-relaxed overflow-hidden"
        value={data.label}
        onChange={onChange}
        placeholder="Type something..."
        rows={1}
        onPointerDownCapture={(e) => {
          // Allow text selection inside the textarea
          e.stopPropagation()
        }}
      />
    </div>
  )
}
