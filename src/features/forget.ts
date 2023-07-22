//@ts-check

import * as fs from "fs"
import * as utils from "../utils"
import Feature from "./feature"


class Forget extends Feature {
    path_data: string
    data: object
    maxEntriesPerAuthor: number
    
    constructor() {
        super()
        
        this.contexts = {
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
    
    _insert(from, _title, _content) {
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
    
    _delete(from, id) {
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
    
    _readTitles(from) {
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
            "Fitur Catatan\n\n" +
            "*lupa* - Tampilkan menu dan daftar catatan\n" +
            "*catat* - Buat catatan baru\n" +
            ""
        )
    }
    
    shouldAttach(command, state) { 
        const inText = command.body.toLowerCase()
        
        if (inText === "lupa") return true
        if (inText === "catat") return true
        
        return false
    }
    
    onReceiveMessage(command, state) {
        const msg = command.body
        const cmd = (msg + "").toLowerCase()
        const sender = command.from
        
        if (cmd === "keluar" && state.context !== this.contexts.IDLE) {
            state.detach()
            return "Berhasil keluar. Sekarang kamu dapat menjalankan perintah lain."
        }
        
        if (cmd === "lupa" && state.context === this.contexts.IDLE) {
            state.setContext(this.contexts.CHOOSE_LIST)
            
            return (
                "Kamu lupa sesuatu? Ini adalah catatanmu:\n\n" + 
                this._readTitles(sender) + "\n" +
                "Balas dengan nomor untuk melihat isi catatanmu.\n" +
                "Balas *hapus <nomor>* untuk hapus catatan.\n" +
                "Balas *catat* untuk tambah catatan.\n" +
                "Balas *keluar* untuk keluar dari menu.\n"
            )
        }
        
        else if (!isNaN(msg) && state.context === this.contexts.CHOOSE_LIST) {
            state.detach()
            
            const index = parseInt(msg) - 1
            if (index >= 0 && index < this.data[sender].length) {
                const note = this.data[sender][index]
                return `${note.title}\n\n${note.content}`
            } else {
                return `Tidak dapat menemukan catatan (${index}).`
            }
        }
        
        else if (cmd === "catat" &&
            (state.context === this.contexts.IDLE || state.context === this.contexts.CHOOSE_LIST))
        {
            if (this.data.hasOwnProperty(sender) && this.data[sender].length >= this.maxEntriesPerAuthor) {
                state.detach()
                return `Telah mencapai maksimum ${this.maxEntriesPerAuthor} catatan.`
            }
            state.setContext(this.contexts.CREATE_TITLE)
            return "Ketik judul catatan yang kamu inginkan. Contoh: Resep Nasi Goreng Seafood."
        }
        
        else if (cmd.startsWith("hapus ") && state.context === this.contexts.CHOOSE_LIST) {
            const num = cmd.replace("hapus ", "")
            if (!isNaN(num)) {
                const index = parseInt(num) - 1
                if (index >= 0 && index < this.data[sender].length) {
                    this._delete(sender, index)
                    state.detach()
                    return `Catatan (${num}) berhasil dihapus.`
                } else {
                    return `Tidak dapat menemukan nomor (${num}).`
                }
            } 
        }
            
        else if (state.context === this.contexts.CREATE_TITLE) {
            if (msg.length < 5) {
                return "Minimum judul harus 5 karakter"
            }
            state.temp.title = "" + msg
            state.setContext(this.contexts.CREATE_CONTENT)
            return `Sekarang ketik catatanmu yang berjudul "${msg}"`
        }
        
        else if (state.context === this.contexts.CREATE_CONTENT) {
            if (msg.length < 10) {
                return "Minimum catatan harus 10 karakter"
            }
            state.detach()
            
            // TODO: Handle image, and caption!
            this._insert(sender, state.temp.title, msg)
            return "Catatanmu berhasil ditambahkan. Untuk melihatnya, ketik *lupa*"
        }
        
    }
    
}


export default Forget