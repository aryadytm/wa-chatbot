import { ReadableStream } from 'web-streams-polyfill'
global.ReadableStream = ReadableStream

import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, AIMessage, SystemMessage } from "langchain/schema";
import { translate } from '@vitalets/google-translate-api';

import MessageContext from "../context";
import Feature from "./feature";

import LanguageDetect from 'languagedetect';

const langDetect = new LanguageDetect();
langDetect.setLanguageType('iso2')

const COMMAND_AI = "tolong";


export default class AIChat extends Feature {
    chat: ChatOpenAI;

    constructor() {
        super();
        this.chat = new ChatOpenAI({
            streaming: false,
            openAIApiKey: "a_whatsapp_user",
            configuration: {
                basePath: "https://llm.bytebooster.dev",
            }
        });
    }

    help(): string {
        return (
            "_Fitur AI (Kecerdasan Buatan)_\n\n" +
            `*${COMMAND_AI} <pesan>* - Meminta AI cerdas untuk membantu apapun dari pesan Anda\n` +
            ""
        );
    }

    async onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase();

        if (msg.startsWith(`${COMMAND_AI} `)) {
            const query = msg.split(`${COMMAND_AI} `)[ 1 ];
            await this.handleAiMessage(query, context);
        }
    }

    async handleAiMessage(query: string, context: MessageContext) {
        this.chat.call([
            new SystemMessage("You need to role play as AI Assistant called \"WA Assistant\" which is a multilingual helpful AI assistant system developed by Arya that is integrated for WhatsApp. Your job to respond user's query accurately and precisely. Please answer as short as possible because this is a chat feature."),
            new HumanMessage(query),
        ]).then(async (response) => {
            // Translate the response back to the original language
            context.reply(response.content.trim());
        }).catch((error) => {
            context.reply("Terjadi error saat bertanya ke AI. Mohon coba kembali.");
        });
    }
    
}
