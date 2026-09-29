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
    const userId = 60001; // Anuradha Athukorala
    console.log(`Checking enrollments for userId=${userId} (type: ${typeof userId})`);

    const [enr1] = await pool.execute('SELECT * FROM enrollments WHERE user_id = ?', [userId]);
    console.log('Execute with number 60001:', enr1);

    const [enr2] = await pool.execute('SELECT * FROM enrollments WHERE user_id = ?', [String(userId)]);
    console.log('Execute with string "60001":', enr2);

    const [enr3] = await pool.query(`
        SELECT e.id as enrollment_id, e.user_id, e.course_id, e.amount_paid, e.payment_status, e.expiry_date, e.created_at,
               c.title as course_title, c.course_category, c.price, c.offer_price
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ${userId}
    `);
    console.log('Query with JOIN:', enr3);

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
