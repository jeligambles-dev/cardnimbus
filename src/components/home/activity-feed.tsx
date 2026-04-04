'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Activity {
  id: string
  action: string
  item: string
  time: string
  value?: string
  type: 'purchase' | 'pull' | 'listing'
}

// Demo activity - will be replaced with real data from API later
const DEMO_ACTIVITIES: Activity[] = [
  { id: '1', action: 'Just pulled', item: 'Charizard VMAX Alt Art', time: '2 min ago', value: '$450', type: 'pull' },
  { id: '2', action: 'Purchased', item: 'Obsidian Flames Booster Box', time: '3 min ago', value: '$129.99', type: 'purchase' },
  { id: '3', action: 'Listed', item: 'Umbreon VMAX PSA 10', time: '5 min ago', value: '$320', type: 'listing' },
  { id: '4', action: 'Won raffle', item: 'Moonbreon Alt Art', time: '7 min ago', value: '$285', type: 'pull' },
  { id: '5', action: 'Purchased', item: 'Pikachu VMAX NM', time: '8 min ago', value: '$42', type: 'purchase' },
  { id: '6', action: 'Listed', item: 'Shining Fates ETB', time: '11 min ago', value: '$68', type: 'listing' },
  { id: '7', action: 'Just pulled', item: 'Rayquaza VMAX Secret', time: '12 min ago', value: '$195', type: 'pull' },
  { id: '8', action: 'Purchased', item: 'Paldea Evolved Pack', time: '14 min ago', value: '$4.99', type: 'purchase' },
]

const TYPE_STYLES = {
  purchase: { emoji: '🛒', color: 'text-volt-500' },
  pull: { emoji: '✨', color: 'text-nimbus-500' },
  listing: { emoji: '🏷️', color: 'text-blue-500' },
}

export function ActivityFeed() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % DEMO_ACTIVITIES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Show 4 activities at a time, rotating
  const visible = [0, 1, 2, 3].map((offset) => DEMO_ACTIVITIES[(index + offset) % DEMO_ACTIVITIES.length])

  return (
    <section className="bg-white border-b border-surface-border">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt-500 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-volt-500" />
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Live Activity
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((activity) => {
              const style = TYPE_STYLES[activity.type]
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className="rounded-xl border border-surface-border bg-surface-raised p-3 hover:border-nimbus-300 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{style.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary">
                        <span className={`font-semibold ${style.color}`}>
                          {activity.action}
                        </span>
                      </p>
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {activity.item}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-text-muted">{activity.time}</span>
                        {activity.value && (
                          <span className="text-xs font-bold text-nimbus-600">
                            {activity.value}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
