const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: (process.env.DB_USERNAME || '').replace(/['"]/g, ''),
    password: (process.env.DB_PASSWORD || '').replace(/['"]/g, ''),
    database: (process.env.DB_DATABASE || '').replace(/['"]/g, ''),
    ssl: {
        rejectUnauthorized: false
    }
};

const COURSES_TO_SEED = [
    { title: "Advanced React Development", price: 5000.00, description: "Master React hooks, context, Redux, and advanced patterns for building scalable modern web applications." },
    { title: "Python for Data Science", price: 4500.00, description: "Comprehensive Python covering NumPy, Pandas, Matplotlib, and machine learning fundamentals with real datasets." },
    { title: "UI/UX Design Fundamentals", price: 3500.00, description: "User research, wireframing, prototyping in Figma, and building scalable design systems from the ground up." },
    { title: "Node.js & Express Backend", price: 4000.00, description: "RESTful APIs, JWT authentication, middleware patterns, and deploying production Node.js apps to the cloud." },
    { title: "Mobile App with Flutter", price: 6000.00, description: "Cross-platform mobile development with Flutter and Dart for beautiful iOS and Android applications." },
    { title: "AWS Cloud Architecture", price: 7500.00, description: "Design and deploy scalable cloud infrastructure using core AWS services, Terraform, and DevOps best practices." }
];

const STUDENT_NAMES = [
    "Kavindu Perera", "Dilshan Silva", "Sanduni Fernando", "Nipuni Jayawardena", "Chathura Bandara",
    "Ruwan Kumara", "Thilina Wickramasinghe", "Nimesh Fernando", "Rasika Jayasinghe", "Dulani Rathnayake",
    "Pradeep Senanayake", "Lahiru Cooray", "Chamath Dissanayake", "Thilini Alwis", "Suresh Mendis",
    "Sachini Gunawardena", "Kaveen de Silva", "Minura Perera", "Isuru Herath", "Hasini Ranasinghe",
    "Dinuka Rajapaksha", "Imesha Fernando", "Roshan Siriwardena", "Gayan Kumara", "Piyumi Madushani",
    "Ashan Perera", "Nadeesha Silva", "Sajith Fernando", "Eranga Jayasinghe", "Pasan Bandara",
    "Gayani Perera", "Kasun Wickramasinghe", "Shalini Cooray", "Supun Rajapakse", "Maleesha Gunasekara"
];

const DISTRICTS = ["Colombo", "Gampaha", "Kandy", "Galle", "Matara", "Negombo", "Kurunegala", "Kalutara", "Anuradhapura"];

async function seed() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database for seeding...');

        // 1. Check if we already have payments
        const [existingPayments] = await connection.query('SELECT COUNT(*) as count FROM payments');
        if (existingPayments[0].count > 0) {
            console.log('Database already has payments. Skipping seeding to prevent duplicate records.');
            await connection.end();
            return;
        }

        console.log('Seeding courses...');
        const courseIds = [];
        for (const course of COURSES_TO_SEED) {
            // Check if course already exists by title
            const [rows] = await connection.query('SELECT id FROM courses WHERE title = ?', [course.title]);
            if (rows.length > 0) {
                courseIds.push(rows[0].id);
            } else {
                const [result] = await connection.query(
                    'INSERT INTO courses (title, description, price) VALUES (?, ?, ?)',
                    [course.title, course.description, course.price]
                );
                courseIds.push(result.insertId);
            }
        }
        console.log(`Courses ready: ${courseIds.length}`);

        console.log('Seeding student users...');
        const studentIds = [];
        const hashedPassword = await bcrypt.hash('student123', 10);
        
        // Let's get existing students first to avoid duplicate phone number errors
        const [existingStudents] = await connection.query('SELECT id FROM users WHERE role = "student"');
        for (const studentIdObj of existingStudents) {
            studentIds.push(studentIdObj.id);
        }

        // Add more students if we have less than 30
        if (studentIds.length < 30) {
            for (let i = 0; i < STUDENT_NAMES.length; i++) {
                const name = STUDENT_NAMES[i];
                const phone = `0770${String(100000 + i).slice(-6)}`; // Unique phone number
                
                const [rows] = await connection.query('SELECT id FROM users WHERE phone_number = ?', [phone]);
                if (rows.length > 0) {
                    if (!studentIds.includes(rows[0].id)) {
                        studentIds.push(rows[0].id);
                    }
                } else {
                    const district = DISTRICTS[i % DISTRICTS.length];
                    const [result] = await connection.query(
                        'INSERT INTO users (full_name, phone_number, district, province, password, role) VALUES (?, ?, ?, ?, ?, ?)',
                        [name, phone, district, "Western", hashedPassword, "student"]
                    );
                    studentIds.push(result.insertId);
                }
            }
        }
        console.log(`Student users ready: ${studentIds.length}`);

        console.log('Seeding enrollments and payments for the last 6 months...');
        const now = new Date();
        let totalCount = 0;

        // Generate payments for the last 6 months (5 months ago to current month)
        for (let m = 5; m >= 0; m--) {
            const date = new Date(now.getFullYear(), now.getMonth() - m, 15);
            // Random number of enrollments for this month: between 8 and 18
            const enrollmentsThisMonth = Math.floor(Math.random() * 11) + 8;
            
            console.log(`Generating ${enrollmentsThisMonth} enrollments for ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}...`);

            for (let e = 0; e < enrollmentsThisMonth; e++) {
                const randomStudentId = studentIds[Math.floor(Math.random() * studentIds.length)];
                const randomCourseId = courseIds[Math.floor(Math.random() * courseIds.length)];
                
                // Get course price
                const [courseRows] = await connection.query('SELECT price FROM courses WHERE id = ?', [randomCourseId]);
                const price = courseRows[0] ? parseFloat(courseRows[0].price) : 4000.00;

                // Random day in that month
                const day = Math.floor(Math.random() * 28) + 1;
                const createdDate = new Date(date.getFullYear(), date.getMonth(), day, 10, 0, 0);
                const expiryDate = new Date(createdDate.getFullYear(), createdDate.getMonth() + 3, day); // 3 months access

                // Format dates for mysql
                const createdStr = createdDate.toISOString().slice(0, 19).replace('T', ' ');
                const expiryStr = expiryDate.toISOString().slice(0, 10);

                // Insert enrollment (ignore duplicates)
                try {
                    const [enrollResult] = await connection.query(
                        'INSERT INTO enrollments (user_id, course_id, amount_paid, payment_status, expiry_date, created_at) VALUES (?, ?, ?, "completed", ?, ?)',
                        [randomStudentId, randomCourseId, price, expiryStr, createdStr]
                    );

                    const enrollmentId = enrollResult.insertId;

                    // Insert corresponding payment
                    const paymentMethods = ["Bank Transfer", "Card Payment", "EzCash"];
                    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                    const transactionId = `TXN_${createdDate.getFullYear()}${String(createdDate.getMonth()+1).padStart(2, '0')}${String(day).padStart(2, '0')}_${Math.floor(Math.random()*900000 + 100000)}`;

                    await connection.query(
                        'INSERT INTO payments (enrollment_id, user_id, course_id, amount, payment_method, transaction_id, status, paid_at) VALUES (?, ?, ?, ?, ?, ?, "success", ?)',
                        [enrollmentId, randomStudentId, randomCourseId, price, method, transactionId, createdStr]
                    );
                    
                    totalCount++;
                } catch (dbErr) {
                    // Unique constraint on (user_id, course_id) might cause duplicate key error, which is fine to skip
                    if (dbErr.code !== 'ER_DUP_ENTRY') {
                        console.error('Error inserting enrollment/payment:', dbErr.message);
                    }
                }
            }
        }

        console.log(`Database seeding completed! Seeded ${totalCount} successful payments & enrollments.`);
        await connection.end();
    } catch (err) {
        console.error('Database seeding failed:', err);
    }
}

seed();
