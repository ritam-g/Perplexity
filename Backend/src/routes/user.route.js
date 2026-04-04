import { Router } from "express";
import { updateUserProfile } from "../controller/user.controller.js";
import { authVerifyMiddleware } from "../middleware/auth.middleware.js";

const userRouter = Router();

/**
 * PATCH /api/users/profile
 *
 * Purpose:
 * Allow an authenticated user to update their own profile information.
 *
 * Middleware order:
 * 1. authVerifyMiddleware confirms the request is authenticated.
 * 2. updateUserProfile handles validation and delegates the update logic.
 */
userRouter.patch("/profile", authVerifyMiddleware, updateUserProfile);

export default userRouter;
