import React, { useCallback } from "react";
import FileUploadButton from "./FileUplodeButton";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

const suggestions = ["Explain AI Ethics", "Generate UI Grid", "Write Unit Tests", "Refactor Function"];

export const Composer = React.memo(({
  chatInput,
  onChange,
  onSubmit,
  disabled,
  onMicClick,
  isListening,
  onFileSelect,
  selectedFile,
  onClearFile,
  showSuggestions,
  isLoading
}) => {
  const textareaRef = useAutoResizeTextarea(chatInput);

  const handleKeyDown = useCallback((event) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    onSubmit(event);
  }, [onSubmit]);

  return (
    <div className="w-full flex flex-col items-center">
      {showSuggestions && !isLoading && (
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-2 w-full max-w-3xl justify-center animate-message">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange({ target: { value: suggestion } })}
              className="flex-shrink-0 rounded-full border border-outline-variant/10 px-4 py-1.5 text-xs font-medium text-on-surface-variant backdrop-blur-md transition-all duration-200 ease-out transform-gpu will-change-transform hover:scale-105 hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="w-full max-w-3xl flex flex-col gap-3">
        {selectedFile && (
          <div className="flex items-center gap-2 self-start rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1.5 animate-message shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
            <span className="material-symbols-outlined text-[14px] text-secondary">description</span>
            <span className="text-[12px] font-semibold text-secondary truncate max-w-[200px]">{selectedFile.name}</span>
            <button
              type="button"
              onClick={onClearFile}
              className="ml-1 rounded-full p-1 text-secondary/60 transition-all duration-150 ease-out hover:scale-105 hover:bg-white/5 hover:text-rose-400 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        <div className={`relative z-10 flex items-end gap-2 rounded-[1.6rem] border p-2 transition-all duration-200 ease-out transform-gpu will-change-transform ${
          isLoading
            ? "glass-panel border-primary/20 bg-surface-container-high/55 shadow-2xl shadow-primary/10"
            : "glass-panel border-outline-variant/10 bg-surface-container-high/45 shadow-2xl hover:border-white/12 hover:bg-surface-container-high/60 focus-within:border-primary/35 focus-within:bg-surface-container-high/70 focus-within:shadow-[0_0_0_1px_rgba(138,235,255,0.14),0_22px_60px_rgba(4,10,24,0.32)]"
        }`}>
          <FileUploadButton onFileSelect={onFileSelect} disabled={isLoading} />

          {/* Smooth height growth keeps the composer feeling responsive without shifting the surrounding layout. */}
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder={isLoading ? "Doraemon is responding..." : "Message Doraemon..."}
            className="max-h-44 min-h-[52px] flex-1 resize-none rounded-[1.25rem] border border-transparent bg-transparent px-3 py-3 text-[15px] font-medium text-on-surface outline-none transition-[height,border-color,box-shadow,background-color] duration-200 ease-out placeholder:text-slate-500 focus:border-primary/25 focus:bg-white/[0.02] focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:placeholder:text-slate-700"
          />

          <div className="flex items-center gap-1 self-end">
            <button
              type="button"
              onClick={onMicClick}
              disabled={isLoading}
              className={`rounded-xl p-2.5 transition-all duration-200 ease-out transform-gpu will-change-transform active:scale-95 ${
                isListening
                  ? "glow-pulse bg-rose-500/10 text-rose-400 shadow-[0_0_25px_rgba(251,113,133,0.2)] hover:scale-105"
                  : "text-slate-400 hover:scale-105 hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined">{isListening ? "graphic_eq" : "mic"}</span>
            </button>

            <button
              type="submit"
              disabled={disabled || isLoading}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary-container text-on-primary shadow-lg shadow-primary/20 transition-all duration-150 ease-out transform-gpu will-change-transform hover:scale-105 hover:shadow-[0_18px_36px_rgba(34,211,238,0.24)] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-lg"
            >
              <span className="material-symbols-outlined font-bold">arrow_upward</span>
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] font-medium tracking-wide text-slate-500 animate-message">
          {isLoading
            ? "Current response is streaming. You can send the next prompt when it finishes."
            : "Doraemon can make mistakes. Verify important information. Shift + Enter adds a new line."}
        </p>
      </form>
    </div>
  );
});
