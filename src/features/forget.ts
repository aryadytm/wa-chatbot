//@ts-check

import * as fs from "fs"
import * as utils from "../utils"
import Feature from "./feature"
import MessageContext from "../context"


export default class Forget extends Feature {
    path_data: string
    data: object
    maxEntriesPerAuthor: number
    
    constructor() {
        super()
        
        this.intents = {
            IDLE: 0,
            CHOOSE_LIST: 1,
            CREATE_TITLE: 11,
            CREATE_CONTENT: 12,
        }
        
        this.path_data = 'data/forget.json'
        this.data = JSON.parse(fs.readFileSync(this.path_data))
        this.maxEntriesPerAuthor = 100
    }
    
    _commit() {
        fs.writeFileSync(this.path_data, JSON.stringify(this.data))
    }
    
    _insert(from: string, _title: string, _content: string) {
        if (!this.data.hasOwnProperty(from)) {
            this.data[from] = []
        }
        this.data[from].push({
            id: this.data[from].length,
            title: _title,
            content: _content
        })
        this._commit()
    }
    
    _delete(from: string, id: number) {
        if (!this.data.hasOwnProperty(from)) {
            return
        }
        if (this.data[from].length === 0) {
            return
        }
        for (let data of this.data[from]) {
            if (data.id == id) {
                this.data[from].splice(this.data[from].indexOf(data), 1)
            }
        }
        // reorder the IDs
        let i = 0
        for (let dt of this.data[from]) {
            dt.id = i++;
        }
        this._commit()
    }
    
    _readTitles(from: string) {
        if (!this.data.hasOwnProperty(from)) {
            return "[ Catatan kamu kosong ]\n"
        }
        if (this.data[from].length === 0) {
            return "[ Catatan kamu kosong ]\n"
        }
        
        const data = this.data[from].sort((a, b) => {
            return a.id - b.id
        })
        
        let titles = ""
        
        for (let i = 0; i < data.length; i++) {
            titles += `${data[i].id + 1}) ${data[i].title}\n`
        }
        return titles
    }
    
    help() {
        return (
            "_Fitur Catatan_\n\n" +
            "*lupa* - Tampilkan menu dan daftar catatan\n" +
            "*catat* - Buat catatan baru\n" +
            ""
        )
    }
    
    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body
        const cmd = (msg + "").toLowerCase()
        const sender = context.message.from
        
        if (cmd === "catat" || cmd === "lupa") {
            context.featureState.attach()
        }
        
        if (cmd === "keluar" && context.featureState.intent !== this.intents.IDLE) {
            context.featureState.detach()
            return context.reply("Berhasil keluar. Sekarang kamu dapat menjalankan perintah lain.")
        }
        
        if (cmd === "lupa" && context.featureState.intent === this.intents.IDLE) {
            context.featureState.setIntent(this.intents.CHOOSE_LIST)
            
            return context.reply(
                "Kamu lupa sesuatu? Ini adalah catatanmu:\n\n" + 
                this._readTitles(sender) + "\n" +
                "Balas dengan nomor untuk melihat isi catatanmu.\n" +
                "Balas *hapus <nomor>* untuk hapus catatan.\n" +
                "Balas *catat* untuk tambah catatan.\n" +
                "Balas *keluar* untuk keluar dari menu.\n"
            )
        }
        
        else if (!isNaN(msg) && context.featureState.intent === this.intents.CHOOSE_LIST) {
            context.featureState.detach()
            
            const index = parseInt(msg) - 1
            if (index >= 0 && index < this.data[sender].length) {
                const note = this.data[sender][index]
                return context.reply(`${note.title}\n\n${note.content}`)
            } else {
                return context.reply(`Tidak dapat menemukan catatan (${index}).`)
            }
        }
        
        else if (cmd === "catat" && (context.featureState.intent === this.intents.IDLE || context.featureState.intent === this.intents.CHOOSE_LIST))
        {
            if (this.data.hasOwnProperty(sender) && this.data[sender].length >= this.maxEntriesPerAuthor) {
                context.featureState.detach()
                return context.reply(`Telah mencapai maksimum ${this.maxEntriesPerAuthor} catatan.`)
            }
            context.featureState.setIntent(this.intents.CREATE_TITLE)
            return context.reply("Ketik judul catatan yang kamu inginkan. Contoh: Resep Nasi Goreng Seafood.")
        }
        
        else if (cmd.startsWith("hapus ") && context.featureState.intent === this.intents.CHOOSE_LIST) {
            const num = cmd.replace("hapus ", "")
            if (!isNaN(num)) {
                const index = parseInt(num) - 1
                if (index >= 0 && index < this.data[sender].length) {
                    this._delete(sender, index)
                    context.featureState.detach()
                    return context.reply(`Catatan (${num}) berhasil dihapus.`)
                } else {
                    return context.reply(`Tidak dapat menemukan nomor (${num}).`)
                }
            } 
        }
            
        else if (context.featureState.intent === this.intents.CREATE_TITLE) {
            if (msg.length < 5) {
                return context.reply("Minimum judul harus 5 karakter")
            }
            context.featureState.data.title = "" + msg
            context.featureState.setIntent(this.intents.CREATE_CONTENT)
            return context.reply(`Sekarang ketik catatanmu yang berjudul "${msg}"`)
        }
        
        else if (context.featureState.intent === this.intents.CREATE_CONTENT) {
            if (msg.length < 10) {
                return "Minimum catatan harus 10 karakter"
            }
            context.featureState.detach()
            
            // TODO: Handle image, and caption!
            this._insert(sender, context.featureState.data.title, msg)
            return context.reply("Catatanmu berhasil ditambahkan. Untuk melihatnya, ketik *lupa*")
        }
    }
}