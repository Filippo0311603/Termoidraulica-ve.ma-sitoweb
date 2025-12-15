require('dotenv').config();
const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let dbType = 'sqlite';
let pgPool = null;
let sqliteDb = null;

// Se c'è DATABASE_URL, usiamo PostgreSQL (Render/Neon)
if (process.env.DATABASE_URL) {
    dbType = 'postgres';
    pgPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log('Connesso a PostgreSQL.');
} else {
    // Altrimenti usiamo SQLite locale
    const DB_PATH = path.join(__dirname, 'vema.db');
    sqliteDb = new sqlite3.Database(DB_PATH, (err) => {
        if (err) console.error('Errore connessione SQLite:', err.message);
        else console.log('Connesso a SQLite.');
    });
}

// Helper per convertire ? in $1, $2 (per Postgres)
const convertSql = (sql) => {
    if (dbType !== 'postgres') return sql;
    let i = 1;
    return sql.replace(/\?/g, () => `$${i++}`);
};

// Esegue una query che ritorna più righe (SELECT *)
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (dbType === 'postgres') {
            pgPool.query(convertSql(sql), params, (err, res) => {
                if (err) reject(err);
                else resolve(res.rows);
            });
        } else {
            sqliteDb.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        }
    });
};

// Esegue una query che ritorna una sola riga (SELECT ... LIMIT 1)
const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (dbType === 'postgres') {
            pgPool.query(convertSql(sql), params, (err, res) => {
                if (err) reject(err);
                else resolve(res.rows[0]);
            });
        } else {
            sqliteDb.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        }
    });
};

// Esegue un comando (INSERT, UPDATE, DELETE)
const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        if (dbType === 'postgres') {
            pgPool.query(convertSql(sql), params, (err, res) => {
                if (err) reject(err);
                else resolve({ rowCount: res.rowCount });
            });
        } else {
            sqliteDb.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        }
    });
};

// Inizializzazione Tabelle
const initDb = async () => {
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT,
            createdAt TEXT,
            vatNumber TEXT,
            sdiCode TEXT,
            pec TEXT,
            fiscalCode TEXT,
            address TEXT,
            city TEXT,
            zip TEXT,
            userType TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            userId TEXT,
            items TEXT,
            total REAL,
            status TEXT,
            createdAt TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            price TEXT,
            image TEXT,
            description TEXT,
            specs TEXT,
            stock INTEGER
        )`
    ];

    for (const sql of tables) {
        await run(sql);
    }
    
    // Schema Migration (Add new columns to existing tables)
    const newColumns = ['vatNumber', 'sdiCode', 'pec', 'fiscalCode', 'address', 'city', 'zip', 'userType'];
    for (const col of newColumns) {
        try {
            await run(`ALTER TABLE users ADD COLUMN ${col} TEXT`);
        } catch (e) {
            // Column likely exists
        }
    }

    // Migrazioni
    await migrateUsers();
    await migrateProducts();
};

const migrateUsers = async () => {
    const USERS_FILE = path.join(__dirname, 'users.json');
    if (fs.existsSync(USERS_FILE)) {
        const count = await get("SELECT count(*) as count FROM users");
        // Postgres ritorna count come stringa a volte, castiamo
        const rowCount = count ? parseInt(count.count) : 0;
        
        if (rowCount === 0) {
            console.log("Migrazione utenti...");
            try {
                const users = JSON.parse(fs.readFileSync(USERS_FILE));
                for (const user of users) {
                    await run(
                        "INSERT INTO users (id, firstName, lastName, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [user.id, user.firstName, user.lastName, user.email, user.password, user.role, user.createdAt]
                    );
                }
                console.log("Migrazione utenti completata.");
            } catch (e) {
                console.error("Errore migrazione utenti:", e);
            }
        }
    }
};

const migrateProducts = async () => {
    const PRODUCTS_FILE = path.join(__dirname, 'public', 'products.json');
    if (fs.existsSync(PRODUCTS_FILE)) {
        const count = await get("SELECT count(*) as count FROM products");
        const rowCount = count ? parseInt(count.count) : 0;

        // Se abbiamo pochi prodotti (es. versione lite), ricarichiamo tutto
        if (rowCount <= 20) {
            console.log("Migrazione prodotti (Full)...");
            try {
                // Puliamo la tabella se stiamo facendo un upgrade dalla versione lite
                if (rowCount > 0) {
                    await run("DELETE FROM products");
                }

                const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE));
                // Batch insert o loop. Per sicurezza usiamo loop ma attenzione alle performance
                // Se sono 14k prodotti, potrebbe volerci un po'.
                // Ottimizzazione: usiamo una transazione se possibile, ma qui siamo su connessioni diverse (pg vs sqlite)
                // Per ora lasciamo il loop, Render ha un timeout di boot ma speriamo basti.
                
                let inserted = 0;
                for (const p of products) {
                    const specsStr = JSON.stringify(p.specs || []);
                    await run(
                        "INSERT INTO products (id, name, category, price, image, description, specs, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [p.id, p.name, p.category, p.price, p.image, p.desc || '', specsStr, p.stock || 0]
                    );
                    inserted++;
                    if (inserted % 1000 === 0) console.log(`Inseriti ${inserted} prodotti...`);
                }
                console.log("Migrazione prodotti completata.");
            } catch (e) {
                console.error("Errore migrazione prodotti:", e);
            }
        }
    }
};

// Avvia init dopo un breve delay per assicurare la connessione
setTimeout(initDb, 1000);

module.exports = { query, get, run };
