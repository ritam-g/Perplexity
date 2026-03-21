import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"
import { chatWithMistralAiModel, messageTitleGenerator } from "../services/ai.service.js"
import 'dotenv/config'

let io
export function initSocket(httpServer) {
    //NOTE - creating server with httpServer
    //REVIEW - so taht the server can be accessed from the frontend
    
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true
        }
    })

    console.log("server is running properly ");

    io.on("connection", (socket) => {
        console.log("a user connected ", socket.id);

        socket.on("ask", async ({ message, chatId, file }) => {
            try {
                let token = '';
                const cookieHeader = socket.handshake.headers.cookie;
                if (cookieHeader) {
                    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                        const [key, value] = cookie.trim().split('=');
                        acc[key] = value;
                        return acc;
                    }, {});
                    token = cookies.token;
                }
                
                if (!token) throw new Error("Unauthorized");
                
                const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const userId = decode.id;
                
                let activeChatId = chatId;
                let chat = null;
                let chatTitle = null;

                if (!chatId || String(chatId).startsWith("temp_")) {
                    chatTitle = await messageTitleGenerator(message);
                    chat = await chatModel.create({
                        user: userId,
                        title: chatTitle,
                    });
                    activeChatId = chat._id.toString();
                }

                await messageModel.create({
                    chat: activeChatId,
                    content: message,
                    role: "user",
                });

                const dbMessages = await messageModel
                    .find({ chat: activeChatId })
                    .sort({ createdAt: 1 })
                    .select("role content")
                    .lean();

                const aiResponse = await chatWithMistralAiModel({ message: dbMessages });

                // Simulate Streaming
                for (let char of aiResponse) {
                    socket.emit("stream", char);
                    await new Promise(r => setTimeout(r, 10)); 
                }

                await messageModel.create({
                    chat: activeChatId,
                    content: aiResponse,
                    role: "ai",
                });

                socket.emit("done", { chatId: activeChatId, title: chatTitle });
            } catch (err) {
                console.error("Socket ASK error:", err);
                socket.emit("error", err.message);
            }
        });

    })

}

export function getSocket() {

    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io
}