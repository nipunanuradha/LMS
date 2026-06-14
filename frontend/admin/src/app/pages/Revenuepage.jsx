import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

export default function RevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // New states for payments and enrollments
  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recording, setRecording] = useState(false);
  
  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  
  // Generate month options (last 6 months)
  const monthOptions = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label });
  }
  
  const [paymentMonth, setPaymentMonth] = useState(monthOptions[0]?.value || "");
  const [paymentTxnId, setPaymentTxnId] = useState("");

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/revenue-stats`);
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
        setError(null);
      } else {
        setError("Failed to fetch revenue data");
      }
    } catch (err) {
      console.error("Error fetching revenue stats:", err);
      setError("Could not connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/enrollments`);
      if (response.ok) {
        setEnrollments(await response.json());
      }
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/payments`);
      if (response.ok) {
        setPayments(await response.json());
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEnrollments();
    fetchPayments();
    
    // Polling every 5 seconds for real-time live data
    const interval = setInterval(() => {
      fetchStats();
      fetchPayments();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStudentChange = (studentId) => {
    setSelectedStudentId(studentId);
    const filtered = enrollments.filter(e => String(e.user_id) === String(studentId));
    if (filtered.length > 0) {
      setSelectedCourseId(filtered[0].course_id);
      setPaymentAmount(filtered[0].course_price);
    } else {
      setSelectedCourseId("");
      setPaymentAmount("");
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    const enrollment = enrollments.find(e => String(e.user_id) === String(selectedStudentId) && String(e.course_id) === String(courseId));
    if (enrollment) {
      setPaymentAmount(enrollment.course_price);
    }
  };

  // Set default selection when enrollments load
  useEffect(() => {
    if (enrollments.length > 0 && !selectedStudentId) {
      const uniqueStudentsMap = new Map();
      enrollments.forEach(e => {
        if (!uniqueStudentsMap.has(e.user_id)) {
          uniqueStudentsMap.set(e.user_id, e.student_name);
        }
      });
      const firstStudentId = Array.from(uniqueStudentsMap.keys())[0];
      if (firstStudentId) {
        handleStudentChange(firstStudentId);
      }
    }
  }, [enrollments]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId || !paymentMonth) {
      alert("Please select a student, course, and payment month.");
      return;
    }
    setRecording(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudentId,
          course_id: selectedCourseId,
          amount: paymentAmount ? parseFloat(paymentAmount) : undefined,
          payment_method: paymentMethod,
          month: paymentMonth,
          transaction_id: paymentTxnId || undefined
        })
      });
      const resData = await response.json();
      if (response.ok) {
        alert("Payment recorded successfully!");
        setPaymentTxnId("");
        
        // Refresh stats & payments immediately
        fetchStats();
        fetchPayments();
      } else {
        alert(resData.error || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to the server to record payment.");
    } finally {
      setRecording(false);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px", color: "#64748B", fontSize: 15, fontWeight: 500 }}>
        Loading revenue statistics...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px", color: "#DC2626", fontSize: 15, fontWeight: 500 }}>
        {error}
      </div>
    );
  }

  const revenueData = data?.monthlyData || [];
  const summary = data?.summary || { totalRevenue: 0, revenueChange: 0, totalEnrollments: 0, enrollmentsChange: 0, avgRevenuePerStudent: 0 };

  const maxRev = Math.max(...revenueData.map(d => d.revenue), 1);
  const maxEnr = Math.max(...revenueData.map(d => d.enrollments), 1);

  // Extract unique students from active enrollments
  const uniqueStudentsMap = new Map();
  enrollments.forEach(e => {
    if (!uniqueStudentsMap.has(e.user_id)) {
      uniqueStudentsMap.set(e.user_id, { id: e.user_id, name: e.student_name, phone: e.student_phone });
    }
  });
  const enrolledStudents = Array.from(uniqueStudentsMap.values());

  // Filter courses enrolled by the selected student
  const studentCourses = enrollments.filter(e => String(e.user_id) === String(selectedStudentId));

  return (
    <div style={{ animation:"fadeIn 0.25s ease", display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A" }}>Revenue & Enrollments</h2>
          <p style={{ fontSize:13, color:"#94A3B8", marginTop:3 }}>Financial overview & payment tracking</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#10B981", background: "#ECFDF5", padding: "6px 12px", borderRadius: 20, fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 1.5s infinite" }} />
          Live Connected
        </div>
      </div>

      <div style={{ display:"flex", gap:16 }}>
        {[
          { 
            label: "Total Revenue", 
            val: `LKR ${summary.totalRevenue.toLocaleString()}`, 
            accent: "#2563EB", 
            sub: `${summary.revenueChange >= 0 ? "+" : ""}${summary.revenueChange.toFixed(1)}% vs last period`,
            isPositive: summary.revenueChange >= 0 
          },
          { 
            label: "Total Enrollments", 
            val: `${summary.totalEnrollments.toLocaleString()} students`, 
            accent: "#7C3AED", 
            sub: `${summary.enrollmentsChange >= 0 ? "+" : ""}${summary.enrollmentsChange.toFixed(1)}% vs last period`,
            isPositive: summary.enrollmentsChange >= 0 
          },
          { 
            label: "Avg. Revenue/Student", 
            val: `LKR ${summary.avgRevenuePerStudent.toLocaleString()}`, 
            accent: "#059669", 
            sub: "Per enrollment",
            isPositive: true 
          },
        ].map(card => (
          <div key={card.label} className="card" style={{ flex:1, background:"#fff", borderRadius:14, padding:"20px 22px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", transition:"all 0.25s" }}>
            <div style={{ fontSize:12, color:"#94A3B8", fontWeight:500, marginBottom:8 }}>{card.label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:"#0F172A", letterSpacing:"-0.5px" }}>{card.val}</div>
            <div style={{ fontSize:12, color: card.sub === "Per enrollment" ? "#64748B" : (card.isPositive ? "#10B981" : "#EF4444"), marginTop:6, fontWeight:500 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Revenue Bar */}
        <div style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:20 }}>Monthly Revenue (LKR)</h3>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:140 }}>
            {revenueData.map(d => (
              <div key={d.month + d.year} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%" }}>
                <div style={{ flex:1, display:"flex", alignItems:"flex-end", width:"100%" }}>
                  <div style={{ width:"100%", height:`${(d.revenue/maxRev)*100}%`, background:"#2563EB", borderRadius:"5px 5px 0 0", transition:"height 0.5s", minHeight:4, opacity:0.85 }} title={`LKR ${d.revenue.toLocaleString()}`} />
                </div>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:500 }}>{d.month}</div>
              </div>
            ))}
            {revenueData.length === 0 && (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#94A3B8", fontSize: 12 }}>No revenue records.</div>
            )}
          </div>
        </div>

        {/* Enrollments Line */}
        <div style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:20 }}>Monthly Enrollments</h3>
          {revenueData.length > 0 ? (
            <svg viewBox="0 0 300 130" width="100%" style={{ overflow:"visible" }}>
              {[0,1,2,3].map(i => (
                <line key={i} x1="0" y1={i*35} x2="300" y2={i*35} stroke="#F1F5F9" strokeWidth="1" />
              ))}
              <polyline
                points={revenueData.map((d,i) => `${i*(300/(revenueData.length - 1 || 1))},${130-(d.enrollments/maxEnr)*110}`).join(" ")}
                fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {revenueData.map((d,i) => (
                <g key={d.month + d.year}>
                  <circle cx={i*(300/(revenueData.length - 1 || 1))} cy={130-(d.enrollments/maxEnr)*110} r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" title={`${d.enrollments} enrollments`} />
                  <text x={i*(300/(revenueData.length - 1 || 1))} y={145} textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="DM Sans,sans-serif">{d.month}</text>
                </g>
              ))}
            </svg>
          ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "130px", color: "#94A3B8", fontSize: 12 }}>No enrollment records.</div>
          )}
        </div>
      </div>

      {/* Record Payment & Transaction Log Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20 }}>
        {/* Record Payment Form */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>Record Student Payment</h3>
          <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>Mark monthly payments for enrolled students</p>
          
          <form onSubmit={handleRecordPayment} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>Select Student</label>
              <select 
                value={selectedStudentId} 
                onChange={e => handleStudentChange(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", color: "#0F172A", cursor: "pointer" }}
              >
                <option value="" disabled>-- Select Enrolled Student --</option>
                {enrolledStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>Select Course</label>
              <select 
                value={selectedCourseId} 
                onChange={e => handleCourseChange(e.target.value)}
                disabled={!selectedStudentId || studentCourses.length === 0}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", color: "#0F172A", cursor: "pointer" }}
              >
                {studentCourses.length === 0 ? (
                  <option value="">No enrolled courses</option>
                ) : (
                  studentCourses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.course_title}</option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>Amount (LKR)</label>
                <input 
                  type="number" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="Price"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, background: "#fff", color: "#0F172A" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>Payment Month</label>
                <select 
                  value={paymentMonth} 
                  onChange={e => setPaymentMonth(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", color: "#0F172A", cursor: "pointer" }}
                >
                  {monthOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, background: "#F8FAFC", color: "#0F172A", cursor: "pointer" }}
                >
                  <option>Bank Transfer</option>
                  <option>Card Payment</option>
                  <option>Cash</option>
                  <option>EzCash</option>
                  <option>Admin Panel</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#475569", display: "block", marginBottom: 6 }}>Transaction ID (Optional)</label>
                <input 
                  type="text" 
                  value={paymentTxnId} 
                  onChange={e => setPaymentTxnId(e.target.value)}
                  placeholder="e.g. TXN12345"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 13, background: "#fff", color: "#0F172A" }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={recording || !selectedStudentId || !selectedCourseId}
              style={{ 
                width: "100%", 
                padding: "11px", 
                borderRadius: 9, 
                border: "none", 
                background: selectedStudentId && selectedCourseId && !recording ? "#2563EB" : "#94A3B8", 
                color: "#fff", 
                fontWeight: 600, 
                fontSize: 13, 
                cursor: selectedStudentId && selectedCourseId && !recording ? "pointer" : "not-allowed", 
                marginTop: 8,
                transition: "all 0.2s",
                boxShadow: selectedStudentId && selectedCourseId && !recording ? "0 2px 6px rgba(37,99,235,0.2)" : "none"
              }}
            >
              {recording ? "Recording Payment..." : "Record Payment"}
            </button>
          </form>
        </div>

        {/* Transaction Log */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F8FAFC" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Recent Transactions Log</h3>
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Successfully recorded payments in the system</p>
          </div>
          <div style={{ overflow: "auto", flex: 1, maxHeight: 310 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", position: "sticky", top: 0, zIndex: 1 }}>
                  {["Student", "Course", "Amount", "Method", "Date"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#94A3B8", letterSpacing: "0.5px", borderBottom: "1.5px solid #F1F5F9" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id || i} className="table-row">
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: "#0F172A", borderBottom: i < payments.length - 1 ? "1px solid #F8FAFC" : "none" }}>{p.student_name}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: "#475569", borderBottom: i < payments.length - 1 ? "1px solid #F8FAFC" : "none" }}>{p.course_title}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "#059669", borderBottom: i < payments.length - 1 ? "1px solid #F8FAFC" : "none" }}>LKR {parseFloat(p.amount).toLocaleString()}</td>
                    <td style={{ padding: "10px 16px", fontSize: 11, color: "#64748B", borderBottom: i < payments.length - 1 ? "1px solid #F8FAFC" : "none" }}>{p.payment_method}</td>
                    <td style={{ padding: "10px 16px", fontSize: 11, color: "#94A3B8", borderBottom: i < payments.length - 1 ? "1px solid #F8FAFC" : "none" }} title={p.transaction_id}>{new Date(p.paid_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: 12 }}>No payments recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div style={{ background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden" }}>
        <div style={{ padding:"18px 22px", borderBottom:"1.5px solid #F8FAFC" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#0F172A" }}>Monthly Breakdown</h3>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["Month","Revenue (LKR)","Enrollments","Avg/Student"].map(h=>(
                <th key={h} style={{ padding:"11px 20px", textAlign:"left", fontSize:11, fontWeight:600, color:"#94A3B8", letterSpacing:"0.5px", borderBottom:"1.5px solid #F1F5F9" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenueData.map((d,i)=>(
              <tr key={d.month + d.year} className="table-row">
                <td style={{ padding:"13px 20px", fontWeight:500, color:"#0F172A", borderBottom:i<revenueData.length-1?"1px solid #F8FAFC":"none" }}>{d.month} {d.year}</td>
                <td style={{ padding:"13px 20px", fontWeight:600, color:"#2563EB", borderBottom:i<revenueData.length-1?"1px solid #F8FAFC":"none" }}>LKR {d.revenue.toLocaleString()}</td>
                <td style={{ padding:"13px 20px", color:"#64748B", borderBottom:i<revenueData.length-1?"1px solid #F8FAFC":"none" }}>{d.enrollments}</td>
                <td style={{ padding:"13px 20px", color:"#64748B", borderBottom:i<revenueData.length-1?"1px solid #F8FAFC":"none" }}>LKR {d.enrollments > 0 ? Math.round(d.revenue/d.enrollments).toLocaleString() : 0}</td>
              </tr>
            ))}
            {revenueData.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No financial data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}