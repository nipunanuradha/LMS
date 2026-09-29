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
    console.log('Courses count:', courses.length);
    console.log('Courses:', courses.map(c => ({
        id: c.id,
        title: c.title,
        expiry_date: c.expiry_date,
        has_purchased_month: c.has_purchased_month
    })));
    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
