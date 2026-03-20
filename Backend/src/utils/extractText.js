// src/utils/extractText.js
import { PDFParse } from "pdf-parse";
import { imagekit } from "../config/imageKit.config.js";

export async function extractTextFromFile(file) {
    let text = "";

    if (!file || !file.buffer) {
        throw new Error("File buffer is missing.");
    }

    // 📄 PDF Case
    if (file.mimetype === "application/pdf") {
        const parser = new PDFParse({ data: file.buffer })
        let resumeContent = { text: "" };
        try {
            resumeContent = await parser.getText()
        } finally {
            await parser.destroy().catch(() => { })
        }

        //REVIEW - empty PDF text usually means scanned/image-only resume or bad file content.
        if (!resumeContent?.text?.trim()) {
            return res.status(400).json({ message: "unable to extract text from resume pdf" })
        }
    }

    // 🖼️ Image Case (ImageKit)
    else if (file.mimetype.startsWith("image/")) {
        const uploadResponse = await imagekit.upload({
            file: file.buffer,
            fileName: file.originalname,
            extensions: [{ name: "google-auto-tagging", minConfidence: 80 }]
        });
        text = JSON.stringify(uploadResponse.extensionStatus) || "No text extracted";
    }

    // 📝 TXT Case
    else if (file.mimetype === "text/plain") {
        text = file.buffer.toString("utf-8");
    }

    return text;
}