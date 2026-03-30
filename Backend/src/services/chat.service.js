import chatModel from "../models/chat.model.js";
import fileModel from "../models/file.model.js";
import messageModel from "../models/message.model.js";
import { messageTitleGenerator } from "./ai.service.js";
import { ragPipeline } from "./rag/pipeline.service.js";
import { indexDocument } from "./rag/indexer.service.js";
import { extractTextFromFile } from "../utils/extractText.js";
import generateFileHash from "../utils/fileHash.js";

/**
 * Shared chat workflow used by both the HTTP controller and Socket.IO.
 *
 * Why this exists:
 * - REST and websocket are only transport layers.
 * - Chat creation, file indexing, and RAG are business logic and should live once.
 * - Reusing one service keeps both entry points consistent.
 */
export async function processChatMessage({ userId, message, chatId = null, file = null }) {
  if (!userId) {
    throw new Error("userId is required");
  }

  if (!message) {
    throw new Error("message is required");
  }

  let chat = null;
  let chatTitle = null;
  const shouldCreateChat = !chatId || String(chatId).startsWith("temp_");

  if (shouldCreateChat) {
    chatTitle = await messageTitleGenerator(message);
    chat = await chatModel.create({
      user: userId,
      title: chatTitle,
    });
  }

  const activeChatId = shouldCreateChat ? chat._id : chatId;

  const userMessage = await messageModel.create({
    chat: activeChatId,
    content: message,
    role: "user",
  });

  const dbMessages = await messageModel
    .find({ chat: activeChatId })
    .sort({ createdAt: 1 })
    .select("role content")
    .lean();

  const history = dbMessages.slice(0, -1);
  let fileContext = "";

  if (file) {
    const fileText = await extractTextFromFile(file);
    const fileHash = generateFileHash(file.buffer);

    // Keep duplicate detection per user so one user's upload never reuses
    // another user's Mongo record or Pinecone namespace.
    let storedFile = await fileModel.findOne({ fileHash, user: userId });

    if (!storedFile) {
      await indexDocument(fileText, userId);

      storedFile = await fileModel.create({
        user: userId,
        fileHash,
        fileName: file.originalname,
        isEmbedded: true,
      });

      console.log("File embedded and stored");
    } else {
      console.log("File already exists for this user, skipping embedding");
    }

    // Keep the prompt small and let the retriever load the real chunks from
    // Pinecone when ragPipeline runs.
    fileContext = `[File: ${storedFile.fileName}]`;
  }

  const aiResponse = await ragPipeline(
    message,
    history,
    fileContext,
    userId
  );

  const aiMessage = await messageModel.create({
    chat: activeChatId,
    content: aiResponse,
    role: "ai",
  });

  return {
    activeChatId,
    aiMessage,
    aiResponse,
    chat,
    chatTitle,
    userMessage,
  };
}
