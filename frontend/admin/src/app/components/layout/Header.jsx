import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "../ui/Primitives";
import { Ic } from "../ui/icons";
import ThemeToggle from "./ThemeToggle";
import { API_URL, LANDING_URL } from "../../config";

export default function Header({ sidebarOpen, setSidebarOpen, notifications = [], setNotifications, searchVal, onSearch, setPage, setModal, students = [], courses = [] }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = searchVal.trim()
    ? students.filter(s => 
        (s.full_name || "").toLowerCase().includes(searchVal.toLowerCase()) || 
        String(s.id).toLowerCase().includes(searchVal.toLowerCase()) ||
        (s.phone_number || "").includes(searchVal)
      ).slice(0, 5)
    : [];

  const filteredCourses = searchVal.trim()
    ? courses.filter(c =>
        (c.title || "").toLowerCase().includes(searchVal.toLowerCase()) ||
        (c.category || "").toLowerCase().includes(searchVal.toLowerCase()) ||
        (c.description || c.desc || "").toLowerCase().includes(searchVal.toLowerCase())
      ).slice(0, 5)
    : [];

  const hasResults = filteredStudents.length > 0 || filteredCourses.length > 0;

  const handleStudentClick = (student) => {
    if (student.role === "admin") {
      setPage("admins");
    } else {
      setPage("students");
    }
    onSearch(student.full_name || student.name);
    setDropdownOpen(false);
  };

  const handleCourseClick = (course) => {
    setPage("courses");
    onSearch(course.title);
    setDropdownOpen(false);
  };

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "{}");
    } catch (e) {
      return {};
    }
  })();
  const name = currentUser.name || "Admin User";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

  const clearAllNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications/clear`, {
        method: "POST"
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header style={{ height: 64, background: "var(--bg-card)", borderBottom: "1.5px solid var(--border-color)", display: "flex", alignItems: "center", padding: "0 24px", gap: 14, flexShrink: 0, zIndex: 40, position: "relative", transition: "all 0.2s" }}>
      <button onClick={() => setSidebarOpen(o => !o)} className="btn-ghost"
        style={{ border: "none", background: "none", cursor: "pointer", padding: "8px", borderRadius: 8, color: "var(--text-secondary)", display: "flex", transition: "all 0.15s" }}>
        {Ic.menu()}
      </button>
      
      {/* Search */}
      <div ref={searchContainerRef} style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>{Ic.search()}</span>
        <input 
          value={searchVal} 
          onChange={e => {
            onSearch(e.target.value);
            setDropdownOpen(true);
          }} 
          onFocus={() => setDropdownOpen(true)}
          placeholder="Search students, courses..."
          style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 10, border: "1.5px solid var(--border-subtle)", fontSize: 14, color: "var(--text-primary)", background: "var(--input-bg)", transition: "all 0.2s" }} 
        />

        {/* Global Search Dropdown */}
        {dropdownOpen && searchVal.trim() && (
          <div style={{ 
            position: "absolute", 
            left: 0, 
            right: 0, 
            top: "calc(100% + 8px)", 
            background: "var(--bg-card)", 
            borderRadius: 12, 
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)", 
            border: "1.5px solid var(--border-subtle)", 
            zIndex: 300, 
            maxHeight: 380, 
            overflowY: "auto", 
            animation: "fadeIn 0.15s ease",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Students Section */}
            <div style={{ padding: "10px 14px 4px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Students / Admins</div>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: "8px 16px", fontSize: 13, color: "var(--text-muted)" }}>No users found</div>
            ) : (
              filteredStudents.map(s => (
                <div key={s.id} onClick={() => handleStudentClick(s)} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "8px 12px", 
                  cursor: "pointer", 
                  borderRadius: 8, 
                  margin: "2px 6px",
                  transition: "background 0.15s",
                  background: "transparent"
                }} className="table-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.role === 'admin' ? "#7C3AED" : (s.color || "#2563EB"), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                      {s.full_name ? s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{s.full_name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.role === 'admin' ? 'Admin' : 'Student'} · ID: {s.id}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: s.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: s.status === 'Active' ? '#22C55E' : '#EF4444' }}>
                    {s.status || 'Active'}
                  </span>
                </div>
              ))
            )}

            {/* Courses Section */}
            <div style={{ padding: "10px 14px 4px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", borderTop: "1px solid var(--border-color)" }}>Courses</div>
            {filteredCourses.length === 0 ? (
              <div style={{ padding: "8px 16px", fontSize: 13, color: "var(--text-muted)" }}>No courses found</div>
            ) : (
              filteredCourses.map(c => (
                <div key={c.id} onClick={() => handleCourseClick(c)} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  padding: "8px 12px", 
                  cursor: "pointer", 
                  borderRadius: 8, 
                  margin: "2px 6px",
                  transition: "background 0.15s",
                  background: "transparent"
                }} className="table-row">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.category || "Web Dev"} · {c.students || 0} students</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setModal({ type: "manageContent", course: c }); setDropdownOpen(false); }} 
                      style={{ border: "1.5px solid var(--border-subtle)", background: "var(--input-bg)", color: "#2563EB", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                      Content
                    </button>
                    <button onClick={() => { setModal({ type: "editCourse", course: c }); setDropdownOpen(false); }} 
                      style={{ border: "1.5px solid var(--border-subtle)", background: "var(--input-bg)", color: "var(--text-secondary)", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      {/* Theme Switcher Toggle */}
      <ThemeToggle />

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowNotif(n => !n); setShowProfile(false); }} className="btn-ghost"
          style={{ border: "1.5px solid var(--border-subtle)", background: "var(--bg-card)", cursor: "pointer", padding: 9, borderRadius: 10, color: "var(--text-secondary)", display: "flex", alignItems: "center", transition: "all 0.15s", position: "relative" }}>
          {Ic.bell()}
          {notifications.length > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)" }}>
              {notifications.length}
            </span>
          )}
        </button>
        {showNotif && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: "var(--bg-card)", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", border: "1.5px solid var(--border-subtle)", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1.5px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Notifications</span>
              <span onClick={clearAllNotifications} style={{ fontSize: 11, color: "#2563EB", fontWeight: 500, cursor: "pointer" }}>Mark all read</span>
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No new notifications</div>
              ) : (
                notifications.map((n, i) => {
                  let dot = "#2563EB";
                  if (n.type === "warning") dot = "#D97706";
                  else if (n.type === "course") dot = "#059669";
                  else if (n.type === "enroll") dot = "#2563EB";

                  return (
                    <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{n.title || n.message}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{n.created_at ? new Date(n.created_at).toLocaleTimeString() : "Just now"}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowProfile(p => !p); setShowNotif(false); }} className="btn-ghost"
          style={{ border: "1.5px solid var(--border-subtle)", background: "var(--bg-card)", cursor: "pointer", padding: "6px 10px 6px 6px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
          <Avatar initials={initials} size={28} bg="#2563EB" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{name}</span>
          <span style={{ color: "var(--text-muted)" }}>{Ic.chevDown(12)}</span>
        </button>
        {showProfile && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "var(--bg-card)", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.2)", border: "1.5px solid var(--border-subtle)", zIndex: 200, animation: "fadeIn 0.15s ease", padding: 8 }}>
            {[
              { label: "My Profile", icon: Ic.users, onClick: () => setModal("profile") },
              { label: "Settings", icon: Ic.cog, onClick: () => setPage("settings") },
              {
                label: "Sign Out", icon: Ic.close, danger: true, onClick: () => {
                  if (window.confirm("Are you sure you want to sign out?")) {
                    localStorage.removeItem("currentUser");
                    localStorage.removeItem("admin_isLoggedIn");
                    localStorage.removeItem("token");
                    window.location.href = LANDING_URL;
                  }
                }
              },
            ].map((item, i) => (
              <button key={i} className={item.danger ? "btn-danger" : "btn-ghost"}
                onClick={() => { item.onClick(); setShowProfile(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left", fontSize: 13, color: item.danger ? "#DC2626" : "var(--text-primary)", transition: "all 0.15s" }}>
                <span style={{ color: item.danger ? "#DC2626" : "var(--text-secondary)" }}>{item.icon(14)}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
