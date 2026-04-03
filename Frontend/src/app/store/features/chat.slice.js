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
        appendToMessage: (state, action) => {
            const { chatId, chunk } = action.payload;

            if (!state.chats[chatId]) return;
            const messages = state.chats[chatId].messages;
            if (!messages || messages.length === 0) return;

            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.role === "ai" || lastMessage?.role === "assistant") {
                lastMessage.content += chunk;
                // Keep the message in "streaming" mode until the backend signals
                // the response is complete. This lets the UI render lightweight
                // plain text while tokens arrive instead of re-running markdown
                // parsing on every chunk.
                lastMessage.isLoading = true;
            }
        },
        resolveAssistantMessage: (state, action) => {
            const { chatId, content } = action.payload;

            if (!state.chats[chatId]) return;
            const messages = state.chats[chatId].messages;
            if (!messages || messages.length === 0) return;

            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.role === "ai" || lastMessage?.role === "assistant") {
                lastMessage.content = content;
                lastMessage.isLoading = false;
                state.chats[chatId].lastUpdated = new Date().toISOString();
            }
        },
        failAssistantMessage: (state, action) => {
            const { chatId, content } = action.payload;

            if (!state.chats[chatId]) return;
            const messages = state.chats[chatId].messages;
            if (!messages || messages.length === 0) return;

            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.role === "ai" || lastMessage?.role === "assistant") {
                lastMessage.content = content || "I hit a problem while responding. Please try again.";
                lastMessage.isLoading = false;
                state.chats[chatId].lastUpdated = new Date().toISOString();
            }
        },
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
            const { chatId, message, role, messageId, isLoading = false } = action.payload

            // 👉 Messages can arrive before sidebar metadata, so guard against missing chat state.
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: "New Chat",
                    messages: [],
                    lastUpdated: new Date().toISOString()
                }
            }

            // 👉 Add the new message to the existing list.

            state.chats[chatId].messages.push({
                id: messageId || `${role}-${Date.now()}`,
                role,
                content: message,
                isLoading
            })

            // 👉 Keep a local timestamp so history sorting reflects the latest interaction.
            state.chats[chatId].lastUpdated = new Date().toISOString()
        },

        // ===== Promote Temp Chat to Real Chat =====
        // 👉 Called after backend confirms the real MongoDB ID.
        //    Runs INSIDE the reducer so it always sees the full, up-to-date streamed messages —
        //    this sidesteps the stale closure problem in useChat.js.
        promoteChat: (state, action) => {
            const { tempId, realId, title } = action.payload;
            const tempChat = state.chats[tempId];
            if (!tempChat) return;

            // Move everything (including fully-streamed messages) to the real ID
            state.chats[realId] = {
                ...tempChat,
                id: realId,
                title: title || tempChat.title,
                lastUpdated: new Date().toISOString(),
            };

            // Clean up the temp entry
            delete state.chats[tempId];

            // Keep the active view pointing at the right chat
            if (state.currentChatId === tempId) {
                state.currentChatId = realId;
            }
        },

        // ===== Bulk State Updates =====
        setChats: (state, action) => {
            // 👉 Replace the chat map after list fetches or after hydrating one conversation.
            // Preserve in-memory messages for any chat the API doesn't return message bodies for.
            const incoming = action.payload;
            Object.keys(incoming).forEach((id) => {
                if (!incoming[id].messages?.length && state.chats[id]?.messages?.length) {
                    incoming[id].messages = state.chats[id].messages;
                }
            });
            state.chats = incoming;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload;
        },
    }
})

export const {
    setChats,
    setLoading,
    setError,
    setCurrentChatId,
    createNewChat,
    addMessage,
    appendToMessage,
    resolveAssistantMessage,
    failAssistantMessage,
    promoteChat,
} = chatSlice.actions
export default chatSlice.reducer;
