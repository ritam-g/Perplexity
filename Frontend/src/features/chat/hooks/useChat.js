import {
    setError,
    setLoading,
    setCurrentChatId,
    createNewChat,
    addMessage,
    setChats,
    appendToMessage,
    resolveAssistantMessage,
    failAssistantMessage,
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
        isLoading: Boolean(message.isLoading),
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
    // 👉 Use a ref to always have the MOST RECENT chat state in callbacks
    //    This prevents the "vanishing messages" bug caused by stale closures.
    const chatsRef = useRef(chats);
    const streamBufferRef = useRef("");
    const streamedContentRef = useRef("");
    const streamFrameRef = useRef(null);
    useEffect(() => {
        chatsRef.current = chats;
    }, [chats]);

    const resetStreamBatching = useCallback(() => {
        if (streamFrameRef.current) {
            window.cancelAnimationFrame(streamFrameRef.current);
            streamFrameRef.current = null;
        }

        streamBufferRef.current = "";
        streamedContentRef.current = "";
    }, []);

    const flushStreamBuffer = useCallback((chatId) => {
        if (!chatId || !streamBufferRef.current) return;

        const chunk = streamBufferRef.current;
        streamBufferRef.current = "";
        dispatch(appendToMessage({ chatId, chunk }));
    }, [dispatch]);

    const queueStreamChunk = useCallback((chatId, chunk) => {
        if (!chatId || !chunk) return;

        streamBufferRef.current += chunk;
        streamedContentRef.current += chunk;

        if (streamFrameRef.current) {
            return;
        }

        streamFrameRef.current = window.requestAnimationFrame(() => {
            streamFrameRef.current = null;
            flushStreamBuffer(chatId);
        });
    }, [flushStreamBuffer]);

    const stopStreamBatching = useCallback((chatId) => {
        if (streamFrameRef.current) {
            window.cancelAnimationFrame(streamFrameRef.current);
            streamFrameRef.current = null;
        }

        flushStreamBuffer(chatId);
    }, [flushStreamBuffer]);

    useEffect(() => {
        return () => {
            if (streamFrameRef.current) {
                window.cancelAnimationFrame(streamFrameRef.current);
            }
        };
    }, []);

    // ===== Socket Setup =====
    // Functions are now defined below using useCallback for better performance

    // ===== Sidebar History Fetch =====
    const handleGetChats = useCallback(async () => {
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
        const activeChatId = chatId || `temp_${Date.now()}`;
        const isNewChat = !chatId;

        try {
            dispatch(setError(null));
            dispatch(setLoading(true));
            resetStreamBatching();

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
                isLoading: true,
            }));

            // Files must go through the HTTP upload route so multer can parse
            // multipart/form-data and expose a real req.file buffer.
            if (file) {
                const data = await sendMessageRequest({
                    message,
                    chatId: activeChatId,
                    file,
                });

                const aiContent =
                    data?.aiMessage?.content ||
                    data?.aiResponse ||
                    "I couldn't generate a response this time. Please try again.";

                dispatch(resolveAssistantMessage({
                    chatId: activeChatId,
                    content: aiContent,
                }));

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
                // Step 1: Collect multiple socket chunks in the same animation
                // frame so the chat list does not re-render for every token.
                const nextChunk =
                    typeof chunk === "string"
                        ? chunk
                        : chunk?.content || "";

                queueStreamChunk(activeChatId, nextChunk);
            };

            const onDone = (payload) => {
                socket.off("stream", onStream);
                socket.off("done", onDone);
                socket.off("error", onError);
                // Step 2: Flush any buffered tokens before we finalize the chat.
                stopStreamBatching(activeChatId);
                dispatch(resolveAssistantMessage({
                    chatId: activeChatId,
                    content: streamedContentRef.current,
                }));
                resetStreamBatching();
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
                stopStreamBatching(activeChatId);
                dispatch(setLoading(false));
                const errorMessage =
                    typeof errorPayload === "string"
                        ? errorPayload
                        : errorPayload?.message || "Unable to send message.";

                dispatch(failAssistantMessage({
                    chatId: activeChatId,
                    content: errorMessage,
                }));
                resetStreamBatching();
                dispatch(setError(errorMessage));
            };

            socket.on("stream", onStream);
            socket.on("done", onDone);
            socket.on("error", onError);
        } catch (error) {
            resetStreamBatching();
            const errorMessage = getErrorMessage(error);
            dispatch(failAssistantMessage({
                chatId: activeChatId,
                content: errorMessage,
            }));
            dispatch(setError(errorMessage));
            dispatch(setLoading(false));
        }
    }, [dispatch, handleGetChats, queueStreamChunk, resetStreamBatching, stopStreamBatching]);

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
