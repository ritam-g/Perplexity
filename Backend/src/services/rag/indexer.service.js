import chunker from "../../utils/chunker.js";
import { embedAndStoreDocuments } from "./embedder.service.js";

function createAppError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

/**
 * @description Splits a document into chunks and stores them inside the owner's Pinecone namespace
 * @param {string} documentText
 * @param {string|import("mongoose").Types.ObjectId} userId
 * @returns {Promise<{ chunkCount: number, namespace: string }>}
 */
export async function indexDocument(documentText, userId) {
    if (!userId) {
        throw createAppError("userId is required to index a document.");
    }

    const normalizedText = typeof documentText === "string"
        ? documentText.trim()
        : "";

    if (!normalizedText) {
        throw createAppError("Document text is empty after extraction.");
    }

    // Step 1: Split the document into smaller chunks for retrieval.
    const chunks = await chunker(normalizedText);
    const searchableChunks = chunks
        .map((chunk) => (typeof chunk === "string" ? chunk.trim() : ""))
        .filter(Boolean);

    if (searchableChunks.length === 0) {
        throw createAppError("Document chunking produced no searchable text.");
    }

    // Step 2: Embed and store the chunks in the user's Pinecone namespace.
    // Using userId.toString() downstream keeps every user's vectors isolated.
    await embedAndStoreDocuments(searchableChunks, userId);

    return {
        chunkCount: searchableChunks.length,
        namespace: userId.toString(),
    };
}
