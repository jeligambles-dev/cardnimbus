"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "cn_email_popup_state";

type State = "unseen" | "minimized" | "claimed" | "dismissed";

export function EmailDiscountPopup() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>("unseen");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "already" | "error";
    message: string;
    code?: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as State | null;
    if (stored === "claimed") {
      setState("claimed");
    } else if (stored === "dismissed") {
      setState("dismissed");
    } else if (stored === "minimized") {
      setState("minimized");
    } else {
      // First visit — show popup after a short delay
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissFloating = (e: React.MouseEvent) => {
    e.stopPropagation();
    setState("dismissed");
    localStorage.setItem(STORAGE_KEY, "dismissed");
  };

  const closePopup = () => {
    setOpen(false);
    if (state === "unseen") {
      setState("minimized");
      localStorage.setItem(STORAGE_KEY, "minimized");
    }
  };

  const reopenPopup = () => {
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ type: "error", message: data.error ?? "Something went wrong" });
      } else if (data.alreadyRegistered) {
        setResult({ type: "already", message: data.message });
      } else if (data.success) {
        setResult({
          type: "success",
          message: data.message,
          code: data.couponCode,
        });
        setState("claimed");
        localStorage.setItem(STORAGE_KEY, "claimed");
      }
    } catch {
      setResult({ type: "error", message: "Failed to submit. Try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Hide entirely for logged-in users
  if (status === "authenticated" && session?.user) return null;

  return (
    <>
      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && closePopup()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-surface-border bg-surface shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={closePopup}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-overlay text-text-muted transition-colors hover:bg-surface-border hover:text-text-primary"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Red accent header */}
              <div className="bg-gradient-to-br from-nimbus-500 to-nimbus-600 px-8 py-10 text-center">
                <div className="mx-auto mb-3 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <span className="text-4xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Get 5% Off
                </h2>
                <p className="mt-2 text-sm text-white/90">
                  Your first purchase on Card Nimbus
                </p>
              </div>

              {/* Content */}
              <div className="px-8 py-6">
                {result?.type === "success" ? (
                  <div className="text-center">
                    <p className="text-text-primary font-medium">
                      {result.message}
                    </p>
                    <p className="mt-4 text-xs text-text-secondary uppercase tracking-wider">
                      Your code
                    </p>
                    <div className="mt-2 rounded-xl border-2 border-dashed border-nimbus-500 bg-nimbus-50 px-4 py-3">
                      <p className="font-mono text-2xl font-bold tracking-wider text-nimbus-600">
                        {result.code}
                      </p>
                    </div>
                    <p className="mt-4 text-xs text-text-muted">
                      Valid for 30 days. One-time use. Save it for checkout.
                    </p>
                    <button
                      onClick={closePopup}
                      className="mt-5 w-full rounded-xl bg-nimbus-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-nimbus-600"
                    >
                      Keep Shopping
                    </button>
                  </div>
                ) : result?.type === "already" ? (
                  <div className="text-center">
                    <p className="text-text-primary">{result.message}</p>
                    <button
                      onClick={closePopup}
                      className="mt-5 w-full rounded-xl bg-surface-overlay px-6 py-3 text-sm font-semibold text-text-primary border border-surface-border transition-colors hover:bg-surface-border"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-sm text-text-secondary mb-4">
                      Enter your email and we&apos;ll send you a one-time 5% off code.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-nimbus-500 focus:outline-none focus:ring-2 focus:ring-nimbus-500/20"
                        disabled={loading}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-nimbus-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-nimbus-500/25 transition-colors hover:bg-nimbus-600 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? "Sending..." : "Claim My 5% Off"}
                      </button>
                      {result?.type === "error" && (
                        <p className="text-center text-sm text-red-600">
                          {result.message}
                        </p>
                      )}
                    </form>
                    <p className="mt-4 text-center text-[11px] text-text-muted">
                      By signing up you agree to receive marketing emails. Unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating "Get 5% off" button when minimized */}
      <AnimatePresence>
        {!open && state === "minimized" && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6"
          >
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reopenPopup}
                className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white bg-gradient-to-b from-nimbus-500 to-nimbus-600 shadow-[0_1px_0_0_rgba(255,255,255,0.3)_inset,0_8px_24px_-4px_rgba(255,0,0,0.5)] ring-1 ring-inset ring-white/20 hover:from-nimbus-400 hover:to-nimbus-500 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 sm:px-8 sm:py-4 sm:text-base"
              >
                <span>Get 5% Off</span>
              </motion.button>
              <button
                type="button"
                onClick={dismissFloating}
                aria-label="Dismiss offer"
                className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-nimbus-600 shadow-md ring-2 ring-nimbus-600 hover:bg-nimbus-50 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
