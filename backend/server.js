const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path'); // [เพิ่ม] เรียกใช้ path เพื่อระบุตำแหน่งไฟล์

const app = express();
const port = 3000;

const JWT_SECRET = 'your_strong_secret_key';

app.use(express.json());
app.use(cors());

// --- [เพิ่ม] ตั้งค่าให้ Server รู้จักไฟล์ HTML/CSS ในโฟลเดอร์ frontend ---
app.use(express.static(path.join(__dirname, '../frontend')));

// --- [เพิ่ม] สร้างเส้นทาง (Routes) เพื่อเชื่อมไปยังหน้าต่างๆ ---

// 1. หน้าหลัก (Homepage)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/homepage.html'));
});

// 2. หน้าเข้าสู่ระบบ (Login)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// 3. หน้าสมัครสมาชิก (Register)
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// 4. หน้าค้นหาโรงพยาบาลสัตว์ (Veterinary)
app.get('/veterinary', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/veterinary.html'));
});

// 5. หน้าบริการขนส่ง (Transport) - เชื่อมกับไฟล์ chaperone.html
app.get('/transport', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chaperone.html'));
});

// 6. หน้าโปรไฟล์ (Profile)
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/about.html'));
});


// --- DATABASE CONNECTION (โค้ดเดิมของคุณ) ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Soda48681.', 
  database: 'pet_service', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- AUTH ROUTES (โค้ดเดิมของคุณ) ---
// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) {
    return res.status(400).json({ error: 'Name, password, and email are required.' });
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = { name, password: password_hash, email, role: 'user' };
    await pool.query("INSERT INTO User SET ?", newUser);
    res.status(200).json({ message: 'Registered Successfully' });
  } catch (err) {
    console.error('Error during registration:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ message: "Something went wrong", detail: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const [result] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);
    if (result.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.user_id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login Successfully', token: token, userId: user.user_id });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' + err.message });
  }
});

// Get Users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, name, email, password, role FROM User');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users: " + error.message });
  }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
  const idToUpdate = parseInt(req.params.id, 10);
  const newInfo = req.body;
  delete newInfo.role; delete newInfo.password; delete newInfo.user_id;

  try {
    const [results] = await pool.query("UPDATE User SET ? WHERE user_id = ?", [newInfo, idToUpdate]);
    if (results.affectedRows === 0) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json({ message: "Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(port, (error) => {
  if (!error) console.log("Server running at http://localhost:" + port);
  else console.log("Error server can't start", error);
});