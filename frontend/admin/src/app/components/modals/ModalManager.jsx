import React, { useState } from "react";
import Modal from "./Modal";
import { Input, Select } from "../ui/Primitives";
import { Ic } from "../ui/icons";
import { DISTRICTS } from "../../data/mockData";

export default function ModalManager({ modal, setModal, students, setStudents, courses, setCourses }) {
  const [pw,  setPw]  = useState({ pass:"", confirm:"" });
  const [enroll, setEnroll] = useState({ courseId: courses[0]?.id||"", expiry:"" });
  const [ec, setEc]   = useState({ title: modal?.course?.title||"", desc: modal?.course?.desc||"" });
  const [ns, setNs]   = useState({ name:"", phone:"", district:"Colombo", status:"Active" });
  const close = () => setModal(null);

  if (modal === "addStudent") {
    const add = () => {
      if (!ns.name.trim()) return;
      const id = `S${String(students.length+1).padStart(3,"0")}`;
      const initials = ns.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
      const colors = ["#2563EB","#059669","#7C3AED","#D97706","#DC2626","#0891B2"];
      setStudents(prev => [...prev, { id, name:ns.name, initials, phone:ns.phone||"—", district:ns.district, status:ns.status, joined: new Date().toISOString().slice(0,10), color:colors[prev.length%colors.length] }]);
      close();
    };
    return (
      <Modal title="Add New Student" subtitle="Create a new student account" onClose={close}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Input label="Full Name *" value={ns.name} onChange={e=>setNs(n=>({...n,name:e.target.value}))} placeholder="e.g. Amara Perera" />
          <Input label="Phone Number" value={ns.phone} onChange={e=>setNs(n=>({...n,phone:e.target.value}))} placeholder="+94 77 000 0000" />
          <Select label="District" value={ns.district} onChange={e=>setNs(n=>({...n,district:e.target.value}))} options={DISTRICTS.slice(1)} />
          <Select label="Status" value={ns.status} onChange={e=>setNs(n=>({...n,status:e.target.value}))} options={["Active","Expired"]} />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <button onClick={close} className="btn-ghost" style={{ flex:1, padding:"10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", fontWeight:500, fontSize:14, color:"#64748B", transition:"all 0.15s" }}>Cancel</button>
            <button onClick={add}   className="btn-primary" style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:"#2563EB", cursor:"pointer", fontWeight:600, fontSize:14, color:"#fff", boxShadow:"0 2px 8px rgba(37,99,235,0.25)", transition:"all 0.2s" }}>Add Student</button>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal?.type === "resetPw") {
    const reset = () => { if (pw.pass && pw.pass === pw.confirm) close(); };
    const ok = pw.pass.length >= 6 && pw.pass === pw.confirm;
    return (
      <Modal title="Reset Password" subtitle={`Resetting password for ${modal.student?.name}`} onClose={close}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#FFFBEB", border:"1.5px solid #FDE68A", borderRadius:10, padding:"12px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <p style={{ fontSize:12, color:"#92400E", lineHeight:1.6 }}>This will immediately reset the student's password. They will need to log in with the new credentials.</p>
          </div>
          <Input label="New Password" type="password" value={pw.pass} onChange={e=>setPw(p=>({...p,pass:e.target.value}))} placeholder="Min. 6 characters" />
          <Input label="Confirm Password" type="password" value={pw.confirm} onChange={e=>setPw(p=>({...p,confirm:e.target.value}))} placeholder="Re-enter password" />
          {pw.confirm && !ok && <p style={{ fontSize:12, color:"#DC2626" }}>Passwords don't match or too short.</p>}
          {ok && <p style={{ fontSize:12, color:"#059669", display:"flex", alignItems:"center", gap:5 }}>{Ic.check()} Passwords match!</p>}
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <button onClick={close} className="btn-ghost" style={{ flex:1, padding:"10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", fontWeight:500, fontSize:14, color:"#64748B", transition:"all 0.15s" }}>Cancel</button>
            <button onClick={reset} disabled={!ok} style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:ok?"#D97706":"#E2E8F0", cursor:ok?"pointer":"not-allowed", fontWeight:600, fontSize:14, color:ok?"#fff":"#94A3B8", transition:"all 0.2s" }}>Reset Password</button>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal?.type === "enroll") {
    const confirm = () => { if (enroll.courseId && enroll.expiry) close(); };
    return (
      <Modal title="Enroll Student" subtitle={`Enrolling ${modal.student?.name} into a course`} onClose={close}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Select label="Select Course" value={enroll.courseId} onChange={e=>setEnroll(en=>({...en,courseId:e.target.value}))}
            options={courses.map(c=>({ value:c.id, label:`${c.title} (${c.students} students)` }))} />
          {enroll.courseId && (() => {
            const c = courses.find(x=>x.id===enroll.courseId);
            return c && (
              <div style={{ background:`${c.accent}10`, border:`1.5px solid ${c.accent}30`, borderRadius:10, padding:"12px 14px", display:"flex", gap:10, alignItems:"center" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:c.accent, flexShrink:0 }} />
                <div style={{ fontSize:13, color:"#334155" }}><strong>{c.title}</strong> · {c.students} students currently enrolled</div>
              </div>
            );
          })()}
          <Input label="Expiry Date *" type="date" value={enroll.expiry} onChange={e=>setEnroll(en=>({...en,expiry:e.target.value}))} />
          <div style={{ display:"flex", gap:10, marginTop:6 }}>
            <button onClick={close} className="btn-ghost" style={{ flex:1, padding:"10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", fontWeight:500, fontSize:14, color:"#64748B", transition:"all 0.15s" }}>Cancel</button>
            <button onClick={confirm} disabled={!enroll.courseId||!enroll.expiry}
              style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:enroll.courseId&&enroll.expiry?"#059669":"#E2E8F0", cursor:enroll.courseId&&enroll.expiry?"pointer":"not-allowed", fontWeight:600, fontSize:14, color:enroll.courseId&&enroll.expiry?"#fff":"#94A3B8", transition:"all 0.2s" }}>
              Confirm Enrollment
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal?.type === "editCourse" || modal === "createCourse") {
    const isEdit = modal?.type === "editCourse";
    const [formState, setFormState] = useState({
      title: isEdit ? modal.course.title : "",
      desc:  isEdit ? modal.course.desc  : "",
      category: isEdit ? modal.course.category : "Web Dev",
    });
    const [dragOver, setDragOver] = useState(false);
    const save = () => {
      if (!formState.title.trim()) return;
      if (isEdit) {
        setCourses(prev => prev.map(c => c.id === modal.course.id ? { ...c, ...formState } : c));
      } else {
        const id = `C${String(courses.length+1).padStart(3,"0")}`;
        const accents = ["#2563EB","#059669","#7C3AED","#D97706","#DC2626","#0891B2"];
        setCourses(prev => [...prev, { id, title:formState.title, desc:formState.desc, students:0, category:formState.category, accent:accents[prev.length%accents.length] }]);
      }
      close();
    };
    return (
      <Modal title={isEdit ? "Edit Course" : "Create New Course"} subtitle={isEdit ? `Editing: ${modal.course.title}` : "Fill in the details below"} onClose={close} width={520}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Input label="Course Title *" value={formState.title} onChange={e=>setFormState(f=>({...f,title:e.target.value}))} placeholder="e.g. Advanced React Development" />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:13, fontWeight:500, color:"#374151" }}>Description</label>
            <textarea value={formState.desc} onChange={e=>setFormState(f=>({...f,desc:e.target.value}))} rows={3} placeholder="Brief course description..."
              style={{ padding:"10px 14px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:14, color:"#0F172A", background:"#FAFAFA", resize:"vertical", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", outline:"none" }} />
          </div>
          <Select label="Category" value={formState.category} onChange={e=>setFormState(f=>({...f,category:e.target.value}))}
            options={["Web Dev","Data Science","Design","Backend","Mobile","Cloud"]} />
          {/* File Upload */}
          <div>
            <label style={{ fontSize:13, fontWeight:500, color:"#374151", display:"block", marginBottom:6 }}>Course Thumbnail</label>
            <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);}}
              style={{ border:`2px dashed ${dragOver?"#2563EB":"#CBD5E1"}`, borderRadius:12, padding:"28px 20px", textAlign:"center", background:dragOver?"#EFF6FF":"#F8FAFC", transition:"all 0.2s", cursor:"pointer" }}>
              <div style={{ color:dragOver?"#2563EB":"#94A3B8", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
                {Ic.upload(32)}
                <div style={{ fontSize:14, fontWeight:500, color:dragOver?"#1D4ED8":"#64748B" }}>
                  Drag & drop image here
                </div>
                <div style={{ fontSize:12, color:"#94A3B8" }}>PNG, JPG, WEBP · Max 5MB · 16:9 ratio</div>
                <button style={{ padding:"7px 16px", borderRadius:8, border:"1.5px solid #CBD5E1", background:"#fff", color:"#374151", cursor:"pointer", fontSize:13, fontWeight:500, marginTop:4, transition:"all 0.15s" }}>
                  Browse Files
                </button>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button onClick={close} className="btn-ghost" style={{ flex:1, padding:"10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#F8FAFC", cursor:"pointer", fontWeight:500, fontSize:14, color:"#64748B", transition:"all 0.15s" }}>Cancel</button>
            <button onClick={save}  className="btn-primary" style={{ flex:1, padding:"10px", borderRadius:9, border:"none", background:"#2563EB", cursor:"pointer", fontWeight:600, fontSize:14, color:"#fff", boxShadow:"0 2px 8px rgba(37,99,235,0.25)", transition:"all 0.2s" }}>
              {isEdit ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }
  return null;
}
