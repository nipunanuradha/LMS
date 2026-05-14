import React from "react";

export function Avatar({ initials, size = 36, bg = "#2563EB" }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*0.33, fontWeight:600, flexShrink:0, fontFamily:"'DM Sans',sans-serif" }}>
      {initials}
    </div>
  );
}

export function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:500, background:active?"#DCFCE7":"#FEE2E2", color:active?"#15803D":"#B91C1C" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:active?"#16A34A":"#DC2626", display:"inline-block" }} />
      {status}
    </span>
  );
}

export function CategoryBadge({ cat, accent }) {
  return (
    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:`${accent}18`, color:accent, letterSpacing:"0.3px" }}>
      {cat}
    </span>
  );
}

export function Input({ label, type="text", value, onChange, placeholder, style:s }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, ...s }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ padding:"10px 14px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:14, color:"#0F172A", background:"#FAFAFA", transition:"all 0.2s" }} />
    </div>
  );
}

export function Select({ label, value, onChange, options, style:s }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, ...s }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:"#374151" }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ padding:"10px 14px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:14, color:"#0F172A", background:"#FAFAFA", cursor:"pointer", transition:"all 0.2s" }}>
        {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}
