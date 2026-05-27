const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: (process.env.DB_USERNAME || '').replace(/['"]/g, ''),
    password: (process.env.DB_PASSWORD || '').replace(/['"]/g, ''),
    database: (process.env.DB_DATABASE || '').replace(/['"]/g, ''),
    ssl: {
        // Change to false if you are having SSL certificate issues
        rejectUnauthorized: false 
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function connectDB() {
    try {
        pool = await mysql.createPool(dbConfig);
        // Test connection
        const [rows] = await pool.execute('SELECT 1');
        console.log('Connected to TiDB successfully. Connection test passed.');

        // Initialize database tables
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                phone_number VARCHAR(50) UNIQUE NOT NULL,
                district VARCHAR(100),
                province VARCHAR(100),
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                thumbnail_url VARCHAR(255),
                price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.execute(`DROP TABLE IF EXISTS course_content`);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS course_content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                content_type VARCHAR(50),
                title VARCHAR(255) NOT NULL,
                content_url VARCHAR(255),
                is_watched TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS video_recordings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                video_url VARCHAR(255),
                embed_code TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS course_notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        await pool.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                message VARCHAR(255) NOT NULL,
                type VARCHAR(50) DEFAULT 'info',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                expiry_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY unique_enrollment (user_id, course_id)
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        await seedAdmin();
    } catch (err) {
        console.error('Database connection or initialization failed:', err.message);
        console.log('Please check your .env credentials and TiDB status.');
    }
}

async function createNotification(message, type = 'info') {
    try {
        if (pool) {
            await pool.execute('INSERT INTO notifications (message, type) VALUES (?, ?)', [message, type]);
        }
    } catch (err) {
        console.error('Failed to create notification:', err);
    }
}

// Seed default admin if not exists
async function seedAdmin() {
    try {
        const adminPhone = '0777777777';
        const [existing] = await pool.execute('SELECT * FROM users WHERE phone_number = ?', [adminPhone]);
        if (existing.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.execute(
                'INSERT INTO users (full_name, phone_number, district, province, password, role) VALUES (?, ?, ?, ?, ?, ?)',
                ['Super Admin', adminPhone, 'Colombo', 'Western', hashedPassword, 'admin']
            );
            console.log('Default Admin user seeded successfully. Phone: 0777777777, Password: admin123');
        } else {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.execute(
                'UPDATE users SET role = "admin", password = ? WHERE phone_number = ?',
                [hashedPassword, adminPhone]
            );
            console.log('Admin user updated/reset successfully. Phone: 0777777777, Password: admin123');
        }
    } catch (err) {
        console.error('Database connection or initialization failed:', err.message);
        console.log('Please check your .env credentials and TiDB status.');
    }
}

connectDB();

// ── AUTH ROUTES ──────────────────────────────────────────────────────────────

// Register Student
app.post('/api/auth/register', async (req, res) => {
    const { full_name, phone_number, district, province, password: plainPassword } = req.body;
    
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }

    try {
        const [existing] = await pool.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, phone_number, district, province, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, phone_number, district, province, hashedPassword, 'student']
        );

        res.status(201).json({ 
            message: 'Registration successful', 
            userId: result.insertId,
            generatedPassword: plainPassword // Return the plain password for display
        });
        await createNotification(`New student ${full_name} enrolled`, 'enroll');
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Database Error: ' + err.message });
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
        let isMatch = await bcrypt.compare(password, user.password);
        
        // Fallback for plain text password comparison in database
        if (!isMatch && password === user.password) {
            isMatch = true;
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
                console.log(`Auto-hashed plain text password for user ID: ${user.id}`);
            } catch (hashErr) {
                console.error('Error auto-hashing password:', hashErr);
            }
        }
        
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
        const [courses] = await pool.execute(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.expiry_date >= CURDATE()) as students
            FROM courses c 
            ORDER BY c.created_at DESC
        `);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get enrolled courses for a student
app.get('/api/student/:userId/courses', async (req, res) => {
    try {
        const [courses] = await pool.execute(`
            SELECT c.*, e.expiry_date
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.user_id = ? AND e.expiry_date >= CURDATE()
            ORDER BY e.created_at DESC
        `, [req.params.userId]);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get course content (Notes/PDFs & Links)
app.get('/api/courses/:id/content', async (req, res) => {
    try {
        const [content] = await pool.execute('SELECT * FROM course_content WHERE course_id = ?', [req.params.id]);
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add course content (Notes/PDFs & Links)
app.post('/api/courses/:id/content', async (req, res) => {
    const { content_type, title, content_url } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO course_content (course_id, content_type, title, content_url) VALUES (?, ?, ?, ?)',
            [req.params.id, content_type, title, content_url]
        );
        res.status(201).json({ id: result.insertId, message: 'Content added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete course content
app.delete('/api/courses/content/:contentId', async (req, res) => {
    try {
        await pool.execute('DELETE FROM course_content WHERE id = ?', [req.params.contentId]);
        res.json({ message: 'Content deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get course video recordings
app.get('/api/courses/:id/recordings', async (req, res) => {
    try {
        const [recordings] = await pool.execute('SELECT * FROM video_recordings WHERE course_id = ?', [req.params.id]);
        res.json(recordings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add course video recording
app.post('/api/courses/:id/recordings', async (req, res) => {
    const { title, video_url, embed_code } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO video_recordings (course_id, title, video_url, embed_code) VALUES (?, ?, ?, ?)',
            [req.params.id, title, video_url, embed_code || '']
        );
        res.status(201).json({ id: result.insertId, message: 'Video recording added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete course video recording
app.delete('/api/courses/recordings/:recordingId', async (req, res) => {
    try {
        await pool.execute('DELETE FROM video_recordings WHERE id = ?', [req.params.recordingId]);
        res.json({ message: 'Video recording deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get course notices/notifications
app.get('/api/courses/:id/notifications', async (req, res) => {
    try {
        const [notifications] = await pool.execute('SELECT * FROM course_notifications WHERE course_id = ? ORDER BY created_at DESC', [req.params.id]);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add course notice/notification
app.post('/api/courses/:id/notifications', async (req, res) => {
    const { title, message, created_by } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO course_notifications (course_id, title, message, created_by) VALUES (?, ?, ?, ?)',
            [req.params.id, title, message, created_by || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Notice added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete course notice/notification
app.delete('/api/courses/notifications/:notificationId', async (req, res) => {
    try {
        await pool.execute('DELETE FROM course_notifications WHERE id = ?', [req.params.notificationId]);
        res.json({ message: 'Notice deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific course details
app.get('/api/courses/:id', async (req, res) => {
    try {
        const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [req.params.id]);
        if (courses.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(courses[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all admins (for ChatWidget)
app.get('/api/admins', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        const [admins] = await pool.execute('SELECT id, full_name, phone_number, role FROM users WHERE role = "admin"');
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── ADMIN ROUTES (Simple middleware could be added here) ─────────────────────

// Get all users (students and admins)
app.get('/api/admin/students', async (req, res) => {
    try {
        const [users] = await pool.execute(`
            SELECT u.id, u.full_name, u.phone_number, u.district, u.province, u.role, u.created_at,
                   IF(u.role = 'admin', 'Active',
                      IF((SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) = 0, 'Active',
                         IF((SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.expiry_date >= CURDATE()) > 0, 'Active', 'Expired')
                      )
                   ) as status
            FROM users u 
            ORDER BY u.created_at DESC
        `);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new user (Student or Admin)
app.post('/api/admin/users', async (req, res) => {
    const { full_name, phone_number, district, province, password, role } = req.body;
    try {
        const [existing] = await pool.execute('SELECT * FROM users WHERE phone_number = ?', [phone_number]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        const [result] = await pool.execute(
            'INSERT INTO users (full_name, phone_number, district, province, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [full_name, phone_number, district || 'Colombo', province || 'Western', hashedPassword, role || 'student']
        );

        res.status(201).json({
            id: result.insertId,
            full_name,
            phone_number,
            district: district || 'Colombo',
            province: province || 'Western',
            role: role || 'student',
            created_at: new Date().toISOString()
        });
        await createNotification(`New user ${full_name} (${role || 'student'}) created`, role === 'admin' ? 'info' : 'enroll');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
        await createNotification(`User ID ${req.params.id} was deleted`, 'warning');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset user password
app.post('/api/admin/users/:id/reset-password', async (req, res) => {
    const { password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
        res.json({ message: 'Password reset successfully' });
        await createNotification(`Password reset request processed for User ID ${req.params.id}`, 'warning');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function saveBase64Image(base64String) {
    if (base64String && base64String.startsWith('data:image/')) {
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const ext = matches[1].split('/')[1] || 'png';
            const data = Buffer.from(matches[2], 'base64');
            const filename = `thumbnail_${Date.now()}_${Math.round(Math.random() * 1E9)}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, data);
            return `http://localhost:5000/uploads/${filename}`;
        }
    }
    return base64String;
}

// Add new course
app.post('/api/admin/courses', async (req, res) => {
    const { title, description, thumbnail_url, price } = req.body;
    try {
        const savedUrl = saveBase64Image(thumbnail_url);
        const [result] = await pool.execute(
            'INSERT INTO courses (title, description, thumbnail_url, price) VALUES (?, ?, ?, ?)',
            [title, description, savedUrl || '', price || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Course created', thumbnail_url: savedUrl });
        await createNotification(`Course '${title}' created successfully`, 'course');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update course
app.put('/api/admin/courses/:id', async (req, res) => {
    const { title, description, thumbnail_url, price } = req.body;
    try {
        const savedUrl = saveBase64Image(thumbnail_url);
        await pool.execute(
            'UPDATE courses SET title = ?, description = ?, thumbnail_url = ?, price = ? WHERE id = ?',
            [title, description, savedUrl || '', price || 0, req.params.id]
        );
        res.json({ message: 'Course updated successfully', thumbnail_url: savedUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete course
app.delete('/api/admin/courses/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM courses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enroll student in course
app.post('/api/admin/enrollments', async (req, res) => {
    const { student_id, course_id, expiry_date } = req.body;
    if (!student_id || !course_id || !expiry_date) {
        return res.status(400).json({ error: 'Please create a course first and select a course and expiry date.' });
    }
    try {
        await pool.execute(
            'INSERT INTO enrollments (user_id, course_id, expiry_date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE expiry_date = ?',
            [student_id, course_id, expiry_date, expiry_date]
        );
        
        // Fetch student name and course title for notification
        const [[student]] = await pool.execute('SELECT full_name FROM users WHERE id = ?', [student_id]);
        const [[course]] = await pool.execute('SELECT title FROM courses WHERE id = ?', [course_id]);
        
        await createNotification(`Enrolled ${student?.full_name || 'student'} in '${course?.title || 'course'}'`, 'enroll');
        
        res.status(201).json({ message: 'Student enrolled successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get notifications
app.get('/api/admin/notifications', async (req, res) => {
    try {
        const [notifications] = await pool.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Clear all notifications
app.post('/api/admin/notifications/clear', async (req, res) => {
    try {
        await pool.execute('DELETE FROM notifications');
        res.json({ message: 'Notifications cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get message history between current user and another user
app.get('/api/admin/messages/:other_user_id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUserId = decoded.id;
        const otherUserId = req.params.other_user_id;
        
        const [messages] = await pool.execute(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = ?) 
             ORDER BY created_at ASC`,
            [currentUserId, otherUserId, otherUserId, currentUserId]
        );
        
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const userSockets = new Map();

io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id;
            userSockets.set(userId, socket.id);
            
            socket.on('private_message', async (data) => {
                const { to, message } = data;
                try {
                    await pool.execute(
                        'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
                        [userId, to, message]
                    );
                    
                    const msgPayload = {
                        sender_id: userId,
                        receiver_id: to,
                        message,
                        created_at: new Date().toISOString()
                    };
                    
                    const receiverSocketId = userSockets.get(to);
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('private_message', msgPayload);
                    }
                    
                    socket.emit('private_message', msgPayload);
                    
                    const [[receiver]] = await pool.execute('SELECT role, full_name FROM users WHERE id = ?', [to]);
                    if (receiver && receiver.role === 'admin') {
                        const [[sender]] = await pool.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
                        const senderName = sender ? sender.full_name : 'Student';
                        await createNotification(`New message from ${senderName}: "${message.substring(0, 30)}..."`, 'info');
                    }
                } catch (err) {
                    console.error('Error handling private message:', err);
                }
            });
            
            socket.on('disconnect', () => {
                userSockets.delete(userId);
            });
        } catch (err) {
            console.error('Socket authentication error:', err.message);
        }
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
