// ─────────────────────────────────────────────────────────────────────────────
// src/api/api.js
// Centralised API layer for NEXTERA LMS Admin.
//
// HOW TO USE:
//   • All functions return Promises.
//   • Mock mode: set USE_MOCK = true  → runs against mockData (no backend needed)
//   • Live mode:  set USE_MOCK = false → hits BASE_URL endpoints
//
// BACKEND CONTRACT (CodeIgniter 4 / any REST API):
//   Every JSON response must follow the envelope:
//     { success: true, data: <payload>, message: "" }
//   or on error:
//     { success: false, data: null,     message: "Reason" }
// ─────────────────────────────────────────────────────────────────────────────

import { STUDENTS_INIT, COURSES_INIT, REVENUE_DATA } from "../data/mockData";

// ── Config ────────────────────────────────────────────────────────────────────
const USE_MOCK = true; // ← flip to false when real backend is ready
const BASE_URL = "https://api.anuradhaathukorala.site/api"; // ← your CI4 API root

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fake network delay for mock mode so loading states are visible. */
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

/**
 * Wraps fetch with auth header injection and unified error handling.
 * @param {string} path   - relative path, e.g. "/students"
 * @param {object} opts   - fetch options (method, body, etc.)
 */
async function request(path, opts = {}) {
    const token = localStorage.getItem("lms_token");
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...opts,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || "API error");
    }

    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Unknown API error");
    return json.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login admin user.
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, admin: object }}
 */
export async function login(credentials) {
    if (USE_MOCK) {
        await delay(400);
        return { token: "mock_token_admin", admin: { name: "Admin User", role: "super_admin" } };
    }
    return request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}

/**
 * Logout current admin session.
 */
