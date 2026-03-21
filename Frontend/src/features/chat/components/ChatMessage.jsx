import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { BotIcon, UserIcon, CopyIcon } from '../icons';
import { itemMotion } from '../utils/motion';

function MessageActions({ message, copiedMessageId, onCopy }) {
  const isCopied = copiedMessageId === message.id;

  if (message.role === 'user') {
    return null;
  }

  return (
    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={() => onCopy(message)}
        className="p-1.5 text-slate-500 hover:text-primary transition-colors"
        title={isCopied ? "Copied!" : "Copy message"}
      >
        <span className="material-symbols-outlined text-sm">{isCopied ? "done" : "content_copy"}</span>
      </button>
      <button className="p-1.5 text-slate-500 hover:text-secondary transition-colors">
        <span className="material-symbols-outlined text-sm">thumb_up</span>
      </button>
      <button className="p-1.5 text-slate-500 hover:text-error transition-colors">
        <span className="material-symbols-outlined text-sm">thumb_down</span>
      </button>
    </div>
  );
}

export function ChatMessage({ message, copiedMessageId, onCopy }) {
  const isUser = message.role === 'user';

  return (
    <motion.article
      {...itemMotion}
      className={`flex gap-4 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-10 h-10 rounded-full border-2 border-secondary overflow-hidden bg-surface-container flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-secondary" />
          </div>
        ) : (
          <BotIcon />
        )}
      </div>

      <div className={`flex-1 space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] font-bold text-on-surface uppercase tracking-[0.2em]">{isUser ? 'You' : 'Doraemon'}</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-tight">System v2.4</span>
        </div>

        <div
          className={`inline-block p-5 text-[15px] leading-relaxed shadow-lg ${isUser
            ? 'bg-secondary-container border border-secondary/20 text-on-secondary-container rounded-2xl rounded-tr-sm max-w-[85%]'
            : 'bg-surface-container border border-outline-variant/10 text-on-background rounded-2xl rounded-tl-sm w-full shadow-sm'
            }`}
        >
          {isUser ? (
            <p className='whitespace-pre-wrap'>{message.content}</p>
          ) : !message.content ? (
            <div className='flex h-[1.5rem] w-8 items-center justify-center gap-1.5'>
              <span className='h-2 w-2 rounded-full bg-primary/60 animate-bounce' style={{ animationDelay: '-0.3s' }} />
              <span className='h-2 w-2 rounded-full bg-primary/60 animate-bounce' style={{ animationDelay: '-0.15s' }} />
              <span className='h-2 w-2 rounded-full bg-primary/60 animate-bounce' />
            </div>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className='mb-3 last:mb-0'>{children}</p>,
                ul: ({ children }) => <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>,
                ol: ({ children }) => <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>,
                code: ({ children }) => <code className='rounded bg-primary/10 px-1.5 py-0.5 text-primary text-sm font-medium'>{children}</code>,
                pre: ({ children }) => (
                   <div className="relative group/code my-4">
                     <pre className='overflow-x-auto rounded-xl border border-outline-variant/10 bg-surface-container-low p-4 text-sm scrollbar-thin scrollbar-thumb-white/10'>{children}</pre>
                   </div>
                ),
                strong: ({ children }) => <strong className='font-bold text-white'>{children}</strong>,
                a: ({ href, children }) => <a href={href} className="text-primary hover:underline underline-offset-4 decoration-2" target="_blank" rel="noreferrer">{children}</a>
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          <MessageActions message={message} copiedMessageId={copiedMessageId} onCopy={onCopy} />
        </div>
      </div>
    </motion.article>
  );
}
