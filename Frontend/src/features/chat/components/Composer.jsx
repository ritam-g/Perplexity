import React from 'react';
import { PaperclipIcon, MicIcon, SendIcon } from '../icons';

export function Composer({ chatInput, onChange, onSubmit, disabled, onMicClick, isListening }) {
  return (
    <form onSubmit={onSubmit} className='w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,26,0.92),rgba(6,9,18,0.98))] px-4 py-3 shadow-[0_20px_60px_-20px_rgba(2,6,23,1)] backdrop-blur-xl'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          className='hidden h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white md:flex'
        >
          <PaperclipIcon />
        </button>

        <div className='flex flex-1 items-center rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 transition focus-within:border-teal-400/50'>
          <input
            type='text'
            value={chatInput}
            onChange={onChange}
            placeholder='Type your message...'
            className='w-full bg-transparent text-[15px] text-white outline-none placeholder:text-slate-400'
          />
        </div>

        <button
          type='button'
          onClick={onMicClick}
          className={`group flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${isListening 
            ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse' 
            : 'text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <MicIcon />
        </button>

        <button
          type='submit'
          disabled={disabled}
          className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
}
