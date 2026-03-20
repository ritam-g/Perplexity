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
    <div className='mt-4 flex items-center gap-2'>
      <button
        type='button'
        onClick={() => onCopy(message)}
        className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-white/16 hover:bg-white/[0.05] hover:text-white'
      >
        <CopyIcon />
        <span>{isCopied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

export function ChatMessage({ message, copiedMessageId, onCopy }) {
  const isUser = message.role === 'user';

  return (
    <motion.article
      {...itemMotion}
      className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-200'>
          <BotIcon />
        </div>
      )}

      <div className={`max-w-[88%] md:max-w-[78%] ${isUser ? 'order-first' : ''}`}>
        <div className={`mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span>{isUser ? 'You' : 'Nova Assistant'}</span>
        </div>

        <div
          className={`rounded-[28px] px-5 py-4 text-[15px] leading-7 shadow-[0_24px_60px_-34px_rgba(2,6,23,1)] md:px-6 md:py-5 ${isUser
            ? 'rounded-tr-md bg-[linear-gradient(135deg,#14b8a6,#0f766e)] text-white'
            : 'rounded-tl-md border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(9,12,24,0.98))] text-slate-100'
            }`}
        >
          {isUser ? (
            <p className='whitespace-pre-wrap'>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className='mb-3 last:mb-0'>{children}</p>,
                ul: ({ children }) => <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>,
                ol: ({ children }) => <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>,
                code: ({ children }) => <code className='rounded-lg bg-white/8 px-1.5 py-0.5 text-teal-200'>{children}</code>,
                pre: ({ children }) => <pre className='mb-3 overflow-x-auto rounded-2xl border border-white/8 bg-black/30 p-4 last:mb-0'>{children}</pre>,
                strong: ({ children }) => <strong className='font-semibold text-white'>{children}</strong>
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          <MessageActions message={message} copiedMessageId={copiedMessageId} onCopy={onCopy} />
        </div>
      </div>

      {isUser && (
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100'>
          <UserIcon />
        </div>
      )}
    </motion.article>
  );
}
