import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage } from "@langchain/core/messages";
import readline from "readline/promises";
import "dotenv/config";
import { tool } from "@langchain/core/tools";
import sendEmail from "./email.service.js";
import { z } from "zod";
import { createAgent } from "langchain"
import webSerch from "./webSearch.service.js";


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

const RealTimeSearch=tool(
    webSerch,
    {
        name:"webSearch",
        description:"Use this tool to search web",
        schema:z.object({
            searchQuery:z.string().describe("Search Query")
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
    tools: [emailTool,RealTimeSearch],

});
// here calling the model
export async function chatWithGeminiAiModel(chat) {
    return (await model.invoke(chat)).text;
}

let messageHistory = [];

export async function chatWithMistralAiModel({message}) {

    while (true) {
        // store user message
        messageHistory.push(new HumanMessage(message));
        // console.log('human message', messageHistory)
        // send conversation to agent
        const response = await agent.invoke({
            messages: messageHistory
        });
        // console.log('ai message',response)
        // get the last AI message
        // const aiMessage = response.messages[response.messages.length - 1];
        const aiMessage = response.messages.at(-1);

        // store AI message in history
        messageHistory.push(aiMessage);

        // print response
        return aiMessage.content;

        console.log(`\x1b[34m[AI]\x1b[0m ${aiMessage.content}`);
    }

}


