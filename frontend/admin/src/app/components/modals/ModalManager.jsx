import React, { useState } from "react";
import Modal from "./Modal";
import { Input, Select } from "../ui/Primitives";
import { Ic } from "../ui/icons";
import { DISTRICTS } from "../../data/mockData";
import { API_URL } from "../config";

export default function ModalManager({ modal, setModal, students, setStudents, courses, setCourses }) {
  const [pw, setPw] = useState({ pass: "", confirm: "" });
  const [enroll, setEnroll] = useState({ courseId: courses[0]?.id || "", expiry: "" });
  const [ec, setEc] = useState({ title: modal?.course?.title || "", desc: modal?.course?.desc || "" });
  const [ns, setNs] = useState({ name: "", phone: "", district: "Colombo", status: "Active", role: "student", password: "" });
  const close = () => setModal(null);

  if (modal === "profile") {
    return (
      <Modal title="My Profile" subtitle="Admin Account Details" onClose={close}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#2563EB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600 }}>AD</div>
            <div>
              <h3 style={{ margin: 0, color: "#0F172A" }}>Admin User</h3>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Super Admin</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Full Name" value="Admin User" readOnly />
            <Input label="Phone Number" value="+94 77 123 4567" readOnly />
            <Input label="District" value="Colombo" readOnly />
            <Input label="Province" value="Western" readOnly />
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: 12, border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>Account Created</p>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#334155" }}>May 15, 2026</p>
          </div>
          <button onClick={close} className="btn-primary" style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", marginTop: 6 }}>Close</button>
        </div>
      </Modal>
    );
  }

  if (modal === "addStudent") {
    const add = async () => {
      if (!ns.name.trim() || !ns.phone.trim() || !ns.password.trim()) {
        alert("Name, Phone, and Password are required fields.");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/admin/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: ns.name,
            phone_number: ns.phone,
            district: ns.district,
            province: "Western", // simple default
            password: ns.password,
            role: ns.role
          })
        });
        const data = await res.json();
        if (res.ok) {
          setStudents(prev => [data, ...prev]);
          close();
        } else {
          alert(data.message || "Failed to create user");
        }
      } catch (err) {
        console.error("Error creating user:", err);
        alert("Server connection failed. Could not add user.");
      }
    };
    return (
      <Modal title="Add New User" subtitle="Create a new student or admin account" onClose={close}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Full Name *" value={ns.name} onChange={e => setNs(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Amara Perera" />
          <Input label="Phone Number *" value={ns.phone} onChange={e => setNs(n => ({ ...n, phone: e.target.value }))} placeholder="+94 77 000 0000" />
          <Input label="Password *" type="password" value={ns.password} onChange={e => setNs(n => ({ ...n, password: e.target.value }))} placeholder="Enter login password" />
          <Select label="Role" value={ns.role} onChange={e => setNs(n => ({ ...n, role: e.target.value }))} options={[{ value: "student", label: "Student" }, { value: "admin", label: "Admin" }]} />
          <Select label="District" value={ns.district} onChange={e => setNs(n => ({ ...n, district: e.target.value }))} options={DISTRICTS.slice(1)} />
          <Select label="Status" value={ns.status} onChange={e => setNs(n => ({ ...n, status: e.target.value }))} options={["Active", "Expired"]} />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={close} className="btn-ghost" style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 500, fontSize: 14, color: "#64748B", transition: "all 0.15s" }}>Cancel</button>
            <button onClick={add} className="btn-primary" style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s" }}>Add User</button>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal?.type === "resetPw") {
    const reset = async () => {
      if (pw.pass && pw.pass === pw.confirm) {
        try {
          const res = await fetch(`${API_URL}/api/admin/users/${modal.student.id}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pw.pass })
          });
          if (res.ok) {
            alert("Password reset successfully!");
            close();
          } else {
            alert("Failed to reset password");
          }
        } catch (err) {
          console.error(err);
          alert("Server connection error");
        }
      }
    };
    const ok = pw.pass.length >= 6 && pw.pass === pw.confirm;
    return (
      <Modal title="Reset Password" subtitle={`Resetting password for ${modal.student?.full_name || modal.student?.name}`} onClose={close}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "#FFFBEB", border: "1.5px solid #FDE68A", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>This will immediately reset the user's password. They will need to log in with the new credentials.</p>
          </div>
          <Input label="New Password" type="password" value={pw.pass} onChange={e => setPw(p => ({ ...p, pass: e.target.value }))} placeholder="Min. 6 characters" />
          <Input label="Confirm Password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter password" />
          {pw.confirm && !ok && <p style={{ fontSize: 12, color: "#DC2626" }}>Passwords don't match or too short.</p>}
          {ok && <p style={{ fontSize: 12, color: "#059669", display: "flex", alignItems: "center", gap: 5 }}>{Ic.check()} Passwords match!</p>}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={close} className="btn-ghost" style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 500, fontSize: 14, color: "#64748B", transition: "all 0.15s" }}>Cancel</button>
            <button onClick={reset} disabled={!ok} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: ok ? "#D97706" : "#E2E8F0", cursor: ok ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14, color: ok ? "#fff" : "#94A3B8", transition: "all 0.2s" }}>Reset Password</button>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal?.type === "enroll") {
    const confirm = async () => {
      if (enroll.courseId && enroll.expiry) {
        try {
          const res = await fetch(`${API_URL}/api/admin/enrollments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: modal.student.id,
              course_id: enroll.courseId,
              expiry_date: enroll.expiry
            })
          });
          const data = await res.json();
          if (res.ok) {
            alert("Student enrolled successfully!");
            window.location.reload();
          } else {
            alert(data.error || "Enrollment failed");
          }
        } catch (err) {
          console.error(err);
          alert("Server connection failed");
        }
      }
    };
    return (
      <Modal title="Enroll Student" subtitle={`Enrolling ${modal.student?.full_name || modal.student?.name} into a course`} onClose={close}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Select label="Select Course" value={enroll.courseId} onChange={e => setEnroll(en => ({ ...en, courseId: e.target.value }))}
            options={courses.map(c => ({ value: c.id, label: `${c.title} (${c.students} students)` }))} />
          {enroll.courseId && (() => {
            const c = courses.find(x => x.id === enroll.courseId);
            return c && (
              <div style={{ background: `${c.accent}10`, border: `1.5px solid ${c.accent}30`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.accent, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: "#334155" }}><strong>{c.title}</strong> · {c.students} students currently enrolled</div>
              </div>
            );
          })()}
          <Input label="Expiry Date *" type="date" value={enroll.expiry} onChange={e => setEnroll(en => ({ ...en, expiry: e.target.value }))} />
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button onClick={close} className="btn-ghost" style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 500, fontSize: 14, color: "#64748B", transition: "all 0.15s" }}>Cancel</button>
            <button onClick={confirm} disabled={!enroll.courseId || !enroll.expiry}
              style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: enroll.courseId && enroll.expiry ? "#059669" : "#E2E8F0", cursor: enroll.courseId && enroll.expiry ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14, color: enroll.courseId && enroll.expiry ? "#fff" : "#94A3B8", transition: "all 0.2s" }}>
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
      desc: isEdit ? (modal.course.description || modal.course.desc || "") : "",
      category: isEdit ? (modal.course.category || "Web Dev") : "Web Dev",
      thumbnail: isEdit ? (modal.course.thumbnail_url || modal.course.thumbnail || "") : "",
      price: isEdit ? (modal.course.price || "") : "",
    });
    const [dragOver, setDragOver] = useState(false);

    const handleImageUpload = (e) => {
      const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormState(prev => ({ ...prev, thumbnail: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    };

    const save = async () => {
      if (!formState.title.trim()) return;
      const payload = {
        title: formState.title,
        description: formState.desc,
        thumbnail_url: formState.thumbnail,
        price: parseFloat(formState.price) || 0
      };

      try {
        let res;
        if (isEdit) {
          res = await fetch(`${API_URL}/api/admin/courses/${modal.course.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch(`${API_URL}/api/admin/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }

        if (res.ok) {
          const cRes = await fetch(`${API_URL}/api/courses`);
          if (cRes.ok) {
            setCourses(await cRes.json());
          }
          close();
        } else {
          alert("Failed to save course");
        }
      } catch (err) {
        console.error(err);
        alert("Server connection failed");
      }
    };
    return (
      <Modal title={isEdit ? "Edit Course" : "Create New Course"} subtitle={isEdit ? `Editing: ${modal.course.title}` : "Fill in the details below"} onClose={close} width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Course Title *" value={formState.title} onChange={e => setFormState(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Advanced React Development" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Description</label>
            <textarea value={formState.desc} onChange={e => setFormState(f => ({ ...f, desc: e.target.value }))} rows={3} placeholder="Brief course description..."
              style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A", background: "#FAFAFA", resize: "vertical", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", outline: "none" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Category" value={formState.category} onChange={e => setFormState(f => ({ ...f, category: e.target.value }))}
              options={["Web Dev", "Data Science", "Design", "Backend", "Mobile", "Cloud"]} />
            <Input label="Price (LKR) *" type="number" value={formState.price} onChange={e => setFormState(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 5000" />
          </div>
          {/* File Upload */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Course Thumbnail</label>
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleImageUpload(e); }}
              style={{ border: `2px dashed ${dragOver ? "#2563EB" : "#CBD5E1"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", background: dragOver ? "#EFF6FF" : "#F8FAFC", transition: "all 0.2s", cursor: "pointer", position: "relative", overflow: "hidden" }}>
              {formState.thumbnail ? (
                <div style={{ position: "absolute", inset: 0 }}>
                  <img src={formState.thumbnail} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: dragOver ? 1 : 0, transition: "opacity 0.2s" }}>
                    <span style={{ color: "white", fontWeight: 500 }}>Drop to replace</span>
                  </div>
                </div>
              ) : (
                <div style={{ color: dragOver ? "#2563EB" : "#94A3B8", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  {Ic.upload(32)}
                  <div style={{ fontSize: 14, fontWeight: 500, color: dragOver ? "#1D4ED8" : "#64748B" }}>
                    Drag & drop image here
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>PNG, JPG, WEBP · Max 5MB · 16:9 ratio</div>
                  <label style={{ display: "inline-block", padding: "7px 16px", borderRadius: 8, border: "1.5px solid #CBD5E1", background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4, transition: "all 0.15s" }}>
                    Browse Files
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={close} className="btn-ghost" style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 500, fontSize: 14, color: "#64748B", transition: "all 0.15s" }}>Cancel</button>
            <button onClick={save} className="btn-primary" style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s" }}>
              {isEdit ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  if (modal?.type === "manageContent") {
    return <ManageContentModal course={modal.course} onClose={close} />;
  }

  return null;
}

function ManageContentModal({ course, onClose }) {
  const [activeTab, setActiveTab] = useState("notices");
  const [notices, setNotices] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [contents, setContents] = useState([]);

  const [noticeForm, setNoticeForm] = useState({ title: "", message: "" });
  const [recForm, setRecForm] = useState({ title: "", video_url: "", embed_code: "" });
  const [pdfForm, setPdfForm] = useState({ title: "", content_url: "" });
  const [linkForm, setLinkForm] = useState({ title: "", content_url: "" });

  const fetchAll = async () => {
    try {
      const nRes = await fetch(`${API_URL}/api/courses/${course.id}/notifications`);
      if (nRes.ok) setNotices(await nRes.json());

      const rRes = await fetch(`${API_URL}/api/courses/${course.id}/recordings`);
      if (rRes.ok) setRecordings(await rRes.json());

      const cRes = await fetch(`${API_URL}/api/courses/${course.id}/content`);
      if (cRes.ok) setContents(await cRes.json());
    } catch (err) {
      console.error("Fetch content error:", err);
    }
  };

  React.useEffect(() => {
    fetchAll();
  }, [course.id]);

  const addNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/${course.id}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...noticeForm, created_by: 1 })
      });
      if (res.ok) {
        setNoticeForm({ title: "", message: "" });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/notifications/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const addRecording = async () => {
    if (!recForm.title || (!recForm.video_url && !recForm.embed_code)) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/${course.id}/recordings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recForm)
      });
      if (res.ok) {
        setRecForm({ title: "", video_url: "", embed_code: "" });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRecording = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/recordings/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const addContent = async (type, form, setForm) => {
    if (!form.title || !form.content_url) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/${course.id}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content_url: form.content_url, content_type: type })
      });
      if (res.ok) {
        setForm({ title: "", content_url: "" });
        fetchAll();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteContent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/content/${id}`, { method: "DELETE" });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal title="Manage Course Materials" subtitle={`Course: ${course.title}`} onClose={onClose} width={650}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid #E2E8F0" }}>
          {["notices", "recordings", "notes", "links"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: "12px 6px",
                border: "none",
                background: "none",
                borderBottom: activeTab === tab ? "3px solid #2563EB" : "3px solid transparent",
                color: activeTab === tab ? "#2563EB" : "#64748B",
                fontWeight: activeTab === tab ? 600 : 500,
                cursor: "pointer",
                textTransform: "capitalize",
                fontSize: 14,
                transition: "all 0.15s"
              }}
            >
              {tab === "notes" ? "Notes / PDFs" : tab === "links" ? "External Links" : tab}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: 4, display: "flex", flexDirection: "column", gap: 12 }}>
          
          {/* NOTICES TAB */}
          {activeTab === "notices" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>Create Course Notice</h4>
                <input
                  type="text"
                  placeholder="Notice Title"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <textarea
                  placeholder="Notice Message..."
                  rows={2}
                  value={noticeForm.message}
                  onChange={e => setNoticeForm(f => ({ ...f, message: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, fontFamily: "inherit", resize: "vertical", background: "#fff", color: "#000" }}
                />
                <button onClick={addNotice} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add Notice</button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>Existing Notices ({notices.length})</h4>
                {notices.map(n => (
                  <div key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: 12, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: "0 0 4px 0", color: "#1E3A8A", fontSize: 13 }}>{n.title}</h5>
                      <p style={{ margin: 0, fontSize: 12, color: "#1E40AF", lineHeight: 1.4 }}>{n.message}</p>
                    </div>
                    <button onClick={() => deleteNotice(n.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {notices.length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No notices added yet.</p>}
              </div>
            </>
          )}

          {/* RECORDINGS TAB */}
          {activeTab === "recordings" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>Add Video Recording</h4>
                <input
                  type="text"
                  placeholder="Video Title"
                  value={recForm.title}
                  onChange={e => setRecForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <input
                  type="text"
                  placeholder="Video URL (Direct link to video or mp4)"
                  value={recForm.video_url}
                  onChange={e => setRecForm(f => ({ ...f, video_url: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <textarea
                  placeholder="Or Embed HTML Code (e.g. YouTube Iframe Embed Code)"
                  rows={2}
                  value={recForm.embed_code}
                  onChange={e => setRecForm(f => ({ ...f, embed_code: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, fontFamily: "inherit", resize: "vertical", background: "#fff", color: "#000" }}
                />
                <button onClick={addRecording} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add Video</button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>Existing Recordings ({recordings.length})</h4>
                {recordings.map(r => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: 0, color: "#166534", fontSize: 13 }}>{r.title}</h5>
                      <span style={{ fontSize: 11, color: "#15803D", wordBreak: "break-all" }}>{r.video_url || "Embed HTML Code"}</span>
                    </div>
                    <button onClick={() => deleteRecording(r.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {recordings.length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No videos added yet.</p>}
              </div>
            </>
          )}

          {/* NOTES/PDF TAB */}
          {activeTab === "notes" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>Upload Note / PDF Link</h4>
                <input
                  type="text"
                  placeholder="Document Title"
                  value={pdfForm.title}
                  onChange={e => setPdfForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <input
                  type="text"
                  placeholder="Document URL (PDF URL / File Link)"
                  value={pdfForm.content_url}
                  onChange={e => setPdfForm(f => ({ ...f, content_url: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <button onClick={() => addContent("pdf", pdfForm, setPdfForm)} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add PDF</button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>Existing Notes ({contents.filter(c => c.content_type === "pdf").length})</h4>
                {contents.filter(c => c.content_type === "pdf").map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: 0, color: "#991B1B", fontSize: 13 }}>{c.title}</h5>
                      <span style={{ fontSize: 11, color: "#B91C1C", wordBreak: "break-all" }}>{c.content_url}</span>
                    </div>
                    <button onClick={() => deleteContent(c.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {contents.filter(c => c.content_type === "pdf").length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No notes added yet.</p>}
              </div>
            </>
          )}

          {/* EXTERNAL LINKS TAB */}
          {activeTab === "links" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>Add External Material Link</h4>
                <input
                  type="text"
                  placeholder="Material Title"
                  value={linkForm.title}
                  onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <input
                  type="text"
                  placeholder="Material URL (e.g. Website URL / Video Link)"
                  value={linkForm.content_url}
                  onChange={e => setLinkForm(f => ({ ...f, content_url: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <button onClick={() => addContent("link", linkForm, setLinkForm)} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add Link</button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>Existing Links ({contents.filter(c => c.content_type === "link").length})</h4>
                {contents.filter(c => c.content_type === "link").map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: 0, color: "#6B21A8", fontSize: 13 }}>{c.title}</h5>
                      <span style={{ fontSize: 11, color: "#7E22CE", wordBreak: "break-all" }}>{c.content_url}</span>
                    </div>
                    <button onClick={() => deleteContent(c.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {contents.filter(c => c.content_type === "link").length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No external links added yet.</p>}
              </div>
            </>
          )}

        </div>

        {/* Close footer */}
        <button onClick={onClose} className="btn-primary" style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", marginTop: 6 }}>Close & Done</button>
      </div>
    </Modal>
  );
}
