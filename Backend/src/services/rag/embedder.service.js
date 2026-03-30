import { MistralAIEmbeddings } from "@langchain/mistralai";
import { pineconeIndex } from "../../config/vector.db.js";

// Mistral Embedding engine
// Using 'mistral-embed' as the model for vector conversions
const embeddings = new MistralAIEmbeddings({
    apiKey: process.env.MISTRAL_API_KEY,
    model: "mistral-embed"
});

/**
 * @description Convets a single string into an embedding vector
 * @param {string} text
 * @returns {Promise<number[]>} - 1024-dimension vector (Mistral default)
 */
export async function embedQuery(text) {
    if (!text) return null;

    try {
        // Step 1: Call Mistral's embedding API for a single query
        return await embeddings.embedQuery(text);
    } catch (error) {
        console.error("Embedding Query Error:", error);
        throw error;
    }
}

/**
 * @description Embeds multiple chunks and stores them in Pinecone
 * @param {string[]} texts - Array of document chunks
 * @param {string|import("mongoose").Types.ObjectId} userId - Owner of the document chunks
 * @returns {Promise<void>}
 */
export async function embedAndStoreDocuments(texts, userId) {
    if (!texts || texts.length === 0) return;
    if (!userId) {
        throw new Error("userId is required to store document embeddings.");
    }

    try {
        // Step 1: Batch embed all documents simultaneously
        // This is more efficient than calling the API for each one
        const allEmbeddings = await embeddings.embedDocuments(texts);
        const namespace = userId.toString();

        // Step 2: Format data for Pinecone (id, values, metadata)
        const records = allEmbeddings.map((embedding, i) => ({
            id: `chunk-${namespace}-${Date.now()}-${i}`,
            values: embedding,
            metadata: {
                text: texts[i]
            }
        }));

        console.log(`\x1b[36m[DATABASE STAGE]: Upserting ${records.length} vectors to Pinecone...\x1b[0m`);

        // Every user writes to their own namespace so Pinecone keeps one user's
        // vectors isolated from every other user's vectors in the same index.
        await pineconeIndex.upsert({
            records,//embeddings and metadata
            namespace//NOTE - fetching the data pincone index
        });

        console.log("\x1b[32m[SUCCESS]: Storage complete.\x1b[0m");
    } catch (error) {
        console.error("Embedding/Storing Documents Error:", error);
        throw error;
    }
}
