import React from "react";
import { Avatar, StatusBadge } from "../components/ui/Primitives";
import { Ic } from "../components/ui/icons";
import KPICard from "../components/dashboard/KPICard";

export default function DashboardPage({ students, courses, setModal }) {
  const totalStudentsList = students.filter(s => !s.role || s.role === "student");
  const studentCount = totalStudentsList.length;
  const adminCount = students.filter(s => s.role === "admin").length;
  
  const activeStudentsCount = totalStudentsList.filter(s => s.status === "Active").length;
  const expiredStudentsCount = totalStudentsList.filter(s => s.status === "Expired").length;
  const totalEnrollments = courses.reduce((a,c)=>a+c.students,0);

  // Dynamic growth calculations
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const registeredThisMonth = totalStudentsList.filter(s => new Date(s.created_at) >= thisMonthStart).length;
  const registeredLastMonth = totalStudentsList.filter(s => {
    const d = new Date(s.created_at);
    return d >= lastMonthStart && d <= lastMonthEnd;
  }).length;

  const growthPercentage = (() => {
    if (registeredLastMonth === 0) {
      return registeredThisMonth > 0 ? "+100%" : "+0%";
    }
    const growth = ((registeredThisMonth - registeredLastMonth) / registeredLastMonth) * 100;
    return (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
  })();

  const avgPerCourse = courses.length ? Math.round(totalEnrollments / courses.length) : 0;

  return (
    <div style={{ animation:"fadeIn 0.25s ease", display:"flex", flexDirection:"column", gap:24 }}>
      {/* KPIs */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
        <div className="card kpi-card" style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", transition:"all 0.25s", flex:"1 1 240px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize:13, color:"#64748B", fontWeight:500, marginBottom:10 }}>Total Registered Accounts</div>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize:28, fontWeight:700, color:"#2563EB", letterSpacing:"-1px", lineHeight:1 }}>
                    {studentCount}
                  </div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:4, fontWeight:500 }}>Students</div>
                </div>
                <div style={{ width:1, height:30, background:"#E2E8F0" }} />
                <div>
                  <div style={{ fontSize:28, fontWeight:700, color:"#7C3AED", letterSpacing:"-1px", lineHeight:1 }}>
                    {adminCount}
                  </div>
                  <div style={{ fontSize:11, color:"#64748B", marginTop:4, fontWeight:500 }}>Admins</div>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10 }}>
                <span style={{ color:"#10B981", display:"flex" }}>{Ic.trend()}</span>
                <span style={{ fontSize:12, color:"#10B981", fontWeight:500 }}>{growthPercentage} this month</span>
              </div>
            </div>
            <div style={{ width:52, height:52, borderRadius:14, background:`#2563EB18`, display:"flex", alignItems:"center", justifyContent:"center", color:"#2563EB", flexShrink: 0 }}>
              <svg style={{width:24,height:24}} viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
        </div>
        <KPICard label="Active Courses"    target={courses.length} accent="#059669" icon={<svg style={{width:24,height:24}} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>} />
        <KPICard label="Live Enrollments"  target={totalEnrollments} accent="#7C3AED" icon={<svg style={{width:24,height:24}} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
      </div>
      {/* Quick Actions */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
        <button onClick={() => setModal("addStudent")} className="action-btn btn-primary"
          style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:"#2563EB", color:"#fff", border:"none", cursor:"pointer", fontWeight:600, fontSize:14, boxShadow:"0 4px 12px rgba(37,99,235,0.25)", transition:"all 0.2s" }}>
          <span>{Ic.plus(16)}</span> Add New Student
        </button>
        <button onClick={() => setModal("createCourse")} className="action-btn"
          style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 22px", borderRadius:12, background:"#fff", color:"#2563EB", border:"2px solid #DBEAFE", cursor:"pointer", fontWeight:600, fontSize:14, transition:"all 0.2s" }}>
          <span>{Ic.book()}</span> Create Course
        </button>
      </div>
      {/* Main grid */}
      <div className="dashboard-grid" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
        {/* Recent Enrollments */}
        <div className="card" style={{ background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden", transition:"all 0.25s" }}>
          <div style={{ padding:"20px 24px", borderBottom:"1.5px solid #F8FAFC", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <h3 style={{ fontSize:15, fontWeight:600, color:"#0F172A" }}>Recent Activity</h3>
              <p style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Latest students who joined</p>
            </div>
            <span style={{ fontSize:12, color:"#2563EB", fontWeight:500, cursor:"pointer" }}>View All</span>
          </div>
          <div>
            {totalStudentsList.slice(0,5).map((s,i) => {
              const initials = s.full_name ? s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";
              return (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 24px", borderBottom:i < Math.min(totalStudentsList.length, 5) - 1 ? "1px solid #F8FAFC" : "none" }}>
                  <Avatar initials={initials} size={40} bg={s.color || "#2563EB"} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:500, color:"#0F172A" }}>{s.full_name}</div>
                    <div style={{ fontSize:12, color:"#94A3B8", marginTop:1 }}>{s.district} · {new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={s.status || "Active"} />
                </div>
              );
            })}
            {totalStudentsList.length === 0 && (
              <div style={{ padding: "48px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>No students registered yet.</div>
            )}
          </div>
        </div>
        {/* Course Overview */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card" style={{ background:"#fff", borderRadius:14, border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", overflow:"hidden", transition:"all 0.25s" }}>
            <div style={{ padding:"18px 20px", borderBottom:"1.5px solid #F8FAFC" }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:"#0F172A" }}>Top Courses</h3>
            </div>
            {courses.slice(0,4).map((c,i) => (
              <div key={c.id} style={{ padding:"12px 20px", borderBottom:i<Math.min(courses.length, 4) - 1 ? "1px solid #F8FAFC" : "none", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c.accent || "#2563EB", flexShrink:0 }} />
                <div style={{ flex:1, overflow:"hidden" }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#0F172A", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{c.title}</div>
                  <div style={{ width:"100%", height:4, background:"#F1F5F9", borderRadius:2, marginTop:6, overflow:"hidden" }}>
                    <div style={{ width: `${Math.min(((c.students || 0)/125)*100, 100)}%`, height:"100%", background:c.accent || "#2563EB", borderRadius:2 }} />
                  </div>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"#64748B", flexShrink:0 }}>{c.students || 0}</span>
              </div>
            ))}
            {courses.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No courses created yet.</div>
            )}
          </div>
          {/* Stats mini cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { label:"Active Students", val:activeStudentsCount, color:"#DCFCE7", text:"#15803D" },
              { label:"Expired",         val:expiredStudentsCount, color:"#FEE2E2", text:"#B91C1C" },
              { label:"This Month",      val:registeredThisMonth, color:"#DBEAFE", text:"#1D4ED8" },
              { label:"Avg. Per Course", val:avgPerCourse, color:"#EDE9FE", text:"#6D28D9" },
            ].map(card => (
              <div key={card.label} style={{ background:card.color, borderRadius:12, padding:"14px 16px" }}>
                <div style={{ fontSize:22, fontWeight:700, color:card.text }}>{card.val}</div>
                <div style={{ fontSize:11, color:card.text, opacity:0.75, marginTop:3, fontWeight:500 }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}