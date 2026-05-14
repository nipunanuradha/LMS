// ─────────────────────────────────────────────────────────────────────────────
// src/components/layout/Header.jsx
// Top app bar: hamburger toggle, global search, notifications, profile dropdown.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Avatar } from "../UI/Primitives";
import { Ic } from "../UI/icons";

const NOTIFICATIONS = [
    { msg: "New student Amara Perera enrolled", time: "2m ago", dot: "#2563EB" },
    { msg: "Course 'React Dev' reached 125 students", time: "1h ago", dot: "#059669" },
    { msg: "Password reset requested by S003", time: "3h ago", dot: "#D97706" },
];

export default function Header({ setSidebarOpen, notifCount, searchVal, onSearch }) {
    const [showNotif, setShowNotif] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const closeAll = () => { setShowNotif(false); setShowProfile(false); };

    return (
        <header className="header">

            {/* Hamburger */}
            <button
                onClick={() => setSidebarOpen(o => !o)}
                className="btn btn--icon"
                style={{ border: "none", background: "none" }}
                aria-label="Toggle sidebar"
            >
                {Ic.menu()}
            </button>

            {/* Global Search */}
            <div className="header__search-wrap">
                <span className="header__search-icon">{Ic.search()}</span>
                <input
                    className="header__search"
                    value={searchVal}
                    onChange={e => onSearch(e.target.value)}
                    placeholder="Search students, courses..."
                />
            </div>

            <div className="header__spacer" />

            {/* ── Notification Bell ── */}
            <div style={{ position: "relative" }}>
                <button
                    className="btn btn--icon"
                    onClick={() => { setShowNotif(n => !n); setShowProfile(false); }}
                    aria-label="Notifications"
                >
                    {Ic.bell()}
                    {notifCount > 0 && (
                        <span className="notif-badge">{notifCount}</span>
                    )}
                </button>

                {showNotif && (
                    <div className="dropdown-popup" style={{ width: 300 }}>
                        {/* Header row */}
                        <div style={{ padding: "14px 16px", borderBottom: "1.5px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Notifications</span>
                            <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 500, cursor: "pointer" }}>Mark all read</span>
                        </div>

                        {NOTIFICATIONS.map((n, i) => (
                            <div key={i} style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, marginTop: 5, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 13, color: "#334155" }}>{n.msg}</div>
                                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{n.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Profile Dropdown ── */}
            <div style={{ position: "relative" }}>
                <button
                    onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px 6px 6px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", transition: "all 0.15s" }}
                >
                    <Avatar initials="AD" size={32} bg="#2563EB" />
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Admin User</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>Super Admin</div>
                    </div>
                    <span style={{ color: "#94A3B8", marginLeft: 4 }}>{Ic.chevDown()}</span>
                </button>

                {showProfile && (
                    <div className="dropdown-popup" style={{ width: 200, padding: 8 }}>
                        {[
                            { label: "My Profile", icon: Ic.users },
                            { label: "Settings", icon: Ic.cog },
                            { label: "Sign Out", icon: Ic.close, danger: true },
                        ].map((item, i) => (
                            <button
                                key={i}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 13, color: item.danger ? "#DC2626" : "#334155", transition: "all 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = item.danger ? "#FEF2F2" : "#F1F5F9"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                <span style={{ color: item.danger ? "#DC2626" : "#64748B" }}>{item.icon(14)}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}