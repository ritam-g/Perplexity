import React from 'react';
import { motion } from 'framer-motion';
import { BotIcon } from '../icons';
import { itemMotion } from '../utils/motion';

export function WelcomeCard() {
  return (
    <motion.article
      {...itemMotion}
      className='flex gap-4'
    >
      <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-200'>
        <BotIcon />
      </div>
      <div className='max-w-[88%] md:max-w-[86%]'>
        <div className='mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
          Nova Assistant
        </div>
        <div className='rounded-[28px] rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] px-5 py-5 text-[15px] leading-7 text-slate-100 shadow-[0_24px_60px_-34px_rgba(2,6,23,1)] md:px-6'>
          Hello! I&apos;m your AI assistant. I can help you with coding, creative writing, research, analysis, and general problem solving. How can I assist you today?
        </div>
      </div>
    </motion.article>
  );
}
