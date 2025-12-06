const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

const JWT_SECRET = 'your_strong_secret_key';

app.use(express.json());
app.use(cors());

// ตั้งค่าให้ Server รู้จักไฟล์ HTML/CSS/JS/Images ในโฟลเดอร์ frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Page Routes (เส้นทางหน้าเว็บ) ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/homepage.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/veterinary', (req, res) => res.sendFile(path.join(__dirname, '../frontend/veterinary.html')));
app.get('/transport', (req, res) => res.sendFile(path.join(__dirname, '../frontend/chaperone.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../frontend/profile.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../frontend/about.html')));

// --- หน้า Detail ---
app.get('/veterinary/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/veterinary.html')); 
});
app.get('/transport/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chaperone.html'));
});

// --- Database Connection ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Soda48681.', // *แนะนำให้ใช้ Environment Variable ใน Production*
  database: 'pet_service',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- API: Auth ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) return res.status(400).json({ error: 'All fields required.' });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = { name, password: password_hash, email, role: 'user' };
    await pool.query("INSERT INTO User SET ?", newUser);
    res.status(200).json({ message: 'Registered Successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists.' });
    res.status(500).json({ message: "Error", detail: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [result] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
    if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.user_id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login Success', token, userId: user.user_id });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, name, email, role FROM User');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  const idToUpdate = parseInt(req.params.id, 10);
  const newInfo = req.body;
  delete newInfo.role; delete newInfo.password; delete newInfo.user_id;

  try {
    const [results] = await pool.query("UPDATE User SET ? WHERE user_id = ?", [newInfo, idToUpdate]);
    if (results.affectedRows === 0) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json({ message: "Updated Successfully" });
  } catch (err) { res.status(500).json({ message: "Update failed" }); }
});

// --- API: Services (Veterinary & Transport) ---

// 1. Get Veterinary List (Pagination Enabled)
app.get('/api/veterinary', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; 
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM services WHERE type = 'veterinary' LIMIT ? OFFSET ?", 
            [limit, offset]
        );
        const [countResult] = await pool.query(
            "SELECT COUNT(*) as count FROM services WHERE type = 'veterinary'"
        );
        
        res.json({
            data: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(countResult[0].count / limit),
                totalItems: countResult[0].count
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Get Single Veterinary/Service Detail
app.get('/api/veterinary/:id', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

// 3. Get Chaperone (Transport) List (Pagination Enabled)
// [UPDATED] แก้ไขให้รองรับ Pagination เหมือน Veterinary
app.get('/api/chaperone', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; 
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM services WHERE type = 'chaperone' LIMIT ? OFFSET ?", 
            [limit, offset]
        );
        const [countResult] = await pool.query(
            "SELECT COUNT(*) as count FROM services WHERE type = 'chaperone'"
        );

        res.json({
            data: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(countResult[0].count / limit),
                totalItems: countResult[0].count
            }
        });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: 'Database error' }); 
    }
});

app.listen(port, () => {
  console.log("Server running at http://localhost:" + port);
});