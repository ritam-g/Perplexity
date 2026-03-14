// --------------------
// Load Environment Variables
// --------------------
import dotenv from "dotenv";
dotenv.config();

// --------------------
// Imports
// --------------------
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { chatWithMistralAiModel } from "./src/services/ai.service.js";

// --------------------
// Constants
// --------------------
const PORT = process.env.PORT || 5000;

// --------------------
// Start Server
// --------------------
async function startServer() {
  try {

    // Connect Database
    await connectDB();

    // Start Express Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
}

// --------------------
// Start AI Chat (CLI)
// --------------------
async function startAI() {
  try {
    console.log("🤖 AI Chat Started\n");
    await chatWithMistralAiModel();
  } catch (error) {
    console.error("❌ AI failed:", error);
  }
}

// --------------------
// Run Application
// --------------------
async function main() {
  await startServer();
  console.log("");
  await startAI();
}

main();