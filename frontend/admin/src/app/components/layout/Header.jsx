import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "../ui/Primitives";
import { Ic } from "../ui/icons";

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
      const res = await fetch("http://localhost:5000/api/admin/notifications/clear", {
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
    <header style={{ height: 64, background: "#fff", borderBottom: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0, zIndex: 40, position: "relative" }}>
      <button onClick={() => setSidebarOpen(o => !o)} className="btn-ghost"
        style={{ border: "none", background: "none", cursor: "pointer", padding: "8px", borderRadius: 8, color: "#64748B", display: "flex", transition: "all 0.15s" }}>
        {Ic.menu()}
      </button>
      {/* Search */}
      <div ref={searchContainerRef} style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>{Ic.search()}</span>
        <input 
          value={searchVal} 
          onChange={e => {
            onSearch(e.target.value);
            setDropdownOpen(true);
          }} 
          onFocus={() => setDropdownOpen(true)}
          placeholder="Search students, courses..."
          style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A", background: "#F8FAFC", transition: "all 0.2s" }} 
        />

        {/* Global Search Dropdown */}
        {dropdownOpen && searchVal.trim() && (
          <div style={{ 
            position: "absolute", 
            left: 0, 
            right: 0, 
            top: "calc(100% + 8px)", 
            background: "#fff", 
            borderRadius: 12, 
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)", 
            border: "1.5px solid #E2E8F0", 
            zIndex: 300, 
            maxHeight: 380, 
            overflowY: "auto", 
            animation: "fadeIn 0.15s ease",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Students Section */}
            <div style={{ padding: "10px 14px 4px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Students / Admins</div>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: "8px 16px", fontSize: 13, color: "#94A3B8" }}>No users found</div>
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
                }} className="btn-ghost"
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.role === 'admin' ? "#7C3AED" : (s.color || "#2563EB"), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>
                      {s.full_name ? s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{s.full_name}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>ID: {s.id} · {s.district || "No District"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setModal({ type: "resetPw", student: s }); setDropdownOpen(false); }} 
                      style={{ border: "1.5px solid #FDE68A", background: "#FFFBEB", color: "#92400E", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                      PW
                    </button>
                    {(!s.role || s.role === "student") && (
                      <button onClick={() => { setModal({ type: "enroll", student: s }); setDropdownOpen(false); }} 
                        style={{ border: "1.5px solid #A7F3D0", background: "#F0FDF4", color: "#065F46", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}

            <div style={{ height: "1.5px", background: "#F1F5F9", margin: "6px 0" }} />

            {/* Courses Section */}
            <div style={{ padding: "4px 14px 4px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>Courses</div>
            {filteredCourses.length === 0 ? (
              <div style={{ padding: "8px 16px", fontSize: 13, color: "#94A3B8" }}>No courses found</div>
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
                }} className="btn-ghost"
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#0F172A" }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.category || "Web Dev"} · {c.students || 0} students</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { setModal({ type: "manageContent", course: c }); setDropdownOpen(false); }} 
                      style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#2563EB", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
                      Content
                    </button>
                    <button onClick={() => { setModal({ type: "editCourse", course: c }); setDropdownOpen(false); }} 
                      style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#334155", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}>
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
      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowNotif(n => !n); setShowProfile(false); }} className="btn-ghost"
          style={{ border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", padding: 9, borderRadius: 10, color: "#64748B", display: "flex", alignItems: "center", transition: "all 0.15s", position: "relative" }}>
          {Ic.bell()}
          {notifications.length > 0 && (
            <span style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
              {notifications.length}
            </span>
          )}
        </button>
        {showNotif && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 300, background: "#fff", borderRadius: 12, boxShadow: "0 10px 40px rgba(0,0,0,0.12)", border: "1.5px solid #F1F5F9", zIndex: 200, animation: "fadeIn 0.15s ease" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1.5px solid #F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Notifications</span>
              <span onClick={clearAllNotifications} style={{ fontSize: 11, color: "#2563EB", fontWeight: 500, cursor: "pointer" }}>Mark all read</span>
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "20px 16px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No new notifications</div>
              ) : (
                notifications.map((n, i) => {
                  let dot = "#2563EB";
                  if (n.type === "warning") dot = "#D97706";
                  else if (n.type === "course") dot = "#059669";
                  else if (n.type === "enroll") dot = "#2563EB";

                  const timeString = (() => {
                    const diffMs = new Date() - new Date(n.created_at);
                    const diffMins = Math.floor(diffMs / 60000);
                    if (diffMins < 1) return "Just now";
                    if (diffMins < 60) return `${diffMins}m ago`;
                    const diffHrs = Math.floor(diffMins / 60);
                    if (diffHrs < 24) return `${diffHrs}h ago`;
                    return new Date(n.created_at).toLocaleDateString();
                  })();

                  return (
                    <div key={n.id} style={{ padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", borderBottom: i < notifications.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, marginTop: 5, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, color: "#334155" }}>{n.message}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{timeString}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {/* Profile */}
      <div style={{ position: "relative" }}>
        <button onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px 6px 6px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", transition: "all 0.15s" }}>
          <Avatar initials={initials} size={32} bg="#2563EB" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{name}</div>
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
                    localStorage.removeItem("admin_isLoggedIn");
                    localStorage.removeItem("token");
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
