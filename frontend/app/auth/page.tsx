'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs for eye-catchy look */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-vibrant mb-4">
            <Leaf className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bonsai</h1>
          <p className="text-slate-500 font-medium">Your tasks, beautifully balanced.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: showLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: showLogin ? 20 : -20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            {showLogin ? (
              <LoginForm onSwitchToRegister={() => setShowLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setShowLogin(true)} />
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-slate-200" />
            Built with Modern Tech
            <span className="w-8 h-[1px] bg-slate-200" />
          </p>
        </motion.div>
      </div>
    </div>
  );
}
