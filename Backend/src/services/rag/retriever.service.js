import { pineconeIndex } from "../../config/vector.db.js";
import { embedQuery } from "./embedder.service.js";

/**
 * @description Retrieves relevant documents from Pinecone after embedding the query
 * @param {string} query - The user's search string
 * @returns {Promise<string>} - Context summary for the LLM
 */
export async function retrieveDocuments(query) {
    if (!query) return "";

    try {
        // Step 1: Convert the query into a vector representation
        // This is necessary for a semantic search (searching by meaning, not words)
        const embeddingQuery = await embedQuery(query);

        // Step 2: Query Pinecone for top matches
        // topK: 5 fetches the top 5 most similar chunks
        const result = await pineconeIndex.query({
            vector: embeddingQuery,
            topK: 5,
            includeMetadata: true // This is where the actual text lives
        });

        // Step 3: Extract and join the text from metadata
        // We filter out any undefined fields and join chunks with line breaks
        const context = result.matches
            .map((match) => match.metadata?.text)
            .filter((text) => !!text)
            .join("\n---\n");

        console.log(`🔍 Retrieved ${result.matches.length} context matches.`);
        return context;

    } catch (error) {
        console.error("❌ Retrieval Error:", error);
        // Fallback to empty context so the chat still works without RAG if DB fails
        return "";
    }
}