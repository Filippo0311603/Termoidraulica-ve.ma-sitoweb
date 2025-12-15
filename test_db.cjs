const { run, get } = require('./database.cjs');

async function test() {
    console.log("Waiting for DB init...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for initDb

    console.log("Testing User Insert...");
    const id = Date.now().toString();
    try {
        await run(
            "INSERT INTO users (id, firstName, lastName, email, password, role, createdAt, vatNumber, sdiCode, pec, fiscalCode, address, city, zip, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [id, "Test", "User", "test@example.com", "pass", "user", new Date().toISOString(), "", "", "", "CF123", "Via Roma", "Milano", "20100", "private"]
        );
        console.log("Insert successful!");
        
        const user = await get("SELECT * FROM users WHERE email = ?", ["test@example.com"]);
        console.log("Retrieved user:", user);
    } catch (e) {
        console.error("Insert failed:", e);
    }
}

test();
