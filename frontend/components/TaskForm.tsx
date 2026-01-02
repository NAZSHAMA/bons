'use client';

import { useState } from 'react';
import { TaskCreate } from '@/types/api';
import { taskService } from '@/lib/services/task-service';
import { Plus, Loader2 } from 'lucide-react';

interface TaskFormProps {
  onTaskCreated: () => void;
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const taskData: TaskCreate = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
    };

    try {
      setIsSubmitting(true);
      await taskService.createTask(taskData);
      setTitle('');
      setDescription('');
      onTaskCreated();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:outline-none placeholder-slate-400 text-sm font-bold transition-all"
        maxLength={200}
        disabled={isSubmitting}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:bg-white/20 focus:outline-none placeholder-slate-400 text-sm font-medium transition-all resize-none"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !title.trim()}
        className="w-full py-3 px-4 bg-white text-slate-900 rounded-xl font-black text-sm hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
        ) : (
          <>
            <Plus className="w-4 h-4 stroke-[3px] group-hover:rotate-90 transition-transform" />
            Add to List
          </>
        )}
      </button>
    </form>
  );
}
