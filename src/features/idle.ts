//@ts-check
import Feature from "./feature"

class Idle extends Feature {
    
    constructor() {
        super()
    }
    
    shouldAttach(command, state) { 
        return false
    }
    
    onReceiveMessage(command, state) {
        
    }
    
}

export default Idle