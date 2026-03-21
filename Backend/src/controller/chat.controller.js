import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { chatWithMistralAiModel, messageTitleGenerator } from "../services/ai.service.js";

/**
 * @description Send message to AI
 * @route POST /api/chats/message
 */

export async function sendMessageController(req, res) {
  try {
    const { message, chatId } = req.body;

    let chat = null;
    let title = null;

    /* =============================
       CREATE CHAT IF FIRST MESSAGE
    ============================== */

    if (!chatId) {
      title = await messageTitleGenerator(message);
      chat = await chatModel.create({
        user: req.user.id,
        title: title,
      });
    }

    const activeChatId = chatId || chat._id;

    /* =============================
       SAVE USER MESSAGE
    ============================== */

    const userMessage = await messageModel.create({
      chat: activeChatId,
      content: message,
      role: "user",
    });

    /* =============================
       GET CHAT HISTORY
    ============================== */

    const dbMessages = await messageModel
      .find({ chat: activeChatId })
      .sort({ createdAt: 1 })
      .select("role content")
      .lean();

    // console.log("✅ DB Messages count:", dbMessages.length, dbMessages);

    if (dbMessages.length === 0) {
      throw new Error("No messages found after save");
    }

    /* =============================
       SEND TO AI
    ============================== */
    const { extractTextFromFile } = await import("../utils/extractText.js");

    if (req.file) {
      const fileText = await extractTextFromFile(req.file);
      const lastMsg = dbMessages[dbMessages.length - 1];

      // Inject extracted text so AI can query it
      lastMsg.content = `File Content:\n${fileText}\n\nUser Question:\n${lastMsg.content}`;
    }

    const aiResponse = await chatWithMistralAiModel({
      message: dbMessages,
    });

    /* =============================
       SAVE AI RESPONSE
    ============================== */

    const aiMessage = await messageModel.create({
      chat: activeChatId,
      content: aiResponse,
      role: "ai",
    });

    /* =============================
       RESPONSE
    ============================== */

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
/**
 * @description Get message
 * @route GET /api/chats
 */
export async function getMessageController(req, res) {
  try {
    const { chatId } = req.params;
    const chat = chatModel.findOne({
      _id: chatId,
      user: req.user.id
    })
    if (!chat) {
      return res.status(400).json({
        success: false,
        message: "Chat not found",
      });
    }

    const messages = await messageModel.find({
      chat: chatId
    })
    res.status(200).json({
      success: true,
      messages
    })


  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function chatDeleteController(req, res, next) {
  try {
    const { chatId } = req.body
    //NOTE - verify user is same or not 
    const userVerificaiton = await chatModel.findOne({
      _id: chatId,
      user: req.user.id
    })
    if (!userVerificaiton) {
      return res.status(400).json({
        success: false,
        message: "Chat not found",
      });
    }
    //NOTE - delete chat
    await chatModel.deleteOne({
      _id: chatId
    })
    //note delete messages
    await messageModel.deleteMany({
      chat: chatId
    })
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
      user: req.user.id
    })
    return res.status(200).json({
      success: true,
      chats
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}