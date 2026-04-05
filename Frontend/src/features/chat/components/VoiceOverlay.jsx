import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const MotionDiv = motion.div;

export function VoiceOverlay({ listening, onStop, transcript }) {
  return (
    <AnimatePresence>
      {listening && (
        <MotionDiv
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09111a]/90 backdrop-blur-xl"
        >
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* Animated rings for pulsing effect */}
            <MotionDiv
              animate={{ 
                scale: [1, 2],
                opacity: [0.5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute h-full w-full rounded-full border-2 border-teal-500/30"
            />
            <MotionDiv
              animate={{ 
                scale: [1, 1.6],
                opacity: [0.3, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 0.5,
                ease: "easeOut"
              }}
              className="absolute h-full w-full rounded-full border-2 border-teal-500/20"
            />
            
            <div className="z-10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-[0_0_50px_rgba(45,212,191,0.4)]">
              <svg viewBox='0 0 24 24' aria-hidden='true' className='h-12 w-12'>
                <path d='M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm0 0v4m-5-6a5 5 0 0 0 10 0' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Listening...</h2>
            <div className="max-w-2xl px-8">
              <p className="text-xl text-teal-100/70 italic min-h-[1.5em] leading-relaxed">
                {transcript || "I'm listening, say something..."}
              </p>
            </div>
          </div>

          <button
            onClick={onStop}
            className="mt-16 group relative flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-[1px] transition-all hover:bg-white/10"
          >
            <div className="relative rounded-[calc(1rem-1px)] bg-[#0f172a] px-10 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-transparent">
              Stop Interaction
            </div>
          </button>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
