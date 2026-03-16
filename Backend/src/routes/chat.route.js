import { Router } from "express";
import { authVerifyMiddleware } from "../middleware/auth.middleware.js";
import { messageValidation } from "../middleware/validation.js";
import { chatDeleteController, getMessageController, sendMessageController } from "../controller/chat.controller.js";

const chatRouter = Router();

/**
 * @description - user can send message but he should login first
 * @method - post method 
 * @route - protected
 * @access - Private
 */
chatRouter.post("/message", messageValidation, authVerifyMiddleware, sendMessageController)
/** wreite a comment for hte route
 * @description - user can get message but he should login first
 * @method - get method
 * @route - protected
 * @access - Private
 */
chatRouter.get("/:chatId",authVerifyMiddleware,getMessageController)
/**  
 * @description - user can delete message but he should login first
 * @method - delete method
 * @route - protected
 * @access - Private
 */
chatRouter.delete("/delete",authVerifyMiddleware,chatDeleteController)

export default chatRouter
