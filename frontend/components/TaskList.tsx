'use client';

import { Task } from '@/types/api';
import { taskService } from '@/lib/services/task-service';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, CheckCircle2, Circle, Clock, Loader2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggle = async (id: number) => {
    try {
      setTogglingId(id);
      await taskService.toggleTask(id);
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await taskService.deleteTask(id);
      onTaskUpdate();
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            layout
            className={`group relative p-5 rounded-3xl border-2 transition-all duration-300 ${
              task.completed
                ? 'bg-slate-50 border-slate-100 opacity-75'
                : 'bg-white border-white shadow-sm hover:shadow-md hover:border-slate-100'
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggle(task.id)}
                disabled={togglingId === task.id}
                className={`mt-1 transition-transform active:scale-90 ${
                  togglingId === task.id ? 'cursor-wait' : 'cursor-pointer'
                }`}
              >
                {togglingId === task.id ? (
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                ) : task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-brand-success fill-brand-success/10" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-200 group-hover:text-brand-primary transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h3
                  className={`text-base font-bold transition-all ${
                    task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className={`text-sm mt-1 mb-2 line-clamp-2 ${
                    task.completed ? 'text-slate-300' : 'text-slate-500 font-medium'
                  }`}>
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-300">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.created_at)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                disabled={deletingId === task.id}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                {deletingId === task.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
