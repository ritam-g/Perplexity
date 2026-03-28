import { Pinecone } from "@pinecone-database/pinecone";

// Initialize Pinecone client
// Centralizing this prevents redundant connections across different services
const pinecone = new Pinecone({
    apiKey: process.env.VECTOR_API_KEY,
});

// Export the specific index we'll be using for RAG
export const pineconeIndex = pinecone.Index(process.env.VECTOR_INDEX_NAME);
