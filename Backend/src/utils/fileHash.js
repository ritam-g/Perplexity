import crypto from "crypto";

function generateFileHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export default generateFileHash;