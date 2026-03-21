import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Preview from '../components/Preview';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="bg-[#05070D] text-[#E6EDF3] font-['Inter'] selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0B0F1A] rounded-full blur-[160px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8aebff22] rounded-full blur-[160px] opacity-40"></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[40%] bg-[#4fdbc811] rounded-full blur-[140px] opacity-30"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="sticky top-0 w-full z-[100] border-b border-white/5 bg-[#05070D]/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tighter">Doraemon</span>
              <span className="text-[10px] text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter self-start mt-1">Intelligence v2.4</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Products</a>
              <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Enterprise</a>
              <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Model</a>
              <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors px-4">Sign In</Link>
              <Link to="/register" className="bg-cyan-400 text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white transition-all hover:scale-105 active:scale-95">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Page Sections */}
        <Hero />
        <Features />
        <HowItWorks />
        <Preview />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
