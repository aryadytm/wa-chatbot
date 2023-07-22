//@ts-check
import KeyValueStore from "../key_value_store"
import FeatureState from "../feature_state"
import * as utils from "../utils"
import MessageContext from "../context"

class Feature {
    contexts: object
    state: KeyValueStore
    
    constructor() {
        this.contexts = {
            IDLE: 0,
        }
        // Manage different state for different senders
        this.state = new KeyValueStore(new FeatureState())
    }
    
    /**
     * Returns the focus state of the feature
     */
    getState(sender: string): FeatureState {
        return this.state.get(sender)
    }
    
    /**
     * Returns the help text of the feature. The returning text will be be included in "help" message.
     */
    help(): string {
        return ""
    }

    /**
     * DEPRECATED. 
     * Switches focus to current feature. This disables other features from responding.
     */
    shouldAttach(context: MessageContext, state: FeatureState): boolean {
        return false
    }

    /**
     * Event that triggered when bot received message from user or group.
     */
    onReceiveMessage(context: MessageContext, state: FeatureState) {

    }
    
    // getContext(sender) {
    //     return this.state.get(sender).context
    // }
    
    // setContext(sender, context) {
    //     this.state.set(sender, {
    //         ...this.state.get(sender),
    //         context: context,
    //         lastActionTime: utils.currentTimeSecs()
    //     })
    // }
    
    // detach(sender) {
    //     this.state.setDefault(sender)
    // }
    
    // attach(sender) {
    //     this.state.setDefault(sender)
    //     this.state.set(sender, {
    //         ...this.state.get(sender),
    //         isAttached: true,
    //         temp: {}
    //     })
    // }
    
    // isAttached(sender) {
    //     return this.state.get(sender).isAttached
    // }
    
}

export default Feature