// ─────────────────────────────────────────────────────────────────────────────
// src/pages/StudentsPage.jsx
// Full CRUD student table: search, district/status filters, inline actions.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Avatar, StatusBadge } from "../Component/UI/Primitives";
import { Ic } from "../Component/UI/icons";
import { DISTRICTS } from "../../Constants/config";
import { deleteStudent as apiDeleteStudent } from "../api/api";

export default function StudentsPage({ students, setStudents, setModal }) {
    const [search, setSearch] = useState("");
    const [district, setDistrict] = useState("All Districts");
    const [statusFilter, setStatusFilter] = useState("All");

    // ── Filter logic ─────────────────────────────────────────────────────────────
    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        const matchSearch = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
        const matchDist = district === "All Districts" || s.district === district;
        const matchStatus = statusFilter === "All" || s.status === statusFilter;
        return matchSearch && matchDist && matchStatus;
    });

    // ── Delete handler ────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await apiDeleteStudent(id);
            setStudents(prev => prev.filter(s => s.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="page-enter flex-col gap-20">

            {/* ── Page Header ── */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Student Management</h2>
                    <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>{filtered.length} students found</p>
                </div>
                <button onClick={() => setModal("addStudent")} className="btn btn--primary">
                    {Ic.plus(14)} Add Student
                </button>
            </div>

            {/* ── Filter Bar ── */}
            <div className="filter-bar">
                {/* Search */}
                <div className="filter-bar__search-wrap">
                    <span className="filter-bar__search-icon">{Ic.search()}</span>
                    <input
                        className="filter-bar__input"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or ID…"
                    />
                </div>

                {/* District */}
                <select
                    className="filter-bar__select"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    style={{ minWidth: 160 }}
                >
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>

                {/* Status */}
                <select
                    className="filter-bar__select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    {["All", "Active", "Expired"].map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* ── Data Table ── */}
            <div className="card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            {["ID", "Student", "Phone", "District", "Status", "Joined", "Actions"].map(h => (
                                <th key={h}>{h.toUpperCase()}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((s, i) => (
                            <tr key={s.id}>
                                {/* ID */}
                                <td style={{ fontSize: 12, fontWeight: 600, color: "#94A3B8", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    {s.id}
                                </td>

                                {/* Name */}
                                <td style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    <div className="flex items-center gap-10">
                                        <Avatar initials={s.initials} size={34} bg={s.color} />
                                        <span style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>{s.name}</span>
                                    </div>
                                </td>

                                {/* Phone */}
                                <td style={{ fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    {s.phone}
                                </td>

                                {/* District */}
                                <td style={{ fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    {s.district}
                                </td>

                                {/* Status */}
                                <td style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    <StatusBadge status={s.status} />
                                </td>

                                {/* Joined */}
                                <td style={{ fontSize: 13, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    {s.joined}
                                </td>

                                {/* Actions */}
                                <td style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                                    <div className="flex gap-6">
                                        {/* Reset Password */}
                                        <button
                                            className="btn btn--warning-subtle"
                                            onClick={() => setModal({ type: "resetPw", student: s })}
                                        >
                                            {Ic.key()} Reset PW
                                        </button>

                                        {/* Enroll */}
                                        <button
                                            className="btn btn--success-subtle"
                                            onClick={() => setModal({ type: "enroll", student: s })}
                                        >
                                            {Ic.plus(12)} Enroll
                                        </button>

                                        {/* Delete */}
                                        <button
                                            className="btn btn--danger-subtle"
                                            onClick={() => handleDelete(s.id)}
                                        >
                                            {Ic.trash()}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Empty state */}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="data-table__empty">
                                    No students found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}