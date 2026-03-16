// Load env
import dotenv from "dotenv";
dotenv.config();

// Imports
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import http from 'http';
import { initSocket } from "./src/socket/server.socket.js";

const PORT = process.env.PORT || 5000;

// FIX: Added 'const' and fixed the variable name spelling (httpServer)
const httpServer = http.createServer(app); 

// FIX: Pass the corrected variable name
initSocket(httpServer);

async function main() {
  try {
    // connect DB
    await connectDB();
    
    // start server
    // FIX: Use the corrected variable name here as well
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Error starting the server:", err);
    process.exit(1); // Optional: Exit process on failure
  }
}

main();
