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



// App
class AppWrapper {
    features: Array<Feature>
    attachedFeature: KeyValueStore
    contextTimeoutSecs: number
    
    
    constructor(messenger: WAWebJS.Client) {
        // client: WhatsApp client
        
        // Features to use
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
        this.contextTimeoutSecs = 300
    }
    
    getAttachedFeature(sender) {
        return this.attachedFeature.get(sender)
    }
    
    setAttachedFeature(sender, attachedFeature) {
        this.attachedFeature.set(sender, attachedFeature)
    }
    
    isIdle(sender) {
        return this.getAttachedFeature(sender) instanceof Idle
    }
    
    setIdle(sender) {
        console.log(`[Set Idle "${sender}"]`)
        this.setAttachedFeature(sender, new Idle())
    }
    
    handleCommand(command) {
        // TODO: If isSelf, don't handle!
        
        const sender = command.from
        
        if (!this.isIdle(sender)) {
            const attachedFeature = this.getAttachedFeature(sender)
            const attachedFeatureState = attachedFeature.getState(sender)
            
            // It is attached to non idle feature. Detach if no action for more than X seconds.
            if (utils.currentTimeSecs() > attachedFeatureState.lastActionTime + this.contextTimeoutSecs) {
                attachedFeatureState.detach()
            }
            // Make sure the attached feature is not detached
            if (!attachedFeatureState.isAttached) {
                this.setIdle(sender)
            } else {
                // It is still attached. Handle command to attached feature
                return attachedFeature.handleCommand(command, attachedFeatureState)
            }
        }
        
        for (let feat of this.features) {
            const initialState = feat.getState(sender)
            
            // Activate the matching feature.
            if (feat.shouldAttach(command, initialState)) {
                initialState.attach()
                this.setAttachedFeature(sender, feat)
                return feat.onReceiveMessage(command, initialState)
            }
        }
    }
}

export default AppWrapper