"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCodeWashStore } from "@/store/useCodeWashStore";

/** Elegant completion state shown when the codebase is cleaned. */
export function CompletionOverlay() {
  const { completed, reset } = useCodeWashStore();

  const handleRestart = () => {
    window.dispatchEvent(new Event("codewash:reset"));
    reset();
  };

  return (
    <AnimatePresence>
      {completed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 bg-[var(--bg)]/70 backdrop-blur-sm"
        >
          <h1 className="text-2xl font-medium tracking-tight">Codebase Cleaned</h1>
          <button
            onClick={handleRestart}
            className="rounded border border-[var(--line)] px-4 py-2 font-mono text-sm text-[var(--accent)]"
          >
            Restart
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
