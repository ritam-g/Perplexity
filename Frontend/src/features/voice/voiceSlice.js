import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    transcript: "",
    listening: false,
    isRecording: false,
    error: null
};

const voiceSlice = createSlice({
    name: 'voice',
    initialState,
    reducers: {
        setTranscript: (state, action) => {
            state.transcript = action.payload;
            state.error = null; // Clear error on successful transcript
        },
        setListening: (state, action) => {
            state.listening = action.payload;
            state.error = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.listening = false;
        },
        resetVoice: (state) => {
            state.transcript = "";
            state.listening = false;
            state.error = null;
        }
    },
});

export const { setTranscript, setListening, setError, resetVoice } = voiceSlice.actions;
export default voiceSlice.reducer;

