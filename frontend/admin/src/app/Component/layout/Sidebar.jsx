// ─────────────────────────────────────────────────────────────────────────────
// src/components/layout/Sidebar.jsx
// Dark-themed collapsible sidebar with navigation links and user footer.
// ─────────────────────────────────────────────────────────────────────────────

import { Avatar } from "../../ui/Primitives";
import { Ic } from "../ui/Icons";
import { NAV_ITEMS } from "../../constants";

const NAV_ICONS = {
    dashboard: Ic.grid,
    students: Ic.users,
    courses: Ic.book,
    revenue: Ic.dollar,
    settings: Ic.cog,
};

export default function Sidebar({ page, setPage, open }) {
    return (
        <aside className={`sidebar ${open ? "sidebar--open" : "sidebar--closed"}`}>

            {/* ── Logo ── */}
            <div className="sidebar__logo-area">
                <div className="flex items-center gap-10">
                    <div className="sidebar__logo-badge">
                        <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none"
                            stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                    </div>
                    <div>
                        <div className="sidebar__brand-name">NEXTERA</div>
                        <div className="sidebar__brand-sub">LMS ADMIN</div>
                    </div>
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav className="sidebar__nav">
                <div className="sidebar__nav-label">NAVIGATION</div>

                {NAV_ITEMS.map(({ id, label }) => {
                    const active = page === id;
                    const Icon = NAV_ICONS[id];
                    return (
                        <button
                            key={id}
                            onClick={() => setPage(id)}
                            className={`nav-item ${active ? "nav-item--active" : ""}`}
                        >
                            <span style={{ color: active ? "#60A5FA" : "#64748B", flexShrink: 0 }}>
                                {Icon()}
                            </span>
                            {label}
                            {active && <span className="nav-item__dot" />}
                        </button>
                    );
                })}
            </nav>

            {/* ── Footer (logged-in user) ── */}
            <div className="sidebar__footer">
                <div className="flex items-center gap-10">
                    <Avatar initials="AD" size={34} bg="#1E40AF" />
                    <div style={{ overflow: "hidden" }}>
                        <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            Admin User
                        </div>
                        <div style={{ color: "#64748B", fontSize: 11 }}>Super Admin</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}