//@ts-check
import MessageContext from "../context"
import FeatureState from "../feature_state"
import Feature from "./feature"


export default class Help extends Feature {
    features: Array<Feature>
    
    constructor(features: Array<Feature>) {
        super()
        this.features = features
    }
    
    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase()
        
        if (msg === "help" || msg === "bantuan") {
            context.reply(this.getHelpText().trim())
        }
    }
    
    help() {
        return (
            "_Fitur Bantuan_\n\n" +
            "*bantuan* - Menampilkan daftar perintah dalam bahasa Indonesia\n" +
            // "*help* - Menampilkan daftar perintah dalam bahasa Inggris\n" +
            ""
        )
    }
    
    getHelpText() {
        let featuresHelp = ""
        
        for (let feat of this.features) {
            featuresHelp += feat.help() + "\n"
        }
        
        return (
            "WA Chatbot Arya - Menu Bantuan\n\n" +
            featuresHelp +
            "Untuk menggunakan fitur-fitur tersebut, kamu hanya perlu kirim *kata kunci* yang tersedia.\n\n" +
            "Contoh: *bantuan*\n\n"
        )
    }
}