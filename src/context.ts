import wa from 'whatsapp-web.js'
import fs from 'fs';


const PATH_MESSAGE_LOG = "./data/whatsapp.jsonl"


interface Message extends wa.Message {}


export default class MessageContext {
    message: Message

    constructor(message: Message) {
        this.message = message
    }

    reply(text: string) {
        // Send
        this.message.reply(text)
        // Log
        appendMessageToFile(this.message, text, PATH_MESSAGE_LOG)
    }
}


function appendMessageToFile(message: Message, response: string, filePath: string): void {
    const obj = {
        timestamp: message.timestamp,
        from: message.from,
        fromMe: message.fromMe,
        to: message.to,
        author: message.author,
        mediaKey: message.mediaKey,
        body: message.body,
        response: response,
        
    }
    const jsonl = JSON.stringify(obj);
    fs.appendFileSync(filePath, jsonl + '\n');
}