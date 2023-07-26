import MessageContext from "../context";
import Feature from "./feature";
import sqlite3 from 'sqlite3';

const COMMAND_INFO_RESEP = "info resep";
const COMMAND_INFO_NUTRISI = "info nutrisi";
const COMMAND_INFO_LIST_MAKANAN = "list makanan";

interface Food {
    id: number,
    name: string,
    recipe: string,
    nutrition: string,
}

export default class Foodie extends Feature {
    db: sqlite3.Database;

    constructor() {
        super();
        this.db = new sqlite3.Database('./data/db.sqlite');
    }

    help() {
        return (
            "_Fitur Makanan_\n\n" +
            `*${COMMAND_INFO_RESEP} <nama makanan>* - Mencari resep dari nama makanan yang diberikan\n` +
            `*${COMMAND_INFO_NUTRISI} <nama makanan>* - Mencari informasi nutrisi dari nama makanan yang diberikan\n` +
            `*${COMMAND_INFO_LIST_MAKANAN}* - Menampilkan daftar semua makanan\n` +
            ""
        );
    }

    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase();

        if (msg.startsWith(COMMAND_INFO_RESEP)) {
            const foodName = msg.split(`${COMMAND_INFO_RESEP} `)[ 1 ];
            this.handleRecipe(foodName, context);
        } else if (msg.startsWith(COMMAND_INFO_NUTRISI)) {
            const foodName = msg.split(`${COMMAND_INFO_NUTRISI} `)[ 1 ];
            this.handleNutrition(foodName, context);
        } else if (msg.startsWith(COMMAND_INFO_LIST_MAKANAN)) {
            this.handleList(context);
        }
    }

    handleRecipe(foodName: string, context: MessageContext) {
        const query = `SELECT * FROM foods WHERE LOWER(name) LIKE '%' || LOWER(?) || '%'`;

        this.db.get(query, [ foodName ], (err, row: Food) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mencari resep.');
            } else if (row) {
                context.reply(`*Resep ${row.name}:*\n\n${row.recipe}`);
            } else {
                context.reply(`Tidak dapat menemukan resep ${foodName}.`);
            }
        });
    }

    handleNutrition(foodName: string, context: MessageContext) {
        const query = `SELECT * FROM foods WHERE LOWER(name) LIKE '%' || LOWER(?) || '%'`;

        this.db.get(query, [ foodName ], (err, row: Food) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mencari nutrisi.');
            } else if (row) {
                context.reply(`*Informasi Nutrisi ${row.name} (100g):*\n\n${row.nutrition}`);
            } else {
                context.reply(`Tidak dapat menemukan nutrisi ${foodName}.`);
            }
        });
    }

    handleList(context: MessageContext) {
        const query = `SELECT * FROM foods ORDER BY id`;

        this.db.all(query, (err, rows: Food[]) => {
            if (err) {
                console.error(err);
                context.reply('Terjadi error saat mengambil daftar makanan.');
            } else if (rows.length > 0) {
                const foodList = rows.map((food) => `${food.id}. ${food.name}`).join('\n');
                context.reply(`*Daftar Makanan:*\n\n${foodList}`);
            } else {
                context.reply('Tidak ada makanan yang tersedia.');
            }
        });
    }
}
