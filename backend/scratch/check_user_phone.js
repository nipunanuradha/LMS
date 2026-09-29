const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: (process.env.DB_USERNAME || '').replace(/['"]/g, ''),
    password: (process.env.DB_PASSWORD || '').replace(/['"]/g, ''),
    database: (process.env.DB_DATABASE || '').replace(/['"]/g, ''),
    ssl: { rejectUnauthorized: false }
};

async function test() {
    const pool = await mysql.createPool(dbConfig);
    const [u] = await pool.query('SELECT * FROM users WHERE phone_number = "0705688891"');
    console.log('User with phone 0705688891:', u);

    if (u.length > 0) {
        const [enr] = await pool.query('SELECT * FROM enrollments WHERE user_id = ?', [u[0].id]);
        console.log('Enrollments for user:', enr);
    }

    process.exit(0);
}

test();
