import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';

const CTA = () => {
  return (
    <section className="py-48 relative overflow-hidden text-center">
       {/* Background Glow */}
       <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-cyan-500/10 rounded-full blur-[240px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[180px] animate-pulse duration-[3000ms]"></div>
       </div>

       <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-12">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight"
          >
            Ready to augment your <span className="bg-gradient-to-tr from-cyan-400 to-white bg-clip-text text-transparent italic">intelligence?</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-zinc-400 font-medium"
          >
             Join 50,000+ engineers, researchers, and creatives building the future with Doraemon.
          </motion.p>

          <motion.div 
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
          </motion.div>
       </div>
    </section>
  );
};

export default CTA;
