import React, { useState, useEffect } from "react";
import { Ic } from "../components/ui/icons";
import { API_URL } from "../config";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/inquiries`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSubmittingReply(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/api/admin/inquiries/${selectedInquiry.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_message: replyMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Reply successfully submitted!");
        setReplyMessage("");
        const updatedRes = await fetch(`${API_URL}/api/admin/inquiries`);
        if (updatedRes.ok) {
          const inquiriesData = await updatedRes.json();
          setInquiries(inquiriesData);
          const fresh = inquiriesData.find(item => item.id === selectedInquiry.id);
          if (fresh) setSelectedInquiry(fresh);
        }
        setTimeout(() => setSuccessMsg(""), data.emailSent ? 3000 : 10000);
      } else {
        setSuccessMsg(data.error || data.message || "Failed to submit reply.");
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg("Could not connect to backend server.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const filtered = inquiries.filter(item => {
    const matchSearch =
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.email || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && item.status === "pending") ||
      (statusFilter === "Replied" && item.status === "replied");
    return matchSearch && matchStatus;
  });

  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(i => i.status === "pending").length;
  const repliedInquiries = inquiries.filter(i => i.status === "replied").length;

  return (
    <div style={{ animation: "fadeIn 0.25s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Contact Inquiries</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>View and reply to messages from the landing page</p>
      </div>

      {/* KPI Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, padding: "20px 24px", border: "1.5px solid var(--border-color)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Total Inquiries</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(37,99,235,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
              {Ic.mail(16)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 12 }}>{totalInquiries}</div>
        </div>

        <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, padding: "20px 24px", border: "1.5px solid var(--border-color)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Pending Reply</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(217,119,6,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D97706" }}>
              {Ic.calendar(16)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#D97706", marginTop: 12 }}>{pendingInquiries}</div>
        </div>

        <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, padding: "20px 24px", border: "1.5px solid var(--border-color)", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>Replied</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A" }}>
              {Ic.check(16)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#16A34A", marginTop: 12 }}>{repliedInquiries}</div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="inquiry-grid" style={{ display: "grid", gridTemplateColumns: selectedInquiry ? "1.2fr 1fr" : "1fr", gap: 24, transition: "all 0.3s ease" }}>
        
        {/* Table/List Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Controls */}
          <div style={{ background: "var(--bg-card)", borderRadius: 12, padding: "16px 20px", border: "1.5px solid var(--border-color)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex" }}>{Ic.search()}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, subject, or email…"
                style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 9, border: "1.5px solid var(--border-subtle)", fontSize: 13, color: "var(--text-primary)", background: "var(--input-bg)", transition: "all 0.2s" }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid var(--border-subtle)", fontSize: 13, color: "var(--text-primary)", background: "var(--input-bg)", cursor: "pointer" }}>
              {["All", "Pending", "Replied"].map(s => <option key={s} style={{ background: "var(--bg-card)", color: "var(--text-primary)" }}>{s}</option>)}
            </select>
            <button onClick={fetchInquiries} className="btn-ghost" style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid var(--border-subtle)", fontSize: 13, color: "var(--text-primary)", background: "var(--input-bg)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
               Reload
            </button>
          </div>
 
          {/* Table */}
          <div className="responsive-table-container" style={{ background: "var(--bg-card)", borderRadius: 14, border: "1.5px solid var(--border-color)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--table-header-bg)" }}>
                  {["Name", "Subject", "Status", "Date", "Action"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.5px", borderBottom: "1.5px solid var(--border-color)", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isSelected = selectedInquiry && selectedInquiry.id === item.id;
                  return (
                    <tr key={item.id} className="table-row" style={{ background: isSelected ? "rgba(37,99,235,0.1)" : "transparent", cursor: "pointer" }} onClick={() => setSelectedInquiry(item)}>
                      <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{item.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                        {item.subject}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: item.status === 'replied' ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                          color: item.status === 'replied' ? "#16A34A" : "#D97706"
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-muted)", borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none", whiteSpace: "nowrap" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedInquiry(item); }} className="btn-ghost" style={{ padding: "6px 12px", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--text-primary)", background: "var(--input-bg)", cursor: "pointer" }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>
                      {loading ? "Loading inquiries..." : "No inquiries found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Details & Reply Drawer Panel */}
        {selectedInquiry && (
          <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, border: "1.5px solid var(--border-color)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 24, display: "flex", flexDirection: "column", gap: 20, height: "fit-content", position: "sticky", top: 0, animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border-color)", paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Inquiry Details</h3>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>ID: #{selectedInquiry.id}</span>
              </div>
              <button onClick={() => setSelectedInquiry(null)} style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                {Ic.close(20)}
              </button>
            </div>

            {/* Submitter Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>From:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{selectedInquiry.name}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Email:</span>
                <a href={`mailto:${selectedInquiry.email}`} style={{ color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>{selectedInquiry.email}</a>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Phone:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{selectedInquiry.phone_number}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Date:</span>
                <span style={{ color: "var(--text-secondary)" }}>{new Date(selectedInquiry.created_at).toLocaleString()}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Subject:</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{selectedInquiry.subject}</span>
              </div>
            </div>

            {/* Message Box */}
            <div style={{ background: "var(--input-bg)", borderRadius: 12, padding: 16, border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, textTransform: "uppercase" }}>Original Message</h4>
              <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, whiteSpace: "pre-line" }}>{selectedInquiry.message}</p>
            </div>

            {/* Reply Info / Form */}
            {selectedInquiry.status === "replied" ? (
              <div style={{ background: "rgba(34,197,94,0.12)", borderRadius: 12, padding: 16, border: "1px solid rgba(34,197,94,0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: "#16A34A", textTransform: "uppercase" }}>Replied Message</h4>
                  <span style={{ fontSize: 11, color: "#16A34A" }}>{selectedInquiry.replied_at ? new Date(selectedInquiry.replied_at).toLocaleString() : ""}</span>
                </div>
                <p style={{ fontSize: 13, color: "#16A34A", lineHeight: 1.5, whiteSpace: "pre-line" }}>{selectedInquiry.reply_message}</p>
              </div>
            ) : (
              <form onSubmit={handleReplySubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>Write Reply</label>
                {successMsg && (
                  <div style={{
                    padding: "10px 14px",
                    background: successMsg.toLowerCase().includes("fail") || successMsg.toLowerCase().includes("error") ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                    color: successMsg.toLowerCase().includes("fail") || successMsg.toLowerCase().includes("error") ? "#EF4444" : "#16A34A",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    border: "1px solid " + (successMsg.toLowerCase().includes("fail") || successMsg.toLowerCase().includes("error") ? "#EF4444" : "#16A34A"),
                    lineHeight: 1.4
                  }}>
                    {successMsg}
                  </div>
                )}
                <textarea
                  required
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-subtle)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: 13, resize: "none" }}
                />
                <button
                  type="submit"
                  disabled={submittingReply}
                  style={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, boxShadow: "0 2px 8px rgba(37,99,235,0.2)" }}
                >
                  {submittingReply ? "Sending..." : "Submit Reply"}
                  {Ic.check(14)}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
