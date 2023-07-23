//@ts-check

// Features
import Feature from "./features/feature"
import Idle from "./features/idle"
import Help from "./features/help"
import Forget from "./features/forget"
import Notification from "./features/notification"

// Helpers
import * as utils from "./utils"
import KeyValueStore from "./key_value_store"
import WAWebJS from "whatsapp-web.js"
import MessageContext, { Message } from "./context"


// App
export default class Chatbot {
    features: Array<Feature>
    attachedFeature: KeyValueStore
    featureTimeoutSecs: number
    
    constructor(messenger: WAWebJS.Client) {
        
        // NOTE: Features to use
        const FEATURES = [
            new Forget(),
            new Notification(messenger)
        ]
        
        this.features = []
        this.features.push(new Help(this.features))
        
        for (let f of FEATURES) {
            this.features.push(f)
        }
        
        this.attachedFeature = new KeyValueStore(new Idle())
        this.featureTimeoutSecs = 300
    }
    
    getAttachedFeature(sender: string): Feature {
        return this.attachedFeature.get(sender)
    }
    
    setAttachedFeature(sender: string, attachedFeature: Feature) {
        this.attachedFeature.set(sender, attachedFeature)
    }
    
    isIdle(sender: string) {
        return this.getAttachedFeature(sender) instanceof Idle
    }
    
    setIdle(sender: string) {
        console.log(`[Set Idle "${sender}"]`)
        this.setAttachedFeature(sender, new Idle())
    }
    
    onMessage(message: Message) {
        
        if (message.fromMe) {
            // Don't do anything if message is from the bot itself
            return
        }
        
        const sender = message.from
        
        if (!this.isIdle(sender)) {
            // User is attached to a feature (not idle). 
            const attachedFeature = this.getAttachedFeature(sender)
            const attachedFeatureState = attachedFeature.getState(sender)
            const context = new MessageContext(message, attachedFeatureState)
            
            // If no interaction for more than X seconds, detach it.
            if (utils.currentTimeSecs() > attachedFeatureState.lastActionTime + this.featureTimeoutSecs) {
                attachedFeatureState.detach()
            }
            // Make sure the attached feature is not detached
            if (!attachedFeatureState.isAttached) {
                this.setIdle(sender)
            } else {
                // It is still attached. Handle command to attached feature
                return attachedFeature.onReceiveMessage(context)
            }
        }
        
        for (let feature of this.features) {
            const initialState = feature.getState(sender)
            initialState.onAttach = () => {
                this.setAttachedFeature(sender, feature)
            }
            initialState.onDetach = () => {
                this.setIdle(sender)
            }
            
            const context = new MessageContext(message, initialState)
            feature.onReceiveMessage(context)
        }
    }
}