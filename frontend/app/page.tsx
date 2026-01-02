'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types/api';
import { taskService } from '@/lib/services/task-service';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Leaf,
  LayoutGrid,
  CheckCircle2,
  Circle,
  Plus,
  Loader2,
  Search,
  Settings as SettingsIcon,
  Bell
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      if (err.message?.includes('Unauthorized')) {
        router.push('/auth');
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadTasks();
    }
  }, [isAuthenticated, authLoading]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    if (!matchesSearch) return false;
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-primary mx-auto mb-4" />
          <p className="text-slate-500 font-medium animate-pulse">Growing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Leaf className="w-6 h-6 text-brand-primary" />
          </div>
          <span className="text-xl font-black text-slate-900">Bonsai</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-brand-primary rounded-xl font-bold transition-all">
            <LayoutGrid className="w-5 h-5" />
            Workspace
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all group">
            <Bell className="w-5 h-5 group-hover:text-slate-900" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-semibold transition-all group">
            <SettingsIcon className="w-5 h-5 group-hover:text-slate-900" />
            Settings
          </button>
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-4 text-left">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 uppercase">
              {user?.username.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 truncate">{user?.username}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-all overflow-hidden relative group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto pb-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-brand-primary" />
              <span className="text-xl font-black text-slate-900">Bonsai</span>
            </div>
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white text-xs font-bold uppercase">
              {user?.username.charAt(0)}
            </div>
          </header>

          {/* Welcome & Stats */}
          <div className="mb-10 lg:flex items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-2">
                Hey, {user?.username} 👋
              </h2>
              <p className="text-slate-500 font-medium">
                You have <span className="text-brand-primary font-bold">{stats.active}</span> tasks to clear today.
              </p>
            </div>

            <div className="flex gap-3 mt-6 lg:mt-0">
              <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-success" />
                <span className="text-sm font-bold text-slate-700">{stats.completed} Done</span>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                <Circle className="w-4 h-4 text-brand-secondary" />
                <span className="text-sm font-bold text-slate-700">{stats.active} Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Task Creation & List */}
            <div className="lg:col-span-8 space-y-8">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl focus:ring-0 focus:border-brand-primary outline-none text-sm transition-all shadow-sm"
                  />
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                  {(['all', 'active', 'completed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task List */}
              <div className="relative">
                {loading ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-50 shadow-sm">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-primary mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Refreshing list...</p>
                  </div>
                ) : filteredTasks.length > 0 ? (
                  <TaskList tasks={filteredTasks} onTaskUpdate={loadTasks} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <LayoutGrid className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Clean Slate</h3>
                    <p className="text-slate-400 text-sm max-w-[200px] mx-auto">No tasks match your criteria. Start fresh!</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Sticky Task Form Sidebar (Desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-6">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-vibrant relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <h3 className="text-lg font-black mb-1 relative z-10">Add Task</h3>
                <p className="text-slate-400 text-xs font-medium mb-4 relative z-10">Type and hit enter</p>
                <TaskForm onTaskCreated={loadTasks} />
              </div>

              <div className="bg-indigo-600 p-6 rounded-3xl text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-200">Progress</span>
                  <span className="text-2xl font-black">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-indigo-900/30 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    className="bg-white h-2 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
