// ─────────────────────────────────────────────────────────────────────────────
// src/pages/CoursesPage.jsx
// Course grid with SVG thumbnails, student count badges, edit and delete actions.
// ─────────────────────────────────────────────────────────────────────────────

import { CategoryBadge } from "../../../component/ui/Primitives";
import { Ic } from "../../../component/ui/icons";
import { deleteCourse as apiDeleteCourse } from "../../../../api/api";

// ── Course Thumbnail (SVG geometric pattern) ────────────────────────────────
function CourseThumbnail({ course }) {
    const PATTERNS = {
        "#2563EB": <><circle cx="140" cy="50" r="60" fill="rgba(255,255,255,0.06)" /><circle cx="40" cy="90" r="40" fill="rgba(255,255,255,0.04)" /><rect x="160" y="10" width="80" height="80" rx="8" fill="rgba(255,255,255,0.05)" transform="rotate(20 200 50)" /></>,
        "#059669": <><circle cx="20" cy="20" r="50" fill="rgba(255,255,255,0.06)" /><rect x="100" y="30" width="100" height="60" rx="30" fill="rgba(255,255,255,0.05)" /></>,
        "#7C3AED": <><polygon points="180,0 240,90 120,90" fill="rgba(255,255,255,0.07)" /><circle cx="30" cy="80" r="45" fill="rgba(255,255,255,0.05)" /></>,
        "#D97706": <><rect x="120" y="-10" width="100" height="100" rx="12" fill="rgba(255,255,255,0.06)" transform="rotate(35 170 40)" /><circle cx="20" cy="70" r="35" fill="rgba(255,255,255,0.05)" /></>,
        "#DC2626": <><circle cx="220" cy="0" r="70" fill="rgba(255,255,255,0.06)" /><rect x="0" y="50" width="80" height="40" rx="8" fill="rgba(255,255,255,0.05)" /></>,
        "#0891B2": <><circle cx="200" cy="90" r="55" fill="rgba(255,255,255,0.06)" /><circle cx="40" cy="10" r="30" fill="rgba(255,255,255,0.05)" /></>,
    };

    return (
        <div className="course-thumbnail" style={{ background: course.accent }}>
            <svg width="100%" height="100%" viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice">
                <rect width="240" height="135" fill={course.accent} />
                {PATTERNS[course.accent]}
                <text x="16" y="72" fontSize="28" fontWeight="700" fill="rgba(255,255,255,0.15)" fontFamily="DM Sans, sans-serif">
                    {course.category}
                </text>
            </svg>
            <div style={{ position: "absolute", top: 10, left: 10 }}>
                <CategoryBadge cat={course.category} accent="#fff" />
            </div>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function CoursesPage({ courses, setCourses, setModal }) {

    const handleDelete = async (id) => {
        try {
            await apiDeleteCourse(id);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="page-enter flex-col gap-20">

            {/* ── Page Header ── */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Course Management</h2>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{courses.length} courses available</p>
                </div>
                <button onClick={() => setModal("createCourse")} className="btn btn--primary">
                    {Ic.plus(14)} New Course
                </button>
            </div>

            {/* ── Course Grid ── */}
            <div className="course-grid">
                {courses.map(course => (
                    <div key={course.id} className="card course-card flex-col overflow-hidden">

                        {/* 16:9 Thumbnail */}
                        <CourseThumbnail course={course} />

                        {/* Card Body */}
                        <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>

                            {/* Title + Category */}
                            <div className="flex justify-between items-center gap-8" style={{ marginBottom: 8 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, flex: 1 }}>
                                    {course.title}
                                </h3>
                                <CategoryBadge cat={course.category} accent={course.accent} />
                            </div>

                            {/* Description (truncated to 2 lines) */}
                            <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {course.desc}
                            </p>

                            {/* Footer: student count + actions */}
                            <div className="flex justify-between items-center" style={{ marginTop: 14, paddingTop: 14, borderTop: "1.5px solid #F8FAFC" }}>

                                {/* Student count */}
                                <div className="flex items-center gap-6" style={{ color: "#64748B", fontSize: 13 }}>
                                    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke={course.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                    </svg>
                                    <span style={{ fontWeight: 600, color: course.accent }}>{course.students}</span>
                                    <span style={{ color: "#94A3B8" }}>students</span>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-6">
                                    <button
                                        onClick={() => setModal({ type: "editCourse", course })}
                                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#334155", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#F1F5F9"}
                                        onMouseLeave={e => e.currentTarget.style.background = "#F8FAFC"}
                                    >
                                        {Ic.edit(13)} Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="btn btn--danger-subtle"
                                        style={{ padding: "6px 10px" }}
                                    >
                                        {Ic.trash()}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}