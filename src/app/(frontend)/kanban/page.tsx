'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Calendar, Trash2 } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'Cần làm' },
  { id: 'in_progress', title: 'Đang làm' },
  { id: 'done', title: 'Đã xong' }
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // Đảm bảo chỉ render trên client để tránh lỗi hydration với react-beautiful-dnd
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        await fetchTasks();
      } else {
        setLoading(false);
      }
    }
    init();
  }, [mounted]);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Cập nhật state local ngay lập tức (Optimistic UI)
    const updatedTasks = Array.from(tasks);
    const draggedTaskIndex = updatedTasks.findIndex(t => t.id === draggableId);
    
    if (draggedTaskIndex === -1) return;
    
    const draggedTask = { ...updatedTasks[draggedTaskIndex], status: destination.droppableId };
    
    // Loại bỏ task cũ và chèn vào vị trí mới (nếu muốn xử lý vị trí chi tiết)
    updatedTasks.splice(draggedTaskIndex, 1);
    
    // Tìm vị trí mới trong mảng tasks của cột đích
    const targetColumnTasks = updatedTasks.filter(t => t.status === destination.droppableId);
    const nonTargetColumnTasks = updatedTasks.filter(t => t.status !== destination.droppableId);
    
    targetColumnTasks.splice(destination.index, 0, draggedTask);
    
    setTasks([...targetColumnTasks, ...nonTargetColumnTasks]);

    // Cập nhật DB
    const { error } = await supabase
      .from('tasks')
      .update({ status: destination.droppableId })
      .eq('id', draggableId);

    if (error) {
      console.error('Error updating task status:', error);
      // Nếu lỗi, fetch lại dữ liệu từ DB
      fetchTasks();
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Vui lòng đăng nhập để sử dụng tính năng này.</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Bảng Kanban</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý tiến độ công việc trực quan (Sử dụng chung dữ liệu với Todo List).</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => {
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
              <div key={column.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col h-[calc(100vh-200px)]">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span>{column.title}</span>
                    <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                      {columnTasks.length}
                    </span>
                  </h2>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto no-scrollbar space-y-3 p-1 rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-slate-100 dark:bg-slate-800/50' : ''
                      }`}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500/50' : ''
                              }`}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-slate-800 dark:text-white font-medium text-sm">
                                    {task.title}
                                  </span>
                                  <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto">
                                  <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Calendar size={12} />
                                    <span>{task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : 'No date'}</span>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                    task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                    'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                  }`}>
                                    {task.priority === 'high' ? 'Gấp' : task.priority === 'medium' ? 'Vừa' : 'Thấp'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
