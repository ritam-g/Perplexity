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
        console.error("❌ Embedding Query Error:", error);
        throw error;
    }
}

/**
 * @description Embeds multiple chunks and stores them in Pinecone
 * @param {string[]} texts - Array of document chunks
 * @returns {Promise<void>}
 */
export async function embedAndStoreDocuments(texts) {
    if (!texts || texts.length === 0) return;

    try {
        // Step 1: Batch embed all documents simultaneously
        // This is more efficient than calling the API for each one
        const allEmbeddings = await embeddings.embedDocuments(texts);

        // Step 2: Format data for Pinecone (id, values, metadata)
        // This exact structure is required by Pinecone SDK v2+
        const vectors = allEmbeddings.map((embedding, i) => ({
            id: `chunk-${Date.now()}-${i}`, // Unique ID per chunk
            values: embedding,
            metadata: {
                text: texts[i] // Store the original text so we can retrieve it later
            }
        }));

        // Step 3: Upsert (Update/Insert) vectors into the index
        console.log(`\x1b[36m💾 [DATABASE STAGE]: Upserting ${vectors.length} vectors to Pinecone...\x1b[0m`);
        await pineconeIndex.upsert(vectors);
        console.log("\x1b[32m✅ [SUCCESS]: Storage complete.\x1b[0m");
        
    } catch (error) {
        console.error("❌ Embedding/Storing Documents Error:", error);
        throw error;
    }
}