import * as utils from "./utils"


class FeatureState {
    context: any
    lastActionTime: number
    isAttached: boolean
    temp: object
    
    constructor() {
        this.setDefault()
    }
    
    setDefault() {
        this.context = 0
        this.lastActionTime = 0
        this.isAttached = false
        this.temp = {}
    }
    
    setContext(context: any) {
        this.context = context
        this.lastActionTime = utils.currentTimeSecs()
    }
    
    attach() {
        this.setDefault()
        this.isAttached = true
        this.lastActionTime = utils.currentTimeSecs()
    }
    
    detach() {
        this.isAttached = false
    }
    
}

export default FeatureState