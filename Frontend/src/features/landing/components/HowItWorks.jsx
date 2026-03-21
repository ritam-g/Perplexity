import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      icon: 'format_quote',
      title: '1. Ask',
      description: 'Input your prompts via text, voice, or file upload to begin the context analysis.'
    },
    {
      icon: 'cached',
      title: '2. Process',
      description: 'Our v2.4 engine leverages multi-modal reasoning to synthesize complex answers.'
    },
    {
      icon: 'task_alt',
      title: '3. Results',
      description: 'Receive enterprise-grade outputs ready for implementation or further refinement.'
    }
  ];

  return (
    <section className="py-32 bg-zinc-950/20 backdrop-blur-3xl relative">
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-30"></div>
       
       <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-24"
          >
            The Path to Intelligence
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
            {/* Horizontal Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-[30%] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-6"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center text-cyan-400 relative z-10 ai-glow">
                   <span className="material-symbols-outlined text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">{step.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed max-w-[300px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
       </div>
    </section>
  );
};

export default HowItWorks;
