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
    const [cm] = await pool.query('SELECT * FROM course_months WHERE course_id = 1');
    console.log('course_months for course 1:');
    console.log(cm);

    const [ma] = await pool.query('SELECT * FROM month_access WHERE enrollment_id = 1');
    console.log('month_access for enrollment 1:');
    console.log(ma);

    const [pay] = await pool.query('SELECT * FROM payments WHERE user_id = 60001 AND course_id = 1');
    console.log('payments for user 60001 course 1:');
    console.log(pay);

    process.exit(0);
}

test();
