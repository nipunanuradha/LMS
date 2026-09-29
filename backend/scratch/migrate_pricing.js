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

async function run() {
    const pool = await mysql.createPool(dbConfig);
    console.log('Connected to TiDB!');

    try {
        await pool.execute('ALTER TABLE courses ADD COLUMN offer_price DECIMAL(10, 2) DEFAULT NULL');
        console.log('Added offer_price to courses table');
    } catch(e) {
        console.log('offer_price notice:', e.message);
    }

    try {
        await pool.execute('ALTER TABLE courses ADD COLUMN discount_badge VARCHAR(100) DEFAULT NULL');
        console.log('Added discount_badge to courses table');
    } catch(e) {
        console.log('discount_badge notice:', e.message);
    }

    try {
        await pool.execute('ALTER TABLE course_months ADD COLUMN is_custom_price TINYINT(1) DEFAULT 0');
        console.log('Added is_custom_price to course_months table');
    } catch(e) {
        console.log('is_custom_price notice:', e.message);
    }

    const [columns] = await pool.query('DESCRIBE courses');
    console.log('Courses columns:', columns.map(c => c.Field));

    const [cmColumns] = await pool.query('DESCRIBE course_months');
    console.log('course_months columns:', cmColumns.map(c => c.Field));

    await pool.end();
}

run().catch(console.error);
