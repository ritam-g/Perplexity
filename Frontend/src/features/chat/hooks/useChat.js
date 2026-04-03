import {
    setError,
    setLoading,
    setCurrentChatId,
    createNewChat,
    addMessage,
    setChats,
    appendToMessage,
    promoteChat,
} from "../../../app/store/features/chat.slice";
import { getChat, getMessage, sendMessage as sendMessageRequest } from "../services/chat.api";
import { initializedSocketConnection, getSocket } from "../services/chat.socket";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useCallback, useMemo } from "react";

// ===== Message Normalization =====
// 👉 Backend can return `_id`, while the UI expects a consistent `id` for React keys and lookups.
function mapMessages(messages = []) {
    return messages.map((message) => ({
        id: message._id || message.id,
        role: message.role,
        content: message.content,
    }));
}

function getErrorMessage(error) {
    return error?.response?.data?.message || error?.message || "Something went wrong";
}

// ===== useChat Hook =====
// 👉 Centralizes chat-related API calls so components stay focused on rendering.
export function useChat() {
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chat?.chats ?? {});
    const currentChatId = useSelector((state) => state.chat?.currentChatId ?? null);
    
    // 👉 Use a ref to always have the MOST RECENT chat state in callbacks
    //    This prevents the "vanishing messages" bug caused by stale closures.
    const chatsRef = useRef(chats);
    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    // ===== Socket Setup =====
    // Functions are now defined below using useCallback for better performance

    // ===== Sidebar History Fetch =====
    const handleGetChats = useCallback(async ({ preserveCurrentId = true } = {}) => {
        try {
            dispatch(setLoading(true));
            const data = await getChat();
            const nextChats = (data.chats || []).reduce((acc, chat) => {
                acc[chat._id] = {
                    id: chat._id,
                    title: chat.title || "New Chat",
                    messages: chatsRef.current[chat._id]?.messages || [],
                    lastUpdated: chat.updatedAt || chat.createdAt || new Date().toISOString(),
                };
                return acc;
            }, {});
            dispatch(setChats(nextChats));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    // ===== Open Existing Chat =====
    const handleOpenChat = useCallback(async (chatId) => {
        try {
            dispatch(setLoading(true));
            const data = await getMessage({ chatId });
            const selectedChat = chatsRef.current[chatId] || {};
            dispatch(setChats({
                ...chatsRef.current,
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
    }, [dispatch]);

    // ===== Send Message Flow =====
    const handleSendMessage = useCallback(async ({ message, chatId, file }) => {
        try {
            dispatch(setError(null));
            dispatch(setLoading(true));
            const activeChatId = chatId || `temp_${Date.now()}`;
            const isNewChat = !chatId;

            if (!chatId) {
                dispatch(createNewChat({
                    chatId: activeChatId,
                    title: message.substring(0, 20) || "New Chat",
                }));
                dispatch(setCurrentChatId(activeChatId));
            }
            dispatch(addMessage({
                chatId: activeChatId,
                message: message,
                role: "user",
                messageId: `user_${Date.now()}`,
            }));
            dispatch(addMessage({
                chatId: activeChatId,
                message: "",
                role: "ai",
                messageId: `ai_${Date.now()}`,
            }));

            // Files must go through the HTTP upload route so multer can parse
            // multipart/form-data and expose a real req.file buffer.
            if (file) {
                const data = await sendMessageRequest({
                    message,
                    chatId: activeChatId,
                    file,
                });

                const aiContent = data?.aiMessage?.content || data?.aiResponse || "";
                if (aiContent) {
                    dispatch(appendToMessage({ chatId: activeChatId, chunk: aiContent }));
                }

                if (isNewChat && data?.chatId) {
                    dispatch(promoteChat({
                        tempId: activeChatId,
                        realId: data.chatId,
                        title: data?.chat?.title || message.substring(0, 30),
                    }));
                    dispatch(setCurrentChatId(data.chatId));
                }

                await handleGetChats({ preserveCurrentId: true });
                dispatch(setLoading(false));
                return;
            }

            const socket = getSocket();
            if (!socket) throw new Error("Socket not initialized");

            socket.emit("ask", {
                message,
                chatId: activeChatId,
                file: null
            });

            const onStream = (chunk) => {
                dispatch(appendToMessage({ chatId: activeChatId, chunk }));
            };

            const onDone = (payload) => {
                socket.off("stream", onStream);
                socket.off("done", onDone);
                socket.off("error", onError);
                dispatch(setLoading(false));
                if (isNewChat && payload?.chatId) {
                    dispatch(promoteChat({
                        tempId: activeChatId,
                        realId: payload.chatId,
                        title: payload.title || message.substring(0, 30),
                    }));
                    dispatch(setCurrentChatId(payload.chatId));
                    handleGetChats({ preserveCurrentId: true });
                } else if (chatId) {
                    handleGetChats({ preserveCurrentId: true });
                }
            };

            const onError = (errorPayload) => {
                socket.off("stream", onStream);
                socket.off("done", onDone);
                socket.off("error", onError);
                dispatch(setLoading(false));
                dispatch(setError(
                    typeof errorPayload === "string"
                        ? errorPayload
                        : errorPayload?.message || "Unable to send message."
                ));
            };

            socket.on("stream", onStream);
            socket.on("done", onDone);
            socket.on("error", onError);
        } catch (error) {
            dispatch(setError(getErrorMessage(error)));
            dispatch(setLoading(false));
        }
    }, [dispatch, handleGetChats]);

    const initializeSocketConnection = useCallback(() => {
        initializedSocketConnection();
    }, []);

    return useMemo(() => ({
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        initializeSocketConnection,
        handelSendMessage: handleSendMessage,
        handelGetChats: handleGetChats,
        initializedSocketConnection: initializeSocketConnection,
    }), [handleSendMessage, handleGetChats, handleOpenChat, initializeSocketConnection]);
}
