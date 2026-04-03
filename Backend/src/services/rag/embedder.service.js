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
    const normalizedText = typeof text === "string" ? text.trim() : "";

    if (!normalizedText) return null;

    try {
        // Step 1: Call Mistral's embedding API for a single query
        const queryVector = await embeddings.embedQuery(normalizedText);

        if (!Array.isArray(queryVector) || queryVector.length === 0) {
            throw new Error("Embedding API returned an empty query vector.");
        }

        return queryVector;
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
    if (!userId) {
        throw new Error("userId is required to store document embeddings.");
    }

    const cleanTexts = Array.isArray(texts)
        ? texts
            .map((text) => (typeof text === "string" ? text.trim() : ""))
            .filter(Boolean)
        : [];

    if (cleanTexts.length === 0) {
        throw new Error("No document chunks were provided for embedding.");
    }

    try {
        // Step 1: Batch embed all documents simultaneously
        // This is more efficient than calling the API for each one
        const allEmbeddings = await embeddings.embedDocuments(cleanTexts);
        const namespace = userId.toString();
        const batchTimestamp = Date.now();

        if (!Array.isArray(allEmbeddings) || allEmbeddings.length !== cleanTexts.length) {
            throw new Error("Embedding API returned an incomplete document embedding batch.");
        }

        // Step 2: Format data for Pinecone using the dense-vector record shape.
        const records = allEmbeddings.map((embedding, i) => {
            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error(`Embedding API returned an empty vector for chunk ${i}.`);
            }

            return {
                id: `chunk-${namespace}-${batchTimestamp}-${i}`,
                values: embedding,
                metadata: {
                    text: cleanTexts[i]
                }
            };
        });

        console.log(`\x1b[36m[DATABASE STAGE]: Upserting ${records.length} vectors to Pinecone...\x1b[0m`);

        // Step 3: Upsert into the user's namespace so one user's vectors never
        // mix with another user's data in the shared Pinecone index.
        await pineconeIndex.upsert({
            records,
            namespace
        });

        console.log("\x1b[32m[SUCCESS]: Storage complete.\x1b[0m");
    } catch (error) {
        console.error("Embedding/Storing Documents Error:", error);
        throw error;
    }
}
