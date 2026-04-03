import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { processChatMessage } from "../services/chat.service.js";

/**
 * @description Send message to AI
 * @route POST /api/chats/message
 */
export async function sendMessageController(req, res) {
  try {
    const { chatId } = req.body;
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication is required.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    // Step 1: Delegate the entire chat + optional file + RAG flow to the
    // shared service so HTTP and Socket.IO follow the exact same logic.
    const { activeChatId, aiMessage, chat, userMessage } = await processChatMessage({
      userId: req.user.id,
      message,
      chatId,
      file: req.file,
    });

    // Step 2: Return the saved messages and resolved chat id to the frontend.
    return res.status(200).json({
      success: true,
      chatId: activeChatId,
      aiMessage,
      chat,
      userMessage,
    });
  } catch (error) {
    console.error("Chat Error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to process chat message.",
    });
  }
}

export async function getMessageController(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messages = await messageModel.find({
      chat: chatId,
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function chatDeleteController(req, res, next) {
  try {
    const { chatId } = req.body;

    const userVerificaiton = await chatModel.findOne({
      _id: chatId,
      user: req.user.id,
    });

    if (!userVerificaiton) {
      return res.status(400).json({
        success: false,
        message: "Chat not found",
      });
    }

    await chatModel.deleteOne({
      _id: chatId,
    });

    await messageModel.deleteMany({
      chat: chatId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getChatControlelr(req, res, next) {
  try {
    const chats = await chatModel.find({
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
