import React from 'react';
import { motion } from 'framer-motion';
import { BotIcon } from '../icons';
import { itemMotion } from '../utils/motion';

export function LoadingMessage() {
  return (
    <motion.div
      {...itemMotion}
      className="flex flex-col items-center justify-center p-4 w-full"
    >
      <div className="flex flex-col items-center gap-2 max-w-xs text-center">
        <span className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] animate-pulse">Processing Neural Output...</span>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full w-48 animate-pulse shadow-[0_0_10px_rgba(138,235,255,0.2)]"></div>
      </div>
    </motion.div>
  );
}
