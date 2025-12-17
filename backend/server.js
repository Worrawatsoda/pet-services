const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

const JWT_SECRET = 'your_strong_secret_key'; 

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Database Connection ---
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Soda48681.', 
  database: 'petcare_connect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// --- Middleware: Verify Token ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// 1. Page Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/homepage.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/register.html')));
app.get('/veterinary', (req, res) => res.sendFile(path.join(__dirname, '../frontend/veterinary.html')));
app.get('/transport', (req, res) => res.sendFile(path.join(__dirname, '../frontend/chaperone.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, '../frontend/profile.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../frontend/about.html')));
app.get('/veterinary/:id', (req, res) => res.sendFile(path.join(__dirname, '../frontend/vet-detail.html')));
app.get('/transport/:id', (req, res) => res.sendFile(path.join(__dirname, '../frontend/chap-detail.html')));

// 2. Auth APIs
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) return res.status(400).json({ error: 'All fields required.' });
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    const newUser = { id, name, password_hash, email, user_type: 'pet-owner' };
    await pool.query("INSERT INTO users SET ?", newUser);
    res.status(200).json({ message: 'Registered Successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists.' });
    res.status(500).json({ message: "Error", detail: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [result] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, name: user.name, role: user.user_type }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login Success', token, userId: user.id, userName: user.name });
  } catch (err) { res.status(500).json({ error: 'Login failed' }); }
});

