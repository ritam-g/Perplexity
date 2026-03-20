import { extractTextFromFile } from "../utils/extractText.js";
import { chatWithMistralAiModel } from "./ai.service.js";

/*
  👉 This function:
  1. Extracts text from file
  2. Sends it to AI
*/
export async function processFileAndAskAI(file) {

    // 🔹 Step 1: Convert file → text
    const text = await extractTextFromFile(file);

    /*
      🔹 Step 2: Send text to AI
  
      We wrap it like a chat message
    */
    const response = await chatWithMistralAiModel({
        message: [
            {
                role: "user",
                content: `Analyze this file:\n${text}`,
            },
        ],
    });

    return response;
}