import axios from 'axios'

// ===== API Client =====
// 👉 Keep one axios instance so every chat request shares the same base URL and cookies.
const api = axios.create({
    baseURL: `http://localhost:5000`+`/api/chats`,
    withCredentials: true
})

// ===== Chat Requests =====
/**  
 * @description Send message to AI
 * @route POST /api/chats/message
 * @access private
 */
export async function sendMessage({ message, chatId }) {
    // 👉 `chatId` is optional: no id means "start a new chat" on the backend.
    const { data } = await api.post('/message', { message, chatId })
    return data
}

/**  
 * @description Get message
 * @route GET /api/chats
 * @access private
 */
export async function getMessage({ chatId }) {
    // 👉 Fetch one conversation when the user selects it from sidebar history.
    const { data } = await api.get(`/${chatId}`)
    return data
}

/**  
 * @description Delete message
 * @route DELETE /api/chats/delete
 * @access private
 */
export async function deleteMessage({ chatId }) {
    // 👉 Keep the payload shape unchanged so the existing backend contract still works.
    const { data } = await api.delete('/delete', { chatId } )
    return data
}

/**  
 * @description Get message
 * @route GET /api/chats
 * @access private
 */
export async function getChat() {
    // 👉 This returns chat metadata for the history list, not the full message bodies.
    const { data } = await api.get(`/`)
    return data
}
