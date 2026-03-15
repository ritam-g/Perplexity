
import { Server } from "socket.io"

let io
export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"]
        }

    })
    console.log("our socket is connected sucessfully ")
    io.on("connection", (socket) => {
        console.log("user connected id is ", socket.id);

    })
}

export function getSocket() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }
    return io
}
export default io;