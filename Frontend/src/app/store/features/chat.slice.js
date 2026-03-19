import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        chats: {},
        isLoading: false,
        error: null,
        //REVIEW - chatid for active chat
        currentChatId: null
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload

            // Create the chat only once.
            // Reason: if the same chat sends more messages later,
            // we should not reset old messages.
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
        addMessage: (state, action) => {
            const { chatId, message, role } = action.payload

            // Safety check:
            // if message comes before chat exists, create a basic chat first.
            if (!state.chats[chatId]) {
                state.chats[chatId] = {
                    id: chatId,
                    title: "New Chat",
                    messages: [],
                    lastUpdated: new Date().toISOString()
                }
            }

            // Push one message into that chat conversation.
            state.chats[chatId].messages.push({
                role,
                content: message
            })

            // Update time so newest chats can stay on top in the UI.
            state.chats[chatId].lastUpdated = new Date().toISOString()
        }
        , setChats: (state, action) => {
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

//NOTE - format will be

// chats = {
//     "docker and AWS": {
//         messages: [
//             {
//                 role: "user",
//                 content: "What is docker?"
//             },
//             {
//                 role: "ai",
//                 content: "Docker is a platform that allows developers to automate the deployment of applications inside lightweight, portable containers. It provides an efficient way to package and distribute software, ensuring consistency across different environments."
//             }
//         ],
//         id: "docker and AWS",
//         lastUpdated: "2024-06-20T12:34:56Z",
//     }

// }
