import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { processChatMessage } from "../services/chat.service.js";

/**
 * @description Send message to AI
 * @route POST /api/chats/message
 */
export async function sendMessageController(req, res) {
  try {
    // Keep the controller thin. The shared service below contains the already
    // built chat + file + RAG workflow so HTTP and Socket.IO use the same code.
    const { message, chatId } = req.body;
    const { activeChatId, aiMessage, chat, userMessage } = await processChatMessage({
      userId: req.user.id,
      message,
      chatId,
      file: req.file,
    });

    res.status(200).json({
      success: true,
      chatId: activeChatId,
      aiMessage,
      chat,
      userMessage,
    });
  } catch (error) {
    console.error("Chat Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
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
