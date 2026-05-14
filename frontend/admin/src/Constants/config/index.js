// ─────────────────────────────────────────────────────────────────────────────
// src/constants/index.js
// App-wide constants: districts list, nav items, category options.
// ─────────────────────────────────────────────────────────────────────────────

export const DISTRICTS = [
    "All Districts",
    "Colombo",
    "Gampaha",
    "Kandy",
    "Galle",
    "Matara",
    "Negombo",
];

export const COURSE_CATEGORIES = [
    "Web Dev",
    "Data Science",
    "Design",
    "Backend",
    "Mobile",
    "Cloud",
];

export const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "students", label: "Students" },
    { id: "courses", label: "Courses" },
    { id: "revenue", label: "Revenue" },
    { id: "settings", label: "Settings" },
];

export const PAGE_NAMES = {
    dashboard: "Dashboard",
    students: "Student Management",
    courses: "Course Management",
    revenue: "Revenue & Enrollments",
    settings: "Settings",
};