import { MessageMedia } from "whatsapp-web.js";
import MessageContext from "../context";
import Feature from "./feature";
import sqlite3 from 'sqlite3';

const COMMAND_MINTA_GAMBAR = "minta gambar";
const COMMAND_LIST_GALLERY = "list gambar";

interface Image {
    name: string;
    path: string;
}

export default class Gallery extends Feature {
    db: sqlite3.Database;

    constructor() {
        super();
        this.db = new sqlite3.Database('./data/db.sqlite');
    }

    help(): string {
        return (
            "*Fitur Galeri*\n\n" +
            `*${COMMAND_MINTA_GAMBAR} <kata kunci>* - Mencari gambar sesuai kata kunci\n` +
            `*${COMMAND_LIST_GALLERY}* - Menampilkan daftar semua gambar\n` +
            ""
        );
    }

    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase();

        if (msg.startsWith(`${COMMAND_MINTA_GAMBAR} `)) {
            const imageName = msg.split(`${COMMAND_MINTA_GAMBAR} `)[ 1 ];
            this.handleGallery(imageName, context);
        } else if (msg === COMMAND_LIST_GALLERY) {
            this.handleList(context);
        }
    }

    handleGallery(imageName: string, context: MessageContext) {
        const query = `SELECT * FROM gallery WHERE LOWER(name) LIKE '%' || LOWER(?) || '%'`;

        this.db.get(query, [ imageName ], (err, row: Image) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mencari gambar.');
            } else if (row) {
                const media = MessageMedia.fromFilePath(row.path);
                context.reply(media);
            } else {
                context.reply(`Tidak dapat menemukan gambar ${imageName}.`);
            }
        });
    }

    handleList(context: MessageContext) {
        const query = `SELECT * FROM gallery ORDER BY name`;

        this.db.all(query, (err, rows: Image[]) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mengambil daftar gambar.');
            } else if (rows.length > 0) {
                const imageList = rows.map((image, index) => `${index + 1}. ${image.name}`).join('\n');
                context.reply(`*Daftar Gambar:*\n\n${imageList}`);
            } else {
                context.reply('Tidak ada gambar yang tersedia.');
            }
        });
    }
}
