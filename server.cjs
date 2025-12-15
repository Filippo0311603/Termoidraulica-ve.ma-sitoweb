require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
// Inizializza Stripe solo se la chiave è presente, altrimenti usa un oggetto vuoto per evitare crash
const stripe = process.env.STRIPE_SECRET_KEY 
    ? require('stripe')(process.env.STRIPE_SECRET_KEY) 
    : null;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Importiamo i metodi dal nuovo modulo database
const { get: dbGet, query: dbAll, run: dbRun } = require('./database.cjs');
const path = require('path');

const app = express();
// Trust proxy is required when running behind a load balancer (like Render, Heroku, Nginx)
// to correctly identify the client IP address for rate limiting.
app.set('trust proxy', 1); 

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-this';

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disabilita CSP per evitare conflitti con script esterni (Stripe, GA4)
}));
app.use(cors()); 

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Middleware di Autenticazione
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // Se non c'è token, non autorizzato

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Se il token non è valido, proibito
        req.user = user;
        next();
    });
};

// Middleware per Admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Accesso negato: Richiesti privilegi di amministratore." });
    }
};

// --- ROUTES ---

// REGISTER
app.post('/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, vatNumber, sdiCode, pec, fiscalCode, address, city, zip, userType } = req.body;
        console.log("Register Request:", { email, userType, vatNumber });

        // Validazione Dati Fiscali
        if (vatNumber) {
            if (!/^\d{11}$/.test(vatNumber)) {
                return res.status(400).json({ message: 'Partita IVA non valida (richieste 11 cifre)' });
            }
            if (!sdiCode || sdiCode.length !== 7) {
                return res.status(400).json({ message: 'Codice SDI non valido (richiesti 7 caratteri)' });
            }
            if (!pec || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pec)) {
                return res.status(400).json({ message: 'Indirizzo PEC non valido' });
            }
            if (!address || !city || !zip) {
                return res.status(400).json({ message: 'Indirizzo completo obbligatorio per fatturazione' });
            }
        }

        if (fiscalCode && fiscalCode.length !== 16) {
            return res.status(400).json({ message: 'Codice Fiscale non valido (richiesti 16 caratteri)' });
        }

        const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email già registrata' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const role = email === 'admin@vema.it' ? 'admin' : 'user';
        if (role === 'admin') {
            const existingAdmin = await dbGet("SELECT * FROM users WHERE role = 'admin'");
            if (existingAdmin) {
                return res.status(400).json({ message: 'L\'amministratore esiste già.' });
            }
        }

        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString(),
            vatNumber: vatNumber || '',
            sdiCode: sdiCode || '',
            pec: pec || '',
            fiscalCode: fiscalCode || '',
            address,
            city,
            zip,
            userType: userType || (vatNumber ? 'company' : 'private')
        };

        await dbRun(
            "INSERT INTO users (id, firstName, lastName, email, password, role, createdAt, vatNumber, sdiCode, pec, fiscalCode, address, city, zip, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [newUser.id, newUser.firstName, newUser.lastName, newUser.email, newUser.password, newUser.role, newUser.createdAt, newUser.vatNumber, newUser.sdiCode, newUser.pec, newUser.fiscalCode, newUser.address, newUser.city, newUser.zip, newUser.userType]
        );

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            user: { 
                id: newUser.id, 
                firstName: newUser.firstName, 
                lastName: newUser.lastName, 
                email: newUser.email, 
                role: newUser.role,
                vatNumber: newUser.vatNumber,
                sdiCode: newUser.sdiCode,
                pec: newUser.pec,
                fiscalCode: newUser.fiscalCode,
                address: newUser.address,
                city: newUser.city,
                zip: newUser.zip,
                userType: newUser.userType
            }
        });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: "Errore server: " + err.message });
    }
});

// LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    try {
        const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                role: user.role,
                vatNumber: user.vatNumber,
                sdiCode: user.sdiCode,
                pec: user.pec,
                fiscalCode: user.fiscalCode,
                address: user.address,
                city: user.city,
                zip: user.zip,
                userType: user.userType
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore server" });
    }
});

// UPDATE USER
app.put('/auth/me', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, vatNumber, sdiCode, pec, fiscalCode, address, city, zip, password } = req.body;
        const userId = req.user.id;
        console.log(`Updating user ${userId}. Password provided: ${!!password}`);

        // Validazione base (simile a register)
        if (vatNumber && !/^\d{11}$/.test(vatNumber)) {
            return res.status(400).json({ message: 'Partita IVA non valida' });
        }
        
        // Costruiamo la query dinamica
        let sql = "UPDATE users SET firstName = ?, lastName = ?, address = ?, city = ?, zip = ?";
        let params = [firstName, lastName, address, city, zip];

        // Aggiungiamo campi opzionali se presenti o se l'utente è azienda
        sql += ", vatNumber = ?, sdiCode = ?, pec = ?, fiscalCode = ?";
        params.push(vatNumber || '', sdiCode || '', pec || '', fiscalCode || '');

        // Gestione Password
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            sql += ", password = ?";
            params.push(hashedPassword);
            console.log("Password updated in DB");
        }

        sql += " WHERE id = ?";
        params.push(userId);

        await dbRun(sql, params);

        // Recuperiamo l'utente aggiornato per restituirlo
        const updatedUser = await dbGet("SELECT * FROM users WHERE id = ?", [userId]);
        
        // Rimuoviamo la password prima di inviare
        delete updatedUser.password;

        res.json({ user: updatedUser });

    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: "Errore durante l'aggiornamento del profilo" });
    }
});

