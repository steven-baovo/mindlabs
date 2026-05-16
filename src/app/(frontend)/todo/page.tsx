'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TodoPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
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
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        { 
          title: newTask, 
          user_id: user.id,
          status: 'todo',
          priority: 'medium',
          due_date: new Date().toISOString().split('T')[0]
        }
      ])
      .select();

    if (error) {
      console.error('Error adding task:', error);
    } else if (data) {
      setTasks([data[0], ...tasks]);
      setNewTask('');
    }
  };

  const toggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      ));
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Nhiệm vụ của tôi</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý các công việc cần làm hàng ngày.</p>
      </div>
      
      {/* Quick Add */}
      <form onSubmit={addTask} className="mb-8 flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Thêm nhiệm vụ mới (Nhập tiêu đề và gõ Enter)..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={20} />
          <span>Thêm</span>
        </button>
      </form>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Active Tasks */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span>Đang thực hiện</span>
            <span className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
              {tasks.filter(t => t.status === 'todo').length}
            </span>
          </h2>
          <div className="space-y-2">
            {tasks.filter(t => t.status === 'todo').map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover: transition-all group">
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleTask(task.id, task.status)} className="text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0">
                    <Circle size={22} />
                  </button>
                  <span className="text-slate-800 dark:text-white font-medium">{task.title}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {task.due_date && (
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Calendar size={14} />
                      <span>{new Date(task.due_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    task.priority === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    task.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {task.priority === 'high' ? 'Khẩn cấp' : task.priority === 'medium' ? 'Vừa' : 'Thấp'}
                  </span>
                  <button 
                    onClick={() => deleteTask(task.id)} 
                    className="text-slate-400 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.status === 'todo').length === 0 && (
              <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                Tuyệt vời! Bạn đã hoàn thành tất cả công việc.
              </div>
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        {tasks.filter(t => t.status === 'done').length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span>Đã hoàn thành</span>
              <span className="text-sm bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
                {tasks.filter(t => t.status === 'done').length}
              </span>
            </h2>
            <div className="space-y-2">
              {tasks.filter(t => t.status === 'done').map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 opacity-75 hover:opacity-100 transition-opacity group">
                  <div className="flex items-center gap-3 flex-1">
                    <button onClick={() => toggleTask(task.id, task.status)} className="text-green-500 flex-shrink-0">
                      <CheckCircle2 size={22} />
                    </button>
                    <span className="text-slate-500 dark:text-slate-500 line-through font-medium">{task.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => deleteTask(task.id)} 
                      className="text-slate-400 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
