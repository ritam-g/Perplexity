import React from 'react';
import { useSelector } from 'react-redux';

import { useSpeechRecognition } from './useSpeechRecognition';

/**
 * Voice Input Component - Mic button + live transcript display.
 * Auto-sends transcript to parent via onTranscript callback.
 */
const VoiceInput = ({ onTranscript, className = '' }) => {
    const { transcript, listening, error } = useSelector((state) => state.voice);
    const { isSupported, toggle } = useSpeechRecognition();

    const handleMicClick = () => {
        if (isSupported) {
            toggle();
        }
    };

    // Auto-send transcript when speaking stops
    React.useEffect(() => {
        if (!listening && transcript && onTranscript) {
            onTranscript(transcript);
        }
    }, [listening, transcript, onTranscript]);

    if (!isSupported) {
        return null; // Hide if not supported
    }

    return (
        <div className={`flex flex-col items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
            {/* Mic Button */}
            <button
                onClick={handleMicClick}
                disabled={!isSupported}
                className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 shadow-lg ${listening
                    ? 'bg-gradient-to-br from-red-400 to-red-500 text-white scale-110 shadow-red-500/25 animate-pulse'
                    : 'bg-white/10 border border-white/20 text-slate-300 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95'
                    }`}
                aria-label={listening ? 'Stop listening' : 'Start voice input'}
                title={listening ? 'Stop voice input' : 'Start voice input'}
            >
                <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5'>
                    <path d='M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm0 0v4m-5-6a5 5 0 0 0 10 0' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
            </button>

            {/* Live Transcript */}
            {listening && (
                <div className="w-full max-w-md bg-black/20 rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-2 text-xs text-teal-300">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                        <span>Listening...</span>
                    </div>
                    <div className="text-sm text-white min-h-[20px] max-h-20 overflow-y-auto whitespace-pre-wrap">
                        {transcript || 'Speak now...'}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="text-xs text-red-300 bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/30">
                    {error}
                </div>
            )}
        </div>
    );
};

export default VoiceInput;

