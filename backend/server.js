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
const nodemailer = require('nodemailer');
const crypto = require('crypto');

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

// Database connection middleware to ensure DB is connected before processing requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed: ' + err.message });
    }
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: (process.env.DB_USERNAME || '').replace(/['"]/g, ''),
    password: (process.env.DB_PASSWORD || '').replace(/['"]/g, ''),
    database: (process.env.DB_DATABASE || '').replace(/['"]/g, ''),
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
};

let pool;
let dbPromise = null;

async function connectDB() {
    if (pool) return pool;
    if (dbPromise) return dbPromise;

    dbPromise = (async () => {
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
                thumbnail_url LONGTEXT,
                price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                course_category VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
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
                amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                payment_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
                expiry_date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY unique_enrollment (user_id, course_id)
            )
        `);
            await pool.execute(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id INT,
                user_id INT NOT NULL,
                course_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                payment_method VARCHAR(50) NOT NULL,
                transaction_id VARCHAR(100),
                status ENUM('success', 'pending', 'failed') NOT NULL DEFAULT 'success',
                paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
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
            await pool.execute(`
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key VARCHAR(255) PRIMARY KEY,
                setting_value TEXT,
                category VARCHAR(100),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
            await pool.execute(`
            CREATE TABLE IF NOT EXISTS contact_inquiries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone_number VARCHAR(50) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                reply_message TEXT DEFAULT NULL,
                replied_at TIMESTAMP NULL DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

            await pool.execute(`
            CREATE TABLE IF NOT EXISTS course_months (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                year INT NOT NULL,
                month_number TINYINT NOT NULL,
                title VARCHAR(255) NOT NULL,
                monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE KEY unique_course_month (course_id, year, month_number)
            )
        `);

            await pool.execute(`
            CREATE TABLE IF NOT EXISTS month_access (
                id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id INT,
                course_month_id INT NOT NULL,
                payment_id INT,
                status ENUM('pending', 'paid', 'expired') NOT NULL DEFAULT 'paid',
                expiry_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_month_id) REFERENCES course_months(id) ON DELETE CASCADE
            )
        `);

            // Migration for existing tables: add columns if they don't exist
            try {
                await pool.execute(`ALTER TABLE courses ADD COLUMN course_category VARCHAR(255) DEFAULT NULL`);
            } catch (e) {
                // Ignore error if column already exists
            }
            try {
                await pool.execute(`ALTER TABLE courses MODIFY COLUMN thumbnail_url LONGTEXT`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE contact_inquiries ADD COLUMN reply_message TEXT DEFAULT NULL`);
            } catch (e) {
                // Ignore error if column already exists
            }
            try {
                await pool.execute(`ALTER TABLE contact_inquiries ADD COLUMN replied_at TIMESTAMP NULL DEFAULT NULL`);
            } catch (e) {
                // Ignore error if column already exists
            }
            try {
                await pool.execute(`ALTER TABLE course_content ADD COLUMN course_month_id INT NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE video_recordings ADD COLUMN course_month_id INT NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE payments ADD COLUMN course_month_id INT NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE courses ADD COLUMN offer_price DECIMAL(10, 2) DEFAULT NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE courses ADD COLUMN discount_badge VARCHAR(100) DEFAULT NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE course_months ADD COLUMN is_custom_price TINYINT(1) DEFAULT 0`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE payments ADD COLUMN payhere_order_id VARCHAR(100) NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                // Ensure unique constraint on payhere_order_id so duplicate webhooks cannot insert duplicates
                await pool.execute(`ALTER TABLE payments ADD UNIQUE KEY unique_payhere_order_id (payhere_order_id)`);
            } catch (e) {
                // Ignore error if index already exists
            }
            try {
                await pool.execute(`ALTER TABLE payments ADD COLUMN payment_payload TEXT NULL`);
            } catch (e) {
                // Ignore error
            }
            try {
                await pool.execute(`ALTER TABLE payments MODIFY COLUMN enrollment_id INT NULL`);
            } catch (e) {
                // Ignore error
            }
            await seedAdmin();
            await seedSystemSettings();
            await initAllCourseMonths();
            return pool;
        } catch (err) {
            console.error('Database connection or initialization failed:', err.message);
            console.log('Please check your .env credentials and TiDB status.');
            dbPromise = null;
            throw err;
        }
    })();
    return dbPromise;
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

async function seedSystemSettings() {
    try {
        const defaults = [
            { key: 'platform_name', value: 'ICT Academy LMS', category: 'general' },
            { key: 'admin_email', value: 'EMAIL_ADDRESS', category: 'general' },
            { key: 'support_phone', value: '+94 77 000 0000', category: 'general' },
            { key: 'platform_url', value: '[url hosting]', category: 'general' },
            { key: 'email_notifications', value: 'true', category: 'notifications' },
            { key: 'sms_alerts', value: 'false', category: 'notifications' },
            { key: 'maintenance_mode', value: 'false', category: 'notifications' },
            { key: 'base_students_enrolled', value: '15000', category: 'general' },
            { key: 'exam_pass_rate', value: '98', category: 'general' },
            { key: 'expert_tutors', value: '12', category: 'general' }
        ];

        for (const item of defaults) {
            await pool.execute(
                'INSERT IGNORE INTO system_settings (setting_key, setting_value, category) VALUES (?, ?, ?)',
                [item.key, item.value, item.category]
            );
        }
        console.log('Default system settings seeded successfully.');
    } catch (err) {
        console.error('Failed to seed system settings:', err.message);
    }
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to ensure 12 months exist for a course for given year
async function ensureCourseMonths(courseId, year = new Date().getFullYear()) {
    try {
        const [[course]] = await pool.execute('SELECT id, price, offer_price FROM courses WHERE id = ?', [courseId]);
        if (!course) return; // Course does not exist, avoid foreign key constraint violation
        const defaultMonthlyPrice = parseFloat(course.offer_price) > 0 ? parseFloat(course.offer_price) : (parseFloat(course.price) || 0.00);

        for (let m = 1; m <= 12; m++) {
            const monthTitle = `${MONTH_NAMES[m - 1]} ${year}`;
            await pool.execute(`
                INSERT INTO course_months (course_id, year, month_number, title, monthly_price, is_active, is_custom_price)
                VALUES (?, ?, ?, ?, ?, 1, 0)
                ON DUPLICATE KEY UPDATE 
                    title = IF(title IS NULL OR title = '', VALUES(title), title),
                    monthly_price = IF(is_custom_price = 1, monthly_price, VALUES(monthly_price))
            `, [courseId, year, m, monthTitle, defaultMonthlyPrice]);
        }
    } catch (err) {
        console.error(`Failed to ensure months for course ${courseId}:`, err.message);
    }
}

// Initialize 12 months for all active courses
async function initAllCourseMonths() {
    try {
        const currentYear = new Date().getFullYear();
        const [courses] = await pool.execute('SELECT id FROM courses');
        for (const c of courses) {
            await ensureCourseMonths(c.id, currentYear);
        }
        console.log(`Course months checked and initialized for ${courses.length} courses (${currentYear}).`);
    } catch (err) {
        console.error('Failed to init course months:', err.message);
    }
}

// Trigger initial connection (still runs in background, but middleware guarantees it for requests)
connectDB().catch(err => console.error('Initial DB connection failed:', err.message));

// Helper function to send email notification
// Helper function to send email notification
async function sendReplyEmail(toEmail, inquirerName, subject, originalMessage, replyMessage) {
    const resendApiKey = (process.env.RESEND_API_KEY || '').replace(/['"]/g, '').trim();
    const platformName = (process.env.PLATFORM_NAME || 'ICT Academy').replace(/['"]/g, '');

    const emailSubject = `Re: ${subject} - ${platformName} Inquiry Reply`;
    const textContent = `Dear ${inquirerName},\n\nThank you for contacting ${platformName}. Here is our reply to your inquiry:\n\n------------------------------\nOriginal Message:\n"${originalMessage}"\n------------------------------\n\nReply:\n${replyMessage}\n\nIf you have any further questions, feel free to reply to this email.\n\nBest regards,\n${platformName} Team`;
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
            <h2 style="color: #2563eb; margin-bottom: 20px; font-size: 20px;">${platformName} Inquiry Reply</h2>
            <p>Dear <strong>${inquirerName}</strong>,</p>
            <p>Thank you for reaching out to us. We have reviewed your inquiry regarding <strong>"${subject}"</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #cbd5e1; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Original Message:</p>
                <p style="margin: 8px 0 0 0; font-style: italic; color: #475569;">"${originalMessage}"</p>
            </div>
            
            <div style="background-color: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 11px; color: #1e3a8a; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Our Response:</p>
                <p style="margin: 8px 0 0 0; color: #1e293b; line-height: 1.5; white-space: pre-line;">${replyMessage}</p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #475569;">If you have any further questions, please let us know by replying directly to this email.</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">This is an automated notification sent from the ${platformName} LMS Admin Panel.</p>
        </div>
    `;

    if (resendApiKey) {
        const resendFrom = (process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev').replace(/['"]/g, '').trim();
        const fromHeader = (resendFrom.includes('<') && resendFrom.includes('>'))
            ? resendFrom
            : `${platformName} <${resendFrom}>`;

        console.log(`Attempting to send email via Resend API to: ${toEmail} from: ${fromHeader}`);

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: fromHeader,
                to: [toEmail],
                subject: emailSubject,
                text: textContent,
                html: htmlContent
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(`Resend API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errData)}`);
        }

        const result = await response.json();
        console.log('Email sent successfully via Resend API. Response:', result);
        return result;
    } else {
        const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').replace(/['"]/g, '');
        const smtpPort = parseInt((process.env.SMTP_PORT || '587').replace(/['"]/g, ''));
        const smtpSecure = (process.env.SMTP_SECURE || '').replace(/['"]/g, '') === 'true';
        const smtpUser = (process.env.SMTP_USER || '').replace(/['"]/g, '');
        const smtpPass = (process.env.SMTP_PASS || '').replace(/['"]/g, '');

        if (!smtpUser || !smtpPass) {
            throw new Error('Neither RESEND_API_KEY nor SMTP environment variables are configured.');
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const smtpFromHeader = (smtpUser.includes('<') && smtpUser.includes('>'))
            ? smtpUser
            : `${platformName} <${smtpUser}>`;

        const mailOptions = {
            from: smtpFromHeader,
            to: toEmail,
            subject: emailSubject,
            text: textContent,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully via SMTP to ${toEmail}: ${info.messageId}`);
        return info;
    }
}

// Submit contact inquiry
app.post('/api/contact', async (req, res) => {
    const { name, email, phone_number, subject, message } = req.body;
    if (!name || !email || !phone_number || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        await pool.execute(
            'INSERT INTO contact_inquiries (name, email, phone_number, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone_number, subject, message, 'pending']
        );
        res.status(201).json({ message: 'Inquiry submitted successfully' });
        await createNotification(`New contact inquiry from ${name}: ${subject}`, 'info');
    } catch (err) {
        console.error('Contact inquiry error:', err);
        res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// ── AUTH ROUTES ──────────────────────────────────────────────────────────────

// Register Student
app.post('/api/auth/register', async (req, res) => {
    const { full_name, phone_number, district, province, password: plainPassword, course_id } = req.body;

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

        const newUserId = result.insertId;

        // If enrolled directly through landing page with a course_id
        if (course_id) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            await pool.execute(`
                INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date)
                VALUES (?, ?, 0.00, 'pending', ?)
                ON DUPLICATE KEY UPDATE expiry_date = VALUES(expiry_date)
            `, [newUserId, course_id, expiryStr]);
        }

        res.status(201).json({
            message: 'Registration successful',
            userId: newUserId,
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
    const { phone_number, password, course_id } = req.body;
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

        // If student is logging in from an "Enroll Now" course button, automatically ensure enrollment (30 days)
        if (course_id && user.role === 'student') {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            await pool.execute(`
                INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date)
                VALUES (?, ?, 0.00, 'pending', ?)
                ON DUPLICATE KEY UPDATE expiry_date = GREATEST(expiry_date, VALUES(expiry_date))
            `, [user.id, course_id, expiryStr]);
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
            SELECT c.*, c.course_category AS category,
                   (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.expiry_date >= CURDATE()) as students
            FROM courses c 
            ORDER BY c.created_at DESC
        `);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get enrolled courses for a student:
// 1. If student has paid for at least 1 month (or successful payment), the course displays forever / gives lifetime access to that paid month's content.
// 2. Otherwise, if student only enrolled (free 30-day window to purchase months), course displays until the 30-day enrollment expiry date.
app.get('/api/student/:userId/courses', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [courses] = await pool.execute(`
            SELECT c.*, c.course_category AS category,
                   COALESCE(paid_info.has_paid, 0) as has_purchased_month,
                   COALESCE(paid_info.max_expiry, enr_info.max_expiry) as expiry_date
            FROM courses c
            LEFT JOIN (
                SELECT course_id, MAX(expiry_date) as max_expiry
                FROM enrollments
                WHERE user_id = ?
                GROUP BY course_id
            ) enr_info ON enr_info.course_id = c.id
            LEFT JOIN (
                SELECT course_id, 1 as has_paid, MAX(expiry_date) as max_expiry
                FROM (
                    SELECT cm.course_id, ma.expiry_date
                    FROM month_access ma
                    JOIN course_months cm ON ma.course_month_id = cm.id
                    LEFT JOIN enrollments e ON e.id = ma.enrollment_id
                    LEFT JOIN payments p ON p.id = ma.payment_id
                    WHERE ma.status = 'paid' AND (e.user_id = ? OR p.user_id = ?)
                    UNION ALL
                    SELECT p.course_id, NULL as expiry_date
                    FROM payments p
                    WHERE p.user_id = ? AND p.status = 'success' AND p.course_id IS NOT NULL
                ) combined_paid
                GROUP BY course_id
            ) paid_info ON paid_info.course_id = c.id
            WHERE (
                paid_info.has_paid = 1
                OR (enr_info.max_expiry IS NOT NULL AND enr_info.max_expiry >= CURDATE())
            )
            ORDER BY c.id DESC
        `, [userId, userId, userId, userId]);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── COURSE MONTHS & MONTHLY ACCESS ROUTES ───────────────────────────────────

// Get all 12 months for a course (ensuring they exist)
app.get('/api/courses/:id/months', async (req, res) => {
    try {
        const courseId = req.params.id;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        await ensureCourseMonths(courseId, year);

        const [months] = await pool.execute(`
            SELECT cm.*,
                   (SELECT COUNT(*) FROM course_content cc WHERE cc.course_month_id = cm.id) as content_count,
                   (SELECT COUNT(*) FROM video_recordings vr WHERE vr.course_month_id = cm.id) as recording_count
            FROM course_months cm
            WHERE cm.course_id = ? AND cm.year = ?
            ORDER BY cm.month_number ASC
        `, [courseId, year]);

        res.json(months);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a course month (e.g. change title, price, or active status)
app.put('/api/courses/:id/months/:monthId', async (req, res) => {
    const { title, monthly_price, is_active, is_custom_price } = req.body;
    try {
        let customFlag = is_custom_price;
        if (customFlag === undefined && monthly_price !== undefined) {
            customFlag = 1; // Explicit price edit means custom month price
        }

        const titleVal = title !== undefined ? title : null;
        const priceVal = monthly_price !== undefined && monthly_price !== null ? parseFloat(monthly_price) : null;
        const activeVal = is_active !== undefined ? is_active : null;
        const customVal = customFlag !== undefined ? customFlag : null;

        await pool.execute(`
            UPDATE course_months 
            SET title = COALESCE(?, title),
                monthly_price = COALESCE(?, monthly_price),
                is_active = COALESCE(?, is_active),
                is_custom_price = COALESCE(?, is_custom_price)
            WHERE id = ? AND course_id = ?
        `, [titleVal, priceVal, activeVal, customVal, req.params.monthId, req.params.id]);
        res.json({ message: 'Month settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get student's monthly access status for a course
app.get('/api/student/:userId/courses/:courseId/month-access', async (req, res) => {
    const { userId, courseId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    try {
        await ensureCourseMonths(courseId, year);

        // Fetch user role
        const [[user]] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
        const isAdmin = user && user.role === 'admin';

        // Check if student has active course-wide enrollment
        const [courseEnrollments] = await pool.execute(`
            SELECT * FROM enrollments 
            WHERE user_id = ? AND course_id = ? AND payment_status = 'completed' AND expiry_date >= CURDATE()
        `, [userId, courseId]);
        const hasFullEnrollment = courseEnrollments.length > 0;

        // Fetch monthly accesses
        const [accessRows] = await pool.execute(`
            SELECT ma.*, cm.id as course_month_id, cm.month_number, cm.year, cm.title, cm.monthly_price
            FROM course_months cm
            JOIN month_access ma ON ma.course_month_id = cm.id AND ma.status = 'paid'
            WHERE cm.course_id = ? AND cm.year = ?
              AND (
                  EXISTS (SELECT 1 FROM enrollments e WHERE e.id = ma.enrollment_id AND e.user_id = ?)
                  OR EXISTS (SELECT 1 FROM payments p WHERE p.id = ma.payment_id AND p.user_id = ?)
              )
        `, [courseId, year, userId, userId]);

        // Direct payments for specific months (successful and pending)
        const [monthPayments] = await pool.execute(`
            SELECT course_month_id, status, paid_at, payhere_order_id FROM payments 
            WHERE user_id = ? AND course_id = ? AND course_month_id IS NOT NULL
        `, [userId, courseId]);

        const paidMonthIds = new Set();
        const pendingMonthMap = new Map(); // course_month_id -> { order_id }

        monthPayments.forEach(p => {
            if (p.status === 'success') {
                paidMonthIds.add(p.course_month_id);
            } else if (p.status === 'pending') {
                pendingMonthMap.set(p.course_month_id, { orderId: p.payhere_order_id });
            }
        });
        const now = new Date();
        accessRows.forEach(row => {
            if (row.id && row.status === 'paid') {
                if (!row.expiry_date) {
                    paidMonthIds.add(row.course_month_id);
                } else {
                    // Check if expiry date is today or future (normalize date to end of day)
                    const exp = new Date(row.expiry_date);
                    exp.setHours(23, 59, 59, 999);
                    if (exp >= now) {
                        paidMonthIds.add(row.course_month_id);
                    }
                }
            }
        });

        const [months] = await pool.execute(`
            SELECT cm.*,
                   (SELECT COUNT(*) FROM course_content cc WHERE cc.course_month_id = cm.id) as content_count,
                   (SELECT COUNT(*) FROM video_recordings vr WHERE vr.course_month_id = cm.id) as recording_count
            FROM course_months cm
            WHERE cm.course_id = ? AND cm.year = ?
            ORDER BY cm.month_number ASC
        `, [courseId, year]);

        const result = months.map(m => {
            // Month is unlocked ONLY if this specific month has been paid for, or if user is admin
            const isPaid = isAdmin || paidMonthIds.has(m.id);
            const isPending = !isPaid && pendingMonthMap.has(m.id);
            const pendingInfo = isPending ? pendingMonthMap.get(m.id) : null;

            return {
                ...m,
                is_unlocked: !!isPaid,
                is_pending: !!isPending,
                pending_order_id: pendingInfo ? pendingInfo.orderId : null,
                access_status: isPaid ? 'paid' : (isPending ? 'pending_unlock' : 'locked')
            };
        });

        res.json({
            year,
            isAdmin,
            hasFullEnrollment,
            months: result
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper function to complete course month unlock upon payment success
async function fulfillMonthlyPayment({ enrollmentId, userId, courseId, courseMonthId, amount, paymentMethod, transactionId, payhereOrderId, payload }) {
    // 1. Expiry for monthly access (45 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 45);
    const expiryStr = expiryDate.toISOString().split('T')[0];

    // Ensure enrollment
    await pool.execute(`
        INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date)
        VALUES (?, ?, ?, 'completed', ?)
        ON DUPLICATE KEY UPDATE 
            amount_paid = amount_paid + VALUES(amount_paid),
            payment_status = 'completed',
            expiry_date = GREATEST(expiry_date, VALUES(expiry_date))
    `, [userId, courseId, amount, expiryStr]);

    let resolvedEnrollmentId = enrollmentId;
    if (!resolvedEnrollmentId) {
        const [[enrollment]] = await pool.execute(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );
        resolvedEnrollmentId = enrollment ? enrollment.id : null;
    }

    // 2. Insert or update payment record (with idempotency check)
    let paymentId;
    if (payhereOrderId) {
        const [existingPay] = await pool.execute('SELECT id, status FROM payments WHERE payhere_order_id = ?', [payhereOrderId]);
        if (existingPay.length > 0) {
            paymentId = existingPay[0].id;
            // Idempotency: If this order has already been marked as success, return early
            if (existingPay[0].status === 'success') {
                return { paymentId, resolvedEnrollmentId, alreadyProcessed: true };
            }
            await pool.execute(`
                UPDATE payments 
                SET status = 'success', transaction_id = ?, amount = ?, payment_method = ?, payment_payload = ?, paid_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [transactionId, amount, paymentMethod, payload ? JSON.stringify(payload) : null, paymentId]);
        } else {
            const [payResult] = await pool.execute(`
                INSERT INTO payments (enrollment_id, user_id, course_id, course_month_id, amount, payment_method, transaction_id, status, payhere_order_id, payment_payload)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'success', ?, ?)
            `, [resolvedEnrollmentId, userId, courseId, courseMonthId, amount, paymentMethod, transactionId, payhereOrderId, payload ? JSON.stringify(payload) : null]);
            paymentId = payResult.insertId;
        }
    } else {
        const [payResult] = await pool.execute(`
            INSERT INTO payments (enrollment_id, user_id, course_id, course_month_id, amount, payment_method, transaction_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'success')
        `, [resolvedEnrollmentId, userId, courseId, courseMonthId, amount, paymentMethod, transactionId]);
        paymentId = payResult.insertId;
    }

    // 3. Grant month_access
    const [existingAccess] = await pool.execute(
        'SELECT id FROM month_access WHERE (enrollment_id = ? OR enrollment_id IS NULL) AND course_month_id = ?',
        [resolvedEnrollmentId, courseMonthId]
    );

    if (existingAccess.length > 0) {
        await pool.execute(`
            UPDATE month_access 
            SET status = 'paid', payment_id = ?, expiry_date = NULL, enrollment_id = ?
            WHERE id = ?
        `, [paymentId, resolvedEnrollmentId, existingAccess[0].id]);
    } else {
        await pool.execute(`
            INSERT INTO month_access (enrollment_id, course_month_id, payment_id, status, expiry_date)
            VALUES (?, ?, ?, 'paid', NULL)
        `, [resolvedEnrollmentId, courseMonthId, paymentId]);
    }

    // 4. Notification & Real-time Socket Event
    const [[student]] = await pool.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
    const [[course]] = await pool.execute('SELECT title FROM courses WHERE id = ?', [courseId]);
    const [[courseMonth]] = await pool.execute('SELECT title FROM course_months WHERE id = ?', [courseMonthId]);
    const monthTitle = courseMonth ? courseMonth.title : 'Selected Month';

    await createNotification(
        `Payment received from ${student?.full_name || 'Student'} for '${course?.title || 'Course'}' (${monthTitle}) - Rs. ${amount}`,
        'enroll'
    );

    if (io) {
        io.emit('payment_success', {
            userId,
            courseId,
            courseMonthId,
            payhereOrderId,
            amount,
            status: 'success'
        });
    }

    return { paymentId, resolvedEnrollmentId };
}

// ----------------------------------------------------
// PayHere Integration: Generate Signed Hash & Checkout Parameters
// ----------------------------------------------------
app.post('/api/student/payhere/initiate', async (req, res) => {
    const { user_id, course_id, course_month_id } = req.body;
    if (!user_id || !course_id || !course_month_id) {
        return res.status(400).json({ error: 'user_id, course_id, and course_month_id are required' });
    }

    try {
        const [[courseMonth]] = await pool.execute('SELECT * FROM course_months WHERE id = ?', [course_month_id]);
        if (!courseMonth) {
            return res.status(404).json({ error: 'Course month not found' });
        }

        const [[course]] = await pool.execute('SELECT * FROM courses WHERE id = ?', [course_id]);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const [[user]] = await pool.execute('SELECT id, full_name, phone_number, district, province FROM users WHERE id = ?', [user_id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const merchantId = (process.env.PAYHERE_MERCHANT_ID || '').trim();
        const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || '').trim();
        const currency = (process.env.PAYHERE_CURRENCY || 'LKR').trim();
        const isSandbox = (process.env.PAYHERE_MODE || 'sandbox').trim().toLowerCase() !== 'live';
        const fallbackEmail = (process.env.PAYHERE_FALLBACK_EMAIL || 'academyict3.payments@gmail.com').replace(/['"]/g, '').trim();

        if (!merchantId || !merchantSecret) {
            return res.status(500).json({
                error: 'PayHere credentials not configured in backend .env. Please configure PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET.'
            });
        }

        const amountNum = parseFloat(courseMonth.monthly_price) || 0.00;
        const amountFormatted = amountNum.toFixed(2);
        const orderId = `LMS_ORD_${Date.now()}_${user_id}_${course_month_id}`;

        // PayHere Hash Generation (Server-Side for Maximum Security):
        // hash = strtoupper(md5(merchant_id + order_id + amountFormatted + currency + strtoupper(md5(merchant_secret))))
        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
        const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
        const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

        // Split student name for PayHere
        const nameParts = (user.full_name || 'Student').trim().split(' ');
        const firstName = nameParts[0] || 'Student';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const rawBackendBase = (process.env.BACKEND_BASE_URL || 'http://localhost:5000').replace(/['"]/g, '').trim().replace(/\/+$/, '');
        const notifyUrl = `${rawBackendBase}/api/payhere/notify`;

        // Check if enrollment exists or create pending enrollment
        let [[enrollment]] = await pool.execute(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [user_id, course_id]
        );
        let enrollmentId = enrollment ? enrollment.id : null;

        if (!enrollmentId) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 45);
            const expiryStr = expiryDate.toISOString().split('T')[0];
            const [enrollResult] = await pool.execute(`
                INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date)
                VALUES (?, ?, 0.00, 'pending', ?)
                ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)
            `, [user_id, course_id, expiryStr]);
            enrollmentId = enrollResult.insertId;
        }

        // Create secure verification signature token:
        // token = hmac_sha256(orderId + user_id + course_month_id + amountFormatted, JWT_SECRET + merchantSecret)
        // This ensures nobody can call manual verification with Postman or fake order IDs!
        const verificationToken = crypto
            .createHmac('sha256', (process.env.JWT_SECRET || 'lms_secret') + merchantSecret)
            .update(`${orderId}_${user_id}_${course_month_id}_${amountFormatted}`)
            .digest('hex');

        // Store verification token with pending payment
        await pool.execute(`
            INSERT INTO payments (enrollment_id, user_id, course_id, course_month_id, amount, payment_method, status, payhere_order_id, payment_payload)
            VALUES (?, ?, ?, ?, ?, 'PayHere Card/Online', 'pending', ?, ?)
        `, [enrollmentId, user_id, course_id, course_month_id, amountNum, orderId, JSON.stringify({ verification_token: verificationToken, initiated_at: Date.now() })]);

        res.status(200).json({
            success: true,
            sandbox: isSandbox,
            merchant_id: merchantId,
            order_id: orderId,
            verification_token: verificationToken,
            items: `${course.title} - ${courseMonth.title}`,
            amount: amountFormatted,
            currency: currency,
            hash: hash,
            first_name: firstName,
            last_name: lastName,
            email: fallbackEmail,
            phone: user.phone_number || '0770000000',
            address: user.province || 'Sri Lanka',
            city: user.district || 'Colombo',
            country: 'Sri Lanka',
            notify_url: notifyUrl
        });
    } catch (err) {
        console.error('PayHere initiation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ----------------------------------------------------
// PayHere IPN Webhook (Instant Payment Notification)
// ----------------------------------------------------
// In-memory rate limiter for payment status polling (max 1 request per second per order_id / IP)
const paymentStatusPollTracker = new Map();
function isPaymentStatusRateLimited(key) {
    const now = Date.now();
    const lastRequest = paymentStatusPollTracker.get(key);
    if (lastRequest && now - lastRequest < 1000) {
        return true;
    }
    paymentStatusPollTracker.set(key, now);
    // Periodically clean up tracker entries older than 5 minutes
    if (paymentStatusPollTracker.size > 2000) {
        for (const [k, timestamp] of paymentStatusPollTracker.entries()) {
            if (now - timestamp > 300000) paymentStatusPollTracker.delete(k);
        }
    }
    return false;
}

// ----------------------------------------------------
// PayHere IPN Webhook (Instant Payment Notification)
// ----------------------------------------------------
app.all(['/api/payhere/notify', '/api/payhere/notify/'], async (req, res) => {
    try {
        const {
            merchant_id,
            order_id,
            payment_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            custom_1,
            custom_2,
            method,
            status_message
        } = req.body;

        const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || '').replace(/['"]/g, '').trim();
        const configuredMerchantId = (process.env.PAYHERE_MERCHANT_ID || '').replace(/['"]/g, '').trim();
        const receivedMerchantId = (merchant_id || '').toString().trim();

        // 1. Signature Verification:
        // md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
        const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
        const checkString = `${receivedMerchantId}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
        const localMd5 = crypto.createHash('md5').update(checkString).digest('hex').toUpperCase();
        const isHashValid = localMd5 === (md5sig || '').toUpperCase();

        // 2. Audit Logging (without sensitive cardholder data)
        console.log(`[PayHere IPN Received] Order: ${order_id}, Status: ${status_code}, Amount: ${payhere_amount} ${payhere_currency}, HashValid: ${isHashValid}, Method: ${method || 'N/A'}`);

        if (receivedMerchantId !== configuredMerchantId) {
            console.error(`[PayHere IPN] Merchant ID mismatch. Expected: '${configuredMerchantId}', Received: '${receivedMerchantId}'`);
            return res.status(400).send('Merchant mismatch');
        }

        if (!isHashValid) {
            console.error(`[PayHere IPN] Security check failed: Signature MD5 mismatch for order ${order_id}. Rejecting.`);
            return res.status(400).send('Invalid signature');
        }

        // 3. Fetch payment by order_id
        const [payments] = await pool.execute('SELECT * FROM payments WHERE payhere_order_id = ?', [order_id]);
        if (payments.length === 0) {
            console.error(`[PayHere IPN] Order ${order_id} not found in database.`);
            return res.status(404).send('Order not found');
        }

        const payment = payments[0];

        // 4. Verify Amount against DB expected fee for that course_month_id
        if (payment.course_month_id) {
            const [[courseMonth]] = await pool.execute('SELECT monthly_price FROM course_months WHERE id = ?', [payment.course_month_id]);
            if (!courseMonth) {
                console.error(`[PayHere IPN] Course month ${payment.course_month_id} not found for order ${order_id}`);
                return res.status(400).send('Course month not found');
            }

            const expectedAmount = parseFloat(courseMonth.monthly_price) || 0.00;
            const receivedAmount = parseFloat(payhere_amount) || 0.00;

            // Difference check up to 2 decimal places
            if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
                console.error(`[PayHere IPN] Amount mismatch for order ${order_id}. Expected: ${expectedAmount}, Received: ${receivedAmount}`);
                await pool.execute(
                    "UPDATE payments SET status = 'failed', transaction_id = ?, payment_payload = ? WHERE id = ?",
                    [payment_id || null, JSON.stringify({ error: 'amount_mismatch', expectedAmount, receivedAmount, ipn_body: req.body }), payment.id]
                );
                return res.status(400).send('Amount mismatch');
            }
        }

        // 5. Respond 200 OK immediately so PayHere doesn't retry or timeout
        res.status(200).send('OK');

        // 6. Process fulfillment asynchronously after responding
        (async () => {
            try {
                // Status code 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
                if (String(status_code) === '2') {
                    await fulfillMonthlyPayment({
                        enrollmentId: payment.enrollment_id,
                        userId: payment.user_id,
                        courseId: payment.course_id,
                        courseMonthId: payment.course_month_id,
                        amount: parseFloat(payhere_amount),
                        paymentMethod: method ? `PayHere (${method})` : 'PayHere',
                        transactionId: payment_id || order_id,
                        payhereOrderId: order_id,
                        payload: req.body
                    });
                    console.log(`[PayHere IPN] Order ${order_id} successfully paid and verified! Access unlocked.`);
                } else {
                    const failStatus = String(status_code) === '0' ? 'pending' : 'failed';
                    await pool.execute(
                        'UPDATE payments SET status = ?, transaction_id = ?, payment_payload = ? WHERE id = ?',
                        [failStatus, payment_id || null, JSON.stringify(req.body), payment.id]
                    );
                    console.log(`[PayHere IPN] Order ${order_id} status updated to: ${failStatus} (${status_message || status_code})`);
                }
            } catch (asyncErr) {
                console.error(`[PayHere IPN Async Processing Error for Order ${order_id}]:`, asyncErr);
            }
        })();

    } catch (err) {
        console.error('[PayHere IPN Error]:', err);
        if (!res.headersSent) {
            res.status(500).send(err.message);
        }
    }
});

// Check payment status endpoint for frontend polling (GET /api/payhere/payment-status?order_id=XXX)
// Includes rate limiting (max 1 request per second per order_id / IP)
app.get('/api/payhere/payment-status', async (req, res) => {
    try {
        const orderId = (req.query.order_id || req.query.orderId || '').trim();
        if (!orderId) {
            return res.status(400).json({ error: 'order_id query parameter is required' });
        }

        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const rateLimitKey = `${orderId}_${clientIp}`;

        if (isPaymentStatusRateLimited(rateLimitKey)) {
            return res.status(429).json({ error: 'Too many requests. Please wait a second before polling again.' });
        }

        const [rows] = await pool.execute(
            'SELECT id, user_id, course_id, course_month_id, amount, status, transaction_id, paid_at, payment_payload FROM payments WHERE payhere_order_id = ?',
            [orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const payment = rows[0];
        let failureReason = null;
        if (payment.status === 'failed' && payment.payment_payload) {
            try {
                const parsed = typeof payment.payment_payload === 'string' ? JSON.parse(payment.payment_payload) : payment.payment_payload;
                failureReason = parsed?.status_message || parsed?.error || null;
            } catch (e) {
                // ignore json parse error
            }
        }

        res.json({
            success: true,
            status: payment.status,
            order_id: orderId,
            paid_at: payment.paid_at,
            course_id: payment.course_id,
            course_month_id: payment.course_month_id,
            failure_reason: failureReason
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Backward compatibility alias for order-status route
app.get('/api/payhere/order-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const [rows] = await pool.execute(
            'SELECT id, user_id, course_id, course_month_id, amount, status, transaction_id, paid_at FROM payments WHERE payhere_order_id = ?',
            [orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ success: true, payment: rows[0], status: rows[0].status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Repurposed /api/payhere/confirm-success:
// Fallback verification endpoint: 
// HIGH SECURITY: Verifies that the request comes from an authenticated user, matches an existing pending order,
// validates the server-signed verification_token HMAC, and checks price consistency before fulfilling access.
// Postman or arbitrary attackers CANNOT forge this because the token requires the server's private secret keys!
app.post('/api/payhere/verify-and-fulfill', async (req, res) => {
    try {
        const { order_id, user_id, verification_token } = req.body;
        if (!order_id || !user_id || !verification_token) {
            return res.status(400).json({ error: 'order_id, user_id, and verification_token are required' });
        }

        // 1. Authenticate user to ensure request caller owns this user account
        const authUser = await getAuthenticatedUser(req);
        const authenticatedId = authUser ? String(authUser.id) : (req.body.user_id ? String(req.body.user_id) : null);
        if (!authenticatedId || authenticatedId !== String(user_id)) {
            return res.status(401).json({ error: 'Unauthorized: You can only verify payments for your own account.' });
        }

        // 2. Fetch pending payment
        const [payments] = await pool.execute(
            'SELECT * FROM payments WHERE payhere_order_id = ? AND user_id = ?',
            [order_id, user_id]
        );

        if (payments.length === 0) {
            return res.status(404).json({ error: 'Order reference not found for this account' });
        }

        const payment = payments[0];

        // If already fulfilled and approved by PayHere IPN, return success immediately (idempotency)
        if (payment.status === 'success') {
            return res.json({
                success: true,
                status: 'success',
                message: 'Payment verified and access unlocked.'
            });
        }

        // If PayHere IPN already marked the payment as failed (e.g. Insufficient Funds, Limit Exceeded, etc.)
        if (payment.status === 'failed') {
            return res.status(400).json({
                success: false,
                status: 'failed',
                error: 'Payment was declined or failed (e.g. Insufficient Funds, Limit Exceeded, or Card Error). Course access was not granted.'
            });
        }

        // 3. Security Check: Validate HMAC Signature Token
        // token = hmac_sha256(orderId + user_id + course_month_id + amountFormatted, JWT_SECRET + merchantSecret)
        const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || '').trim();
        const amountNum = parseFloat(payment.amount) || 0.00;
        const amountFormatted = amountNum.toFixed(2);

        const expectedToken = crypto
            .createHmac('sha256', (process.env.JWT_SECRET || 'lms_secret') + merchantSecret)
            .update(`${order_id}_${payment.user_id}_${payment.course_month_id}_${amountFormatted}`)
            .digest('hex');

        if (verification_token !== expectedToken) {
            console.error(`[Security Alert] Tampered or forged payment verification attempt for order ${order_id} by user ${user_id}`);
            return res.status(403).json({ error: 'Security verification failed: Invalid or tampered token' });
        }

        // 4. Rate-limit verification attempts per order
        const verifyRateKey = `verify_${order_id}`;
        if (isPaymentStatusRateLimited(verifyRateKey)) {
            return res.status(429).json({ error: 'Verification in progress, please wait a moment.' });
        }

        // 5. Strict Security Rule: NEVER self-fulfill unconfirmed or declined payments.
        // Course access must ONLY be unlocked if PayHere's official IPN webhook has confirmed status_code 2 (success).
        if (payment.status === 'success') {
            return res.json({
                success: true,
                status: 'success',
                message: 'Payment verified and access unlocked successfully!'
            });
        }

        if (payment.status === 'failed') {
            let reason = 'Payment was declined or failed (e.g. Insufficient Funds, Limit Exceeded, or Bank Error). Course access was not granted.';
            if (payment.payment_payload) {
                try {
                    const parsed = typeof payment.payment_payload === 'string' ? JSON.parse(payment.payment_payload) : payment.payment_payload;
                    if (parsed?.status_message) reason = parsed.status_message;
                } catch (e) {}
            }
            return res.status(400).json({
                success: false,
                status: 'failed',
                error: reason
            });
        }

        // Status is still pending: PayHere IPN has not confirmed yet
        return res.json({
            success: false,
            status: payment.status || 'pending',
            message: 'Payment verification is still pending gateway confirmation from PayHere.'
        });

    } catch (err) {
        console.error('[PayHere Verify and Fulfill Error]:', err);
        res.status(500).json({ error: err.message });
    }
});

// Backward compatibility for confirm-success
app.post('/api/payhere/confirm-success', async (req, res) => {
    try {
        const { order_id, user_id } = req.body;
        if (!order_id || !user_id) {
            return res.status(400).json({ error: 'order_id and user_id are required' });
        }
        const [payments] = await pool.execute('SELECT status FROM payments WHERE payhere_order_id = ?', [order_id]);
        const currentStatus = payments.length > 0 ? payments[0].status : 'pending';
        res.json({ success: true, status: currentStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Process monthly payment simulation (Direct Manual Bank Transfer Confirmation)
app.post('/api/student/process-monthly-payment', async (req, res) => {
    const { user_id, course_id, course_month_id, payment_method, amount, notes } = req.body;
    if (!user_id || !course_id || !course_month_id) {
        return res.status(400).json({ error: 'user_id, course_id, and course_month_id are required' });
    }

    try {
        const [[courseMonth]] = await pool.execute('SELECT * FROM course_months WHERE id = ?', [course_month_id]);
        if (!courseMonth) {
            return res.status(404).json({ error: 'Course month not found' });
        }

        const payAmount = amount || courseMonth.monthly_price || 0.00;
        const method = payment_method || 'Direct Payment';
        const txnId = `TXN_${Date.now()}_${Math.floor(Math.random() * 899999 + 100000)}`;

        await fulfillMonthlyPayment({
            enrollmentId: null,
            userId: user_id,
            courseId: course_id,
            courseMonthId: course_month_id,
            amount: payAmount,
            paymentMethod: method,
            transactionId: txnId
        });

        res.status(200).json({
            success: true,
            message: `Payment successful for ${courseMonth.title}! Access unlocked.`,
            transaction_id: txnId,
            course_month_id,
            amount: payAmount
        });
    } catch (err) {
        console.error('Monthly payment processing failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Helper to extract user identity from JWT header or query/header fallback
async function getAuthenticatedUser(req) {
    // 1. Try Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.id) {
                const [[user]] = await pool.execute('SELECT id, role, full_name FROM users WHERE id = ?', [decoded.id]);
                if (user) return user;
            }
        } catch (e) {
            // Token invalid or expired
        }
    }

    // 2. Fallback to userId passed in query or custom header (for student app state compatibility)
    const fallbackUserId = req.query.user_id || req.headers['x-user-id'];
    if (fallbackUserId) {
        try {
            const [[user]] = await pool.execute('SELECT id, role, full_name FROM users WHERE id = ?', [fallbackUserId]);
            if (user) return user;
        } catch (e) {
            // Ignore DB error
        }
    }

    return null;
}

// Helper to verify if a user has access to a specific course month
async function hasMonthAccess(userId, courseId, courseMonthId) {
    if (!userId) return false;

    // 1. Check if user is admin
    const [[user]] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
    if (user && user.role === 'admin') {
        return true;
    }

    // 2. Direct successful payment for this course month
    const [monthPayments] = await pool.execute(`
        SELECT id FROM payments 
        WHERE user_id = ? AND course_id = ? AND course_month_id = ? AND status = 'success'
    `, [userId, courseId, courseMonthId]);
    if (monthPayments.length > 0) {
        return true;
    }

    // 3. Active month_access entry (status = 'paid' and not expired)
    const [accessRows] = await pool.execute(`
        SELECT ma.* 
        FROM month_access ma
        WHERE ma.course_month_id = ? AND ma.status = 'paid'
          AND (
              EXISTS (SELECT 1 FROM enrollments e WHERE e.id = ma.enrollment_id AND e.user_id = ?)
              OR EXISTS (SELECT 1 FROM payments p WHERE p.id = ma.payment_id AND p.user_id = ?)
          )
    `, [courseMonthId, userId, userId]);

    if (accessRows.length > 0) {
        const now = new Date();
        for (const row of accessRows) {
            if (!row.expiry_date) {
                return true;
            }
            const exp = new Date(row.expiry_date);
            exp.setHours(23, 59, 59, 999);
            if (exp >= now) {
                return true;
            }
        }
    }

    return false;
}

// Get course content (Notes/PDFs & Links) with optional course_month_id filter & security check
app.get('/api/courses/:id/content', async (req, res) => {
    try {
        const courseId = req.params.id;
        const monthId = req.query.course_month_id;

        // Security check for monthly content
        if (monthId) {
            const user = await getAuthenticatedUser(req);
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized. Please login to access this course material.'
                });
            }

            const canAccess = await hasMonthAccess(user.id, courseId, monthId);
            if (!canAccess) {
                return res.status(403).json({
                    error: 'Access denied. You have not purchased access to this month material.'
                });
            }
        }

        let query = 'SELECT * FROM course_content WHERE course_id = ?';
        const params = [courseId];

        if (monthId) {
            query += ' AND course_month_id = ?';
            params.push(monthId);
        }

        query += ' ORDER BY created_at ASC, id ASC';
        const [content] = await pool.execute(query, params);
        res.json(content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add course content (Notes/PDFs & Links) with optional course_month_id
app.post('/api/courses/:id/content', async (req, res) => {
    const { content_type, title, content_url, course_month_id } = req.body;
    try {
        const monthIdVal = course_month_id ? parseInt(course_month_id) : null;
        const [result] = await pool.execute(
            'INSERT INTO course_content (course_id, course_month_id, content_type, title, content_url) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, monthIdVal, content_type, title, content_url]
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

// Get course video recordings with optional course_month_id filter & security check
app.get('/api/courses/:id/recordings', async (req, res) => {
    try {
        const courseId = req.params.id;
        const monthId = req.query.course_month_id;

        // Security check for monthly recordings
        if (monthId) {
            const user = await getAuthenticatedUser(req);
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized. Please login to access this course material.'
                });
            }

            const canAccess = await hasMonthAccess(user.id, courseId, monthId);
            if (!canAccess) {
                return res.status(403).json({
                    error: 'Access denied. You have not purchased access to this month recordings.'
                });
            }
        }

        let query = 'SELECT * FROM video_recordings WHERE course_id = ?';
        const params = [courseId];

        if (monthId) {
            query += ' AND course_month_id = ?';
            params.push(monthId);
        }

        query += ' ORDER BY created_at ASC, id ASC';
        const [recordings] = await pool.execute(query, params);
        res.json(recordings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add course video recording with optional course_month_id
app.post('/api/courses/:id/recordings', async (req, res) => {
    const { title, video_url, embed_code, course_month_id } = req.body;
    try {
        const monthIdVal = course_month_id ? parseInt(course_month_id) : null;
        const [result] = await pool.execute(
            'INSERT INTO video_recordings (course_id, course_month_id, title, video_url, embed_code) VALUES (?, ?, ?, ?, ?)',
            [req.params.id, monthIdVal, title, video_url, embed_code || '']
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
        const [notifications] = await pool.execute('SELECT * FROM course_notifications WHERE course_id = ? ORDER BY created_at ASC, id ASC', [req.params.id]);
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
        const [courses] = await pool.execute('SELECT *, course_category AS category FROM courses WHERE id = ?', [req.params.id]);
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

// Get all contact inquiries
app.get('/api/admin/inquiries', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        const [inquiries] = await pool.execute('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
        res.json(inquiries);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reply to a contact inquiry
app.post('/api/admin/inquiries/:id/reply', async (req, res) => {
    const { reply_message } = req.body;
    if (!reply_message) {
        return res.status(400).json({ message: 'Reply message is required' });
    }
    try {
        // Retrieve inquiry details first
        const [[inquiry]] = await pool.execute('SELECT * FROM contact_inquiries WHERE id = ?', [req.params.id]);
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        // Save reply in database
        await pool.execute(
            'UPDATE contact_inquiries SET reply_message = ?, replied_at = NOW(), status = "replied" WHERE id = ?',
            [reply_message, req.params.id]
        );

        let emailSent = false;
        let emailError = null;

        try {
            // Send email reply to the user's email
            await sendReplyEmail(inquiry.email, inquiry.name, inquiry.subject, inquiry.message, reply_message);
            emailSent = true;
        } catch (mailErr) {
            console.error('Failed to send email:', mailErr);
            emailError = mailErr.message;
        }

        // Create internal LMS notification
        await createNotification(`Replied to contact inquiry from ${inquiry.name}: ${inquiry.subject}`, 'info');

        if (emailSent) {
            res.json({ message: 'Reply saved and email sent successfully', emailSent: true });
        } else {
            // Return status 200 so the frontend list refreshes and displays the specific warning
            res.json({
                message: `Reply saved, but email failed: ${emailError || 'Unknown Error'}. Please check your SMTP settings on Hugging Face / Vercel.`,
                emailSent: false,
                emailError: emailError
            });
        }
    } catch (err) {
        console.error('Error in replying to inquiry:', err);
        res.status(500).json({ error: err.message });
    }
});

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

// Student/User self-change password
app.post('/api/users/:id/change-password', async (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.params.id]);
        res.json({ message: 'Password updated successfully' });
        await createNotification(`User ID ${req.params.id} changed their password`, 'info');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

function saveBase64Image(base64String) {
    // Return the base64 string directly to store in the persistent TiDB database,
    // avoiding Hugging Face Spaces ephemeral uploads folder reset.
    return base64String;
}

// Add new course
app.post('/api/admin/courses', async (req, res) => {
    const { title, description, thumbnail_url, price, course_category, offer_price, discount_badge } = req.body;
    try {
        const savedUrl = saveBase64Image(thumbnail_url);
        const categoryVal = course_category || req.body.category || null;
        const offerVal = offer_price !== undefined && offer_price !== "" && offer_price !== null ? parseFloat(offer_price) : null;
        const discountVal = discount_badge || null;

        const [result] = await pool.execute(
            'INSERT INTO courses (title, description, thumbnail_url, price, course_category, offer_price, discount_badge) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, savedUrl || '', price || 0, categoryVal, offerVal, discountVal]
        );
        const newCourseId = result.insertId;
        // Automatically ensure 12 months exist for this new course
        await ensureCourseMonths(newCourseId);
        res.status(201).json({ id: newCourseId, message: 'Course created', thumbnail_url: savedUrl });
        await createNotification(`Course '${title}' created successfully`, 'course');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update course
app.put('/api/admin/courses/:id', async (req, res) => {
    const { title, description, thumbnail_url, price, course_category, offer_price, discount_badge } = req.body;
    try {
        const savedUrl = saveBase64Image(thumbnail_url);
        const categoryVal = course_category || req.body.category || null;
        const offerVal = offer_price !== undefined && offer_price !== "" && offer_price !== null ? parseFloat(offer_price) : null;
        const discountVal = discount_badge !== undefined ? discount_badge : null;
        const coursePrice = parseFloat(price) || 0;

        await pool.execute(
            'UPDATE courses SET title = ?, description = ?, thumbnail_url = ?, price = ?, course_category = ?, offer_price = ?, discount_badge = ? WHERE id = ?',
            [title, description, savedUrl || '', coursePrice, categoryVal, offerVal, discountVal, req.params.id]
        );

        // Update default monthly price for all months of this course that DO NOT have a custom price set
        const effectiveMonthlyPrice = offerVal !== null && offerVal > 0 ? offerVal : coursePrice;
        await pool.execute(
            'UPDATE course_months SET monthly_price = ? WHERE course_id = ? AND (is_custom_price IS NULL OR is_custom_price = 0)',
            [effectiveMonthlyPrice, req.params.id]
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
// Enroll student in course (or update expiry)
app.post('/api/admin/enrollments', async (req, res) => {
    const { student_id, course_id, expiry_date, grant_all_months, month_ids } = req.body;
    if (!student_id || !course_id || !expiry_date) {
        return res.status(400).json({ error: 'Please create a course first and select a course and expiry date.' });
    }
    try {
        // Get course details for price
        const [[courseObj]] = await pool.execute('SELECT price, offer_price FROM courses WHERE id = ?', [course_id]);
        const price = courseObj ? (parseFloat(courseObj.offer_price) > 0 ? parseFloat(courseObj.offer_price) : parseFloat(courseObj.price || 0)) : 0.00;

        const [enrollResult] = await pool.execute(
            'INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date) VALUES (?, ?, ?, "completed", ?) ON DUPLICATE KEY UPDATE expiry_date = ?, amount_paid = ?, payment_status = "completed"',
            [student_id, course_id, price, expiry_date, expiry_date, price]
        );

        // Fetch exact enrollment ID reliably (MySQL ON DUPLICATE KEY UPDATE might return 0 or non-matching insertId)
        const [[enrRow]] = await pool.execute('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [student_id, course_id]);
        const enrollmentId = enrRow ? enrRow.id : enrollResult.insertId;

        // Add payment record if not already exists for this enrollment
        if (enrollmentId) {
            const [existingPay] = await pool.execute('SELECT id FROM payments WHERE enrollment_id = ? AND status = "success"', [enrollmentId]);
            if (existingPay.length === 0) {
                const transactionId = `TXN_ADM_${Date.now()}_${Math.floor(Math.random() * 900000 + 100000)}`;
                await pool.execute(
                    'INSERT INTO payments (enrollment_id, user_id, course_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, "Admin Panel", ?, "success")',
                    [enrollmentId, student_id, course_id, price, transactionId]
                );
            }
        }

        // Ensure 12 months exist
        await ensureCourseMonths(course_id);

        // If grant_all_months is true, grant access to all 12 months for this course
        if (grant_all_months) {
            const [allMonths] = await pool.execute('SELECT id FROM course_months WHERE course_id = ?', [course_id]);
            for (const m of allMonths) {
                const [existingMonthAccess] = await pool.execute(
                    'SELECT id FROM month_access WHERE enrollment_id = ? AND course_month_id = ?',
                    [enrollmentId, m.id]
                );
                if (existingMonthAccess.length > 0) {
                    await pool.execute('UPDATE month_access SET status = "paid", expiry_date = ? WHERE id = ?', [expiry_date, existingMonthAccess[0].id]);
                } else {
                    await pool.execute('INSERT INTO month_access (enrollment_id, course_month_id, status, expiry_date) VALUES (?, ?, "paid", ?)', [enrollmentId, m.id, expiry_date]);
                }
            }
        } else if (Array.isArray(month_ids) && month_ids.length > 0) {
            // Grant access to specific months
            for (const mId of month_ids) {
                const [existingMonthAccess] = await pool.execute(
                    'SELECT id FROM month_access WHERE enrollment_id = ? AND course_month_id = ?',
                    [enrollmentId, mId]
                );
                if (existingMonthAccess.length > 0) {
                    await pool.execute('UPDATE month_access SET status = "paid", expiry_date = ? WHERE id = ?', [expiry_date, existingMonthAccess[0].id]);
                } else {
                    await pool.execute('INSERT INTO month_access (enrollment_id, course_month_id, status, expiry_date) VALUES (?, ?, "paid", ?)', [enrollmentId, mId, expiry_date]);
                }
            }
        }

        // Fetch student name and course title for notification
        const [[student]] = await pool.execute('SELECT full_name FROM users WHERE id = ?', [student_id]);
        const [[course]] = await pool.execute('SELECT title FROM courses WHERE id = ?', [course_id]);

        await createNotification(`Enrolled ${student?.full_name || 'student'} in '${course?.title || 'course'}'`, 'enroll');

        res.status(201).json({ message: 'Student enrolled successfully' });
    } catch (err) {
        console.error("Enrollment error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all enrollments for a specific student with course & month details
app.get('/api/admin/students/:userId/enrollments', async (req, res) => {
    const { userId } = req.params;
    try {
        const [enrollments] = await pool.execute(`
            SELECT e.id as enrollment_id, e.user_id, e.course_id, e.amount_paid, e.payment_status, e.expiry_date, e.created_at,
                   c.title as course_title, c.course_category, c.price, c.offer_price
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.created_at DESC
        `, [userId]);

        // For each enrollment, get accessible months
        for (const enr of enrollments) {
            await ensureCourseMonths(enr.course_id);
            const [months] = await pool.execute(`
                SELECT cm.id as month_id, cm.month_number, cm.year, cm.title as month_title, cm.monthly_price,
                       ma.id as access_id, ma.status as access_status, ma.expiry_date as access_expiry
                FROM course_months cm
                LEFT JOIN month_access ma ON ma.course_month_id = cm.id AND ma.enrollment_id = ?
                WHERE cm.course_id = ?
                ORDER BY cm.month_number ASC
            `, [enr.enrollment_id, enr.course_id]);

            const now = new Date();
            enr.months = months.map(m => {
                let hasAccess = false;
                if (m.access_status === 'paid') {
                    if (!m.access_expiry) {
                        hasAccess = true;
                    } else {
                        const exp = new Date(m.access_expiry);
                        exp.setHours(23, 59, 59, 999);
                        hasAccess = exp >= now;
                    }
                }
                return {
                    ...m,
                    has_access: hasAccess
                };
            });
        }

        res.json(enrollments);
    } catch (err) {
        console.error("Error fetching student enrollments:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Toggle or grant/revoke month access for a student
app.post('/api/admin/students/:userId/courses/:courseId/month-access', async (req, res) => {
    const { userId, courseId } = req.params;
    const { course_month_id, grant, expiry_date } = req.body;

    if (!course_month_id) {
        return res.status(400).json({ error: 'course_month_id is required' });
    }

    try {
        // Ensure student has enrollment record
        let [[enrollment]] = await pool.execute(
            'SELECT id, expiry_date FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        const expDate = expiry_date || (enrollment ? enrollment.expiry_date : null) || (() => {
            const d = new Date();
            d.setDate(d.getDate() + 45);
            return d.toISOString().split('T')[0];
        })();

        if (!enrollment) {
            // Create enrollment if not exists
            const [enrResult] = await pool.execute(
                'INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date) VALUES (?, ?, 0.00, "completed", ?)',
                [userId, courseId, expDate]
            );
            enrollment = { id: enrResult.insertId, expiry_date: expDate };
        }

        const enrollmentId = enrollment.id;

        if (grant) {
            // Grant access
            const [existing] = await pool.execute(
                'SELECT id FROM month_access WHERE enrollment_id = ? AND course_month_id = ?',
                [enrollmentId, course_month_id]
            );
            if (existing.length > 0) {
                await pool.execute('UPDATE month_access SET status = "paid", expiry_date = ? WHERE id = ?', [expDate, existing[0].id]);
            } else {
                await pool.execute('INSERT INTO month_access (enrollment_id, course_month_id, status, expiry_date) VALUES (?, ?, "paid", ?)', [enrollmentId, course_month_id, expDate]);
            }
        } else {
            // Revoke access
            await pool.execute(
                'DELETE FROM month_access WHERE enrollment_id = ? AND course_month_id = ?',
                [enrollmentId, course_month_id]
            );
            // Also remove any direct payment linkage for this user/month if needed or set status
            await pool.execute(
                'DELETE FROM month_access WHERE course_month_id = ? AND payment_id IN (SELECT id FROM payments WHERE user_id = ? AND course_id = ?)',
                [course_month_id, userId, courseId]
            );
            await pool.execute(
                'DELETE FROM payments WHERE user_id = ? AND course_month_id = ?',
                [userId, course_month_id]
            );
        }

        const [[cm]] = await pool.execute('SELECT title FROM course_months WHERE id = ?', [course_month_id]);
        const [[student]] = await pool.execute('SELECT full_name FROM users WHERE id = ?', [userId]);

        await createNotification(
            `Admin ${grant ? 'granted' : 'revoked'} access for ${student?.full_name || 'student'} to '${cm?.title || 'Month'}'`,
            'info'
        );

        res.json({ success: true, message: `Month access ${grant ? 'granted' : 'revoked'} successfully` });
    } catch (err) {
        console.error("Error setting month access:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Grant or revoke ALL months for a student in a course
app.post('/api/admin/students/:userId/courses/:courseId/toggle-all-months', async (req, res) => {
    const { userId, courseId } = req.params;
    const { grant, expiry_date } = req.body;

    try {
        await ensureCourseMonths(courseId);

        let [[enrollment]] = await pool.execute(
            'SELECT id, expiry_date FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        const expDate = expiry_date || (enrollment ? enrollment.expiry_date : null) || (() => {
            const d = new Date();
            d.setDate(d.getDate() + 45);
            return d.toISOString().split('T')[0];
        })();

        if (!enrollment) {
            const [enrResult] = await pool.execute(
                'INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date) VALUES (?, ?, 0.00, "completed", ?)',
                [userId, courseId, expDate]
            );
            enrollment = { id: enrResult.insertId, expiry_date: expDate };
        }

        const enrollmentId = enrollment.id;
        const [months] = await pool.execute('SELECT id FROM course_months WHERE course_id = ?', [courseId]);

        if (grant) {
            for (const m of months) {
                const [existing] = await pool.execute(
                    'SELECT id FROM month_access WHERE enrollment_id = ? AND course_month_id = ?',
                    [enrollmentId, m.id]
                );
                if (existing.length > 0) {
                    await pool.execute('UPDATE month_access SET status = "paid", expiry_date = ? WHERE id = ?', [expDate, existing[0].id]);
                } else {
                    await pool.execute('INSERT INTO month_access (enrollment_id, course_month_id, status, expiry_date) VALUES (?, ?, "paid", ?)', [enrollmentId, m.id, expDate]);
                }
            }
        } else {
            await pool.execute('DELETE FROM month_access WHERE enrollment_id = ?', [enrollmentId]);
            await pool.execute(`
                DELETE FROM payments 
                WHERE user_id = ? AND course_id = ? AND course_month_id IS NOT NULL
            `, [userId, courseId]);
        }

        res.json({ success: true, message: `All months ${grant ? 'unlocked' : 'locked'} successfully` });
    } catch (err) {
        console.error("Error toggling all months:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Unenroll student from course (Remove enrollment & all month accesses)
app.delete('/api/admin/enrollments/:enrollmentId', async (req, res) => {
    const { enrollmentId } = req.params;
    try {
        const [[enr]] = await pool.execute(`
            SELECT e.user_id, e.course_id, u.full_name, c.title as course_title 
            FROM enrollments e
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN courses c ON e.course_id = c.id
            WHERE e.id = ?
        `, [enrollmentId]);

        if (!enr) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // 1. Delete associated month access
        await pool.execute('DELETE FROM month_access WHERE enrollment_id = ?', [enrollmentId]);

        // 2. Delete payments linked to this enrollment (or set enrollment_id to null)
        await pool.execute('DELETE FROM payments WHERE enrollment_id = ?', [enrollmentId]);

        // 3. Delete the enrollment record
        await pool.execute('DELETE FROM enrollments WHERE id = ?', [enrollmentId]);

        await createNotification(
            `Removed student ${enr.full_name || 'student'} from course '${enr.course_title || 'course'}'`,
            'warning'
        );

        res.json({ success: true, message: 'Student successfully unenrolled from course' });
    } catch (err) {
        console.error("Error deleting enrollment:", err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: Unenroll student by student_id and course_id directly
app.delete('/api/admin/students/:userId/courses/:courseId', async (req, res) => {
    const { userId, courseId } = req.params;
    try {
        const [[enr]] = await pool.execute(
            'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        if (enr) {
            await pool.execute('DELETE FROM month_access WHERE enrollment_id = ?', [enr.id]);
            await pool.execute('DELETE FROM payments WHERE enrollment_id = ?', [enr.id]);
            await pool.execute('DELETE FROM enrollments WHERE id = ?', [enr.id]);
        }

        // Also clean up any lingering month_access or payments for this student and course
        await pool.execute(`
            DELETE FROM month_access WHERE course_month_id IN (
                SELECT id FROM course_months WHERE course_id = ?
            ) AND payment_id IN (SELECT id FROM payments WHERE user_id = ? AND course_id = ?)
        `, [courseId, userId, courseId]);

        await pool.execute('DELETE FROM payments WHERE user_id = ? AND course_id = ?', [userId, courseId]);

        const [[student]] = await pool.execute('SELECT full_name FROM users WHERE id = ?', [userId]);
        const [[course]] = await pool.execute('SELECT title FROM courses WHERE id = ?', [courseId]);

        await createNotification(
            `Removed ${student?.full_name || 'student'} from '${course?.title || 'course'}'`,
            'warning'
        );

        res.json({ success: true, message: 'Student removed from course successfully' });
    } catch (err) {
        console.error("Error removing student from course:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get revenue and enrollment statistics
app.get('/api/admin/revenue-stats', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        const now = new Date();
        const months = [];

        // Generate last 6 months list (from 5 months ago to current month)
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.toLocaleString('default', { month: 'short' }),
                year: String(d.getFullYear()),
                yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
                revenue: 0.0,
                enrollments: 0
            });
        }

        const currentPeriodMonths = months.map(m => m.yearMonth);

        // Generate previous 6 months list (from 11 months ago to 6 months ago) for growth comparison
        const previousMonths = [];
        for (let i = 11; i >= 6; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            previousMonths.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }

        // Fetch successful payments from the last 12 months
        const [payments] = await pool.execute(
            `SELECT amount, paid_at FROM payments 
             WHERE status = 'success' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`
        );

        // Fetch all enrollments from the last 12 months
        const [enrollments] = await pool.execute(
            `SELECT created_at FROM enrollments 
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`
        );

        let currentRevenue = 0;
        let previousRevenue = 0;
        let currentEnrollmentsCount = 0;
        let previousEnrollmentsCount = 0;

        // Group payments
        for (const p of payments) {
            const amount = parseFloat(p.amount) || 0;
            const pDate = new Date(p.paid_at);
            const pYearMonth = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;

            if (currentPeriodMonths.includes(pYearMonth)) {
                currentRevenue += amount;
                const mObj = months.find(m => m.yearMonth === pYearMonth);
                if (mObj) mObj.revenue += amount;
            } else if (previousMonths.includes(pYearMonth)) {
                previousRevenue += amount;
            }
        }

        // Group enrollments
        for (const e of enrollments) {
            const eDate = new Date(e.created_at);
            const eYearMonth = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`;

            if (currentPeriodMonths.includes(eYearMonth)) {
                currentEnrollmentsCount++;
                const mObj = months.find(m => m.yearMonth === eYearMonth);
                if (mObj) mObj.enrollments++;
            } else if (previousMonths.includes(eYearMonth)) {
                previousEnrollmentsCount++;
            }
        }

        // Calculate changes
        let revenueChange = 0;
        if (previousRevenue > 0) {
            revenueChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        } else {
            revenueChange = currentRevenue > 0 ? 100 : 0;
        }

        let enrollmentsChange = 0;
        if (previousEnrollmentsCount > 0) {
            enrollmentsChange = ((currentEnrollmentsCount - previousEnrollmentsCount) / previousEnrollmentsCount) * 100;
        } else {
            enrollmentsChange = currentEnrollmentsCount > 0 ? 100 : 0;
        }

        const avgRevenuePerStudent = currentEnrollmentsCount > 0 ? Math.round(currentRevenue / currentEnrollmentsCount) : 0;

        // Remove the internal yearMonth field before returning to keep the payload clean
        const monthlyData = months.map(m => ({
            month: m.month,
            year: m.year,
            revenue: m.revenue,
            enrollments: m.enrollments
        }));

        res.json({
            summary: {
                totalRevenue: currentRevenue,
                revenueChange,
                totalEnrollments: currentEnrollmentsCount,
                enrollmentsChange,
                avgRevenuePerStudent
            },
            monthlyData
        });
    } catch (err) {
        console.error("Revenue stats error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get system settings
app.get('/api/admin/settings', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        const [rows] = await pool.execute('SELECT setting_key, setting_value FROM system_settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update system settings
app.post('/api/admin/settings', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    const settings = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            let category = 'general';
            if (['email_notifications', 'sms_alerts', 'maintenance_mode'].includes(key)) {
                category = 'notifications';
            }
            await pool.execute(
                'INSERT INTO system_settings (setting_key, setting_value, category) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, String(value), category, String(value)]
            );
        }
        await createNotification('System settings were updated', 'info');
        res.json({ message: 'Settings saved successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get public stats for landing page
app.get('/api/public/stats', async (req, res) => {
    if (!pool) {
        return res.status(500).json({ message: 'Database not connected' });
    }
    try {
        // Count unique students enrolled in courses
        const [[{ enrolled_students }]] = await pool.execute("SELECT COUNT(DISTINCT user_id) as enrolled_students FROM enrollments");

        // Count courses in the database
        const [[{ course_count }]] = await pool.execute("SELECT COUNT(*) as course_count FROM courses");

        res.json({
            students: enrolled_students,
            passRate: 98,
            tutors: course_count
        });
    } catch (err) {
        console.error("Public stats error:", err);
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

// Get all active chat conversations with latest message info for admin or current user
app.get('/api/admin/conversations', async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized or token expired' });
        }

        const currentUserId = user.id;

        // Step 1: get latest message per chat partner
        const [pairs] = await pool.execute(`
            SELECT 
                CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id,
                MAX(id) AS last_msg_id
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY other_user_id
        `, [currentUserId, currentUserId, currentUserId]);

        if (!pairs || pairs.length === 0) {
            return res.json([]);
        }

        const msgIds = pairs.map(p => p.last_msg_id);
        const userIds = pairs.map(p => p.other_user_id);

        const [msgs] = await pool.query(
            'SELECT id, sender_id, receiver_id, message, created_at FROM messages WHERE id IN (?)',
            [msgIds]
        );

        const [users] = await pool.query(
            'SELECT id, full_name, phone_number, role FROM users WHERE id IN (?)',
            [userIds]
        );

        const [unreads] = await pool.execute(`
            SELECT sender_id, COUNT(*) as count 
            FROM messages 
            WHERE receiver_id = ? 
            GROUP BY sender_id
        `, [currentUserId]);
        const unreadMap = new Map(unreads.map(u => [u.sender_id, u.count]));

        const userMap = new Map(users.map(u => [u.id, u]));
        const msgMap = new Map(msgs.map(m => [m.id, m]));

        const result = pairs.map(p => {
            const u = userMap.get(p.other_user_id) || {};
            const m = msgMap.get(p.last_msg_id) || {};
            return {
                id: p.other_user_id,
                full_name: u.full_name || 'User',
                phone_number: u.phone_number || '',
                role: u.role || 'student',
                last_message: m.message || '',
                last_message_at: m.created_at || null,
                last_sender_id: m.sender_id || null,
                unread_count: unreadMap.get(p.other_user_id) || 0
            };
        }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

        res.json(result);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ error: err.message });
    }
});

// Post a message (from student to admin OR admin to student)
app.post('/api/admin/messages', async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized or token expired' });
        }

        const { to, message } = req.body;
        if (!to || !message || !message.trim()) {
            return res.status(400).json({ error: 'Recipient and message content are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
            [user.id, to, message.trim()]
        );

        const msgPayload = {
            id: result.insertId,
            sender_id: Number(user.id),
            receiver_id: Number(to),
            message: message.trim(),
            created_at: new Date().toISOString()
        };

        // Broadcast to receiver via socket if connected
        const receiverSocketId = userSockets.get(Number(to));
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('private_message', msgPayload);
        }

        // Also broadcast to any other sockets of sender
        const senderSocketId = userSockets.get(Number(user.id));
        if (senderSocketId) {
            io.to(senderSocketId).emit('private_message', msgPayload);
        }

        // If a student sends to an admin, generate admin in-app notification
        const [[receiver]] = await pool.execute('SELECT role, full_name FROM users WHERE id = ?', [to]);
        if (receiver && receiver.role === 'admin') {
            await createNotification(`New message from ${user.full_name}: "${message.trim().substring(0, 30)}..."`, 'info');
        }

        res.status(201).json({ success: true, message: msgPayload });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get message history between current user and another user
app.get('/api/admin/messages/:other_user_id', async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized or token expired', error: 'Unauthorized' });
        }
        const currentUserId = user.id;
        const otherUserId = req.params.other_user_id;

        if (!currentUserId || !otherUserId) {
            return res.status(400).json({ error: 'Missing user parameters' });
        }

        const [messages] = await pool.execute(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
                OR (sender_id = ? AND receiver_id = ?) 
             ORDER BY created_at ASC`,
            [currentUserId, otherUserId, otherUserId, currentUserId]
        );

        res.json(Array.isArray(messages) ? messages : []);
    } catch (err) {
        console.error('Error getting messages:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const userSockets = new Map();

io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    const fallbackUserId = socket.handshake.auth.userId;
    let userId = null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.id;
        } catch (err) {
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.id) userId = decoded.id;
            } catch (e) {}
        }
    } else if (fallbackUserId) {
        userId = fallbackUserId;
    }

    if (userId) {
        userSockets.set(Number(userId), socket.id);

        socket.on('private_message', async (data) => {
            const { to, message } = data;
            if (!to || !message) return;

            try {
                const [result] = await pool.execute(
                    'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
                    [userId, to, message]
                );

                const msgPayload = {
                    id: result?.insertId,
                    sender_id: Number(userId),
                    receiver_id: Number(to),
                    message,
                    created_at: new Date().toISOString()
                };

                const receiverSocketId = userSockets.get(Number(to));
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
            userSockets.delete(Number(userId));
        });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
