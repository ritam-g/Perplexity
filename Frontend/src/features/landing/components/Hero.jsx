import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
const MotionDiv = motion.div;

const Hero = () => {
  return (
    <section className="relative pt-24 pb-32 sm:pt-32 sm:pb-48 overflow-hidden z-[50]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Hero Left Content */}
        <MotionDiv
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ai-glow animate-pulse"></span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-400">NOW WITH V2.4 INTELLIGENCE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter">
            Your Personal AI <br />
            <span className="bg-gradient-to-br from-cyan-400 via-secondary to-purple-500 bg-clip-text text-transparent">Intelligence Engine</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed">
            Experience the next frontier of Artificial Intelligence. Doraemon v2.4 combines massive compute with ethereal design to deliver insights at the speed of light.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/login" className="bg-cyan-400 text-black px-8 py-4 rounded-2xl font-black text-sm tracking-tight hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-cyan-400/20">
              Get Started Free
            </Link>
            <Link to="/chat" className="glass-panel px-8 py-4 rounded-2xl font-black text-sm tracking-tight text-white/90 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
              Try Demo
            </Link>
          </div>
        </MotionDiv>

        {/* Hero Right Preview */}
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative perspective-1000 hidden lg:block"
        >
          <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/60 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 to-purple-500/5 pointer-events-none group-hover:opacity-100 opacity-20 transition-opacity"></div>
            
            {/* Top Bar Mockup */}
            <div className="bg-zinc-950/40 border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
              </div>
              <div className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">COMPONENT 1 - AI PREVIEW</div>
              <div className="w-6 h-6 rounded bg-zinc-800/50 border border-white/5"></div>
            </div>

            {/* Content Mockup */}
            <div className="p-8 space-y-6 bg-zinc-950/60 backdrop-blur-md min-h-[460px]">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-zinc-800 shrink-0"></div>
                 <div className="space-y-2 flex-1">
                    <div className="h-4 bg-zinc-800 rounded-full w-3/4"></div>
                    <div className="h-4 bg-zinc-800 rounded-full w-1/2"></div>
                 </div>
              </div>

              <div className="flex gap-4 justify-end">
                 <div className="space-y-2 flex flex-col items-end flex-1">
                    <div className="h-4 bg-cyan-500/20 border border-cyan-500/30 rounded-full w-2/3"></div>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-cyan-500/30 shrink-0"></div>
              </div>

              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-xl bg-purple-500/30 shrink-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white animate-pulse"></div>
                 </div>
                 <div className="glass-panel p-4 rounded-2xl flex-1 border-cyan-500/20">
                    <div className="h-3 bg-zinc-700/50 rounded-full w-full mb-3"></div>
                    <div className="h-3 bg-zinc-700/50 rounded-full w-[90%] mb-3"></div>
                    <div className="h-3 bg-zinc-700/50 rounded-full w-[95%] mb-3"></div>
                    <div className="h-3 bg-zinc-700/50 rounded-full w-[40%]"></div>
                 </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-white/5 flex gap-3">
                 <div className="flex-1 h-12 glass-panel rounded-xl px-4 flex items-center text-zinc-500 text-sm">Explain relativistic physics...</div>
                 <div className="w-12 h-12 glass-panel rounded-xl flex items-center justify-center text-cyan-400">
                    <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
                      <path d='m4 12 15-7-4 7 4 7-15-7Zm0 0h11' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                 </div>
              </div>
            </div>
            
            {/* Status Pill Floating */}
            <div className="absolute top-10 right-10 animate-float">
               <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 backdrop-blur-2xl border border-cyan-400/20">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">ANALYZING CONTEXT...</span>
               </div>
            </div>
          </div>

          {/* Floating Accents */}
          <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute -z-10 -top-10 -left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse"></div>
        </MotionDiv>
      </div>
      
      {/* Logos Strip Mockup */}
      <div className="max-w-7xl mx-auto px-6 mt-32 border-t border-white/5 pt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px] text-center">
            <span className="material-symbols-outlined text-zinc-600">verified</span>
            Built with Modern AI
          </div>
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px] text-center">
            <span className="material-symbols-outlined text-zinc-600">bolt</span>
            Real-time Intelligence
          </div>
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px] text-center">
            <span className="material-symbols-outlined text-zinc-600">security</span>
            Enterprise Grade
          </div>
          <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-[10px] text-center">
            <span className="material-symbols-outlined text-zinc-600">up_time</span>
            99.9% Uptime SLA
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
