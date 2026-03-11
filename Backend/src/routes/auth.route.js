import { Router } from "express";
import { registerController, userLoginController, verifyEmailController } from "../controller/auth.controller.js";
import { loginValidation, registerValidation } from "../middleware/validation.js";

const authRouter = Router();
/**!SECTION
 * 
 * @description - register
 * @method - POST
 * @route - /api/auth/register
 * @access - Public
 * 
 */
authRouter.post("/register", registerValidation, registerController);

/**!SECTION
 * @access - Public
 * @description - verify email
 * @method - GET
 * @route - /api/auth/verify-email
 */
authRouter.get('/verify-email',verifyEmailController)

/**!SECTION
 * 
 * @description - login
 * @method - POST 
 * @route - /api/auth/login
 * @access - Public
 * 
 */

authRouter.post("/login",loginValidation,userLoginController)
export default authRouter;
