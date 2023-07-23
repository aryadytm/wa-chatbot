//@ts-check
import KeyValueStore from "../key_value_store"
import FeatureState from "../feature_state"
import * as utils from "../utils"
import MessageContext from "../context"


export default abstract class Feature {
    intents: object
    state: KeyValueStore
    
    constructor() {
        this.intents = {
            IDLE: 0,
        }
        // Manage different state for different senders
        this.state = new KeyValueStore(new FeatureState())
    }
    
    /**
     * Returns the help text of the feature. The returning text will be be included in "help" message.
     */
    abstract help(): string

    /**
     * Event that triggered when bot received message from user or group.
     */
    abstract onReceiveMessage(context: MessageContext): any
    
    /**
     * Returns the focus state of the feature. Different sender have different state.
     */
    getState(sender: string): FeatureState {
        return this.state.get(sender)
    }

    /**
     * DEPRECATED. 
     * Switches focus to current feature. This disables other features from responding.
     */
    shouldAttach(context: MessageContext): boolean {
        return false
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