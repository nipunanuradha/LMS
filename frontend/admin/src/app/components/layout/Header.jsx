import React, { useState } from "react";
import { Avatar } from "../ui/Primitives";
import { Ic } from "../ui/icons";

export default function Header({ sidebarOpen, setSidebarOpen, notifCount, searchVal, onSearch, setPage, setModal }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header style={{ height: 64, background: "#fff", borderBottom: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0, zIndex: 40, position: "relative" }}>
      <button onClick={() => setSidebarOpen(o => !o)} className="btn-ghost"
        style={{ border: "none", background: "none", cursor: "pointer", padding: "8px", borderRadius: 8, color: "#64748B", display: "flex", transition: "all 0.15s" }}>
        {Ic.menu()}
      </button>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>{Ic.search()}</span>
        <input value={searchVal} onChange={e => onSearch(e.target.value)} placeholder="Search students, courses..."
          style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A", background: "#F8FAFC", transition: "all 0.2s" }} />
      </div>
      <div style={{ flex: 1 }} />
      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowNotif(n => !n); setShowProfile(false); }} className="btn-ghost"
          style={{ border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", padding: 9, borderRadius: 10, color: "#64748B", display: "flex", alignItems: "center", transition: "all 0.15s", position: "relative" }}>
          {Ic.bell()}
          {notifCount > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
              {notifCount}
            </span>
          )}
        </button>
        {showNotif && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: "#fff", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.12)", border: "1.5px solid #F1F5F9", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1.5px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Notifications</span>
              <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 500, cursor: "pointer" }}>Mark all read</span>
            </div>
            {[
              { msg: "New student Amara Perera enrolled", time: "2m ago", dot: "#2563EB" },
              { msg: "Course 'React Dev' reached 125 students", time: "1h ago", dot: "#059669" },
              { msg: "Password reset requested by S003", time: "3h ago", dot: "#D97706" },
            ].map((n, i) => (
              <div key={i} style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", borderBottom: i < 2 ? "1px solid #F8FAFC" : "none" }}>
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
      {/* Profile */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px 6px 6px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", transition: "all 0.15s" }}>
          <Avatar initials="AD" size={32} bg="#2563EB" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Admin User</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Super Admin</div>
          </div>
          <span style={{ color: "#94A3B8", marginLeft: 4 }}>{Ic.chevDown()}</span>
        </button>
        {showProfile && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "#fff", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.12)", border: "1.5px solid #F1F5F9", zIndex: 200, animation: "fadeIn 0.15s ease", padding: 8 }}>
            {[
              { label: "My Profile", icon: Ic.users, onClick: () => setModal("profile") },
              { label: "Settings", icon: Ic.cog, onClick: () => setPage("settings") },
              {
                label: "Sign Out", icon: Ic.close, danger: true, onClick: () => {
                  if (window.confirm("Are you sure you want to sign out?")) {
                    localStorage.removeItem("currentUser");
                    window.location.reload();
                  }
                }
              },
            ].map((item, i) => (
              <button key={i} className={item.danger ? "btn-danger" : "btn-ghost"}
                onClick={() => { item.onClick(); setShowProfile(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 13, color: item.danger ? "#DC2626" : "#334155", transition: "all 0.15s" }}>
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
