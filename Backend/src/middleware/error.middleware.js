export function errorHandler(err, req, res, next) {
  console.error("🔥 ERROR:", err);

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Operational error (trusted)
  if (err.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  // Unknown error (programming error)
  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
}