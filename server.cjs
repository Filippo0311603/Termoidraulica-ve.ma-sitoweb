require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Importiamo i metodi dal nuovo modulo database
const { get: dbGet, query: dbAll, run: dbRun } = require('./database.cjs');
const path = require('path');

const app = express();
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
    const { firstName, lastName, email, password } = req.body;

    try {
        const existingUser = await dbGet("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser) {
            return res.status(400).json({ message: 'Email già registrata' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Admin check
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
            createdAt: new Date().toISOString()
        };

        await dbRun(
            "INSERT INTO users (id, firstName, lastName, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [newUser.id, newUser.firstName, newUser.lastName, newUser.email, newUser.password, newUser.role, newUser.createdAt]
        );

        const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ 
            token, 
            user: { 
                id: newUser.id, 
                firstName: newUser.firstName, 
                lastName: newUser.lastName, 
                email: newUser.email, 
                role: newUser.role 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore server" });
    }
});

// LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await dbGet("SELECT * FROM users WHERE email = ?", [email]);

        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
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
                role: user.role 
            } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore server" });
    }
});

// SAVE ORDER
app.post('/api/orders', async (req, res) => {
    const { userId, items, total, status } = req.body;
    try {
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        const itemsJson = JSON.stringify(items);

        await dbRun(
            "INSERT INTO orders (id, userId, items, total, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            [id, userId, itemsJson, total, status || 'pending', createdAt]
        );

        res.json({ success: true, orderId: id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore salvataggio ordine" });
    }
});

// GET ORDERS (Admin only)
app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const orders = await dbAll(`
            SELECT orders.*, users.firstName, users.lastName, users.email 
            FROM orders 
            LEFT JOIN users ON orders.userId = users.id
            ORDER BY createdAt DESC
        `);
        
        // Parse items JSON
        const parsedOrders = orders.map(o => ({
            ...o,
            items: JSON.parse(o.items)
        }));

        res.json(parsedOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore recupero ordini" });
    }
});

// --- PRODUCTS API ---

// GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
    try {
        const products = await dbAll("SELECT * FROM products");
        const parsedProducts = products.map(p => ({
            ...p,
            specs: JSON.parse(p.specs || '[]')
        }));
        res.json(parsedProducts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore recupero prodotti" });
    }
});

// ADD PRODUCT
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    const { id, name, category, price, image, desc, specs, stock } = req.body;
    try {
        const specsStr = JSON.stringify(specs || []);
        await dbRun(
            "INSERT INTO products (id, name, category, price, image, desc, specs, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [id, name, category, price, image, desc, specsStr, stock]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore aggiunta prodotto" });
    }
});

// UPDATE PRODUCT
app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, category, price, image, desc, specs, stock } = req.body;
    try {
        const specsStr = JSON.stringify(specs || []);
        await dbRun(
            "UPDATE products SET name=?, category=?, price=?, image=?, desc=?, specs=?, stock=? WHERE id=?",
            [name, category, price, image, desc, specsStr, stock, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore aggiornamento prodotto" });
    }
});

// DELETE PRODUCT
app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await dbRun("DELETE FROM products WHERE id=?", [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Errore eliminazione prodotto" });
    }
});

// STRIPE
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));
