import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '../icons';
import { formatRelativeTime } from '../utils/formatters';

export function SidebarChatItem({ chatItem, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      type='button'
      className={`w-full rounded-[20px] border px-4 py-3 text-left transition duration-200 ${isActive
        ? 'border-teal-400/30 bg-[linear-gradient(135deg,rgba(45,212,191,0.15),rgba(15,23,42,0.9))] shadow-[0_20px_50px_-34px_rgba(45,212,191,0.85)]'
        : 'border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]'
        }`}
    >
      <p className='truncate text-sm font-semibold text-white'>{chatItem.title}</p>
      <div className='mt-2 flex items-center gap-1.5 text-xs text-slate-400'>
        <ClockIcon />
        <span>{formatRelativeTime(chatItem.lastUpdated)}</span>
      </div>
    </motion.button>
  );
}