// DELETE USER
app.delete('/auth/me', authenticateToken, async (req, res) => {
    try {
        await dbRun("DELETE FROM users WHERE id = ?", [req.user.id]);
        res.json({ message: "Utente eliminato con successo" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore durante l'eliminazione dell'account" });
    }
});

// STRIPE
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, receipt_email } = req.body;

  if (!stripe) {
      console.error("Stripe key missing");
      return res.status(500).json({ error: { message: "Pagamenti non configurati (Manca API Key)" } });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email, // Invia ricevuta Stripe
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    res.status(400).send({ error: { message: e.message } });
  }
});

// EMAIL SENDER
const sendOrderEmail = async (orderData) => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("SMTP non configurato. Email non inviata.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false, // true per 465, false per altre porte
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const itemsList = orderData.items.map(item => 
        `<li>${item.quantity}x ${item.product.name} - €${item.product.price}</li>`
    ).join('');

    // --- 1. EMAIL CLIENTE ---
    let shippingNote = "";
    if (orderData.deliveryMethod === 'shipping') {
        shippingNote = `
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>🚚 Spedizione in corso</h3>
                <p>Il tuo ordine verrà preparato e spedito a breve.</p>
                <p><strong>Non appena il pacco sarà affidato al corriere, ti invieremo una email con il link per tracciare la spedizione.</strong></p>
            </div>
        `;
    } else {
        shippingNote = `
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3>🏪 Ritiro in Sede</h3>
                <p>Il tuo ordine è pronto per essere ritirato presso il nostro punto vendita.</p>
                <p><strong>Indirizzo:</strong> Via delle Magnolie 21, 00055 Ladispoli (RM)</p>
                <p>Ti aspettiamo!</p>
            </div>
        `;
    }

    const customerMailOptions = {
        from: `"Termoidraulica VE.MA" <${process.env.SMTP_USER}>`,
        to: orderData.email,
        subject: `Conferma Ordine #${orderData.id} - VE.MA`,
        html: `
            <h1>Grazie per il tuo ordine, ${orderData.firstName}!</h1>
            <p>Abbiamo ricevuto il tuo ordine e lo stiamo elaborando.</p>
            ${shippingNote}
            <h3>Riepilogo Ordine #${orderData.id}</h3>
            <ul>${itemsList}</ul>
            <p><strong>Totale: € ${(orderData.total / 100).toFixed(2)}</strong></p>
            <br>
            <h3>Dati Fatturazione/Spedizione:</h3>
            <p>${orderData.firstName} ${orderData.lastName}</p>
            <p>${orderData.address}</p>
            <p>${orderData.city}, ${orderData.zip}</p>
            <p>Tel: ${orderData.phone || 'N/A'}</p>
            <br>
            <p>Se hai domande, rispondi a questa email.</p>
            <p>Cordiali saluti,<br>Il team VE.MA</p>
        `,
    };

    // --- 2. EMAIL AMMINISTRATORE (Tu) ---
    const adminMailOptions = {
        from: `"VE.MA Shop Bot" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Invia a te stesso (o un'altra email admin se preferisci)
        subject: `🔔 NUOVO ORDINE #${orderData.id} (${orderData.deliveryMethod === 'shipping' ? 'SPEDIZIONE' : 'RITIRO'})`,
        html: `
            <h2>Nuovo Ordine Ricevuto!</h2>
            <p><strong>ID Ordine:</strong> ${orderData.id}</p>
            <p><strong>Cliente:</strong> ${orderData.firstName} ${orderData.lastName}</p>
            <p><strong>Email:</strong> ${orderData.email}</p>
            <p><strong>Telefono:</strong> ${orderData.phone || 'N/A'}</p>
            <p><strong>Metodo Consegna:</strong> ${orderData.deliveryMethod === 'shipping' ? 'SPEDIZIONE 🚚' : 'RITIRO IN SEDE 🏪'}</p>
            
            <hr>
            <h3>Indirizzo Cliente (per Packlink/Fattura):</h3>
            <p><strong>Nome:</strong> ${orderData.firstName} ${orderData.lastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${orderData.email}">${orderData.email}</a></p>
            <p><strong>Indirizzo:</strong> ${orderData.address}</p>
            <p><strong>Città:</strong> ${orderData.city}</p>
            <p><strong>CAP:</strong> ${orderData.zip}</p>
            <p><strong>Provincia:</strong> ${orderData.province || ''}</p>
            
            <hr>
            <h3>Prodotti:</h3>
            <ul>${itemsList}</ul>
            <p><strong>Totale Incassato: € ${(orderData.total / 100).toFixed(2)}</strong></p>
        `,
    };

    try {
        // Invia al cliente
        await transporter.sendMail(customerMailOptions);
        console.log("Email cliente inviata a " + orderData.email);

        // Invia all'admin
        await transporter.sendMail(adminMailOptions);
        console.log("Email admin inviata a " + process.env.SMTP_USER);

    } catch (error) {
        console.error("Errore invio email:", error);
    }
};

// SAVE ORDER & SEND EMAIL
app.post('/api/orders', async (req, res) => {
    const { userId, items, total, status, customerDetails, deliveryMethod } = req.body;
    try {
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const itemsJson = JSON.stringify(items);

        // Salva nel DB (Nota: userId può essere null per guest)
        await dbRun(
            "INSERT INTO orders (id, userId, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            [id, userId || 'guest', itemsJson, total, status || 'paid', createdAt]
        );

        // Invia Email
        if (customerDetails && customerDetails.email) {
            await sendOrderEmail({
                id,
                items,
                total, // in cents
                deliveryMethod, // Passiamo il metodo
                ...customerDetails
            });
        }

        res.json({ success: true, orderId: id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore salvataggio ordine" });
    }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// NOTA: In Express 5, '*' non è più valido come wildcard. Usiamo '(.*)' o una Regex.
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));
