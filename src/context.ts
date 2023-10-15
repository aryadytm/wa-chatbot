import wa from 'whatsapp-web.js'
import fs from 'fs';
import FeatureState from './feature_state';


const PATH_MESSAGE_LOG = "./data/whatsapp.jsonl"


export interface Message extends wa.Message {
    
}


export default class MessageContext {
    message: Message
    featureState: FeatureState

    constructor(message: Message, featureState: FeatureState) {
        this.message = message
        this.featureState = featureState
    }

    reply(content: string | wa.MessageContent) {
        // Send
        this.message.reply(content)
        // Log
        appendMessageToFile(this.message, content, PATH_MESSAGE_LOG)
    }
}


import path from 'path';

function appendMessageToFile(message: Message, response: string | wa.MessageContent, filePath: string): void {
    const obj = {
        timestamp: message.timestamp,
        from: message.from,
        fromMe: message.fromMe,
        to: message.to,
        author: message.author,
        mediaKey: message.mediaKey,
        body: message.body,
        response: typeof response === 'string' ? response : 'MessageContent',
    }
    const jsonl = JSON.stringify(obj);
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        fs.writeFileSync(resolvedPath, '');
    }
    fs.appendFileSync(resolvedPath, jsonl + '\n');
}