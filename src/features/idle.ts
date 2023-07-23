//@ts-check
import MessageContext from "../context";
import Feature from "./feature"

export default class Idle extends Feature {
    
    help(): string {
        return ""
    }
    
    onReceiveMessage(context: MessageContext) {
        
    }
    
}