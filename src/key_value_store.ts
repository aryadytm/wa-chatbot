//@ts-check
import * as fs from "fs"


class KeyValueStore {
    defaultValue: any
    datastore: object
    
    constructor(defaultValue: any) {
        this.defaultValue = defaultValue
        this.datastore = {}
    }
    
    setDefault(key: string) {
        this.datastore[key] = this.defaultValue
    }
    
    prepare(key: string) {
        if (!this.datastore.hasOwnProperty(key)) {
            this.setDefault(key)
        }
    }
    
    set(key: string, value: any) {
        this.prepare(key)
        this.datastore[key] = value
        
    }
    
    get(key: string) {
        this.prepare(key)
        return this.datastore[key]
    }
}

export default KeyValueStore