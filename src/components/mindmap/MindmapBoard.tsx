'use client'

import React, { useCallback, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  useReactFlow,
  MarkerType,
  ConnectionMode,
  SelectionMode,
  NodeChange
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import TextNode from './TextNode'
import { updateMindmap } from '@/app/(frontend)/mindmap/actions'
import { SquarePlus, Hand, MousePointer2, Activity } from 'lucide-react'
import MindmapEdge from './MindmapEdge'
import { useWorkspace } from '@/contexts/WorkspaceContext'

import { HelperLinesRenderer } from './HelperLinesRenderer'
import { getHelperLines, HelperLines } from './helperLines'

const nodeTypes = {
  textNode: TextNode,
}

const edgeTypes = {
  mindmapEdge: MindmapEdge,
}

interface MindmapBoardProps {
  mindmapId: string
  initialTitle: string
  initialNodes: Node[]
  initialEdges: Edge[]
}



export default function MindmapBoard({
  mindmapId,
  initialTitle,
  initialNodes,
  initialEdges,
}: MindmapBoardProps) {
  const { title, setTitle, setIsSaving } = useWorkspace()

  // Init title khi mount, cleanup khi unmount
  useEffect(() => {
    setTitle(initialTitle)
    return () => {
      setTitle('')
      setIsSaving(false)
    }
  }, [mindmapId, initialTitle, setTitle, setIsSaving])
  const upgradedInitialEdges = initialEdges.map(edge => {
    if (edge.type === 'default' || !edge.type) {
      return {
        ...edge,
        type: 'mindmapEdge',
        data: edge.data || { direction: 'one' },
        style: edge.style || { stroke: '#94A3B8', strokeWidth: 1.5 },
        markerEnd: edge.markerEnd || { type: MarkerType.ArrowClosed, color: '#94A3B8' }
      }
    }
    return edge
  })
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(upgradedInitialEdges)
  const [isPanMode, setIsPanMode] = useState(false)
  const [helperLines, setHelperLines] = useState<HelperLines>({})
  const [edgePathType, setEdgePathType] = useState('bezier')
  const [isPathMenuOpen, setIsPathMenuOpen] = useState(false)
  const pathMenuRef = useRef<HTMLDivElement>(null)
  
  const connectingNodeId = useRef<string | null>(null)
  const connectingHandleId = useRef<string | null>(null)
  const connectionMadeRef = useRef(false)
  const isReconnecting = useRef(false)
  
  const { screenToFlowPosition, getNodes, addNodes } = useReactFlow()
  
  // Track if changes have been made to trigger save
  const hasChangesRef = useRef(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      connectionMadeRef.current = true
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'mindmapEdge',
        data: { direction: 'one', pathType: edgePathType },
        style: { stroke: '#94A3B8', strokeWidth: 1.5 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#94A3B8',
        },
      } as Edge, eds))
      hasChangesRef.current = true
    },
    [setEdges, edgePathType]
  )

  const onConnectStart = useCallback((_: any, { nodeId, handleId }: { nodeId: string | null, handleId: string | null }) => {
    connectingNodeId.current = nodeId
    connectingHandleId.current = handleId
    connectionMadeRef.current = false
  }, [])

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const sourceId = connectingNodeId.current
      const sourceHandleId = connectingHandleId.current
      const wasConnectionMade = connectionMadeRef.current

      if (!sourceId || wasConnectionMade || isReconnecting.current) {
        connectingNodeId.current = null
        connectingHandleId.current = null
        connectionMadeRef.current = false
        return
      }

      const targetIsPane = (event.target as Element).classList.contains('react-flow__pane')

      if (targetIsPane) {
        const { clientX, clientY } = 'changedTouches' in event 
          ? (event as TouchEvent).changedTouches[0] 
          : (event as MouseEvent)
        
        // Approximate node default size (min-w-[200px], min-h-[48px] + padding)
        const NODE_W = 200
        const NODE_H = 80

        // Offset position so the handle of the new card aligns with the drop point
        // Target handle is the opposite of the source handle
        const positionOffset: Record<string, { x: number; y: number }> = {
          // source=right → target=left → new card appears to the right, left-edge at cursor
          right: { x: 0, y: -NODE_H / 2 },
          // source=left → target=right → new card appears to the left, right-edge at cursor
          left: { x: -NODE_W, y: -NODE_H / 2 },
          // source=bottom → target=top → new card appears below, top-edge at cursor
          bottom: { x: -NODE_W / 2, y: 0 },
          // source=top → target=bottom → new card appears above, bottom-edge at cursor
          top: { x: -NODE_W / 2, y: -NODE_H },
        }

        const offset = (sourceHandleId && positionOffset[sourceHandleId]) || { x: -NODE_W / 2, y: -NODE_H / 2 }
        const dropPosition = screenToFlowPosition({ x: clientX, y: clientY })

        const id = `node-${Date.now()}`
        const newNode: Node = {
          id,
          type: 'textNode',
          position: {
            x: dropPosition.x + offset.x,
            y: dropPosition.y + offset.y,
          },
          data: { label: '' },
        }

        // Pick the opposite handle as target based on the source handle direction
        const oppositeHandle: Record<string, string> = {
          right: 'left',
          left: 'right',
          bottom: 'top',
          top: 'bottom',
        }
        const targetHandle = (sourceHandleId && oppositeHandle[sourceHandleId]) || 'top'

        setNodes((nds) => nds.concat(newNode))
        setEdges((eds) =>
          eds.concat({
            id: `edge-${sourceId}-${id}`,
            source: sourceId,
            sourceHandle: sourceHandleId,
            target: id,
            targetHandle,
            type: 'mindmapEdge',
            data: { direction: 'one', pathType: edgePathType },
            style: { stroke: '#94A3B8', strokeWidth: 1.5 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94A3B8',
            },
          } as Edge)
        )
        hasChangesRef.current = true
      }
      
      connectingNodeId.current = null
      connectingHandleId.current = null
      connectionMadeRef.current = false
    },
    [screenToFlowPosition, setNodes, setEdges, edgePathType]
  )

  const updateGlobalPathType = (type: string) => {
    setEdgePathType(type)
    setEdges((eds) => eds.map(e => ({ ...e, data: { ...e.data, pathType: type } })))
    setIsPathMenuOpen(false)
    hasChangesRef.current = true
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pathMenuRef.current && !pathMenuRef.current.contains(event.target as any)) {
        setIsPathMenuOpen(false)
      }
    }

    if (isPathMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPathMenuOpen])

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    let currentHelperLines = {}
    let hasDraggingPositionChange = false

    const nextChanges = changes.map((change) => {
      if (change.type === 'position' && change.position) {
        const currentNodes = getNodes()
        const node = currentNodes.find((n) => n.id === change.id)
        if (node) {
          const { snappedPosition, helperLines: lines } = getHelperLines(
            { ...node, position: change.position },
            currentNodes,
            20,
            16
          )
          
          if (change.dragging) {
            currentHelperLines = lines
            hasDraggingPositionChange = true
          }
          
          return {
            ...change,
            position: snappedPosition,
          }
        }
      }
      return change
    })
    
    if (hasDraggingPositionChange) {
      setHelperLines(currentHelperLines)
    }

    onNodesChange(nextChanges)
    hasChangesRef.current = true
  }, [onNodesChange, getNodes])

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes)
    hasChangesRef.current = true
  }, [onEdgesChange])

  const onNodeDragStop = useCallback(() => {
    setHelperLines({})
  }, [])

  // Edge reconnection: cầm đầu/đuôi edge để kéo sang node khác
  const edgeReconnectSuccessful = useRef(true)

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeReconnectSuccessful.current = true
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
      hasChangesRef.current = true
    },
    [setEdges]
  )

  const onReconnectStart = useCallback(() => {
    isReconnecting.current = true
    edgeReconnectSuccessful.current = false
  }, [])

  const onReconnectEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      // Nếu thả vào vùng trống (không nối được) → giữ nguyên edge cũ
      // Không xóa edge, chỉ reset flag
      edgeReconnectSuccessful.current = true
      // Reset sau 1 tick để onConnectEnd (nếu fire sau) kịp đọc
      setTimeout(() => { isReconnecting.current = false }, 0)
    },
    [setEdges]
  )

  const onPaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      // Only create a node if clicking on the pane background, not on a node or edge
      const target = event.target as Element
      const isPane = target.classList.contains('react-flow__pane') ||
                     target.classList.contains('react-flow__background')

      if (!isPane) return

      event.preventDefault()
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'textNode',
        position,
        data: { label: '' },
      }

      setNodes((nds) => [...nds, newNode])
      hasChangesRef.current = true
    },
    [screenToFlowPosition, setNodes]
  )

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      // Fallback for double click if onPaneDoubleClick is blocked
      if (event.detail === 2) {
        onPaneDoubleClick(event)
      }
    },
    [onPaneDoubleClick]
  )

  // Add a new node to the center of the viewport
  const addCard = useCallback(() => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    })
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'textNode',
      position,
      data: { label: '' },
    }
    setNodes((nds) => nds.concat(newNode))
    hasChangesRef.current = true
  }, [screenToFlowPosition, setNodes])

  // Auto-save logic
  useEffect(() => {
    if (!hasChangesRef.current) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      await updateMindmap(mindmapId, { nodes, edges, title })
      setIsSaving(false)
      hasChangesRef.current = false
    }, 1500) // 1.5s debounce

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [nodes, edges, title, mindmapId, setIsSaving])

  return (
    <div className="w-full h-full bg-white flex flex-col relative">

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative" onDoubleClick={onPaneDoubleClick}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeDragStop={onNodeDragStop}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          reconnectRadius={20}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          panOnDrag={isPanMode}
          selectionOnDrag={!isPanMode}
          panActivationKeyCode="Space"
          selectionMode={SelectionMode.Partial}
          fitView
          zoomOnDoubleClick={false}
          className="bg-white"
          minZoom={0.2}
          maxZoom={4}
          proOptions={{ hideAttribution: true }} // Hide watermark for clean UI
        >
          <HelperLinesRenderer horizontal={helperLines.horizontal} vertical={helperLines.vertical} />
          <style dangerouslySetInnerHTML={{ __html: `

            ${!isPanMode ? `
              .react-flow__pane {
                cursor: default !important;
              }
              .react-flow__pane.selection {
                cursor: default !important;
              }
              .react-flow__pane.draggable {
                cursor: grab !important;
              }
              .react-flow__pane.dragging {
                cursor: grabbing !important;
              }
            ` : ''}
          ` }} />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#cbd5e1" />
          <Controls 
            className="!bg-white !border-gray-200 !shadow-sm !rounded-xl overflow-hidden [&>button]:!border-[#e5e5e5] [&>button]:hover:!bg-gray-50"
            position="bottom-right" 
            showInteractive={false}
          />
          
          <Panel position="bottom-center" className="mb-6 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-gray-200 shadow-lg">
            <button
              onClick={addCard}
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors flex items-center gap-2 group relative"
              title="Add Card"
            >
              <SquarePlus className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Add Card
              </span>
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
              <button
                onClick={() => setIsPanMode(false)}
                className={`p-1.5 rounded-md transition-colors relative group ${!isPanMode ? 'bg-white shadow-md text-blue-600 border border-blue-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                title="Select Mode (V)"
              >
                <MousePointer2 className="w-4 h-4" strokeWidth={2.5} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Select
                </span>
              </button>
              <button
                onClick={() => setIsPanMode(true)}
                className={`p-1.5 rounded-md transition-colors relative group ${isPanMode ? 'bg-white shadow-md text-blue-600 border border-blue-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                title="Pan Mode (Space)"
              >
                <Hand className="w-4 h-4" strokeWidth={2.5} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Pan (Hold Space)
                </span>
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>

            <div className="relative" ref={pathMenuRef}>
              <button
                onClick={() => setIsPathMenuOpen(!isPathMenuOpen)}
                className={`p-2.5 rounded-lg transition-colors group ${isPathMenuOpen ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                title="Edge Style"
              >
                <Activity className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Edge Style
                </span>
              </button>
              {isPathMenuOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-gray-200 shadow-xl rounded-xl p-1.5 flex flex-col gap-1 z-50 w-36 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200">
                  <button onClick={() => updateGlobalPathType('bezier')} className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${edgePathType === 'bezier' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    Curved
                  </button>
                  <button onClick={() => updateGlobalPathType('smoothstep')} className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${edgePathType === 'smoothstep' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    Structured
                  </button>
                  <button onClick={() => updateGlobalPathType('straight')} className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${edgePathType === 'straight' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    Straight
                  </button>
                </div>
              )}
            </div>

          </Panel>
        </ReactFlow>
      </div>
    </div>
  )
}
