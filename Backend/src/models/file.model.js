import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  fileHash: {
    type: String,
    required: true
  },
  fileName: String,
  isEmbedded: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Scope duplicate file detection to a single user so the same file hash can
// exist for different users without causing cross-user conflicts.
fileSchema.index({ user: 1, fileHash: 1 }, { unique: true });

const fileModel= mongoose.model("File", fileSchema);
export default fileModel;
