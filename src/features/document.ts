import { MessageMedia } from "whatsapp-web.js";
import MessageContext from "../context";
import Feature from "./feature";
import sqlite3 from 'sqlite3';

const COMMAND_MINTA_DOKUMEN = "minta dokumen";
const COMMAND_LIST_DOKUMEN = "list dokumen";
const DB_TABLE_DOCUMENT = "document";

interface Document {
    name: string
    path: string
}

export default class DocumentLibrary extends Feature {
    db: sqlite3.Database;

    constructor() {
        super();
        this.db = new sqlite3.Database('./data/db.sqlite');
    }

    help(): string {
        return (
            "*Fitur Dokumen*\n\n" +
            `*${COMMAND_MINTA_DOKUMEN} <kata kunci>* - Mencari dokumen sesuai kata kunci\n` +
            `*${COMMAND_LIST_DOKUMEN}* - Menampilkan daftar semua dokumen\n` +
            ""
        );
    }

    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase()

        if (msg.startsWith(`${COMMAND_MINTA_DOKUMEN} `)) {
            const docName = msg.split(`${COMMAND_MINTA_DOKUMEN} `)[ 1 ];
            this.handleDocument(docName, context);
        } else if (msg === COMMAND_LIST_DOKUMEN) {
            this.handleList(context);
        }
    }

    handleDocument(docName: string, context: MessageContext) {
        const query = `SELECT * FROM ${DB_TABLE_DOCUMENT} WHERE LOWER(name) LIKE '%' || LOWER(?) || '%'`;

        this.db.get(query, [ docName ], (err, row: Document) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mencari dokumen.');
            } else if (row) {
                const media = MessageMedia.fromFilePath(row.path);
                context.reply(media);
            } else {
                context.reply(`Tidak dapat menemukan dokumen ${docName}.`);
            }
        });
    }

    handleList(context: MessageContext) {
        const query = `SELECT * FROM ${DB_TABLE_DOCUMENT} ORDER BY name`;

        this.db.all(query, (err, rows: Document[]) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mengambil daftar dokumen.');
            } else if (rows.length > 0) {
                const documentList = rows.map((doc, index) => `${index + 1}. ${doc.name}`).join('\n');
                context.reply(`*Daftar Dokumen:*\n\n${documentList}`);
            } else {
                context.reply('Tidak ada dokumen yang tersedia.');
            }
        });
    }
}
