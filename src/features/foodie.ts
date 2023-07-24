import MessageContext from "../context";
import Feature from "./feature";
import sqlite3 from 'sqlite3';


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
            "Fitur Makanan\n\n" +
            "*info resep <nama makanan>* - Mencari resep dari nama makanan yang diberikan\n" +
            "*info nutrisi <nama makanan>* - Mencari informasi nutrisi dari nama makanan yang diberikan\n" +
            ""
        );
    }
    
    onReceiveMessage(context: MessageContext) {
        const msg = context.message.body.toLowerCase();

        if (msg.startsWith('info resep')) {
            const foodName = msg.split('info resep ')[ 1 ];
            this.getRecipe(foodName, context);
        }
        else if (msg.startsWith('info nutrisi')) {
            const foodName = msg.split('info nutrisi ')[ 1 ];
            this.getNutrition(foodName, context);
        }
    }

    getRecipe(foodName: string, context: MessageContext) {
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

    getNutrition(foodName: string, context: MessageContext) {
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
}