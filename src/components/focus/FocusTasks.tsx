'use client'

import { useState, useEffect } from 'react'
import { loadFocusTasks, createFocusTask, updateFocusTask, deleteFocusTask } from '@/app/(frontend)/pomodoro/actions'
import { useFocus } from '@/contexts/FocusContext'
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
  id: string
  title: string
  notes: string | null
  estimated_pomodoros: number
  completed_pomodoros: number
  is_completed: boolean
}

export default function FocusTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskEst, setNewTaskEst] = useState(1)
  const [newTaskNotes, setNewTaskNotes] = useState('')

  const { activeTaskId, setActiveTaskId } = useFocus()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    const { data, error } = await loadFocusTasks()
    
    if (error === 'Unauthorized') {
      // Guest mode
      const local = localStorage.getItem('mindfocus_tasks')
      if (local) setTasks(JSON.parse(local))
    } else if (data) {
      setTasks(data)
    }
    setIsLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    
    setIsAdding(false)
    const { data, error } = await createFocusTask(newTaskTitle, newTaskEst, newTaskNotes)
    
    if (error === 'Unauthorized') {
      // Guest mode creation
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTaskTitle,
        notes: newTaskNotes,
        estimated_pomodoros: newTaskEst,
        completed_pomodoros: 0,
        is_completed: false
      }
      const updated = [newTask, ...tasks]
      setTasks(updated)
      localStorage.setItem('mindfocus_tasks', JSON.stringify(updated))
      if (tasks.length === 0) setActiveTaskId(newTask.id)
      setNewTaskTitle('')
      setNewTaskEst(1)
      setNewTaskNotes('')
    } else if (data) {
      setTasks([data, ...tasks])
      setNewTaskTitle('')
      setNewTaskEst(1)
      setNewTaskNotes('')
      if (tasks.length === 0) setActiveTaskId(data.id)
    }
  }

  const handleToggleComplete = async (task: Task) => {
    const updatedStatus = { is_completed: !task.is_completed }
    const { error } = await updateFocusTask(task.id, updatedStatus)
    
    if (error === 'Unauthorized') {
      const updated = tasks.map(t => t.id === task.id ? { ...t, ...updatedStatus } : t)
      setTasks(updated)
      localStorage.setItem('mindfocus_tasks', JSON.stringify(updated))
    } else {
      fetchTasks()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteFocusTask(id)
    
    if (error === 'Unauthorized') {
      const updated = tasks.filter(t => t.id !== id)
      setTasks(updated)
      localStorage.setItem('mindfocus_tasks', JSON.stringify(updated))
      if (activeTaskId === id) setActiveTaskId(null)
    } else {
      setTasks(tasks.filter(t => t.id !== id))
      if (activeTaskId === id) setActiveTaskId(null)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Active Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-[10px] font-black text-black/40">{tasks.filter(t => t.is_completed).length}/{tasks.length}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-4 h-4 border-2 border-black/10 border-t-black/40 rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 && !isAdding ? (
          <div className="text-center py-12 text-xs font-bold text-black/40 uppercase tracking-widest">
            Your task list is empty
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`group flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer ${
                  activeTaskId === task.id ? 'bg-black/[0.04]' : 'hover:bg-black/[0.02]'
                }`}
                onClick={() => setActiveTaskId(task.id)}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleComplete(task) }}
                  className={`shrink-0 transition-all ${task.is_completed ? 'text-primary' : 'text-black/20 hover:text-primary'}`}
                >
                  {task.is_completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${task.is_completed ? 'text-black/30 line-through' : 'text-foreground'}`}>
                    {task.title}
                  </p>
                  {task.notes && !task.is_completed && (
                    <p className="text-[10px] mt-1 text-black/50 truncate font-medium uppercase tracking-wider">
                      {task.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-black text-black/40">
                    {task.completed_pomodoros}/{task.estimated_pomodoros}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(task.id) }}
                    className="p-2 rounded-full hover:bg-red-50 text-black/20 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isAdding ? (
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-6 rounded-[32px] bg-black/[0.04] border border-black/[0.05] flex flex-col gap-4"
            onSubmit={handleCreate}
          >
            <input
              autoFocus
              type="text"
              placeholder="What are you focusing on?"
              className="w-full bg-transparent border-none outline-none text-base font-bold placeholder:text-black/30 text-foreground"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
            />
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-black/50">Est. Pomos</span>
                <input
                  type="number"
                  min="1"
                  className="w-16 bg-transparent border-none outline-none font-black text-sm text-foreground"
                  value={newTaskEst}
                  onChange={e => setNewTaskEst(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-black/50 block mb-1">Notes</span>
                <input
                  type="text"
                  placeholder="Optional notes..."
                  className="w-full bg-transparent border-none outline-none text-[11px] font-medium text-foreground placeholder:text-black/30"
                  value={newTaskNotes}
                  onChange={e => setNewTaskNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
              >
                Save Task
              </button>
            </div>
          </motion.form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 w-full py-6 rounded-3xl border border-dashed border-black/10 flex items-center justify-center gap-3 text-black/40 hover:text-foreground hover:border-black/30 hover:bg-black/[0.02] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Add New Task</span>
          </button>
        )}
      </div>
    </div>
  )
}