export async function logout() {
    if (USE_MOCK) { await delay(200); localStorage.removeItem("lms_token"); return; }
    await request("/auth/logout", { method: "POST" });
    localStorage.removeItem("lms_token");
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all students (optionally filtered).
 * @param {{ search?: string, district?: string, status?: string }} params
 * @returns {Student[]}
 */
export async function getStudents(params = {}) {
    if (USE_MOCK) {
        await delay(300);
        let result = [...STUDENTS_INIT];
        if (params.search) result = result.filter(s => s.name.toLowerCase().includes(params.search.toLowerCase()) || s.id.toLowerCase().includes(params.search.toLowerCase()));
        if (params.district && params.district !== "All Districts") result = result.filter(s => s.district === params.district);
        if (params.status && params.status !== "All") result = result.filter(s => s.status === params.status);
        return result;
    }
    const qs = new URLSearchParams(params).toString();
    return request(`/students?${qs}`);
}

/**
 * Fetch a single student by ID.
 * @param {string} id
 * @returns {Student}
 */
export async function getStudent(id) {
    if (USE_MOCK) { await delay(200); return STUDENTS_INIT.find(s => s.id === id) || null; }
    return request(`/students/${id}`);
}

/**
 * Create a new student.
 * @param {{ name: string, phone: string, district: string, status: string }} payload
 * @returns {Student}
 */
export async function createStudent(payload) {
    if (USE_MOCK) {
        await delay(400);
        return { id: `S${String(Date.now()).slice(-3)}`, ...payload, initials: payload.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(), joined: new Date().toISOString().slice(0, 10), color: "#2563EB" };
    }
    return request("/students", { method: "POST", body: JSON.stringify(payload) });
}

/**
 * Update an existing student.
 * @param {string} id
 * @param {Partial<Student>} payload
 * @returns {Student}
 */
export async function updateStudent(id, payload) {
    if (USE_MOCK) { await delay(300); return { ...STUDENTS_INIT.find(s => s.id === id), ...payload }; }
    return request(`/students/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

/**
 * Delete a student account permanently.
 * @param {string} id
 */
export async function deleteStudent(id) {
    if (USE_MOCK) { await delay(300); return { deleted: id }; }
    return request(`/students/${id}`, { method: "DELETE" });
}

/**
 * Reset a student's password.
 * @param {string} id
 * @param {{ password: string, passwordConfirm: string }} payload
 */
export async function resetStudentPassword(id, payload) {
    if (USE_MOCK) { await delay(500); return { success: true }; }
    return request(`/students/${id}/reset-password`, { method: "POST", body: JSON.stringify(payload) });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENROLLMENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enroll a student into a course.
 * @param {{ studentId: string, courseId: string, expiryDate: string }} payload
 */
export async function enrollStudent(payload) {
    if (USE_MOCK) { await delay(400); return { enrolled: true, ...payload }; }
    return request("/enrollments", { method: "POST", body: JSON.stringify(payload) });
}

/**
 * Get enrollments for a student.
 * @param {string} studentId
 */
export async function getStudentEnrollments(studentId) {
    if (USE_MOCK) { await delay(250); return []; }
    return request(`/enrollments?studentId=${studentId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all courses.
 * @returns {Course[]}
 */
export async function getCourses() {
    if (USE_MOCK) { await delay(300); return [...COURSES_INIT]; }
    return request("/courses");
}

/**
 * Create a new course.
 * @param {{ title: string, desc: string, category: string }} payload
 * @returns {Course}
 */
export async function createCourse(payload) {
    if (USE_MOCK) {
        await delay(400);
        return { id: `C${String(Date.now()).slice(-3)}`, students: 0, accent: "#2563EB", ...payload };
    }
    return request("/courses", { method: "POST", body: JSON.stringify(payload) });
}

/**
 * Update course details (title, desc, category).
 * @param {string} id
 * @param {Partial<Course>} payload
 */
export async function updateCourse(id, payload) {
    if (USE_MOCK) { await delay(300); return { ...COURSES_INIT.find(c => c.id === id), ...payload }; }
    return request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

/**
 * Upload a course thumbnail image.
 * @param {string} courseId
 * @param {File} file
 * @returns {{ thumbnailUrl: string }}
 */
export async function uploadCourseThumbnail(courseId, file) {
    if (USE_MOCK) { await delay(800); return { thumbnailUrl: URL.createObjectURL(file) }; }
    const form = new FormData();
    form.append("thumbnail", file);
    const token = localStorage.getItem("lms_token");
    const res = await fetch(`${BASE_URL}/courses/${courseId}/thumbnail`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Delete a course permanently.
 * @param {string} id
 */
export async function deleteCourse(id) {
    if (USE_MOCK) { await delay(300); return { deleted: id }; }
    return request(`/courses/${id}`, { method: "DELETE" });
}

// ─────────────────────────────────────────────────────────────────────────────
// REVENUE & ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch monthly revenue and enrollment stats.
 * @param {{ year?: number }} params
 * @returns {{ month: string, revenue: number, enrollments: number }[]}
 */
export async function getRevenueStats(params = {}) {
    if (USE_MOCK) { await delay(350); return [...REVENUE_DATA]; }
    const qs = new URLSearchParams(params).toString();
    return request(`/analytics/revenue?${qs}`);
}

/**
 * Fetch high-level dashboard KPIs.
 * @returns {{ totalStudents: number, activeCourses: number, totalEnrollments: number }}
 */
export async function getDashboardKPIs() {
    if (USE_MOCK) {
        await delay(300);
        return {
            totalStudents: STUDENTS_INIT.length,
            activeCourses: COURSES_INIT.length,
            totalEnrollments: COURSES_INIT.reduce((a, c) => a + c.students, 0),
        };
    }
    return request("/analytics/kpis");
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch platform settings.
 * @returns {{ siteName: string, email: string, phone: string, url: string, notifications: object }}
 */
export async function getSettings() {
    if (USE_MOCK) {
        await delay(200);
        return { siteName: "NEXTERA LMS", email: "admin@nextera.lk", phone: "", url: "https://nextera.anuradhaathukorala.site", notifications: { email: true, sms: false, maintenance: false } };
    }
    return request("/settings");
}

/**
 * Save platform settings.
 * @param {object} payload
 */
export async function saveSettings(payload) {
    if (USE_MOCK) { await delay(500); return payload; }
    return request("/settings", { method: "PUT", body: JSON.stringify(payload) });
}