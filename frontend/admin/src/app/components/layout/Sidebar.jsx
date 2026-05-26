import React from "react";
import { Avatar } from "../ui/Primitives";
import { Ic } from "../ui/icons";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Ic.grid },
  { id: "students", label: "Students", icon: Ic.users },
  { id: "admins", label: "Admins", icon: Ic.users },
  { id: "courses", label: "Courses", icon: Ic.book },
  { id: "revenue", label: "Revenue", icon: Ic.dollar },
  { id: "settings", label: "Settings", icon: Ic.cog },
];

export default function Sidebar({ page, setPage, open, onClose }) {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch (e) {
      return {};
    }
  })();
  const name = currentUser.name || "Admin User";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  return (
    <>
      {!open && null}
      <div style={{ width: open ? 240 : 0, minWidth: open ? 240 : 0, height: "100vh", background: "#0F172A", display: "flex", flexDirection: "column", overflow: "hidden", transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", flexShrink: 0, position: "relative", zIndex: 50 }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(to right, #2563EB, #4ADE80)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {Ic.cap(24)}
            </div>
            <div>
              <div style={{ color: "#F8FAFC", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>ICT Academy</div>
              <div style={{ color: "#64748B", fontSize: 11, fontWeight: 500, letterSpacing: "0.5px" }}>LMS ADMIN</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ color: "#475569", fontSize: 10, fontWeight: 600, letterSpacing: "1px", padding: "0 8px", marginBottom: 8 }}>NAVIGATION</div>
          {NAV.map(({ id, label, icon }) => {
            const active = page === id;
            return (
              <button key={id} onClick={() => setPage(id)}
                className={`nav-item ${active ? "active" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: active ? "rgba(37,99,235,0.2)" : "transparent", color: active ? "#93C5FD" : "#94A3B8", fontWeight: active ? 600 : 400, fontSize: 14, width: "100%", textAlign: "left", transition: "all 0.15s", whiteSpace: "nowrap" }}>
                <span style={{ color: active ? "#60A5FA" : "#64748B", flexShrink: 0 }}>{icon()}</span>
                {label}
                {active && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#3B82F6" }} />}
              </button>
            );
          })}
        </nav>
        {/* Bottom */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={initials} size={34} bg="#1E40AF" />
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#E2E8F0", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
              <div style={{ color: "#64748B", fontSize: 11 }}>Super Admin</div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile overlay */}
      {open && <div onClick={onClose} style={{ display: "none" }} />}
    </>
  );
}
