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
        recognition.continuous = false; // Stop automatically when the user stops talking
        recognition.interimResults = true;

        // Live transcript updates (final + interim)
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            dispatch(setTranscript(transcript));
        };

        // Clean finish (auto-stop on silence or manual stop)
        recognition.onend = () => {
            dispatch(setListening(false));
            recognitionRef.current = null;
        };

        // Error handling
        recognition.onerror = (event) => {
            // Silence (no-speech) and manual stop (aborted) are not real errors to show the user
            if (event.error === 'no-speech' || event.error === 'aborted') {
                return;
            }
            
            console.error('Speech recognition error:', event.error);
            dispatch(setError(`Recognition error: ${event.error}`));
            dispatch(setListening(false));
            recognitionRef.current = null;
        };

        return recognition;
    }, [dispatch]);

    const startListening = useCallback(() => {
        if (!isSupported) {
            dispatch(setError('Speech Recognition not supported'));
            return;
        }

        dispatch(setTranscript('')); // Clear previous state
        dispatch(setListening(true)); 

        const recognition = createRecognition();
        if (recognition) {
            recognitionRef.current = recognition;
            recognition.start();
        }
    }, [isSupported, createRecognition, dispatch]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            const recognition = recognitionRef.current;
            recognitionRef.current = null; // Important: nullify before stopping
            recognition.stop();
        }
        dispatch(setListening(false));
    }, [dispatch]);

    const toggleListening = useCallback(() => {
        if (recognitionRef.current) {
            stopListening();
        } else {
            startListening();
        }
    }, [startListening, stopListening]);


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, []);

    return {
        isSupported,
        startListening,
        stopListening,
        toggleListening,
    };
};

