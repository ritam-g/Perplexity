import chatModel from "../models/chat.model.js";
import fileModel from "../models/file.model.js";
import messageModel from "../models/message.model.js";
import { messageTitleGenerator } from "./ai.service.js";
import { ragPipeline } from "./rag/pipeline.service.js";
import { indexDocument } from "./rag/indexer.service.js";
import { extractTextFromFile } from "../utils/extractText.js";
import generateFileHash from "../utils/fileHash.js";

const MAX_INLINE_FILE_CONTEXT_CHARS = 2000;

function createAppError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toNodeBuffer(value) {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (value instanceof ArrayBuffer) return Buffer.from(value);

  if (value?.type === "Buffer" && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  return null;
}

function normalizeIncomingFile(file) {
  if (!file) return null;

  const normalizedBuffer = toNodeBuffer(file.buffer ?? file);

  if (!normalizedBuffer) {
    throw createAppError(
      "Uploaded file data is invalid. Please send the file using multipart/form-data.",
      400
    );
  }

  return {
    ...file,
    buffer: normalizedBuffer,
    originalname: file.originalname || file.name || "upload",
    mimetype: file.mimetype || file.type || "application/octet-stream",
  };
}

function buildInlineFileContext(fileName, fileText) {
  const trimmedText = typeof fileText === "string" ? fileText.trim() : "";

  if (!trimmedText) {
    return `[File: ${fileName}]`;
  }

  const preview = trimmedText.slice(0, MAX_INLINE_FILE_CONTEXT_CHARS);
  const suffix = trimmedText.length > MAX_INLINE_FILE_CONTEXT_CHARS
    ? "\n...[truncated for prompt size]"
    : "";

  return `File Name: ${fileName}\nFile Preview:\n${preview}${suffix}`;
}

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
    throw createAppError("userId is required", 401);
  }

  const normalizedMessage = typeof message === "string" ? message.trim() : "";

  if (!normalizedMessage) {
    throw createAppError("message is required");
  }

  let chat = null;
  let chatTitle = null;
  const shouldCreateChat = !chatId || String(chatId).startsWith("temp_");

  if (shouldCreateChat) {
    chatTitle = await messageTitleGenerator(normalizedMessage);
    chat = await chatModel.create({
      user: userId,
      title: chatTitle,
    });
  }

  const activeChatId = shouldCreateChat ? chat._id : chatId;

  const userMessage = await messageModel.create({
    chat: activeChatId,
    content: normalizedMessage,
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
    const normalizedFile = normalizeIncomingFile(file);

    // Step 1: Hash the uploaded file so duplicate detection stays scoped per user.
    const fileHash = generateFileHash(normalizedFile.buffer);
    let storedFile = await fileModel.findOne({ fileHash, user: userId });
    let fileText = "";

    // Step 2: Only extract and embed when this user has not already indexed
    // the same file. This avoids duplicate embeddings and Pinecone writes.
    if (!storedFile?.isEmbedded) {
      try {
        fileText = await extractTextFromFile(normalizedFile);
      } catch (error) {
        throw createAppError(
          `Unable to process uploaded file: ${error.message}`,
          400
        );
      }

      if (!fileText?.trim()) {
        throw createAppError("No readable text could be extracted from the uploaded file.");
      }

      // Step 3: Index the new document before the RAG search runs so the file
      // becomes searchable within the same request cycle.
      await indexDocument(fileText, userId);

      storedFile = await fileModel.findOneAndUpdate(
        { fileHash, user: userId },
        {
          user: userId,
          fileHash,
          fileName: normalizedFile.originalname,
          isEmbedded: true,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log("File embedded and stored");
    } else {
      console.log("File already exists for this user, skipping embedding");
    }

    // Step 4: Prefer a small inline preview for freshly uploaded files.
    // For duplicate uploads, keep only a lightweight marker and let Pinecone
    // retrieval load the actual chunk text.
    if (fileText) {
      fileContext = buildInlineFileContext(normalizedFile.originalname, fileText);
    } else {
      fileContext = `[File: ${storedFile.fileName || normalizedFile.originalname}]`;
    }
  }

  // Step 5: Run the RAG pipeline after upload processing has finished.
  const aiResponse = await ragPipeline(
    normalizedMessage,
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
