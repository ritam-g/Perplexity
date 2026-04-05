import React from 'react';
import { motion } from 'framer-motion';
const MotionButton = motion.button;

// Show only the first 5 words of a title; append "..." if truncated.
function truncateTitle(title = '') {
  const words = title.trim().split(/\s+/);
  if (words.length <= 5) return title;
  return words.slice(0, 5).join(' ') + '...';
}

export const SidebarChatItem = React.memo(({ chatItem, isActive, onClick }) => {
  const displayTitle = truncateTitle(chatItem.title);

  return (
    <MotionButton
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type="button"
      className={`group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all duration-200 ease-out transform-gpu will-change-transform ${
        isActive
          ? 'border border-white/5 bg-[#191f31] font-semibold text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_18px_40px_rgba(4,10,24,0.16)]'
          : 'text-slate-400 hover:scale-[1.01] hover:bg-[#191f31] hover:text-on-surface hover:shadow-[0_18px_36px_rgba(4,10,24,0.16)] active:scale-[0.99]'
      }`}
    >
      <div className={`h-1.5 w-1.5 rounded-full transition-all ${isActive ? 'bg-cyan-400 ai-glow' : 'bg-transparent group-hover:bg-slate-600'}`} />
      <span className="flex-1 truncate" title={chatItem.title}>{displayTitle}</span>
      {isActive && (
        <span className="text-[10px] font-bold uppercase tracking-tighter text-cyan-500/50">Active</span>
      )}
    </MotionButton>
  );
});
