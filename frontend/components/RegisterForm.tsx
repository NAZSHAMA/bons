'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3 || username.length > 50) {
      setError('Username must be between 3 and 50 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await register({ username, email, password });
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Registration failed';
      if (errorMessage.includes('Username already registered')) {
        setError('Username is already taken');
      } else if (errorMessage.includes('Email already registered')) {
        setError('Email is already registered');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl shadow-vibrant p-8 border-white/50">
      <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">
        Create Your Space
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Username
          </label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Unique username"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border-2 border-slate-100 rounded-xl focus:border-brand-primary focus:ring-0 outline-none transition-all font-medium text-slate-900"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Email
          </label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border-2 border-slate-100 rounded-xl focus:border-brand-primary focus:ring-0 outline-none transition-all font-medium text-slate-900"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border-2 border-slate-100 rounded-xl focus:border-brand-primary focus:ring-0 outline-none transition-all font-medium text-slate-900"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Confirm
            </label>
            <div className="relative group">
              <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border-2 border-slate-100 rounded-xl focus:border-brand-primary focus:ring-0 outline-none transition-all font-medium text-slate-900"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !username.trim() || !email.trim() || !password.trim()}
          className="w-full mt-4 py-4 px-6 bg-brand-success text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:bg-slate-300 disabled:shadow-none disabled:translate-y-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Join Bonsai
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm font-medium">
          Already have account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-brand-primary hover:text-indigo-700 font-bold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
