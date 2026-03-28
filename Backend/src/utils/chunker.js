import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

/**
 * @description Splits a long document into smaller, manageable chunks for embedding
 * @param {string} document - The full text content to be split
 * @returns {Promise<string[]>} - Array of text chunks
 */
export default async function chunker(document) {
    if (!document) return [];

    // chunkSize: 500 is a good balance between context and precision
    // chunkOverlap: 50 ensures that context isn't lost at the split points
    const splitter = new RecursiveCharacterTextSplitter({ 
        chunkSize: 500, 
        chunkOverlap: 50 
    });

    // Step: Perform the split
    return await splitter.splitText(document);
}