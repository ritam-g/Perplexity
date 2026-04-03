import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { BotIcon, UserIcon } from '../icons';
import { AiTypingLoader } from './AiTypingLoader';
import { itemMotion } from '../utils/motion';

function MessageActions({ message, copiedMessageId, onCopy }) {
  const isCopied = copiedMessageId === message.id;

  if (message.role === 'user' || message.isLoading) {
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

export const ChatMessage = React.memo(({ message, copiedMessageId, onCopy }) => {
  const isUser = message.role === 'user';
  const isAssistantLoading = !isUser && message.isLoading;
  const hasStreamingContent = isAssistantLoading && Boolean(message.content);
  const bubbleClassName = isUser
    ? 'bg-secondary-container border border-secondary/20 text-on-secondary-container rounded-2xl rounded-tr-sm max-w-[85%]'
    : isAssistantLoading
      ? hasStreamingContent
        ? 'bg-surface-container border border-outline-variant/10 text-on-background rounded-2xl rounded-tl-sm w-full shadow-sm'
        : 'bg-surface-container border border-outline-variant/10 text-on-background rounded-2xl rounded-tl-sm max-w-full md:max-w-[28rem] shadow-sm'
      : 'bg-surface-container border border-outline-variant/10 text-on-background rounded-2xl rounded-tl-sm w-full shadow-sm';

  return (
    <motion.article
      {...itemMotion}
      // Only animate position changes so streamed content can grow naturally
      // without re-animating the bubble height on every token.
      layout="position"
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

        <motion.div
          className={`inline-block p-5 text-[15px] leading-relaxed shadow-lg overflow-hidden ${bubbleClassName}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isUser ? (
              <motion.p
                key="user-content"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className='whitespace-pre-wrap'
              >
                {message.content}
              </motion.p>
            ) : isAssistantLoading ? (
              hasStreamingContent ? (
                <motion.div
                  key="assistant-streaming"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400"
                    aria-label="AI is typing"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-pulse" />
                    <span>Streaming</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="assistant-loader"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <AiTypingLoader />
                </motion.div>
              )
            ) : (
              <motion.div
                key="assistant-content"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
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
                <MessageActions message={message} copiedMessageId={copiedMessageId} onCopy={onCopy} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.article>
  );
});
