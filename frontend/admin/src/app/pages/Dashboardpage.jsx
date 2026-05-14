// ─────────────────────────────────────────────────────────────────────────────
// src/pages/DashboardPage.jsx
// Main overview: animated KPI cards, quick actions, recent activity, top courses.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { Avatar, StatusBadge } from "../components/ui/Primitives";
import { Ic } from "../components/ui/Icons";

// ── Animated KPI Card ──────────────────────────────────────────────────────────
function KPICard({ label, target, icon, accent }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1400;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target]);

    return (
        <div className="card kpi-card" style={{ padding: "22px 24px", flex: 1 }}>
            <div className="flex justify-between" style={{ alignItems: "flex-start" }}>
                <div>
                    <div className="kpi-card__label">{label}</div>
                    <div className="kpi-card__value">{count.toLocaleString()}</div>
                    <div className="kpi-card__trend">
                        <span style={{ color: "#10B981", display: "flex" }}>{Ic.trend()}</span>
                        +12.5% this month
                    </div>
                </div>
                <div
                    className="kpi-card__icon-wrap"
                    style={{ background: `${accent}18`, color: accent }}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardPage({ students, courses, setModal }) {
    const activeStudents = students.filter(s => s.status === "Active").length;
    const totalEnrollments = courses.reduce((a, c) => a + c.students, 0);

    return (
        <div className="page-enter flex-col gap-24">

            {/* ── KPI Row ── */}
            <div className="kpi-grid">
                <KPICard
                    label="Total Students"
                    target={students.length}
                    accent="#2563EB"
                    icon={
                        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    }
                />
                <KPICard
                    label="Active Courses"
                    target={courses.length}
                    accent="#059669"
                    icon={
                        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                    }
                />
                <KPICard
                    label="Live Enrollments"
                    target={totalEnrollments}
                    accent="#7C3AED"
                    icon={
                        <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    }
                />
            </div>

            {/* ── Quick Actions ── */}
            <div className="flex gap-12">
                <button
                    onClick={() => setModal("addStudent")}
                    className="btn btn--primary btn--action"
                >
                    {Ic.plus(16)} Add New Student
                </button>
                <button
                    onClick={() => setModal("createCourse")}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: "#fff", color: "#2563EB", border: "2px solid #DBEAFE", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s" }}
                >
                    {Ic.book()} Create Course
                </button>
            </div>

            {/* ── Main Grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

                {/* Recent Activity */}
                <div className="card overflow-hidden">
                    <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Recent Activity</h3>
                            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Latest students who joined</p>
                        </div>
                        <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 500, cursor: "pointer" }}>View All</span>
                    </div>

                    {students.slice(0, 5).map((s, i) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: i < 4 ? "1px solid #F8FAFC" : "none" }}>
                            <Avatar initials={s.initials} size={40} bg={s.color} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>{s.district} · {s.joined}</div>
                            </div>
                            <StatusBadge status={s.status} />
                        </div>
                    ))}
                </div>

                {/* Right column */}
                <div className="flex-col gap-16">

                    {/* Top Courses */}
                    <div className="card overflow-hidden">
                        <div style={{ padding: "18px 20px", borderBottom: "1.5px solid #F8FAFC" }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>Top Courses</h3>
                        </div>
                        {courses.slice(0, 4).map((c, i) => (
                            <div key={c.id} style={{ padding: "12px 20px", borderBottom: i < 3 ? "1px solid #F8FAFC" : "none", display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.accent, flexShrink: 0 }} />
                                <div style={{ flex: 1, overflow: "hidden" }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                                    <div style={{ width: "100%", height: 4, background: "#F1F5F9", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                                        <div style={{ width: `${(c.students / 125) * 100}%`, height: "100%", background: c.accent, borderRadius: 2 }} />
                                    </div>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B", flexShrink: 0 }}>{c.students}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stat mini-cards */}
                    <div className="stat-mini-grid">
                        {[
                            { label: "Active Students", val: activeStudents, bg: "#DCFCE7", text: "#15803D" },
                            { label: "Expired", val: students.length - activeStudents, bg: "#FEE2E2", text: "#B91C1C" },
                            { label: "This Month", val: 3, bg: "#DBEAFE", text: "#1D4ED8" },
                            { label: "Avg. Per Course", val: Math.round(totalEnrollments / courses.length), bg: "#EDE9FE", text: "#6D28D9" },
                        ].map(card => (
                            <div key={card.label} className="stat-mini-card" style={{ background: card.bg }}>
                                <div className="stat-mini-card__val" style={{ color: card.text }}>{card.val}</div>
                                <div className="stat-mini-card__label" style={{ color: card.text }}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}