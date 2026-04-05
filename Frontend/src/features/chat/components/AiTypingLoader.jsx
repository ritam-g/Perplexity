import React from "react";
import { motion } from "framer-motion";
const MotionDiv = motion.div;

const typingDots = [
  { id: "dot-1", delay: "-0.24s" },
  { id: "dot-2", delay: "-0.12s" },
  { id: "dot-3", delay: "0s" },
];

export const AiTypingLoader = React.memo(function AiTypingLoader() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.24, ease: "easeOut", delay: 0.12 }}
      role="status"
      aria-label="AI is typing"
      className="flex min-h-[5.75rem] min-w-[11.5rem] max-w-full flex-col gap-3 will-change-transform-opacity"
    >
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
        <span className="h-2 w-2 rounded-full bg-primary/70 animate-pulse" />
        <span>AI is thinking...</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 via-white/[0.03] to-transparent px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(138,235,255,0.14),transparent_42%),linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.12)_46%,transparent_78%)] opacity-80 animate-pulse" />
        <div className="animate-loader-shimmer pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_12%,rgba(255,255,255,0.15)_44%,transparent_72%)] opacity-60" />

        <div className="relative flex items-center gap-2.5">
          {typingDots.map((dot) => (
            <span
              key={dot.id}
              className="h-2.5 w-2.5 rounded-full bg-primary/80 shadow-[0_0_20px_rgba(138,235,255,0.32)] animate-bounce"
              style={{
                animationDelay: dot.delay,
                animationDuration: "1.2s",
              }}
            />
          ))}
        </div>
      </div>
    </MotionDiv>
  );
});