// 3. Veterinary APIs (Real Rating Filter)
app.get('/api/veterinary', async (req, res) => {
    const { services, emergency, walkin, rating, search } = req.query;
    
    let sql = `
        SELECT v.*, 
        GROUP_CONCAT(DISTINCT vs.service_name) AS services_list,
        (SELECT COUNT(*) FROM reviews WHERE veterinary_clinic_id = v.id) AS real_review_count,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE veterinary_clinic_id = v.id) AS real_rating
        FROM veterinary_clinics v 
        LEFT JOIN veterinary_services vs ON v.id = vs.clinic_id 
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        sql += " AND v.name LIKE ?";
        params.push(`%${search}%`);
    }

    if (emergency === 'true') sql += " AND v.emergency_24_7 = 1";
    if (walkin === 'true') sql += " AND v.accepts_walk_ins = 1";
    
    // Group ก่อน
    sql += " GROUP BY v.id";
    
    // *** ใช้ HAVING ในการกรอง Services และ Real Rating ***
    let havingConditions = [];

    if (services) {
        const sList = services.split(',');
        // Logic: มีบริการอย่างน้อย 1 อย่างที่เลือก
        havingConditions.push(`(${sList.map(() => "services_list LIKE ?").join(' AND ')})`);
        sList.forEach(s => params.push(`%${s}%`));
    }

    if (rating) {
        // กรองจากค่า real_rating ที่คำนวณมาสดๆ
        havingConditions.push("real_rating >= ?");
        params.push(rating);
    }

    if (havingConditions.length > 0) {
        sql += " HAVING " + havingConditions.join(' AND ');
    }
    
    try { const [rows] = await pool.query(sql, params); res.json({ data: rows, total: rows.length }); } 
    catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.get('/api/veterinary/:id', async (req, res) => {
    try {
        const sql = `
            SELECT v.*, 
            (SELECT GROUP_CONCAT(service_name) FROM veterinary_services WHERE clinic_id = v.id) AS services_list,
            (SELECT COUNT(*) FROM reviews WHERE veterinary_clinic_id = v.id) AS real_review_count,
            (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE veterinary_clinic_id = v.id) AS real_rating
            FROM veterinary_clinics v 
            WHERE v.id = ?
        `;
        const [rows] = await pool.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const vet = rows[0];
        vet.review_count = vet.real_review_count || 0;
        vet.rating = vet.real_rating ? parseFloat(vet.real_rating).toFixed(1) : "0.0";

        const [hours] = await pool.query('SELECT day_of_week, open_time FROM veterinary_hours WHERE clinic_id = ?', [vet.id]);
        vet.hours = hours;
        res.json(vet);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

// 4. Chaperone APIs (Real Rating Filter)
app.get('/api/chaperone', async (req, res) => {
    const { services, vehicle, pets, rating, search } = req.query;
    
    let sql = `
        SELECT c.*, 
        GROUP_CONCAT(DISTINCT cs.service_name) AS services_list, 
        GROUP_CONCAT(DISTINCT cv.vehicle_type) AS vehicles_list, 
        GROUP_CONCAT(DISTINCT cp.pet_type) AS pet_types_list,
        (SELECT COUNT(*) FROM reviews WHERE pet_chaperone_id = c.id) AS real_review_count,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE pet_chaperone_id = c.id) AS real_rating
        FROM pet_chaperones c 
        LEFT JOIN chaperone_services cs ON c.id = cs.chaperone_id 
        LEFT JOIN chaperone_vehicle_types cv ON c.id = cv.chaperone_id 
        LEFT JOIN chaperone_pet_types cp ON c.id = cp.chaperone_id 
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        sql += " AND c.name LIKE ?";
        params.push(`%${search}%`);
    }

    sql += " GROUP BY c.id";
    
    let havingConditions = [];

    if (services) {
        const sList = services.split(',');
        havingConditions.push(`(${sList.map(() => "services_list LIKE ?").join(' AND ')})`);
        sList.forEach(s => params.push(`%${s}%`));
    }
    if (vehicle) {
        const vList = vehicle.split(',');
        havingConditions.push(`(${vList.map(() => "vehicles_list LIKE ?").join(' AND ')})`);
        vList.forEach(v => params.push(`%${v}%`));
    }
    if (pets) {
        const pList = pets.split(',');
        havingConditions.push(`(${pList.map(() => "pet_types_list LIKE ?").join(' AND ')})`);
        pList.forEach(p => params.push(`%${p}%`));
    }

    if (rating) {
        // กรองจากค่า real_rating ที่คำนวณมาสดๆ
        havingConditions.push("real_rating >= ?");
        params.push(rating);
    }

    if (havingConditions.length > 0) {
        sql += " HAVING " + havingConditions.join(' AND ');
    }
    
    try { const [rows] = await pool.query(sql, params); res.json({ data: rows, total: rows.length }); } 
    catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.get('/api/chaperone/:id', async (req, res) => {
    try {
         const sql = `
            SELECT c.*, 
            (SELECT GROUP_CONCAT(service_name) FROM chaperone_services WHERE chaperone_id = c.id) AS services_list,
            (SELECT GROUP_CONCAT(vehicle_type) FROM chaperone_vehicle_types WHERE chaperone_id = c.id) AS vehicles_list,
            (SELECT GROUP_CONCAT(pet_type) FROM chaperone_pet_types WHERE chaperone_id = c.id) AS pet_types_list,
            (SELECT COUNT(*) FROM reviews WHERE pet_chaperone_id = c.id) AS real_review_count,
            (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE pet_chaperone_id = c.id) AS real_rating
            FROM pet_chaperones c
            WHERE c.id = ?
        `;
        const [rows] = await pool.query(sql, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        const chap = rows[0];
        chap.review_count = chap.real_review_count || 0;
        chap.rating = chap.real_rating ? parseFloat(chap.real_rating).toFixed(1) : "0.0";

        res.json(chap);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

// 5. Review APIs
app.get('/api/reviews', async (req, res) => {
    const { type, id } = req.query;
    if (!type || !id) return res.status(400).json({ error: 'Missing parameters' });
    try {
        let sql = "";
        if (type === 'veterinary') sql = `SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.veterinary_clinic_id = ? ORDER BY r.date DESC`;
        else if (type === 'chaperone') sql = `SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.pet_chaperone_id = ? ORDER BY r.date DESC`;
        const [rows] = await pool.query(sql, [id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    const { rating, title, comment, targetId, targetType } = req.body;
    const userId = req.user.id;
    if (!rating || !targetId || !targetType) return res.status(400).json({ error: 'Missing required fields' });
    try {
        const reviewId = crypto.randomUUID();
        const date = new Date().toISOString().slice(0, 10);
        const params = [reviewId, userId, rating, title, comment, date, targetId];
        let sql = "";
        if (targetType === 'veterinary') sql = "INSERT INTO reviews (id, user_id, rating, title, comment, date, veterinary_clinic_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        else if (targetType === 'chaperone') sql = "INSERT INTO reviews (id, user_id, rating, title, comment, date, pet_chaperone_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
        else return res.status(400).json({ error: 'Invalid type' });
        
        await pool.query(sql, params);
        res.status(201).json({ message: 'Review submitted' });
    } catch (err) { res.status(500).json({ error: 'Submit failed' }); }
});

app.get('/api/users/:id/reviews', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    try {
        const sql = `SELECT r.*, v.name AS vet_name, c.name AS chap_name, v.id AS vet_id, c.id AS chap_id FROM reviews r LEFT JOIN veterinary_clinics v ON r.veterinary_clinic_id = v.id LEFT JOIN pet_chaperones c ON r.pet_chaperone_id = c.id WHERE r.user_id = ? ORDER BY r.date DESC`;
        const [rows] = await pool.query(sql, [req.params.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

// 6. Favorite APIs
app.post('/api/favorites/toggle', authenticateToken, async (req, res) => {
    const { type, targetId } = req.body;
    const userId = req.user.id;
    let table, idCol;
    if (type === 'veterinary') { table = 'user_favorite_clinics'; idCol = 'clinic_id'; }
    else if (type === 'chaperone') { table = 'user_favorite_chaperones'; idCol = 'chaperone_id'; }
    else return res.status(400).json({ error: 'Invalid type' });

    try {
        const [rows] = await pool.query(`SELECT * FROM ${table} WHERE user_id = ? AND ${idCol} = ?`, [userId, targetId]);
        if (rows.length > 0) {
            await pool.query(`DELETE FROM ${table} WHERE user_id = ? AND ${idCol} = ?`, [userId, targetId]);
            res.json({ isFavorite: false });
        } else {
            await pool.query(`INSERT INTO ${table} (user_id, ${idCol}) VALUES (?, ?)`, [userId, targetId]);
            res.json({ isFavorite: true });
        }
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.get('/api/favorites/check', authenticateToken, async (req, res) => {
    const { type, targetId } = req.query;
    const userId = req.user.id;
    let table, idCol;
    if (type === 'veterinary') { table = 'user_favorite_clinics'; idCol = 'clinic_id'; }
    else if (type === 'chaperone') { table = 'user_favorite_chaperones'; idCol = 'chaperone_id'; }
    else return res.status(400).json({ error: 'Invalid type' });

    try {
        const [rows] = await pool.query(`SELECT 1 FROM ${table} WHERE user_id = ? AND ${idCol} = ?`, [userId, targetId]);
        res.json({ isFavorite: rows.length > 0 });
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.get('/api/users/:id/favorites', authenticateToken, async (req, res) => {
    if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
    try {
        const [vets] = await pool.query(`SELECT v.id, v.name, v.address, v.image_url, v.rating FROM veterinary_clinics v JOIN user_favorite_clinics f ON v.id = f.clinic_id WHERE f.user_id = ?`, [req.params.id]);
        const [chaps] = await pool.query(`SELECT c.id, c.name, c.business_name, c.address, c.image_url, c.rating FROM pet_chaperones c JOIN user_favorite_chaperones f ON c.id = f.chaperone_id WHERE f.user_id = ?`, [req.params.id]);
        res.json({ veterinary: vets, chaperone: chaps });
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

// 7. API: User Settings
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, user_type FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Database error' }); }
});

app.put('/api/users/me', authenticateToken, async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.id;
    if (!name || !email) return res.status(400).json({ error: 'Required fields missing' });

    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
        if (existing.length > 0) return res.status(409).json({ error: 'Email taken' });

        let sql = 'UPDATE users SET name = ?, email = ?';
        let params = [name, email];
        if (password && password.trim() !== "") {
            const hash = await bcrypt.hash(password, 10);
            sql += ', password_hash = ?';
            params.push(hash);
        }
        sql += ' WHERE id = ?';
        params.push(userId);

        await pool.query(sql, params);
        res.json({ message: 'Updated', name, email });
    } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));