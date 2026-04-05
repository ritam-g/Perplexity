import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
const MotionH2 = motion.h2;
const MotionP = motion.p;
const MotionDiv = motion.div;

const CTA = () => {
  return (
    <section className="layout-cta relative flex items-center py-16 sm:py-20 lg:py-24 overflow-hidden">
       {/* This section is allowed to absorb leftover page height so the footer
           stays attached without exposing an empty flex gap above it. */}
       {/* Background Glow */}
       <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-cyan-500/10 rounded-full blur-[240px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[180px] animate-pulse duration-[3000ms]"></div>
       </div>

       <div className="relative z-10 mx-auto w-full max-w-4xl px-6 space-y-10 sm:space-y-12">
          <MotionH2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight"
          >
            Ready to augment your <span className="bg-gradient-to-tr from-cyan-400 to-white bg-clip-text text-transparent italic">intelligence?</span>
          </MotionH2>

          <MotionP 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-zinc-400 font-medium"
          >
             Join 50,000+ engineers, researchers, and creatives building the future with Doraemon.
          </MotionP>

          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
          >
            <Link to="/register" className="w-full sm:w-auto bg-cyan-400 text-black px-12 py-5 rounded-2xl font-black text-base tracking-tight hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-cyan-400/20">
               Launch App Now
            </Link>
            <a href="#" className="w-full sm:w-auto glass-panel px-12 py-5 rounded-2xl font-black text-base tracking-tight text-white/90 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all">
               Talk to Sales
            </a>
          </MotionDiv>
       </div>
    </section>
  );
};

export default CTA;
