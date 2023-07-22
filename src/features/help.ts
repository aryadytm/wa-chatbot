//@ts-check
import Feature from "./feature"

class Help extends Feature {
    features: Array<Feature>
    
    constructor(features) {
        super()
        this.features = features
    }
    
    shouldAttach(command, state) { 
        const inText = command.body.toLowerCase()
        
        if (inText === "help") return true
        if (inText === "bantuan") return true
        
        return false
    }
    
    onReceiveMessage(command, state) {
        state.detach()
        
        const msg = command.body.toLowerCase()
        
        if (msg == "help") {
            return this._getHelpText()
        }
        return this._getHelpText()
    }
    
    help() {
        return (
            "Fitur Bantuan\n\n" +
            "*bantuan* - Menampilkan daftar perintah dalam bahasa Indonesia\n" +
            "*help* - Menampilkan daftar perintah dalam bahasa Inggris\n" +
            ""
        )
    }
    
    _getHelpText() {
        let featuresHelp = ""
        
        for (let feat of this.features) {
            featuresHelp += feat.help() + "\n"
        }
        
        return (
            "AIE Bot - Menu Bantuan\n\n" +
            featuresHelp +
            "Untuk menggunakan fitur-fitur tersebut, kamu hanya perlu kirim *kata kunci* yang tersedia.\n\n" +
            "Contoh: *bantuan*\n\n" +
            "Nikmati beragam fitur AIE Bot lainnya (seperti *rewrite*, *ask*, dan *imagine*) dengan bergabung ke server Discord!"
        )
    }
    
    
}

export default Help