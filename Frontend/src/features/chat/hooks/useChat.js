import {
    setError,
    setLoading,
    setCurrentChatId,
    createNewChat,
    addMessage,
    setChats,
} from "../../../app/store/features/chat.slice";
import { sendMessage, getChat, getMessage } from "../services/chat.api";
import { initializedSocketConnection } from "../services/chat.socket";
import { useDispatch, useSelector } from "react-redux";

// ===== Message Normalization =====
// 👉 Backend can return `_id`, while the UI expects a consistent `id` for React keys and lookups.
function mapMessages(messages = []) {
    return messages.map((message) => ({
        id: message._id || message.id,
        role: message.role,
        content: message.content,
    }));
}

// ===== useChat Hook =====
// 👉 Centralizes chat-related API calls so components stay focused on rendering.
export function useChat() {
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chat?.chats ?? {});
    const currentChatId = useSelector((state) => state.chat?.currentChatId ?? null);

    // ===== Socket Setup =====
    function initializeSocketConnection() {
        initializedSocketConnection();
    }

    // ===== Send Message Flow =====
    async function handleSendMessage({ message, chatId }) {
        try {
            dispatch(setLoading(true));

            // Flow:
            // 1. Send user input to backend
            // 2. Backend returns chat metadata + user/AI messages
            // 3. Redux stores both messages so UI re-renders immediately
            const { chatId: activeChatId, chat, userMessage, aiMessage } = await sendMessage({ message, chatId });

            dispatch(createNewChat({
                chatId: activeChatId,
                title: chat?.title || chats[activeChatId]?.title || "New Chat",
            }));

            dispatch(addMessage({
                chatId: activeChatId,
                message: userMessage?.content || message,
                role: "user",
                messageId: userMessage?._id,
            }));

            dispatch(addMessage({
                chatId: activeChatId,
                message: aiMessage?.content || "",
                role: "ai",
                messageId: aiMessage?._id,
            }));

            dispatch(setCurrentChatId(activeChatId));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    // ===== Sidebar History Fetch =====
    async function handleGetChats() {
        try {
            dispatch(setLoading(true));

            const data = await getChat();

            // 👉 Convert the API array into an object keyed by chat id for fast Redux access.
            const nextChats = (data.chats || []).reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title || "New Chat",
                    messages: chats[chat._id]?.messages || [],
                    lastUpdated: chat.updatedAt || chat.createdAt || new Date().toISOString(),
                };
                return acc;
            }, {});

            dispatch(setChats(nextChats));

            // 👉 Default to the newest available chat so the UI has an active thread.
            if (!currentChatId && data.chats?.length) {
                dispatch(setCurrentChatId(data.chats[0]._id));
            }
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    // ===== Open Existing Chat =====
    async function handleOpenChat(chatId) {
        try {
            dispatch(setLoading(true));

            // 👉 Sidebar only stores summary data, so opening a chat hydrates full messages on demand.
            const data = await getMessage({ chatId });
            const selectedChat = chats[chatId] || {};

            // 👉 Merge the loaded conversation back into the existing map without losing other chats.
            dispatch(setChats({
                ...chats,
                [chatId]: {
                    id: chatId,
                    title: selectedChat.title || "New Chat",
                    messages: mapMessages(data.messages || []),
                    lastUpdated: selectedChat.lastUpdated || new Date().toISOString(),
                },
            }));

            dispatch(setCurrentChatId(chatId));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        initializeSocketConnection,
        // 👉 Keep legacy names so older callers do not break while the app migrates.
        handelSendMessage: handleSendMessage,
        handelGetChats: handleGetChats,
        initializedSocketConnection: initializeSocketConnection,
    };
}
