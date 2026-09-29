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

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

async function run() {
    const pool = await mysql.createPool(dbConfig);
    const [courses] = await pool.query('SELECT id, title, price FROM courses');
    console.log(`Found ${courses.length} courses to setup months for.`);

    const currentYear = new Date().getFullYear();
    for (const c of courses) {
        const defaultPrice = parseFloat(c.price) || 0.00;
        for (let m = 1; m <= 12; m++) {
            const title = `${MONTH_NAMES[m - 1]} ${currentYear}`;
            await pool.execute(`
                INSERT INTO course_months (course_id, year, month_number, title, monthly_price, is_active)
                VALUES (?, ?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE title = VALUES(title), monthly_price = VALUES(monthly_price)
            `, [c.id, currentYear, m, title, defaultPrice]);
        }
    }

    const [count] = await pool.query('SELECT COUNT(*) as total FROM course_months');
    console.log(`course_months count is now: ${count[0].total}`);

    // Also assign existing course_content and video_recordings that have course_month_id = NULL to Month 1 (January)
    const [firstMonths] = await pool.query('SELECT id, course_id FROM course_months WHERE month_number = 1 AND year = ?', [currentYear]);
    for (const fm of firstMonths) {
        await pool.execute('UPDATE course_content SET course_month_id = ? WHERE course_id = ? AND course_month_id IS NULL', [fm.id, fm.course_id]);
        await pool.execute('UPDATE video_recordings SET course_month_id = ? WHERE course_id = ? AND course_month_id IS NULL', [fm.id, fm.course_id]);
    }
    console.log('Assigned existing content without months to Month 1.');

    await pool.end();
}

run().catch(console.error);
