import { Router } from "express";
import { authVerifyMiddleware } from "../middleware/auth.middleware.js";
import { messageValidation } from "../middleware/validation.js";
import { sendMessageController } from "../controller/chat.controller.js";

const chatRouter = Router();

/**
 * 
 * @description - user can send message but he should login first
 * @method - post method 
 * @route - protected
 * @access - Private
 */
chatRouter.post("/message", messageValidation, authVerifyMiddleware, sendMessageController)



export default chatRouter
