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
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:500, background:active?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", color:active?"#22C55E":"#EF4444" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:active?"#22C55E":"#EF4444", display:"inline-block" }} />
      {status}
    </span>
  );
}

export function CategoryBadge({ cat, accent }) {
  return (
    <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:`${accent}22`, color:accent, letterSpacing:"0.3px" }}>
      {cat}
    </span>
  );
}

export function Input({ label, type="text", value, onChange, placeholder, style:s }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, ...s }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:"var(--text-secondary, #64748B)" }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ padding:"10px 14px", borderRadius:8, border:"1.5px solid var(--border-subtle, #E2E8F0)", fontSize:14, color:"var(--text-primary, #0F172A)", background:"var(--input-bg, #FAFAFA)", transition:"all 0.2s" }} />
    </div>
  );
}

export function Select({ label, value, onChange, options, style:s }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, ...s }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:"var(--text-secondary, #64748B)" }}>{label}</label>}
      <select value={value} onChange={onChange}
        style={{ padding:"10px 14px", borderRadius:8, border:"1.5px solid var(--border-subtle, #E2E8F0)", fontSize:14, color:"var(--text-primary, #0F172A)", background:"var(--input-bg, #FAFAFA)", cursor:"pointer", transition:"all 0.2s" }}>
        {options.map(o => <option key={o.value||o} value={o.value||o} style={{ background:"var(--bg-card, #fff)", color:"var(--text-primary, #0F172A)" }}>{o.label||o}</option>)}
      </select>
    </div>
  );
}
