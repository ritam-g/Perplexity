import React from 'react';

const Footer = () => {
  return (
    <footer className="py-24 border-t border-white/5 bg-[#05070D] relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h2 className="text-2xl font-black text-white tracking-tighter">Doraemon Intelligence</h2>
            <p className="text-sm text-zinc-500 font-medium max-w-[300px] leading-relaxed">
              The neural engine of the next generation. Redefining human-AI collaboration for the elite mind.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-12 gap-y-6">
            <a href="#" className="text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] px-2 py-1">TWITTER</a>
            <a href="#" className="text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] px-2 py-1">GITHUB</a>
            <a href="#" className="text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] px-2 py-1">DISCORD</a>
            <a href="#" className="text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] px-2 py-1">PRIVACY</a>
            <a href="#" className="text-[10px] font-black text-zinc-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] px-2 py-1">TERMS</a>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
           <div className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">© 2024 DORAEMON INTELLIGENCE. ALL RIGHTS RESERVED.</div>
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">ALL SYSTEMS OPERATIONAL</span>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
