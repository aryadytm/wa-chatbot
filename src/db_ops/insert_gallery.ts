import sqlite3 from 'sqlite3';

// Create or open the database
const db = new sqlite3.Database('./data/db.sqlite');

// Create the 'foods' table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    path TEXT
  )
`)

// Example images
const exampleImages = [
    {
        name: "Picasso Art",
        path: "data/gallery/picasso.jpg",
    },
    {
        name: "Greg Rutkowsi",
        path: "data/gallery/greg_rutkowski.jpg",
    },
    {
        name: "Nasi Goreng",
        path: "data/gallery/nasi_goreng.jpg",
    },
    {
        name: "Sate Ayam",
        path: "data/gallery/sate_ayam.jpg",
    },
]

// Insert the example data into table
exampleImages.forEach(item => {
    db.run(`
    INSERT INTO gallery (name, path)
    VALUES (?, ?)`, 
    [ item.name, item.path, ]);
});

// Close the database connection
db.close();
