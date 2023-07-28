import { MessageMedia } from "whatsapp-web.js";
import MessageContext from "../context";
import Feature from "./feature";
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';


const COMMAND_ASK_IMAGE = "minta gambar";
const COMMAND_LIST_IMAGES = "list gambar";
const COMMAND_ADD_IMAGE = "simpan gambar";
const COMMAND_DELETE_IMAGE = "hapus gambar";

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
            "_Fitur Galeri_\n\n" +
            `*${COMMAND_ASK_IMAGE} <kata kunci>* - Mencari gambar sesuai kata kunci\n` +
            `*${COMMAND_LIST_IMAGES}* - Menampilkan daftar semua gambar\n` +
            `*${COMMAND_ADD_IMAGE} <nama gambar>* - Menyimpan gambar yang Anda kirim bersamaan dengan perintah\n` +
            `*${COMMAND_DELETE_IMAGE} <nama gambar>* - Menghapus gambar sesuai nama\n` +
            ""
        );
    }

    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase();

        if (msg.startsWith(`${COMMAND_ASK_IMAGE} `)) {
            const imageName = msg.split(`${COMMAND_ASK_IMAGE} `)[ 1 ];
            this.handleGallery(imageName, context);
        }
        else if (msg === COMMAND_LIST_IMAGES) {
            this.handleList(context);
        }
        else if (msg.startsWith(`${COMMAND_ADD_IMAGE} `)) {
            const imageName = msg.split(`${COMMAND_ADD_IMAGE} `)[ 1 ];
            this.handleAddImage(imageName, context)
        }
        else if (msg.startsWith(`${COMMAND_DELETE_IMAGE} `)) {
            const imageName = msg.split(`${COMMAND_DELETE_IMAGE} `)[ 1 ];
            this.handleDeleteImage(imageName, context);
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
    
    async handleAddImage(imageName: string, context: MessageContext) {
        if (!context.message.hasMedia) {
            return context.reply('Kamu harus memasukkan gambar untuk disimpan.');
        }
        const media = await context.message.downloadMedia();
        // media.mimetype: string

        // Check if the mimetype is an image
        if (!media.mimetype.startsWith('image/')) {
            return context.reply('Format file yang diunggah bukan gambar.');
        }

        // Get the image format based on the mimetype
        const imageFormat = media.mimetype.split('/')[ 1 ];
        if (!imageFormat) {
            return context.reply('Format gambar tidak didukung.');
        }

        // Generate a UUID for the image filename
        const imageId = uuidv4();
        const imageFilename = `${imageId}.${imageFormat}`;

        // 1. Save media to data/gallery/(filename)
        const imagePath = `data/gallery/${imageFilename}`;
        fs.writeFileSync(imagePath, Buffer.from(media.data, 'base64'));

        // 2. Insert newly added image data to the database
        const query = `INSERT INTO gallery(name, path) VALUES(?, ?)`;
        this.db.run(query, [ imageName, imagePath ], (err) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat menyimpan gambar.');
            } else {
                context.reply(`Gambar '${imageName}' telah berhasil disimpan.`);
            }
        });
    }
    
    handleDeleteImage(imageName: string, context: MessageContext) {
        const query = `SELECT * FROM gallery WHERE LOWER(name) = LOWER(?)`;

        this.db.get(query, [ imageName ], (err, row: Image) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat menghapus gambar.');
            } else if (row) {
                const imagePath = row.path;

                // 1. Delete the image file
                fs.unlinkSync(imagePath);

                // 2. Delete the image record from the database
                const deleteQuery = `DELETE FROM gallery WHERE LOWER(name) = LOWER(?)`;
                this.db.run(deleteQuery, [ imageName ], (err) => {
                    if (err) {
                        console.error(err);
                        context.reply('Terjadi error saat menghapus gambar.');
                    } else {
                        context.reply(`Gambar '${imageName}' telah berhasil dihapus.`);
                    }
                });
            } else {
                context.reply(`Tidak dapat menemukan gambar ${imageName}.`);
            }
        });
    }
}


