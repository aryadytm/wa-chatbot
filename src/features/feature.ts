//@ts-check
import KeyValueStore from "../key_value_store"
import FeatureState from "../feature_state"
import * as utils from "../utils"

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
    
    getState(sender) {
        return this.state.get(sender)
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
    
    help() {
        return ""
    }
    
    shouldAttach(command, state) {
        return false
    }

    onReceiveMessage(command, state) {
        return null
    }
    
}

export default Feature