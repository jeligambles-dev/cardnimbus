'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { create } from 'zustand'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  add: (message: string, type?: ToastType) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 4000)
  },
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

export function toast(message: string, type?: ToastType) {
  useToastStore.getState().add(message, type)
}

const typeClasses: Record<ToastType, string> = {
  success: 'border-emerald-700 bg-emerald-950 text-emerald-300',
  error: 'border-red-700 bg-red-950 text-red-300',
  info: 'border-nimbus-700 bg-nimbus-950 text-nimbus-300',
}

const typeIcon: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  ),
}

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium min-w-64 max-w-sm',
        typeClasses[t.type],
      ].join(' ')}
    >
      {typeIcon[t.type]}
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => remove(t.id)}
        className="opacity-60 hover:opacity-100 transition-opacity ml-1"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  )
}
