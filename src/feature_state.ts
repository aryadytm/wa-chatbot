import * as utils from "./utils"


let intents = {
    IDLE: 0,
}


class FeatureState {
    intent: any
    lastActionTime: number
    isAttached: boolean
    data: object
    onAttach: CallableFunction
    onDetach: CallableFunction
    
    constructor() {
        this.setDefault()
    }
    
    setDefault() {
        this.intent = 0
        this.lastActionTime = 0
        this.isAttached = false
        this.data = {}
    }
    
    setIntent(context: any) {
        this.intent = context
        this.lastActionTime = utils.currentTimeSecs()
    }
    
    attach() {
        this.setDefault()
        this.isAttached = true
        this.lastActionTime = utils.currentTimeSecs()
        this.onAttach()
    }
    
    detach() {
        this.isAttached = false
        this.intent = intents.IDLE
        this.onDetach()
    }
    
}

export default FeatureState