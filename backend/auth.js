const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;

const JWT_SECRET = 'your_strong_secret_key';

app.use(express.json());
app.use(cors());

// --- 1. DATABASE CONNECTION ---
// ‼️ ตรวจสอบให้แน่ใจว่าชื่อ database ตรงกับที่คุณสร้าง
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Soda48681.', // 
  database: 'pet_service', // 🟢 CHANGED: (คงไว้ตามเดิม) แต่ต้องแน่ใจว่าตรงกับ DB ที่รัน SQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// --- 2. AUTH ROUTES (Register / Login) ---

// REGISTER: POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  // 🟢 CHANGED: เปลี่ยนจาก username เป็น name
  const { name, email, password } = req.body;

  // 🟢 CHANGED: อัปเดตการตรวจสอบ
  if (!name || !password || !email) {
    return res.status(400).json({ error: 'Name, password, and email are required.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      // 🟢 CHANGED: `username` กลายเป็น `name`
      name: name,
      password: password_hash,
      email: email,
      role: 'user'
    };

    // 🟢 CHANGED: `user` -> `User`
    const [result] = await pool.query("INSERT INTO User SET ?", newUser);
    res.status(200).json({ message: 'Registered Successfully' });
  } catch (err) {
    console.error('Error during registration:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      // 🟢 CHANGED: (เนื่องจาก email คือ UNIQUE ใน SQL ของคุณ)
      return res.status(409).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ message: "Something went wrong", detail: err.message });
  }
});

// LOGIN: POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  // 🟢 CHANGED: ใช้ email ในการ login
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 🟢 CHANGED: ค้นหาด้วย email และจากตาราง `User`
    const [result] = await pool.query("SELECT * FROM User WHERE email = ?", [email]);

    if (result.length === 0) {
      // 🟢 CHANGED: อัปเดตข้อความ
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // 🟢 CHANGED: อัปเดตข้อความ
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 🟢 CHANGED: เปลี่ยน payload จาก `user.username` เป็น `user.name`
    const token = jwt.sign(
      { id: user.user_id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({ message: 'Login Successfully', token: token, userId: user.user_id });

  } catch (err) {
    res.status(500).json({ error: 'Login failed' + err.message });
  }
});


// --- 3. USER ROUTES (ไม่มีการป้องกัน) ---

// GET ALL USERS: GET /api/users (เปิดสาธารณะ)
app.get('/api/users', async (req, res) => {
  try {
    // 🟢 CHANGED: `username` -> `name` และ `user` -> `User`
    const [rows, fields] = await pool.query('SELECT user_id, name, email, role FROM User');
    res.json(rows);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error fetching users: " + error.message });
  }
});

// UPDATE USER: PUT /api/users/:id (เปิดสาธารณะ)
app.put('/api/users/:id', async (req, res) => {
  const idToUpdate = parseInt(req.params.id, 10);
  const newInfo = req.body;

  // ส่วนนี้ดีอยู่แล้ว โค้ดจะป้องกันการอัปเดต role, password, user_id
  delete newInfo.role;
  delete newInfo.password;
  delete newInfo.user_id;
  // ‼️ ถ้า frontend ส่ง `username` มา, มันจะพยายามอัปเดตคอลัมน์ `username`
  // ต้องแน่ใจว่า frontend ส่ง `name` หรือ `email` มาแทน
  // เช่น: { "name": "Alice Smith New" }

  try {
    // 🟢 CHANGED: `user` -> `User`
    const [results] = await pool.query("UPDATE User SET ? WHERE user_id = ?", [newInfo, idToUpdate]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User Id " + idToUpdate + " is Not Found" });
    }
    res.status(200).json({ message: "Updated Successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Something went wrong" });
  }
});


// --- 4. SERVER LISTENING ---
app.listen(port, (error) => {
  if (!error) {
    console.log("Server is Successfully Running, and App is listening on port " + port);
  } else {
    console.log("Error occurred, server can't start", error);
  }
});