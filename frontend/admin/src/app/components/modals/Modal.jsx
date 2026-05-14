import React from "react";
import { Ic } from "../ui/icons";

export default function Modal({ title, subtitle, onClose, children, width=480 }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(15,23,42,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:width, boxShadow:"0 25px 60px rgba(0,0,0,0.18)", animation:"slideUp 0.22s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ padding:"24px 28px 20px", borderBottom:"1.5px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <h2 style={{ fontSize:17, fontWeight:600, color:"#0F172A" }}>{title}</h2>
            {subtitle && <p style={{ fontSize:13, color:"#94A3B8", marginTop:4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ border:"none", background:"none", cursor:"pointer", padding:6, borderRadius:8, color:"#94A3B8", display:"flex", alignItems:"center", transition:"all 0.15s" }}>
            {Ic.close()}
          </button>
        </div>
        <div style={{ padding:"24px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
}
