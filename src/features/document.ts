import { MessageMedia } from "whatsapp-web.js";
import MessageContext from "../context";
import Feature from "./feature";
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const COMMAND_MINTA_DOKUMEN = "minta dokumen";
const COMMAND_LIST_DOKUMEN = "list dokumen";
const COMMAND_ADD_DOCUMENT = "simpan dokumen";
const COMMAND_DELETE_DOCUMENT = "hapus dokumen";
const DB_TABLE_DOCUMENT = "document";

interface Document {
    name: string;
    path: string;
}

export default class DocumentLibrary extends Feature {
    db: sqlite3.Database;

    constructor() {
        super();
        this.db = new sqlite3.Database('./data/db.sqlite');
    }

    help(): string {
        return (
            "_Fitur Dokumen_\n\n" +
            `*${COMMAND_MINTA_DOKUMEN} <kata kunci>* - Mencari dokumen sesuai kata kunci\n` +
            `*${COMMAND_LIST_DOKUMEN}* - Menampilkan daftar semua dokumen\n` +
            `*${COMMAND_ADD_DOCUMENT} <nama dokumen>* - Menyimpan dokumen yang Anda kirim bersamaan dengan perintah\n` +
            `*${COMMAND_DELETE_DOCUMENT} <nama dokumen>* - Menghapus dokumen sesuai nama\n` +
            ""
        );
    }

    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase();

        if (msg.startsWith(`${COMMAND_MINTA_DOKUMEN} `)) {
            const docName = msg.split(`${COMMAND_MINTA_DOKUMEN} `)[ 1 ];
            this.handleDocument(docName, context);
        } else if (msg === COMMAND_LIST_DOKUMEN) {
            this.handleList(context);
        } else if (msg.startsWith(`${COMMAND_ADD_DOCUMENT} `)) {
            const docName = msg.split(`${COMMAND_ADD_DOCUMENT} `)[ 1 ];
            this.handleAddDocument(docName, context);
        } else if (msg.startsWith(`${COMMAND_DELETE_DOCUMENT} `)) {
            const docName = msg.split(`${COMMAND_DELETE_DOCUMENT} `)[ 1 ];
            this.handleDeleteDocument(docName, context);
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

    async handleAddDocument(docName: string, context: MessageContext) {
        if (!context.message.hasMedia) {
            return context.reply('Kamu harus memasukkan dokumen untuk disimpan.');
        }
        const media = await context.message.downloadMedia();

        // Define a hashmap of allowed document mimetypes and their corresponding extensions
        const allowedMimetypes = {
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.oasis.opendocument.text': 'odt',
            'application/vnd.oasis.opendocument.presentation': 'odp',
            'application/vnd.oasis.opendocument.spreadsheet': 'ods',
            'application/vnd.oasis.opendocument.graphics': 'odg',
            'application/vnd.oasis.opendocument.formula': 'odf',
            'application/zip': 'zip',
            'application/vnd.rar': 'rar',
            'application/epub+zip': 'epub',
            'text/csv': 'csv',
            'text/plain': 'txt',
            // add more allowed document mimetypes as needed
        };


        // Check if the mimetype is a document
        if (!allowedMimetypes.hasOwnProperty(media.mimetype)) {
            return context.reply('Format file yang diunggah bukan dokumen.');
        }

        // Get the document format based on the mimetype
        const docFormat = allowedMimetypes[ media.mimetype ];
        if (!docFormat) {
            return context.reply('Format dokumen tidak didukung.');
        }
        
        // Generate a sanitized docName for the document filename
        const sanitizedDocName = docName.replace(/[^a-zA-Z0-9]/g, '_');

        // Generate a UUID for the document filename
        const docId = uuidv4();
        const docFilename = `${sanitizedDocName}_${docId}.${docFormat}`;

        // 1. Save media to data/document/(filename)
        const docPath = `data/document/${docFilename}`;
        fs.writeFileSync(docPath, Buffer.from(media.data, 'base64'));

        // 2. Insert newly added document data to the database
        const query = `INSERT INTO ${DB_TABLE_DOCUMENT}(name, path) VALUES(?, ?)`;
        this.db.run(query, [ docName, docPath ], (err) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat menyimpan dokumen.');
            } else {
                context.reply(`Dokumen '${docName}' telah berhasil disimpan.`);
            }
        });
    }

    handleDeleteDocument(docName: string, context: MessageContext) {
        const query = `SELECT * FROM ${DB_TABLE_DOCUMENT} WHERE LOWER(name) = LOWER(?)`;

        this.db.get(query, [ docName ], (err, row: Document) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat menghapus dokumen.');
            } else if (row) {
                const docPath = row.path;

                // 1. Delete the document file
                fs.unlinkSync(docPath);

                // 2. Delete the document record from the database
                const deleteQuery = `DELETE FROM ${DB_TABLE_DOCUMENT} WHERE LOWER(name) = LOWER(?)`;
                this.db.run(deleteQuery, [ docName ], (err) => {
                    if (err) {
                        console.error(err);
                        context.reply('Terjadi error saat menghapus dokumen.');
                    } else {
                        context.reply(`Dokumen '${docName}' telah berhasil dihapus.`);
                    }
                });
            } else {
                context.reply(`Tidak dapat menemukan dokumen ${docName}.`);
            }
        });
    }
}
