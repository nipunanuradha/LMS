import React, { useState } from "react";
import { Avatar, StatusBadge } from "../components/ui/Primitives";
import { Ic } from "../components/ui/icons";
import { DISTRICTS } from "../data/mockData";

export default function StudentsPage({ students, setStudents, setModal }) {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = students.filter(s => {
    const matchSearch = (s.full_name || "").toLowerCase().includes(search.toLowerCase()) || String(s.id).toLowerCase().includes(search.toLowerCase());
    const matchDist = district === "All Districts" || s.district === district;
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchDist && matchStatus;
  });
  const deleteStudent = id => setStudents(prev => prev.filter(s=>s.id!==id));
  return (
    <div style={{ animation: "fadeIn 0.25s ease", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Student Management</h2>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{filtered.length} students found</p>
        </div>
        <button onClick={() => setModal("addStudent")} className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s" }}>
          {Ic.plus(14)} Add Student
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
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#F8FAFC", cursor: "pointer" }}>
          {["All", "Active", "Expired"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["ID", "Student", "Phone", "District", "Status", "Joined", "Actions"].map(h => (
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
                    <Avatar initials={s.full_name ? s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "S"} size={34} bg={s.color || "#2563EB"} />
                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>{s.full_name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{s.phone_number}</td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{s.district}</td>
                <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}><StatusBadge status={s.status || "Active"} /></td>
                <td style={{ padding: "13px 16px", fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>{new Date(s.created_at).toLocaleDateString()}</td>
                <td style={{ padding:"13px 16px", borderBottom:i<filtered.length-1?"1px solid #F8FAFC":"none" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => setModal({type:"resetPw",student:s})} className="btn-warning"
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:7, border:"1.5px solid #FDE68A", background:"#FFFBEB", color:"#92400E", cursor:"pointer", fontSize:12, fontWeight:500, transition:"all 0.15s" }}>
                      {Ic.key()} Reset PW
                    </button>
                    <button onClick={() => setModal({type:"enroll",student:s})} className="btn-success"
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:7, border:"1.5px solid #A7F3D0", background:"#F0FDF4", color:"#065F46", cursor:"pointer", fontSize:12, fontWeight:500, transition:"all 0.15s" }}>
                      {Ic.plus(12)} Enroll
                    </button>
                    <button onClick={() => deleteStudent(s.id)} className="btn-danger"
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 10px", borderRadius:7, border:"1.5px solid #FECACA", background:"#FEF2F2", color:"#991B1B", cursor:"pointer", fontSize:12, fontWeight:500, transition:"all 0.15s" }}>
                      {Ic.trash()}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding:"48px", textAlign:"center", color:"#94A3B8", fontSize:14 }}>No students found matching your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}