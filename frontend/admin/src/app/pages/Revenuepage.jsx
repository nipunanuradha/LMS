import React, { useState, useEffect } from "react";
import { API_URL } from "../config";

export default function RevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

    fetchStats();
    
    // Polling every 5 seconds for real-time live data
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div style={{ animation:"fadeIn 0.25s ease", display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A" }}>Revenue & Enrollments</h2>
        <p style={{ fontSize:13, color:"#94A3B8", marginTop:3 }}>Financial overview — last 6 months</p>
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
              {/* Grid lines */}
              {[0,1,2,3].map(i => (
                <line key={i} x1="0" y1={i*35} x2="300" y2={i*35} stroke="#F1F5F9" strokeWidth="1" />
              ))}
              {/* Line */}
              <polyline
                points={revenueData.map((d,i) => `${i*(300/(revenueData.length - 1 || 1))},${130-(d.enrollments/maxEnr)*110}`).join(" ")}
                fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {/* Dots */}
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
      {/* Table */}
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