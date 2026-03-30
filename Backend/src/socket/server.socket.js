import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { processChatMessage } from "../services/chat.service.js";
import "dotenv/config";

// Shared Socket.IO instance used by the whole backend.
// The frontend keeps one live socket connection and exchanges events with it.
let io;

/**
 * Attaches Socket.IO to the HTTP server.
 *
 * Frontend communication:
 * 1. Frontend connects to this socket server.
 * 2. Frontend emits "ask" with { message, chatId, file }.
 * 3. Backend authenticates the user from the handshake cookie.
 * 4. Backend calls the shared chat service, which runs the same business flow
 *    already used by the REST controller.
 * 5. Backend emits "stream" chunks, then "done", or "error" on failure.
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      // Allow the frontend dev server to open a websocket connection.
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  console.log("server is running properly ");

  io.on("connection", (socket) => {
    console.log("a user connected ", socket.id);

    // The frontend sends "ask" whenever the user submits a new prompt.
    // Socket.IO handles transport here, while processChatMessage handles the
    // actual chat, file indexing, and RAG workflow behind the scenes.
    socket.on("ask", async ({ message, chatId, file }) => {
      try {
        let token = "";
        const cookieHeader = socket.handshake.headers.cookie;

        // Reuse the same login cookie the frontend already has so socket chats
        // stay tied to the authenticated user.
        if (cookieHeader) {
          const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split("=");
            acc[key] = value;
            return acc;
          }, {});
          token = cookies.token;
        }

        if (!token) throw new Error("Unauthorized");

        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decode.id;

        const { activeChatId, aiResponse, chatTitle } = await processChatMessage({
          userId,
          message,
          chatId,
          file,
        });

        // Stream the response incrementally so the frontend can render a live
        // typing effect instead of waiting for the full answer.
        for (const char of aiResponse) {
          socket.emit("stream", char);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }

        // Tell the frontend the message is complete and return the real chat id
        // so temporary client-side chat ids can be replaced.
        socket.emit("done", { chatId: String(activeChatId), title: chatTitle });
      } catch (err) {
        console.error("Socket ASK error:", err);

        // The frontend can listen to this event and show an error toast, retry
        // state, or inline error message.
        socket.emit("error", err.message);
      }
    });
  });
}

export function getSocket() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}
