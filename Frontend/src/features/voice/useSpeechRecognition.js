import { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setTranscript, setListening, setError, resetVoice } from './voiceSlice';

/**
 * Custom hook for Web Speech API with proper lifecycle, error handling,
 * and Redux integration. Handles browser compatibility and cleanup.
 */
export const useSpeechRecognition = () => {
    const dispatch = useDispatch();
    const recognitionRef = useRef(null);
    const [isSupported, setIsSupported] = useState(false);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    const createRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            dispatch(setError('Speech Recognition not supported in this browser'));
            return null;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        // Live transcript updates (final + interim)
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            dispatch(setTranscript(transcript));
        };

        // Auto-restart for continuous listening (handles onend)
        recognition.onend = () => {
            dispatch(setListening(false));
            // Restart if still supposed to be listening
            if (recognitionRef.current === recognition && window.SpeechRecognition) {
                setTimeout(() => recognition.start(), 100);
            }
        };

        // Error handling
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            dispatch(setError(`Recognition error: ${event.error}`));
            dispatch(setListening(false));
        };

        return recognition;
    }, [dispatch]);

    const start = useCallback(() => {
        if (!isSupported) {
            dispatch(setError('Speech Recognition not supported'));
            return;
        }

        dispatch(setListening(true));
        dispatch(resetVoice()); // Clear previous state

        const recognition = createRecognition();
        if (recognition) {
            recognitionRef.current = recognition;
            recognition.start();
        }
    }, [isSupported, createRecognition, dispatch]);

    const stop = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        dispatch(setListening(false));
    }, [dispatch]);

    const toggle = useCallback(() => {
        if (!recognitionRef.current || !recognitionRef.current.listening) {
            start();
        } else {
            stop();
        }
    }, [start, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return {
        isSupported,
        start,
        stop,
        toggle,
    };
};

