const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: true
    }
};

let pool;

async function connectDB() {
    try {
        pool = await mysql.createPool(dbConfig);
        console.log('Connected to TiDB successfully');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

connectDB();

// ── AUTH ROUTES ──────────────────────────────────────────────────────────────

// Register Student
app.post('/api/auth/register', async (req, res) => {
    const { full_name, phone_number, district, province, password } = req.body;
    try {
        const [existing] = await pool.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, phone_number, district, province, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, phone_number, district, province, hashedPassword, 'student']
        );

        res.status(201).json({ message: 'Registration successful', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login (Both Student & Admin)
app.post('/api/auth/login', async (req, res) => {
    const { phone_number, password } = req.body;
    try {
        // Find user by phone number or username (for admin)
        const [users] = await pool.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.full_name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.full_name,
                role: user.role,
                phone: user.phone_number,
                district: user.district,
                province: user.province
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── COURSE ROUTES ────────────────────────────────────────────────────────────

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const [courses] = await pool.execute('SELECT * FROM courses ORDER BY created_at DESC');
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get course content (videos/pdfs)
app.get('/api/courses/:id/content', async (req, res) => {
    try {
        const [content] = await pool.execute('SELECT * FROM course_content WHERE course_id = ?', [req.params.id]);
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN ROUTES (Simple middleware could be added here) ─────────────────────

// Get all students
app.get('/api/admin/students', async (req, res) => {
    try {
        const [students] = await pool.execute('SELECT id, full_name, phone_number, district, province, role, created_at FROM users WHERE role = "student"');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new course
app.post('/api/admin/courses', async (req, res) => {
    const { title, description, thumbnail_url, price } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO courses (title, description, thumbnail_url, price) VALUES (?, ?, ?, ?)',
            [title, description, thumbnail_url, price]
        );
        res.status(201).json({ id: result.insertId, message: 'Course created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
