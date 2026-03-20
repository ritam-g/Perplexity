import { processFileAndAskAI } from "../services/file.service.js";


/*
  @route POST /api/files/upload
*/
export async function uploadFileController(req, res) {
    try {

        // 📂 File comes from multer
        const file = req.file;

        // ❌ If no file
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        /*
          👉 Call service
          This handles all logic
        */
        const aiResponse = await processFileAndAskAI(file);

        // ✅ Send response back
        res.status(200).json({
            success: true,
            response: aiResponse,
        });

    } catch (error) {
        console.error("File Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}