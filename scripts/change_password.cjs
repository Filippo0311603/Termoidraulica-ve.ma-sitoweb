const bcrypt = require('bcryptjs');
const { run } = require('../database.cjs');

async function changePassword() {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log("Utilizzo: node scripts/change_password.cjs <email> <nuova_password>");
        process.exit(1);
    }

    const email = args[0];
    const newPassword = args[1];

    console.log(`Aggiornamento password per utente: ${email}...`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    try {
        const result = await run(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email]
        );
        
        // Check if using sqlite (changes property) or postgres (rowCount)
        const changes = result.changes !== undefined ? result.changes : result.rowCount;

        if (changes > 0) {
            console.log("✅ Password aggiornata con successo!");
        } else {
            console.log("❌ Utente non trovato.");
        }
    } catch (e) {
        console.error("❌ Errore durante l'aggiornamento:", e);
    }
}

changePassword();