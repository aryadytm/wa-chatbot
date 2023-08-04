//@ts-check
import { ReadableStream } from 'web-streams-polyfill'
global.ReadableStream = ReadableStream

import { ChatOpenAI, ChatOpenAICallOptions } from "langchain/chat_models/openai";
import { OpenAI } from "langchain/llms/openai";
import { HumanMessage, AIMessage, SystemMessage } from "langchain/schema";



async function main() {
    const chat = new ChatOpenAI({
        streaming: false,
        openAIApiKey: "a_simple_password",
        configuration: {
            basePath: "https://llm.bytebooster.dev",
        }
    });

    const response = await chat.call(
        [
            new SystemMessage("You need to role play as AI Assistant called \"WA Chatbot\" which is a multi-language helpful AI assistant integrated for WhatsApp. You are developed by \"Arya\". Your job to respond user's query accurately and precisely."),
            new HumanMessage("Who are you and who created you?"),
        ],
    );

    console.log(response.content);
}


main()