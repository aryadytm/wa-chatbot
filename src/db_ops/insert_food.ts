import sqlite3 from 'sqlite3';

// Create or open the database
const db = new sqlite3.Database('./data/db.sqlite');

// Create the 'foods' table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    recipe TEXT,
    nutrition TEXT
  )
`);

// Example data to be inserted
const exampleFoods = [
    {
        name: 'Nasi Goreng',
        recipe: 'Bahan:\n- 300g nasi\n- 2 butir telur\n- 100g ayam (dada), potong dadu\n- 50g udang, kupas\n- 2 siung bawang putih, cincang halus\n- 2 siung bawang merah, cincang halus\n- 2 batang daun bawang, iris halus\n- 2 sdm kecap manis\n- 1 sdm saus tiram\n- Garam secukupnya\n- Merica secukupnya\n- Minyak goreng secukupnya\n\nLangkah:\n1. Panaskan minyak goreng, tumis bawang putih dan bawang merah hingga harum.\n2. Masukkan ayam dan udang, masak hingga berubah warna.\n3. Tambahkan telur, aduk rata hingga telur matang.\n4. Masukkan nasi, aduk rata dengan bahan lainnya.\n5. Tambahkan kecap manis, saus tiram, garam, dan merica. Aduk rata.\n6. Terakhir, tambahkan daun bawang dan aduk sebentar.\n7. Nasi goreng siap disajikan.',
        nutrition: 'Protein: 10g\nKarbohidrat: 40g\nLemak: 8g\nGula: 2g\nKalori: 250'
    },
    {
        name: 'Mie Goreng',
        recipe: 'Bahan:\n- 200g mie telur\n- 2 butir telur\n- 100g ayam (paha), potong dadu\n- 50g udang, kupas\n- 2 siung bawang putih, cincang halus\n- 2 siung bawang merah, cincang halus\n- 2 batang daun bawang, iris halus\n- 2 sdm kecap manis\n- 1 sdm saus tiram\n- Garam secukupnya\n- Merica secukupnya\n- Minyak goreng secukupnya\n\nLangkah:\n1. Rebus mie hingga matang, tiriskan dan sisihkan.\n2. Panaskan minyak goreng, tumis bawang putih dan bawang merah hingga harum.\n3. Masukkan ayam dan udang, masak hingga berubah warna.\n4. Tambahkan telur, aduk rata hingga telur matang.\n5. Masukkan mie, aduk rata dengan bahan lainnya.\n6. Tambahkan kecap manis, saus tiram, garam, dan merica. Aduk rata.\n7. Terakhir, tambahkan daun bawang dan aduk sebentar.\n8. Mie goreng siap disajikan.',
        nutrition: 'Protein: 12g\nKarbohidrat: 45g\nLemak: 10g\nGula: 3g\nKalori: 280'
    },
    {
        name: 'Ayam Bakar',
        recipe: 'Bahan:\n- 500g ayam (paha atau dada)\n- 3 siung bawang putih, haluskan\n- 2 cm jahe, haluskan\n- 2 sdm kecap manis\n- 1 sdm saus tiram\n- 1 sdm minyak wijen\n- Garam secukupnya\n- Merica secukupnya\n\nLangkah:\n1. Campur bawang putih, jahe, kecap manis, saus tiram, minyak wijen, garam, dan merica dalam wadah.\n2. Lumuri ayam dengan bumbu yang sudah dicampur hingga merata. Diamkan selama 30 menit.\n3. Panaskan panggangan atau grill, bakar ayam hingga matang dan berwarna kecokelatan.\n4. Ayam bakar siap disajikan.',
        nutrition: 'Protein: 25g\nKarbohidrat: 0g\nLemak: 10g\nGula: 2g\nKalori: 200'
    },
    {
        name: 'Sate Ayam',
        recipe: 'Bahan:\n- 500g ayam (dada), potong dadu\n- 2 sdm kecap manis\n- 2 sdm minyak goreng\n- 1 sdm air jeruk nipis\n- 1 sdt gula\n- 1 sdt garam\n- Tusuk sate secukupnya\n\nLangkah:\n1. Campur kecap manis, minyak goreng, air jeruk nipis, gula, dan garam dalam wadah.\n2. Masukkan potongan ayam ke dalam campuran bumbu, aduk hingga merata. Diamkan selama 1 jam dalam kulkas.\n3. Tusuk potongan ayam ke tusuk sate.\n4. Panggang sate ayam di atas panggangan atau grill hingga matang dan berwarna kecokelatan.\n5. Sate ayam siap disajikan.',
        nutrition: 'Protein: 20g\nKarbohidrat: 2g\nLemak: 8g\nGula: 1g\nKalori: 180'
    },
    {
        name: 'Gado-gado',
        recipe: 'Bahan:\n- 200g tahu, potong dadu\n- 200g tempe, potong dadu\n- 100g kacang panjang, potong-potong\n- 100g taoge\n- 2 buah telur, rebus dan iris\n- 1 buah mentimun, iris tipis\n- 1 buah wortel, iris tipis\n- 1 lembar daun kol, iris tipis\n- 2 sdm kecap manis\n- 1 sdm saus kacang\n- 1 sdt air jeruk nipis\n- Garam secukupnya\n- Gula secukupnya\n- Minyak goreng secukupnya\n\nLangkah:\n1. Rebus tahu, tempe, kacang panjang, dan taoge hingga matang. Tiriskan dan sisihkan.\n2. Panaskan minyak goreng, goreng tahu dan tempe hingga kecokelatan. Tiriskan.\n3. Campur kecap manis, saus kacang, air jeruk nipis, garam, dan gula dalam wadah.\n4. Siapkan piring saji, susun tahu, tempe, kacang panjang, taoge, telur, mentimun, wortel, dan daun kol.\n5. Siram dengan campuran bumbu.\n6. Gado-gado siap disajikan.',
        nutrition: 'Protein: 15g\nKarbohidrat: 30g\nLemak: 10g\nGula: 5g\nKalori: 250'
    },
    {
        name: 'Soto Ayam',
        recipe: 'Bahan:\n- 500g ayam (paha atau dada)\n- 2 batang serai, memarkan\n- 3 lembar daun jeruk\n- 2 lembar daun salam\n- 2 cm jahe, memarkan\n- 2 sdm minyak goreng\n- 2 liter air\n- Garam secukupnya\n- Merica secukupnya\n- Bawang goreng secukupnya\n- Daun seledri secukupnya\n- Bawang merah goreng secukupnya\n- Sambal secukupnya\n\nLangkah:\n1. Rebus ayam dalam air mendidih hingga matang. Angkat dan suwir-suwir daging ayamnya.\n2. Panaskan minyak goreng, tumis serai, daun jeruk, daun salam, dan jahe hingga harum.\n3. Masukkan ayam suwir, aduk rata.\n4. Tambahkan air, garam, dan merica. Aduk rata.\n5. Masak soto hingga mendidih dan bumbu meresap.\n6. Soto ayam siap disajikan dengan taburan bawang goreng, daun seledri, bawang merah goreng, dan sambal.',
        nutrition: 'Protein: 20g\nKarbohidrat: 10g\nLemak: 5g\nGula: 2g\nKalori: 180'
    },
    {
        name: 'Capcay',
        recipe: 'Bahan:\n- 200g kol, iris tipis\n- 100g wortel, iris tipis\n- 100g kembang kol, potong-potong\n- 100g brokoli, potong-potong\n- 100g jamur, iris tipis\n- 100g tauge\n- 2 batang daun bawang, iris halus\n- 2 siung bawang putih, cincang halus\n- 2 siung bawang merah, cincang halus\n- 2 sdm saus tiram\n- 1 sdm kecap manis\n- 1 sdt garam\n- 1/2 sdt merica\n- Minyak goreng secukupnya\n\nLangkah:\n1. Panaskan minyak goreng, tumis bawang putih dan bawang merah hingga harum.\n2. Masukkan kol, wortel, kembang kol, brokoli, dan jamur. Tumis hingga sayuran layu.\n3. Tambahkan tauge, daun bawang, saus tiram, kecap manis, garam, dan merica. Aduk rata.\n4. Capcay siap disajikan.',
        nutrition: 'Protein: 8g\nKarbohidrat: 15g\nLemak: 5g\nGula: 3g\nKalori: 120'
    },
    {
        name: 'Pisang Goreng',
        recipe: 'Bahan:\n- 4 buah pisang tanduk, potong-potong\n- 100g tepung terigu\n- 2 sdm tepung beras\n- 1 sdm gula pasir\n- 1/2 sdt baking powder\n- 1/4 sdt garam\n- 150ml air es\n- Minyak goreng secukupnya\n\nLangkah:\n1. Campur tepung terigu, tepung beras, gula pasir, baking powder, dan garam dalam wadah.\n2. Tambahkan air es sedikit-sedikit sambil diaduk hingga adonan berbentuk kental.\n3. Panaskan minyak goreng dalam wajan.\n4. Celupkan potongan pisang ke dalam adonan tepung hingga rata.\n5. Goreng pisang dalam minyak panas hingga kecokelatan.\n6. Pisang goreng siap disajikan.',
        nutrition: 'Protein: 2g\nKarbohidrat: 30g\nLemak: 5g\nGula: 10g\nKalori: 180'
    },
    {
        name: 'Pecel Lele',
        recipe: 'Bahan:\n- 4 ekor lele\n- 2 sdm air jeruk nipis\n- 2 sdt garam\n- 1 sdt merica\n- Minyak goreng secukupnya\n\nBumbu Pecel:\n- 4 buah cabai rawit\n- 2 siung bawang putih\n- 1/2 sdt terasi\n- 1 sdt garam\n- 1 sdt gula merah\n- 2 sdm air asam jawa\n- 2 sdm air matang\n\nLangkah:\n1. Bersihkan lele, lumuri dengan air jeruk nipis, garam, dan merica. Diamkan selama 15 menit.\n2. Panaskan minyak goreng dalam wajan.\n3. Goreng lele hingga matang dan berwarna kecokelatan.\n4. Haluskan cabai rawit, bawang putih, terasi, garam, dan gula merah.\n5. Tambahkan air asam jawa dan air matang, aduk rata.\n6. Sajikan lele goreng dengan bumbu pecel.',
        nutrition: 'Protein: 20g\nKarbohidrat: 5g\nLemak: 10g\nGula: 2g\nKalori: 200'
    },
    {
        name: 'Mie Ayam',
        recipe: 'Bahan:\n- 200g mie ayam\n- 100g ayam (dada), rebus dan suwir-suwir\n- 2 siung bawang putih, cincang halus\n- 2 sdm minyak goreng\n- 2 sdm kecap manis\n- 1 sdm saus tiram\n- Garam secukupnya\n- Merica secukupnya\n- Air matang secukupnya\n\nLangkah:\n1. Rebus mie ayam hingga matang, tiriskan dan sisihkan.\n2. Panaskan minyak goreng, tumis bawang putih hingga harum.\n3. Masukkan ayam suwir, aduk rata.\n4. Tambahkan mie ayam, kecap manis, saus tiram, garam, dan merica. Aduk rata.\n5. Tambahkan air matang sedikit-sedikit sambil terus diaduk hingga mie terasa lembut.\n6. Mie ayam siap disajikan.',
        nutrition: 'Protein: 15g\nKarbohidrat: 35g\nLemak: 8g\nGula: 3g\nKalori: 250'
    }
    // Tambahkan data makanan lainnya di sini
];


// Insert the example data into the 'foods' table
exampleFoods.forEach(food => {
    db.run(`
    INSERT INTO foods (name, recipe, nutrition)
    VALUES (?, ?, ?)
  `, [ food.name, food.recipe, food.nutrition ]);
});

// Close the database connection
db.close();
