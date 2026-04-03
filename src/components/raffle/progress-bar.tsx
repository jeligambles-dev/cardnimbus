"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  filled: number;
  total: number;
  className?: string;
}

export function ProgressBar({ filled, total, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? Math.min(100, (filled / total) * 100) : 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">
          {filled.toLocaleString()} / {total.toLocaleString()} tickets
        </span>
        <span className="font-semibold text-nimbus-400">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-nimbus-500 to-nimbus-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
