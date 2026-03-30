import chunker from "../../utils/chunker.js";
import { embedAndStoreDocuments } from "./embedder.service.js";

/**
 * @description Splits a document into chunks and stores them inside the owner's Pinecone namespace
 * @param {string} documentText
 * @param {string|import("mongoose").Types.ObjectId} userId
 * @returns {Promise<void>}
 */
export async function indexDocument(documentText, userId) {
    if (!documentText?.trim()) return;
    if (!userId) {
        throw new Error("userId is required to index a document.");
    }

    //NOTE  Step 1: Split the document into smaller chunks
    const chunks = await chunker(documentText);

    // The embedder stores these chunks under userId.toString(), which prevents
    // cross-user retrieval even when many users share the same Pinecone index.
    await embedAndStoreDocuments(chunks, userId);
}
