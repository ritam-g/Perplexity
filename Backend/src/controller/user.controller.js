import AppError from "../utils/AppError.js";
import { updateUserById } from "../services/user.service.js";

/**
 * Update the authenticated user's profile details.
 *
 * Flow:
 * 1. Read the logged-in user id from req.user.
 * 2. Read the editable fields from the request body.
 * 3. Reject empty update requests early.
 * 4. Delegate the database update to the service layer.
 * 5. Return a clean user object for the client.
 *
 * @route PATCH /api/users/profile
 * @access Private
 */
export async function updateUserProfile(req, res, next) {
  try {
    // Step 1: Extract the authenticated user id and incoming profile fields.
    const userId = req.user?.id;
    const { name, email } = req.body ?? {};

    // Step 2: Check whether the request includes at least one editable value.
    const hasName = typeof name === "string" && name.trim();
    const hasEmail = typeof email === "string" && email.trim();

    if (!userId) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!hasName && !hasEmail) {
      return next(new AppError("Nothing to update", 400));
    }

    // Step 3: Pass the allowed fields to the service layer for validation and update.
    const updatedUser = await updateUserById(userId, { name, email });

    // Step 4: Return a clean response payload with the updated public profile fields.
    return res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.username,
        username: updatedUser.username,
        email: updatedUser.email,
        verified: updatedUser.verified,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}
