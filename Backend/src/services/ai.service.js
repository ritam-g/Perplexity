import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import readline from "readline/promises";
import "dotenv/config";
import { tool } from "@langchain/core/tools";
import sendEmail from "./email.service.js";
import { z } from "zod";
import { createAgent } from "langchain"
import webSerch from "./webSearch.service.js";
// import { ms } from "zod/v4/locales"; // Removed incorrect import



/** all toll are here */
const emailTool = tool(
    sendEmail,
    {
        name: "sendEmail",
        description: "Use this tool to send an email",
        // what ever we write in hree it will be passed as object to sendEmail
        schema: z.object({
            to: z.string().describe("Email address"),
            subject: z.string().describe("Email subject"),
            html: z.string().optional(),
            text: z.string().optional(),
        })
    }
)

const RealTimeSearch = tool(
    webSerch,
    {
        name: "webSearch",
        description: "Use this tool to search web",
        schema: z.object({
            searchQuery: z.string().describe("Search Query")
        })
    }
)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
// here definding the model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GOOGLE_API_KEY,
});

const model2 = new ChatMistralAI({
    model: "mistral-small-latest",
    temperature: 0.1,
});

const agent = createAgent({
    model: model2,
    tools: [emailTool, RealTimeSearch],

});
// here calling the model
export async function chatWithGeminiAiModel(chat) {
    return (await model.invoke(chat)).text;
}


// crete desctip of thie sfunciotn 
/**  
 * @description - chat with ai
 * @method - POST
 * @route - /api/ai
 * @access - Public
 */
export async function chatWithMistralAiModel({ message }) {

    //NOTE - THE PROBLE OF THIS THE AI IS NOT RESPONDING BECUSE AI WANT MORE CONTEXT
    // const response = await agent.invoke([
    //     new HumanMessage(message)
    // ])
    //todo  makig sing json to more context for the ai 
    const allMessages = message.map(msg => {
        if (msg.role === "system") {
            return new SystemMessage(msg.content)
        } else if (msg.role === "user") {
            return new HumanMessage(msg.content)
        } else {
            return new AIMessage(msg.content)
        }
    })

    console.log("🚀 Sending to Agent with messages:", allMessages);

    // Some agents (like LangGraph-based ones) expect a 'messages' key in the input object.
    const response = await agent.invoke({
        messages: allMessages
    });

    console.log("🤖 AI Agent Raw Response:", response);
    
    // Determine the text response. 
    // If it's a LangGraph agent, the last message in the returned 'messages' state is the AI's response.
    // Otherwise, check for 'output', 'text', or 'content'.
    let aiText = "";
    if (response.output) {
        aiText = response.output;
    } else if (response.text) {
        aiText = response.text;
    } else if (response.content) {
        aiText = response.content;
    } else if (Array.isArray(response.messages)) {
        const lastMsg = response.messages[response.messages.length - 1];
        aiText = lastMsg.text || lastMsg.content || "";
    }

    return aiText;

    
}

//making title base on the message
export async function messageTitleGenerator(message) {
    const response = await model.invoke([
        new SystemMessage(
            "Generate a SHORT chat title (4-5 words maximum) that captures the topic of the user message. " +
            "Rules: Only output the title itself — no explanations, no bullet points, no quotes, no punctuation at the end. " +
            "Examples: 'Fix login bug', 'React state management help', 'Plan weekend trip', 'Write poem about rain'."
        ),
        new HumanMessage(message)
    ]);

    // Strip any surrounding quotes Gemini sometimes adds and trim whitespace
    const raw = (response.text || '').trim().replace(/^["']|["']$/g, '');

    // Safety net: if the model still returns something too long, clip to 5 words
    const words = raw.split(/\s+/);
    return words.length <= 5 ? raw : words.slice(0, 5).join(' ');
}



