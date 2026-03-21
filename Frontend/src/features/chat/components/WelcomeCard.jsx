import React from 'react';
import { motion } from 'framer-motion';
import { BotIcon } from '../icons';
import { itemMotion } from '../utils/motion';

export function WelcomeCard() {
  return (
    <motion.div
      {...itemMotion}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16"
    >
      <div className="col-span-1 md:col-span-2 p-8 rounded-2xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <span className="material-symbols-outlined text-[120px]">neurology</span>
        </div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-on-surface mb-3 tracking-tight">How can I help you today?</h3>
          <p className="text-on-surface-variant max-w-md text-lg leading-relaxed">
            I'm Doraemon, your gadget-powered AI assistant! Whether it's coding, planning, or just a chat, I've got the right tools for you.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5 group hover:bg-surface-container transition-all cursor-pointer hover:scale-[1.02] duration-300 shadow-md">
        <span className="material-symbols-outlined text-primary mb-4 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
        <p className="font-bold text-on-surface text-base mb-1">Code Optimization</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">Refactor complex logic structures with AI precision.</p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-container-low border border-outline-variant/5 group hover:bg-surface-container transition-all cursor-pointer hover:scale-[1.02] duration-300 shadow-md">
        <span className="material-symbols-outlined text-secondary mb-4 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>draw</span>
        <p className="font-bold text-on-surface text-base mb-1">Asset Generation</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">Create high-fidelity SVG patterns and vector styles.</p>
      </div>
    </motion.div>
  );
}
