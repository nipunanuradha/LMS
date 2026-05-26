const mysql = require('mysql2/promise');
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

async function dump() {
    try {
        const pool = await mysql.createPool(dbConfig);
        const [rows] = await pool.execute('SELECT id, full_name, phone_number, role, password FROM users');
        console.log('USERS IN DB:');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
dump();
