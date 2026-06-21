import React, { useState } from "react";
import { Avatar, StatusBadge } from "../components/ui/Primitives";
import { Ic } from "../components/ui/icons";
import { DISTRICTS } from "../data/mockData";
import { API_URL } from "../config";

export default function StudentsPage({ students, setStudents, setModal, globalSearch, setGlobalSearch }) {
  const [localSearch, setLocalSearch] = useState("");
  const search = globalSearch !== undefined ? globalSearch : localSearch;
  const setSearch = setGlobalSearch !== undefined ? setGlobalSearch : setLocalSearch;

  const [district, setDistrict] = useState("All Districts");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All Roles");

  const filtered = students.filter(s => {
    const matchSearch = (s.full_name || "").toLowerCase().includes(search.toLowerCase()) || String(s.id).toLowerCase().includes(search.toLowerCase());
    const matchDist = district === "All Districts" || s.district === district;
    const matchStatus = statusFilter === "All" || (s.status || "Active") === statusFilter;
    const matchRole = roleFilter === "All Roles" || (s.role || "student").toLowerCase() === roleFilter.toLowerCase();
    return matchSearch && matchDist && matchStatus && matchRole;
  });

  const deleteStudent = async id => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setStudents(prev => prev.filter(s => s.id !== id));
        } else {
          alert("Failed to delete user");
        }
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Connection error. Failed to delete user.");
      }
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.25s ease", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>User & Account Management</h2>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{filtered.length} users found</p>
        </div>
        <button onClick={() => setModal("addStudent")} className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s" }}>
          {Ic.plus(14)} Add Student / Admin
        </button>
      </div>
      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>{Ic.search()}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…"
            style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFC", transition: "all 0.2s" }} />
        </div>
        <select value={district} onChange={e => setDistrict(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#F8FAFC", cursor: "pointer", minWidth: 160 }}>
          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#F8FAFC", cursor: "pointer" }}>
          {["All Roles", "Student", "Admin"].map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#F8FAFC", cursor: "pointer" }}>
          {["All", "Active", "Expired"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      {/* Table */}
      <div className="responsive-table-container" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["ID", "User", "Phone", "District", "Role", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.5px", borderBottom: "1.5px solid #F1F5F9", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="table-row">
                <td style={{ padding: "13px 16px", fontSize: 12, fontWeight: 600, color: "#94A3B8", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{s.id}</td>
                <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={s.full_name ? s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"} size={34} bg={s.role === 'admin' ? "#7C3AED" : (s.color || "#2563EB")} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>{s.full_name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{s.phone_number}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{s.district}</td>
                <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <span style={{ padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "uppercase", background: s.role === 'admin' ? "#F3E8FF" : "#E0F2FE", color: s.role === 'admin' ? "#6B21A8" : "#0369A1" }}>
                    {s.role || "student"}
                  </span>
                </td>
                <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}><StatusBadge status={s.status || "Active"} /></td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setModal({ type: "resetPw", student: s })} className="btn-warning"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1.5px solid #FDE68A", background: "#FFFBEB", color: "#92400E", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}>
                      {Ic.key()} Reset PW
                    </button>
                    {(!s.role || s.role === "student") && (
                      <button onClick={() => setModal({ type: "enroll", student: s })} className="btn-success"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1.5px solid #A7F3D0", background: "#F0FDF4", color: "#065F46", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}>
                        {Ic.plus(12)} Enroll
                      </button>
                    )}
                    <button onClick={() => deleteStudent(s.id)} className="btn-danger"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#991B1B", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}>
                      {Ic.trash()}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>No users found matching your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}