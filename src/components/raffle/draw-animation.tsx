"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawAnimationProps {
  winnerName: string;
  ticketNumber: number;
}

const FAKE_NAMES = [
  "CryptoKing",
  "StarCollector",
  "NimbusHunter",
  "CardShark",
  "RareFinds",
  "LuckyDraw",
  "PrizeSeeking",
  "HoloHunter",
];

function randomName() {
  return FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
}

export function DrawAnimation({ winnerName, ticketNumber }: DrawAnimationProps) {
  const [phase, setPhase] = useState<"suspense" | "reveal">("suspense");
  const [rollingName, setRollingName] = useState(randomName());

  useEffect(() => {
    let count = 0;
    const roll = setInterval(() => {
      setRollingName(randomName());
      count++;
      if (count >= 20) {
        clearInterval(roll);
        setPhase("reveal");
      }
    }, 100);
    return () => clearInterval(roll);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <AnimatePresence mode="wait">
        {phase === "suspense" ? (
          <motion.div
            key="suspense"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center"
          >
            <p className="text-sm text-text-muted">Drawing winner…</p>
            <p className="mt-3 text-3xl font-bold text-text-primary">
              {rollingName}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0px rgba(249,115,22,0)",
                  "0 0 40px rgba(249,115,22,0.8)",
                  "0 0 20px rgba(249,115,22,0.4)",
                ],
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="rounded-2xl border border-nimbus-500/50 bg-nimbus-950/50 px-10 py-8"
            >
              <p className="text-sm font-medium text-nimbus-400">Winner</p>
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-white">
                {winnerName}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Ticket #{ticketNumber}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
