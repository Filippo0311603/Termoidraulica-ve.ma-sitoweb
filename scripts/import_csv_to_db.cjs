const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '../vema.db');
const CSV_DIR = path.join(__dirname, '../dati_csv');

const db = new sqlite3.Database(DB_PATH);

const parseCSVLine = (line) => {
    const parts = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ';' && !inQuote) {
            parts.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current);
    return parts.map(p => p.replace(/^"|"$/g, '').trim()); // Remove surrounding quotes
};

const importData = async () => {
    console.log("Inizio importazione dati da CSV...");

    // 1. Load Categories
    const categories = {};
    const catContent = fs.readFileSync(path.join(CSV_DIR, 'CARGRO_Categorie.csv'), 'utf-8');
    catContent.split('\n').forEach(line => {
        if (!line.trim()) return;
        const [code, desc] = parseCSVLine(line);
        if (code && desc) categories[code] = desc;
    });
    console.log(`Caricate ${Object.keys(categories).length} categorie.`);

    // 2. Load Stock
    const stockMap = {};
    const stockContent = fs.readFileSync(path.join(CSV_DIR, 'CARGRO_Giacenze.csv'), 'utf-8');
    stockContent.split('\n').forEach(line => {
        if (!line.trim()) return;
        const [code, qty] = parseCSVLine(line);
        if (code) stockMap[code] = parseInt(qty) || 0;
    });
    console.log(`Caricate giacenze per ${Object.keys(stockMap).length} prodotti.`);

    // 3. Process Listino and Insert
    const listinoPath = path.join(CSV_DIR, 'CARGRO_Listino.csv');
    const fileStream = fs.createReadStream(listinoPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    let headers = [];

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        db.run("DELETE FROM products"); // Clear existing data

        const stmt = db.prepare("INSERT INTO products (id, name, category, price, image, desc, specs, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

        rl.on('line', (line) => {
            if (!line.trim()) return;
            const cols = parseCSVLine(line);

            if (count === 0) {
                headers = cols; // Skip header
                count++;
                return;
            }

            // Mapping based on header:
            // CAT.;Gerarchia;Descrizione Gerarchia;Codice;Descrizione;Prezzo;...
            // 0    1         2                      3      4           5
            
            const catCode = cols[0];
            const id = cols[3];
            const name = cols[4];
            const rawPrice = cols[5];
            const imageFile = cols[17]; // Index 17 based on visual count, let's verify dynamically if possible, but fixed index is safer for now if format is stable.
            // Actually let's count:
            // 0:CAT, 1:Gerarchia, 2:DescGer, 3:Codice, 4:Desc, 5:Prezzo, 6:Netto, 7-12:Sconti, 13:UExtra, 14:ScTot, 15:PrzDef, 16:UM, 17:Immagine
            // 18:Min, 19:Mult, 20:Conf, 21:Produttore, 22:Pagina, 23:BarCode, 24:ItmsGrp, 25-29:Dims, 30:Modifica, 31:Note
            
            const producer = cols[21];
            const barcode = cols[23];
            const note = cols[31];

            const category = categories[catCode] || "Altro";
            
            // Format Price
            let price = "€0.00";
            if (rawPrice) {
                const p = parseFloat(rawPrice.replace(',', '.'));
                if (!isNaN(p)) price = `€${p.toFixed(2).replace('.', ',')}`;
            }

            const image = imageFile ? `/images/${imageFile}` : '/images/placeholder.jpg';
            const desc = note || name;
            
            const specs = JSON.stringify([
                `Produttore: ${producer}`,
                `EAN: ${barcode}`
            ]);

            const stock = stockMap[id] || 0;

            stmt.run(id, name, category, price, image, desc, specs, stock);
            count++;
        });

        rl.on('close', () => {
            stmt.finalize();
            db.run("COMMIT", () => {
                console.log(`Importazione completata. Inseriti ${count - 1} prodotti.`);
                db.close();
            });
        });
    });
};

importData();
