import { createSlice } from "@reduxjs/toolkit";

// ===== Chat Slice =====
// 👉 `chats` is stored as an object for fast lookup by chat id from any screen.
const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        isLoading: false,
        error: null,
        // 👉 Tracks which conversation the UI should currently render.
        currentChatId: null
    },
    reducers: {
        // ===== Chat Metadata =====
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload

            // 👉 Create once, then only refresh metadata so later sends do not wipe messages.
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: title ? title : "New Chat",
                    messages: [],
                    lastUpdated: new Date().toISOString()
                }
                return
            }

            // Keep the existing chat and only refresh small metadata.
            state.chats[chatId].title = title ? title : state.chats[chatId].title
            state.chats[chatId].lastUpdated = new Date().toISOString()
        },

        // ===== Message Updates =====
        addMessage: (state, action) => {
            const { chatId, message, role, messageId } = action.payload

            // 👉 Messages can arrive before sidebar metadata, so guard against missing chat state.
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: "New Chat",
                    messages: [],
                    lastUpdated: new Date().toISOString()
                }
            }

            state.chats[chatId].messages.push({
                id: messageId || `${role}-${Date.now()}`,
                role,
                content: message
            })

            // 👉 Keep a local timestamp so history sorting reflects the latest interaction.
            state.chats[chatId].lastUpdated = new Date().toISOString()
        },

        // ===== Bulk State Updates =====
        setChats: (state, action) => {
            // 👉 Replace the chat map after list fetches or after hydrating one conversation.
            state.chats = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        }
    }
})

export const { setChats, setLoading, setError, setCurrentChatId, createNewChat, addMessage} = chatSlice.actions
export default chatSlice.reducer;
