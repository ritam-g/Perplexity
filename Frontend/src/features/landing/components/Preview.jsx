import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage } from '../../chat/components/ChatMessage';

const Preview = () => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const mockMessages = [
    {
      id: '1',
      role: 'user',
      content: 'Explain the main benefits of Doraemon\'s new intelligence engine integrated in science solutions.'
    },
    {
      id: '2',
      role: 'bot',
      content: 'Doraemon Intelligence v2.4 introduces a fundamental shift in reasoning through three core pillars:\n\n*   **ParallelContext Processing:** Understanding billion-parameter datasets 6x faster than v2.3.\n*   **Ethereal Intelligence Layer:** Intuitive reasoning that feels natural to the user’s creative intent.\n*   **Neural Memory:** Gaining instant recall of technical documentation across multiple sessions.'
    }
  ];

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message.content);
    setCopiedMessageId(message.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <section className="py-32 relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl shadow-black">
          {/* Mock Browser Header */}
          <div className="bg-zinc-950/60 border-b border-white/5 px-8 py-5 flex items-center justify-between backdrop-blur-md">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/40"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/40"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/40"></div>
            </div>
            <div className="text-[11px] font-black text-zinc-500 tracking-[0.3em] uppercase opacity-70">Doraemon v2.4 — LIVE PREVIEW</div>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5"></div>
          </div>

          <div className="flex h-[600px]">
            {/* Sidebar Mockup */}
            <div className="hidden md:flex w-64 bg-zinc-950/40 border-r border-white/5 p-6 flex-col gap-6">
               <div className="space-y-4">
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">History</div>
                  <div className="h-10 bg-white/5 rounded-xl border border-white/5"></div>
                  <div className="text-xs text-zinc-500 font-bold px-2">Quantum Physics</div>
                  <div className="text-xs text-zinc-500 font-bold px-2">Marketing Strategy</div>
                  <div className="text-xs text-zinc-500 font-bold px-2">App Development</div>
               </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 bg-zinc-950/20 p-8 overflow-y-auto hide-scrollbar flex flex-col gap-10">
               {mockMessages.map((msg) => (
                 <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    copiedMessageId={copiedMessageId} 
                    onCopy={handleCopy} 
                 />
               ))}
               
               {/* Input Mockup */}
               <div className="mt-auto pt-8">
                  <div className="relative">
                    <div className="h-16 glass-panel rounded-2xl border-white/10 px-6 flex items-center text-zinc-500 text-sm">
                      Message Doraemon...
                    </div>
                    <div className="absolute right-3 top-3 w-10 h-10 bg-cyan-400 rounded-xl flex items-center justify-center text-black shadow-lg shadow-cyan-400/20">
                       <span className="material-symbols-outlined font-bold">send</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Preview;
