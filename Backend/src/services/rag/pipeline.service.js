import { retrieveDocuments } from "./retriever.service.js";
import { chatWithMistralAiModel } from "../ai.service.js";

/**
 * @description Orchestrates the Multi-turn RAG Flow (History + Vector Search + LLM)
 * @param {string} userQuery - The actual question for vector search
 * @param {Array} chatHistory - Previous messages for continuity
 * @param {string} fileContext - Any text from an uploaded file (treated as extra context)
 * @param {string|import("mongoose").Types.ObjectId} userId - Owner of the Pinecone namespace
 * @returns {Promise<string>} - Context-aware AI response
 */
export async function ragPipeline(userQuery, chatHistory = [], fileContext = "", userId) {
    try {
        // Define simple ANSI colors for the terminal
        const colors = {
            reset: "\x1b[0m",
            cyan: "\x1b[36m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            magenta: "\x1b[35m"
        };

        // Retrieval is always scoped by userId so this chat can only see chunks
        // from the authenticated user's Pinecone namespace.
        const context = await retrieveDocuments(userQuery, userId);

        console.log(`${colors.cyan}[RAG STAGE]: Context Query Finished.${colors.reset}`);

        if (context) {
            console.log(`${colors.green}[DATABASE FOUND]: Relevant chunks injected.${colors.reset}`);
            console.log(`${colors.yellow}--- RETRIEVED TEXT PREVIEW ---\n${context.substring(0, 200)}...\n--- END PREVIEW ---${colors.reset}`);
        } else {
            console.log(`${colors.magenta}[DATABASE EMPTY]: No relevant facts found. Falling back to general knowledge.${colors.reset}`);
        }

        // Step 3: Build a precise System Prompt
        let systemPrompt = "You are an intelligent knowledge assistant.\n\n";

        // Add File context separately (if provided)
        if (fileContext) {
            systemPrompt += `## Uploaded Document Content:\n${fileContext}\n\n`;
        }

        // Add Pinecone context separately (if provided)
        if (context) {
            systemPrompt += "## Knowledge Base Facts:\n" +
                "Use ONLY the relevant context strings below for additional facts:\n" +
                context + "\n\n";
        }

        systemPrompt += "Rules:\n" +
            "- If the document above contains the answer, use it.\n" +
            "- If the Knowledge Base contains the answer, use it.\n" +
            "- Otherwise, fallback to your general intelligence.";

        // Step 4: Assemble message chain
        const finalMessages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.slice(-10).map((msg) => ({
                role: msg.role === "ai" ? "assistant" : msg.role,
                content: msg.content
            })),
            { role: "user", content: userQuery }
        ];

        // Step 5: Call LLM
        console.log(`${colors.cyan}[AI STAGE]: Generating response with Mistral...${colors.reset}`);
        return await chatWithMistralAiModel({ message: finalMessages });
    } catch (error) {
        console.error("Pipeline Error:", error);

        // Fallback: Default to a normal LLM call if the RAG flow breaks
        // This ensures the user still gets some answer, even if context search failed
        return await chatWithMistralAiModel({
            message: [{ role: "user", content: userQuery }]
        });
    }
}
