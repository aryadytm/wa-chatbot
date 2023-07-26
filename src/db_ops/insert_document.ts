import sqlite3 from 'sqlite3';


async function main() {
    // Create or open the database
    const db = new sqlite3.Database('./data/db.sqlite');

    // Create the 'foods' table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS document (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            path TEXT
        )
    `)
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Example images
    const exampleData = [
        {
            name: "Laporan Covid 19",
            path: "data/document/laporan_covid.pdf",
        },
        {
            name: "Laporan Kominfo",
            path: "data/document/laporan_kominfo.pdf",
        },
    ]

    // Insert the example data into table
    exampleData.forEach(item => {
        db.run(`
            INSERT INTO document (name, path)
            VALUES (?, ?)`,
            [ item.name, item.path, ]
        );
    });

    // Close the database connection
    db.close();
}


main()