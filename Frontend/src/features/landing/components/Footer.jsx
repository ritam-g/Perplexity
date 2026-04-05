import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-root relative z-20 shrink-0 border-t border-white/5 bg-[#05070D]">
      {/* The footer no longer needs auto margins because the CTA now absorbs spare height above it. */}
      <div className="footer-container mx-auto max-w-7xl px-6 py-8 sm:py-10">
        <div className="footer-top flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="footer-brand flex flex-col gap-3 text-center md:text-left">
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Doraemon Intelligence
            </h2>
            <p className="max-w-[280px] text-sm leading-relaxed text-zinc-500">
              The neural engine of the next generation. Redefining human-AI collaboration.
            </p>
          </div>

          <div className="footer-links grid grid-cols-2 gap-6 text-center sm:grid-cols-4 md:text-right">
            <a href="https://x.com/maty_ritam" className="footer-link">TWITTER</a>
            <a href="https://github.com/ritam-g" className="footer-link">GITHUB</a>
            <a href="https://www.linkedin.com/in/ritammaty/" className="footer-link">LINKEDIN</a>
            <a href="#" className="footer-link">TERMS</a>
          </div>
        </div>

        <div className="footer-divider my-6 border-t border-white/5" />

        <div className="footer-bottom flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="footer-copy text-[10px] uppercase tracking-widest text-zinc-500">
            (c) 2026 Doraemon Intelligence. All rights reserved.
          </div>

          <div className="footer-status flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-emerald-400">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
