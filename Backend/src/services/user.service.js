import userModel from "../models/user.model.js";
import AppError from "../utils/AppError.js";

// Keep email validation local to this service so update rules stay in one place.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Update only the profile fields that are allowed to change.
 *
 * Responsibilities:
 * 1. Normalize incoming values.
 * 2. Validate name and email before touching the database.
 * 3. Update only the fields that were actually provided.
 * 4. Convert database errors into user-friendly AppError responses.
 *
 * @param {string} userId
 * @param {{ name?: string, email?: string }} data
 * @returns {Promise<import("mongoose").Document>}
 */
export async function updateUserById(userId, data) {
  const updateData = {};

  // Step 1: Normalize and validate the incoming name before mapping it to username.
  if (typeof data.name === "string") {
    const trimmedName = data.name.trim();

    if (!trimmedName) {
      throw new AppError("Name cannot be empty", 400);
    }

    updateData.username = trimmedName;
  }

  // Step 2: Normalize and validate the incoming email before updating it.
  if (typeof data.email === "string") {
    const trimmedEmail = data.email.trim().toLowerCase();

    if (!trimmedEmail) {
      throw new AppError("Email cannot be empty", 400);
    }

    if (!emailRegex.test(trimmedEmail)) {
      throw new AppError("Please provide a valid email address", 400);
    }

    updateData.email = trimmedEmail;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError("Nothing to update", 400);
  }

  try {
    // Step 3: Persist only the sanitized fields and ask Mongoose to re-run validators.
    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    return updatedUser;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    // Step 4: Translate duplicate key errors into clear API messages.
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0];

      if (duplicateField === "email") {
        throw new AppError("Email is already in use", 409);
      }

      if (duplicateField === "username") {
        throw new AppError("Username is already in use", 409);
      }

      throw new AppError("Duplicate value provided", 409);
    }

    // Step 5: Surface schema validation errors as standard bad-request responses.
    if (error?.name === "ValidationError") {
      const firstValidationError = Object.values(error.errors)[0];

      throw new AppError(firstValidationError?.message || "Invalid user data", 400);
    }

    throw error;
  }
}
