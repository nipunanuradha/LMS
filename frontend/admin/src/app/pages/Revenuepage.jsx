import React from "react";
import { REVENUE_DATA } from "../data/mockData";

export default function RevenuePage() {
  const maxRev = Math.max(...REVENUE_DATA.map(d=>d.revenue));
  const maxEnr = Math.max(...REVENUE_DATA.map(d=>d.enrollments));
  return (
    <div style={{ animation:"fadeIn 0.25s ease", display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ fontSize:20, fontWeight:700, color:"#0F172A" }}>Revenue & Enrollments</h2>
        <p style={{ fontSize:13, color:"#94A3B8", marginTop:3 }}>Financial overview — last 6 months</p>
      </div>
      <div style={{ display:"flex", gap:16 }}>
        {[
          { label:"Total Revenue", val:"LKR 221,900", accent:"#2563EB", sub:"+18.4% vs last period" },
          { label:"Total Enrollments", val:"379 students", accent:"#7C3AED", sub:"+22.1% vs last period" },
          { label:"Avg. Revenue/Student", val:"LKR 585", accent:"#059669", sub:"Per enrollment" },
        ].map(card => (
          <div key={card.label} className="card" style={{ flex:1, background:"#fff", borderRadius:14, padding:"20px 22px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", transition:"all 0.25s" }}>
            <div style={{ fontSize:12, color:"#94A3B8", fontWeight:500, marginBottom:8 }}>{card.label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:"#0F172A", letterSpacing:"-0.5px" }}>{card.val}</div>
            <div style={{ fontSize:12, color:"#10B981", marginTop:6, fontWeight:500 }}>{card.sub}</div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {/* Revenue Bar */}
        <div style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:20 }}>Monthly Revenue (LKR)</h3>
          <div style={{ display:"flex", alignItems:"flex-end", gap:10, height:140 }}>
            {REVENUE_DATA.map(d => (
              <div key={d.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6, height:"100%" }}>
                <div style={{ flex:1, display:"flex", alignItems:"flex-end", width:"100%" }}>
                  <div style={{ width:"100%", height:`${(d.revenue/maxRev)*100}%`, background:"#2563EB", borderRadius:"5px 5px 0 0", transition:"height 0.5s", minHeight:4, opacity:0.85 }} />
                </div>
                <div style={{ fontSize:10, color:"#94A3B8", fontWeight:500 }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Enrollments Line */}
        <div style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:20 }}>Monthly Enrollments</h3>
          <svg viewBox="0 0 300 130" width="100%" style={{ overflow:"visible" }}>
            {/* Grid lines */}
            {[0,1,2,3].map(i => (
              <line key={i} x1="0" y1={i*35} x2="300" y2={i*35} stroke="#F1F5F9" strokeWidth="1" />
            ))}
            {/* Line */}
            <polyline
              points={REVENUE_DATA.map((d,i) => `${i*(300/5)},${130-(d.enrollments/maxEnr)*110}`).join(" ")}
              fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {REVENUE_DATA.map((d,i) => (
              <g key={d.month}>
                <circle cx={i*(300/5)} cy={130-(d.enrollments/maxEnr)*110} r="5" fill="#fff" stroke="#7C3AED" strokeWidth="2.5" />
                <text x={i*(300/5)} y={145} textAnchor="middle" fontSize="10" fill="#94A3B8" fontFamily="DM Sans,sans-serif">{d.month}</text>
              </g>
            ))}
          </svg>
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
            {REVENUE_DATA.map((d,i)=>(
              <tr key={d.month} className="table-row">
                <td style={{ padding:"13px 20px", fontWeight:500, color:"#0F172A", borderBottom:i<REVENUE_DATA.length-1?"1px solid #F8FAFC":"none" }}>{d.month} 2024</td>
                <td style={{ padding:"13px 20px", fontWeight:600, color:"#2563EB", borderBottom:i<REVENUE_DATA.length-1?"1px solid #F8FAFC":"none" }}>LKR {d.revenue.toLocaleString()}</td>
                <td style={{ padding:"13px 20px", color:"#64748B", borderBottom:i<REVENUE_DATA.length-1?"1px solid #F8FAFC":"none" }}>{d.enrollments}</td>
                <td style={{ padding:"13px 20px", color:"#64748B", borderBottom:i<REVENUE_DATA.length-1?"1px solid #F8FAFC":"none" }}>LKR {Math.round(d.revenue/d.enrollments)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}