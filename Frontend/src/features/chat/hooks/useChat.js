import { setError, setLoading, setCurrentChatId, createNewChat, addMessage } from "../../../app/store/features/chat.slice";
import { sendMessage, getChat, getMessage, deleteMessage } from "../services/chat.api";
import { initializedSocketConnection } from "../services/chat.socket";
import { useDispatch, useSelector } from "react-redux";

export function useChat() {
    const dispatch = useDispatch();
   const chats =useSelector((state) => state.chat);
    async function handelSendMessage({ message, chatId }) {
        try {
            // Start loading before the API call so the UI can disable the send button
            // and show a typing/sending state.
            dispatch(setLoading(true));

            /*
              Flow:
              UI submit
                  |
                  v
              sendMessage API
                  |
                  v
              get activeChatId
                  |
                  v
              create chat in Redux if needed
                  |
                  v
              add user message
                  |
                  v
              add AI message
                  |
                  v
              set current chat
            */

            // Backend returns the real chat id after save.
            // We rename it to activeChatId because this function already has chatId as input.
            const { chatId: activeChatId, chat, userMessage, aiMessage } = await sendMessage({ message, chatId });

            // Ensure the chat exists in Redux before pushing messages into it.
            // For a new chat this creates the entry.
            // For an old chat this only updates title/lastUpdated.
            dispatch(createNewChat({
                chatId:activeChatId,
                title: chat?.title || chats[activeChatId]?.title ||"New Chat",
            }))

            // Add the user message so the UI shows what the user just sent.
            dispatch(addMessage({
                chatId: activeChatId,
                message: message,
                role: "user"
            }))

            // Add the AI reply from backend so both sides of the conversation
            // stay in the same Redux chat entry.
            dispatch(addMessage({
                chatId: activeChatId,
                message: aiMessage.content,
                role: "ai"
            }))

            // Mark this chat as active so Dashboard shows the correct conversation.
            dispatch(setCurrentChatId(activeChatId));
        } catch (error) {
            // Save API error in Redux so the UI can show the problem.
            dispatch(setError(error.message));
        } finally {
            // Always stop loading, even if API fails.
            dispatch(setLoading(false));
        }
    }

    return {
        handelSendMessage,
        initializedSocketConnection,
    };
}
