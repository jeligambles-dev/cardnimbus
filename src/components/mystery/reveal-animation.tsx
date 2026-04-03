"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export interface RevealResult {
  pullId: string;
  tier: string;
  itemName: string;
  itemImage: string | null;
  itemValue: number;
}

interface RevealAnimationProps {
  result: RevealResult | null;
  onClose: () => void;
}

const TIER_GLOW: Record<string, string> = {
  Bronze: "#b45309",
  Silver: "#94a3b8",
  Gold: "#eab308",
  Platinum: "#67e8f9",
  Common: "#6b7280",
  Rare: "#3b82f6",
  "Ultra Rare": "#a855f7",
  Secret: "#ec4899",
};

function getTierGlow(tier: string): string {
  return TIER_GLOW[tier] ?? "#8b5cf6";
}

export function RevealAnimation({ result, onClose }: RevealAnimationProps) {
  const [phase, setPhase] = useState<"idle" | "flip" | "glow" | "revealed">(
    "idle"
  );

  useEffect(() => {
    if (!result) {
      setPhase("idle");
      return;
    }
    // Sequence: flip → glow → revealed
    setPhase("flip");
    const t1 = setTimeout(() => setPhase("glow"), 800);
    const t2 = setTimeout(() => setPhase("revealed"), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [result]);

  if (!result) return null;

  const glowColor = getTierGlow(result.tier);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => phase === "revealed" && onClose()}
        >
          <motion.div
            key="card-container"
            className="relative flex flex-col items-center"
            style={{ perspective: 1200 }}
          >
            {/* Card flip wrapper */}
            <motion.div
              className="relative w-64 h-96 rounded-2xl overflow-hidden cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                boxShadow:
                  phase === "glow" || phase === "revealed"
                    ? `0 0 60px 20px ${glowColor}80, 0 0 120px 40px ${glowColor}40`
                    : "none",
              }}
              initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
              animate={{
                rotateY: phase === "flip" || phase === "idle" ? 180 : 0,
                scale: phase === "idle" ? 0.8 : 1,
                opacity: 1,
              }}
              transition={{
                rotateY: { duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] },
                scale: { duration: 0.4 },
                opacity: { duration: 0.3 },
                boxShadow: { duration: 0.5 },
              }}
            >
              {/* Card back face */}
              <div
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center border-2 border-white/10"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-6xl opacity-30">?</div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
              </div>

              {/* Card front face */}
              <div
                className="absolute inset-0 rounded-2xl bg-gray-900 border-2 border-white/10 overflow-hidden flex flex-col"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* Image area */}
                <div className="flex-1 bg-gray-800 overflow-hidden relative">
                  {result.itemImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={result.itemImage}
                      alt={result.itemName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="h-16 w-16 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {/* Glow overlay */}
                  {(phase === "glow" || phase === "revealed") && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(ellipse at center, ${glowColor}30 0%, transparent 70%)`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>

                {/* Info area */}
                <div className="p-4 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: glowColor }}>
                    {result.tier}
                  </p>
                  <p className="text-white font-bold text-sm leading-tight line-clamp-2">
                    {result.itemName}
                  </p>
                  <p className="text-green-400 font-black text-lg">
                    {formatCurrency(result.itemValue)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Particle burst on reveal */}
            {phase === "revealed" && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: glowColor }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{
                      x: Math.cos((i / 12) * Math.PI * 2) * 120,
                      y: Math.sin((i / 12) * Math.PI * 2) * 120,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 0.8, delay: i * 0.03 }}
                  />
                ))}
              </motion.div>
            )}

            {/* Tap to close hint */}
            {phase === "revealed" && (
              <motion.p
                className="mt-6 text-sm text-gray-500"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Tap anywhere to close
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
