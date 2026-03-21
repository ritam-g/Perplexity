import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="glass-panel p-8 rounded-3xl border border-white/5 relative group cursor-default transition-all hover:bg-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
      
      <div className="w-14 h-14 rounded-2xl bg-zinc-950/60 border border-white/5 mb-8 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>

      <h3 className="text-xl font-black text-white mb-4 tracking-tight group-hover:text-cyan-400 transition-colors">{title}</h3>
      <p className="text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-400 transition-colors">
        {description}
      </p>
    </motion.div>
  );
};

const Features = () => {
  const features = [
    {
      icon: 'chat',
      title: 'Real-time AI Responses',
      description: 'Experience low-latency interactions that feel fluid and human-like. v2.4 processes data in parallel for instantaneous feedback.'
    },
    {
      icon: 'mic',
      title: 'Voice Input Support',
      description: 'Talk naturally. Our advanced transcription model captures nuance, tone, and technical terminology with 98% accuracy.'
    },
    {
      icon: 'history',
      title: 'Conversation Memory',
      description: 'The engine remembers your preferences, past projects, and specific style, getting smarter with every interaction.'
    },
    {
      icon: 'api',
      title: 'API Integrations',
      description: 'Seamlessly connect Doraemon to your existing workflow. Support for Slack, GitHub, Notion, and custom webhooks out of the box.'
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-white tracking-tighter"
          >
            Capabilities Redefined
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-zinc-500 font-medium"
          >
            Engineered to handle complex reasoning while maintaining a beautifully simple user experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} index={idx} />
          ))}
        </div>
      </div>
      
      {/* Background Decorative Element */}
      <div className="absolute top-[50%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[160px] pointer-events-none"></div>
    </section>
  );
};

export default Features;
