import { pineconeIndex } from "../../config/vector.db.js";
import { embedQuery } from "./embedder.service.js";

/**
 * @description Retrieves relevant documents from Pinecone after embedding the query
 * @param {string} query - The user's search string
 * @param {string|import("mongoose").Types.ObjectId} userId - Owner of the Pinecone namespace
 * @returns {Promise<string>} - Context summary for the LLM
 */
export async function retrieveDocuments(query, userId) {
    if (!query || !userId) return "";

    try {
        // Step 1: Convert the query into a vector representation
        // This is necessary for a semantic search (searching by meaning, not words)
        const embeddingQuery = await embedQuery(query);
        const namespace = userId.toString();

        // Step 2: Query Pinecone for top matches
        // topK: 5 fetches the top 5 most similar chunks
        const result = await pineconeIndex.query({
            vector: embeddingQuery,
            topK: 5,
            includeMetadata: true,
            // Query only inside the current user's namespace so retrieval never
            // returns chunks that belong to a different user's documents.
            namespace
        });

        // Step 3: Extract and join the text from metadata
        // We filter out any undefined fields and join chunks with line breaks
        const context = result.matches
            .map((match) => match.metadata?.text)
            .filter((text) => !!text)
            .join("\n---\n");

        console.log(`[RETRIEVER]: Retrieved ${result.matches.length} context matches.`);
        return context;
    } catch (error) {
        console.error("Retrieval Error:", error);
        // Fallback to empty context so the chat still works without RAG if DB fails
        return "";
    }
}
