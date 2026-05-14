import React, { useState, useEffect } from "react";
import { Ic } from "../ui/icons";

export default function KPICard({ label, target, icon, accent, suffix="", prefix="" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0; const duration = 1400;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <div className="card kpi-card" style={{ background:"#fff", borderRadius:14, padding:"22px 24px", border:"1.5px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", transition:"all 0.25s", flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontSize:13, color:"#64748B", fontWeight:500, marginBottom:10 }}>{label}</div>
          <div style={{ fontSize:32, fontWeight:700, color:"#0F172A", letterSpacing:"-1px", lineHeight:1 }}>
            {prefix}{count.toLocaleString()}{suffix}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:10 }}>
            <span style={{ color:"#10B981", display:"flex" }}>{Ic.trend()}</span>
            <span style={{ fontSize:12, color:"#10B981", fontWeight:500 }}>+12.5% this month</span>
          </div>
        </div>
        <div style={{ width:52, height:52, borderRadius:14, background:`${accent}18`, display:"flex", alignItems:"center", justifyContent:"center", color:accent }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
