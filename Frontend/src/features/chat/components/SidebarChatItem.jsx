import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '../icons';
import { formatRelativeTime } from '../utils/formatters';

// Show only the first 5 words of a title; append '…' if truncated.
function truncateTitle(title = '') {
  const words = title.trim().split(/\s+/);
  if (words.length <= 5) return title;
  return words.slice(0, 5).join(' ') + '…';
}

export const SidebarChatItem = React.memo(({ chatItem, isActive, onClick }) => {
  const displayTitle = truncateTitle(chatItem.title);

  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      type='button'
      className={`w-full px-4 py-2.5 text-left text-sm transition-all rounded-xl flex items-center gap-3 group ${
        isActive
          ? 'bg-[#191f31] text-cyan-300 font-semibold shadow-inner border border-white/5'
          : 'text-slate-400 hover:bg-[#191f31] hover:text-on-surface'
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-cyan-400 ai-glow' : 'bg-transparent group-hover:bg-slate-600'}`} />
      <span className="truncate flex-1" title={chatItem.title}>{displayTitle}</span>
      {isActive && (
        <span className="text-[10px] text-cyan-500/50 font-bold uppercase tracking-tighter">Active</span>
      )}
    </motion.button>
  );
});
