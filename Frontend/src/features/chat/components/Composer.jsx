import React from 'react';
import { PaperclipIcon, MicIcon, SendIcon } from '../icons';
import FileUploadButton from './FileUplodeButton';

export function Composer({ chatInput, onChange, onSubmit, disabled, onMicClick, isListening, onFileSelect, selectedFile, onClearFile, showSuggestions, isLoading }) {
  const suggestions = ["Explain AI Ethics", "Generate UI Grid", "Write Unit Tests", "Refactor Function"];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Suggestions Chips - Only show when chat is empty */}
      {showSuggestions && !isLoading && (
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2 w-full max-w-3xl justify-center animate-message">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ target: { value: s } })}
              className="flex-shrink-0 px-4 py-1.5 border border-outline-variant/10 hover:border-primary/40 hover:bg-primary/5 rounded-full text-xs font-medium text-on-surface-variant transition-all backdrop-blur-md active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="w-full max-w-3xl flex flex-col gap-3">
        {/* Selected File Badge */}
        {selectedFile && (
          <div className="flex items-center gap-2 self-start bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-full animate-message">
            <span className="material-symbols-outlined text-[14px] text-secondary">description</span>
            <span className="text-[12px] font-semibold text-secondary truncate max-w-[200px]">{selectedFile.name}</span>
            <button
              type="button"
              onClick={onClearFile}
              className="ml-1 text-secondary/60 hover:text-rose-400 transition"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className={`p-2 rounded-2xl border transition-all duration-500 flex items-center gap-2 relative z-10 ${
          isLoading 
            ? 'bg-transparent border-transparent shadow-none opacity-20 pointer-events-none' 
            : 'glass-panel border-outline-variant/10 shadow-2xl focus-within:border-primary/40 focus-within:shadow-[0_0_40px_rgba(138,235,255,0.12)] focus-within:bg-surface-container-high/60'
        }`}>
          <FileUploadButton onFileSelect={onFileSelect} />
          
          <input
            type="text"
            value={chatInput}
            onChange={onChange}
            disabled={isLoading}
            placeholder={isLoading ? "Doraemon is thinking..." : "Message Doraemon..."}
            className="bg-transparent border-none ring-0 focus:ring-0 focus:outline-none flex-1 text-on-surface placeholder-slate-500 py-3 font-medium text-[15px] disabled:placeholder-slate-700"
          />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onMicClick}
              disabled={isLoading}
              className={`p-2.5 transition-all duration-300 rounded-xl ${
                isListening 
                  ? 'text-rose-400 glow-pulse' 
                  : 'text-slate-400 hover:text-on-surface hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">{isListening ? 'graphic_eq' : 'mic'}</span>
            </button>

            <button
              type="submit"
              disabled={disabled || isLoading}
              className="w-11 h-11 bg-gradient-to-tr from-primary to-primary-container rounded-xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100"
            >
              <span className="material-symbols-outlined font-bold">arrow_upward</span>
            </button>
          </div>
        </div>
        {!isLoading && (
          <p className="text-[10px] text-center mt-3 text-slate-500 font-medium tracking-wide animate-message">
            Doraemon can make mistakes. Verify important information.
          </p>
        )}
      </form>
    </div>
  );
}
