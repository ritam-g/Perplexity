import { DEFAULT_TOP_K, retrieveDocuments } from "./retriever.service.js";
import { chatWithMistralAiModel } from "../ai.service.js";

function normalizeContext(context) {
    return typeof context === "string" ? context.trim() : "";
}

function buildHistoryMessages(chatHistory = []) {
    return chatHistory
        .slice(-10)
        .map((msg) => ({
            role: msg.role === "ai" ? "assistant" : msg.role,
            content: msg.content
        }))
        .filter((msg) => typeof msg.content === "string" && msg.content.trim());
}

function buildSystemPrompt(fileContext, retrievedContext) {
    let systemPrompt = "You are an intelligent knowledge assistant.\n\n";

    if (fileContext) {
        systemPrompt += `## Uploaded Document Content:\n${fileContext}\n\n`;
    }

    if (retrievedContext) {
        systemPrompt += "## Knowledge Base Facts:\n" +
            retrievedContext + "\n\n";
    }

    systemPrompt += "Rules:\n" +
        "- Prefer the uploaded file context when it directly answers the question.\n" +
        "- Otherwise, use the retrieved knowledge base facts.\n" +
        "- If neither contains the answer, fall back to your general knowledge.";

    return systemPrompt;
}

/**
 * @description Orchestrates the Multi-turn RAG Flow (History + Vector Search + LLM)
 * @param {string} userQuery - The actual question for vector search
 * @param {Array} chatHistory - Previous messages for continuity
 * @param {string} fileContext - Any text from an uploaded file (treated as extra context)
 * @param {string|import("mongoose").Types.ObjectId} userId - Owner of the Pinecone namespace
 * @param {{ topK?: number }} [options]
 * @returns {Promise<string>} - Context-aware AI response
 */
export async function ragPipeline(userQuery, chatHistory = [], fileContext = "", userId, options = {}) {
    const normalizedQuery = typeof userQuery === "string" ? userQuery.trim() : "";
    const normalizedFileContext = normalizeContext(fileContext);
    const historyMessages = buildHistoryMessages(chatHistory);

    if (!normalizedQuery) {
        const error = new Error("userQuery is required");
        error.statusCode = 400;
        throw error;
    }

    try {
        // Step 1: Search Pinecone for the current user's most relevant chunks.
        const retrievedContext = normalizeContext(
            await retrieveDocuments(normalizedQuery, userId, {
                topK: options.topK ?? DEFAULT_TOP_K,
            })
        );

        const hasFileContext = normalizedFileContext.length > 0;
        const hasRetrievedContext = retrievedContext.length > 0;

        if (hasRetrievedContext) {
            console.log("[RAG PIPELINE]: Retrieved Pinecone context for this query.");
        } else {
            console.log("[RAG PIPELINE]: No Pinecone context found. Falling back to chat history + query.");
        }

        let finalMessages = [
            ...historyMessages,
            { role: "user", content: normalizedQuery }
        ];

        // Step 2: Only inject a system prompt when we actually have file or
        // retrieved context to prioritize.
        if (hasFileContext || hasRetrievedContext) {
            const systemPrompt = buildSystemPrompt(
                normalizedFileContext,
                retrievedContext
            );

            finalMessages = [
                { role: "system", content: systemPrompt },
                ...historyMessages,
                { role: "user", content: normalizedQuery }
            ];
        }

        // Step 3: Call the LLM with either:
        // - file context + retrieved context + history + query, or
        // - history + query only when Pinecone returns no usable context.
        console.log("[AI STAGE]: Generating response with Mistral...");
        return await chatWithMistralAiModel({ message: finalMessages });
    } catch (error) {
        console.error("Pipeline Error:", error);

        // Step 4: Final fallback when the RAG flow itself fails. Keep the chat
        // usable by sending only recent history plus the current query.
        return await chatWithMistralAiModel({
            message: [
                ...historyMessages,
                { role: "user", content: normalizedQuery }
            ]
        });
    }
}
