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
    const userId = 60001;

    try {
        const [enrollments] = await pool.execute(`
            SELECT e.id as enrollment_id, e.user_id, e.course_id, e.amount_paid, e.payment_status, e.expiry_date, e.created_at,
                   c.title as course_title, c.course_category, c.price, c.offer_price
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.created_at DESC
        `, [userId]);

        console.log('Enrollments count:', enrollments.length);

        for (const enr of enrollments) {
            console.log('Testing for enr:', enr.enrollment_id, 'course:', enr.course_id);
            const [months] = await pool.execute(`
                SELECT cm.id as month_id, cm.month_number, cm.year, cm.title as month_title, cm.monthly_price,
                       ma.id as access_id, ma.status as access_status, ma.expiry_date as access_expiry
                FROM course_months cm
                LEFT JOIN month_access ma ON ma.course_month_id = cm.id AND ma.enrollment_id = ?
                WHERE cm.course_id = ?
                ORDER BY cm.month_number ASC
            `, [enr.enrollment_id, enr.course_id]);

            console.log(`Months for course ${enr.course_id}: ${months.length}`);
        }
        console.log('SUCCESS ALL DONE!');
    } catch (e) {
        console.error('ERROR OCCURRED:', e);
    }
    process.exit(0);
}

test();
