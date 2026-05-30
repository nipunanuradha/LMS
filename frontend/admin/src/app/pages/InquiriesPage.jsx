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
      if (res.ok) {
        setSuccessMsg("Reply successfully submitted!");
        setReplyMessage("");
        // Reload list and update selected
        const updatedRes = await fetch(`${API_URL}/api/admin/inquiries`);
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setInquiries(data);
          const fresh = data.find(item => item.id === selectedInquiry.id);
          if (fresh) setSelectedInquiry(fresh);
        }
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to reply:", err);
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
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Contact Inquiries</h2>
        <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>View and reply to messages from the landing page</p>
      </div>

      {/* KPI Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1.5px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B" }}>Total Inquiries</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyCenter: "center", color: "#2563EB", justifyContent: "center" }}>
              {Ic.mail(16)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#0F172A", marginTop: 12 }}>{totalInquiries}</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1.5px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B" }}>Pending Reply</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#FFFBEB", display: "flex", alignItems: "center", justifyCenter: "center", color: "#D97706", justifyContent: "center" }}>
              {Ic.calendar(16)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#D97706", marginTop: 12 }}>{pendingInquiries}</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1.5px solid #F1F5F9", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B" }}>Replied</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyCenter: "center", color: "#16A34A", justifyContent: "center" }}>
              {Ic.check(16)}
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#16A34A", marginTop: 12 }}>{repliedInquiries}</div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div style={{ display: "grid", gridTemplateColumns: selectedInquiry ? "1.2fr 1fr" : "1fr", gap: 24, transition: "all 0.3s ease" }}>
        
        {/* Table/List Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Controls */}
          <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", display: "flex" }}>{Ic.search()}</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, subject, or email…"
                style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFC", transition: "all 0.2s" }} />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#F8FAFC", cursor: "pointer" }}>
              {["All", "Pending", "Replied"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={fetchInquiries} style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#334155", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              Reload
            </button>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Name", "Subject", "Status", "Date", "Action"].map(h => (
                    <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.5px", borderBottom: "1.5px solid #F1F5F9", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isSelected = selectedInquiry && selectedInquiry.id === item.id;
                  return (
                    <tr key={item.id} className="table-row" style={{ background: isSelected ? "#EFF6FF" : "transparent", cursor: "pointer" }} onClick={() => setSelectedInquiry(item)}>
                      <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{item.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#334155", fontWeight: 500, borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                        {item.subject}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          background: item.status === 'replied' ? "#D1FAE5" : "#FEF3C7",
                          color: item.status === 'replied' ? "#065F46" : "#92400E"
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#64748B", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none", whiteSpace: "nowrap" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none" }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedInquiry(item); }} className="btn-ghost" style={{ padding: "6px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#475569", background: "#fff", cursor: "pointer" }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
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
          <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: 24, display: "flex", flexDirection: "column", gap: 20, height: "fit-content", position: "sticky", top: 0, animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #F8FAFC", paddingBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Inquiry Details</h3>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>ID: #{selectedInquiry.id}</span>
              </div>
              <button onClick={() => setSelectedInquiry(null)} style={{ border: "none", background: "transparent", color: "#64748B", cursor: "pointer", display: "flex" }}>
                {Ic.close(20)}
              </button>
            </div>

            {/* Submitter Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "#94A3B8", fontWeight: 500 }}>From:</span>
                <span style={{ color: "#334155", fontWeight: 600 }}>{selectedInquiry.name}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "#94A3B8", fontWeight: 500 }}>Email:</span>
                <a href={`mailto:${selectedInquiry.email}`} style={{ color: "#2563EB", textDecoration: "none", fontWeight: 500 }}>{selectedInquiry.email}</a>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "#94A3B8", fontWeight: 500 }}>Phone:</span>
                <span style={{ color: "#334155", fontWeight: 500 }}>{selectedInquiry.phone_number}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "#94A3B8", fontWeight: 500 }}>Date:</span>
                <span style={{ color: "#64748B" }}>{new Date(selectedInquiry.created_at).toLocaleString()}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", fontSize: 13 }}>
                <span style={{ color: "#94A3B8", fontWeight: 500 }}>Subject:</span>
                <span style={{ color: "#0F172A", fontWeight: 600 }}>{selectedInquiry.subject}</span>
              </div>
            </div>

            {/* Message Box */}
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 16, border: "1px solid #F1F5F9" }}>
              <h4 style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>Original Message</h4>
              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-line" }}>{selectedInquiry.message}</p>
            </div>

            {/* Reply Info / Form */}
            {selectedInquiry.status === "replied" ? (
              <div style={{ background: "#ECFDF5", borderRadius: 12, padding: 16, border: "1px solid #D1FAE5" }}>
                <div style={{ display: "flex", justifyBetween: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h4 style={{ fontSize: 12, fontWeight: 600, color: "#065F46", textTransform: "uppercase" }}>Replied Message</h4>
                  <span style={{ fontSize: 11, color: "#047857" }}>{selectedInquiry.replied_at ? new Date(selectedInquiry.replied_at).toLocaleString() : ""}</span>
                </div>
                <p style={{ fontSize: 13, color: "#065F46", lineHeight: 1.5, whiteSpace: "pre-line" }}>{selectedInquiry.reply_message}</p>
              </div>
            ) : (
              <form onSubmit={handleReplySubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase" }}>Write Reply</label>
                {successMsg && (
                  <div style={{ padding: "8px 12px", background: "#DEF7EC", color: "#03543F", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
                    {successMsg}
                  </div>
                )}
                <textarea
                  required
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  style={{ width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid #CBD5E1", fontSize: 13, color: "#0F172A", resize: "none" }}
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
