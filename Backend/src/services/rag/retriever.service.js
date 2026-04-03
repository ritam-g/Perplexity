import { pineconeIndex } from "../../config/vector.db.js";
import { embedQuery } from "./embedder.service.js";

export const DEFAULT_TOP_K = 5;

/**
 * @description Retrieves relevant documents from Pinecone after embedding the query
 * @param {string} query - The user's search string
 * @param {string|import("mongoose").Types.ObjectId} userId - Owner of the Pinecone namespace
 * @param {{ topK?: number }} [options]
 * @returns {Promise<string>} - Context summary for the LLM
 */
export async function retrieveDocuments(query, userId, options = {}) {
    const normalizedQuery = typeof query === "string" ? query.trim() : "";

    if (!normalizedQuery || !userId) return "";

    const topK = Number.isInteger(options.topK) && options.topK > 0
        ? options.topK
        : DEFAULT_TOP_K;

    try {
        // Step 1: Convert user query into an embedding vector.
        const embeddingQuery = await embedQuery(normalizedQuery);
        const namespace = userId.toString();

        if (!Array.isArray(embeddingQuery) || embeddingQuery.length === 0) {
            console.warn("[RETRIEVER]: Empty query embedding received. Skipping Pinecone search.");
            return "";
        }

        // Step 2: Search Pinecone for the top matching chunks inside the
        // current user's namespace.
        const result = await pineconeIndex.query({
            vector: embeddingQuery,
            topK,
            includeMetadata: true,
            namespace
        });

        const matches = Array.isArray(result?.matches) ? result.matches : [];

        if (matches.length === 0) {
            console.log(`[RETRIEVER]: No matches found in namespace "${namespace}".`);
            return "";
        }

        // Step 3: Return only the stored chunk text as a clean string so the
        // prompt builder can inject it directly.
        const context = matches
            .map((match) => {
                const chunkText = match?.metadata?.text;
                return typeof chunkText === "string" ? chunkText.trim() : "";
            })
            .filter(Boolean)
            .join("\n\n");

        console.log(`[RETRIEVER]: Retrieved ${matches.length} context matches with topK=${topK}.`);
        return context;
    } catch (error) {
        console.error("Retrieval Error:", error);
        // Fallback to empty context so the chat still works without RAG if Pinecone fails.
        return "";
    }
}
