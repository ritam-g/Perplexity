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

    const response = await chatWithMistralAiModel({
        message: [
            {
                role: "system",
                content: `You are an intelligent AI assistant designed to analyze user-provided files and answer questions based ONLY on the file content.

## Your Responsibilities:
- Carefully read and understand the provided file content.
- Answer the user's question using ONLY the extracted content.
- If the answer is not present in the file, clearly say:
  "The answer is not available in the provided file."

## Rules:
- Do NOT make assumptions.
- Do NOT generate fake information.
- Keep answers clear, structured, and concise.
- Use bullet points if helpful.
- If the file is large, focus only on relevant parts.

## Context:
You will receive:
1. Extracted file content
2. User question

## Output Style:
- Clear explanation
- Structured format
- No unnecessary text`
            },
            {
                role: "user",
                content: `Extracted file content:\n${text}\n\nUser question: Analyze this file.`,
            },
        ],
    });

    return response;
}