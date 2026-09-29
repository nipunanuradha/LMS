import React, { useState, useEffect, useMemo } from "react";
import Modal from "./Modal";
import { Input, Select } from "../ui/Primitives";
import { Ic } from "../ui/icons";
import { DISTRICTS } from "../../data/mockData";
import { API_URL, getImageUrl } from "../../config";

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
    return (
      <EnhancedEnrollModal
        student={modal.student}
        courses={courses}
        onClose={close}
        onEnrolled={() => {
          close();
          window.location.reload();
        }}
      />
    );
  }

  if (modal?.type === "manageStudentAccess") {
    return (
      <ManageStudentAccessModal
        student={modal.student}
        courses={courses}
        onClose={close}
        onOpenEnroll={(st) => setModal({ type: "enroll", student: st })}
      />
    );
  }

  if (modal?.type === "editCourse" || modal === "createCourse") {
    const isEdit = modal?.type === "editCourse";
    const [formState, setFormState] = useState({
      title: isEdit ? modal.course.title : "",
      desc: isEdit ? (modal.course.description || modal.course.desc || "") : "",
      category: isEdit ? (modal.course.category || modal.course.course_category || "Web Dev") : "Web Dev",
      thumbnail: isEdit ? (modal.course.thumbnail_url || modal.course.thumbnail || "") : "",
      price: isEdit ? (modal.course.price || "") : "",
      offer_price: isEdit ? (modal.course.offer_price || "") : "",
      discount_badge: isEdit ? (modal.course.discount_badge || "") : "",
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
        price: parseFloat(formState.price) || 0,
        offer_price: formState.offer_price !== "" ? parseFloat(formState.offer_price) : null,
        discount_badge: formState.discount_badge.trim() || null,
        course_category: formState.category
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
      <Modal title={isEdit ? "Edit Course & Pricing" : "Create New Course"} subtitle={isEdit ? `Editing: ${modal.course.title}` : "Fill in the details below"} onClose={close} width={540}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Input label="Course Title *" value={formState.title} onChange={e => setFormState(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Advanced React Development" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Description</label>
            <textarea value={formState.desc} onChange={e => setFormState(f => ({ ...f, desc: e.target.value }))} rows={3} placeholder="Brief course description..."
              style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A", background: "#FAFAFA", resize: "vertical", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", outline: "none" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Category" value={formState.category} onChange={e => setFormState(f => ({ ...f, category: e.target.value }))}
              options={["Web Dev", "Data Science", "Design", "Backend", "Mobile", "Cloud", "O/L", "A/L"]} />
            <Input label="Regular Monthly Fee (LKR) *" type="number" value={formState.price} onChange={e => setFormState(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 5000" />
          </div>

          {/* Special Offer / Discount Section */}
          <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#166534", display: "flex", alignItems: "center", gap: 5 }}>
                🎁 Promotional Offer / Discount Price
              </span>
              <span style={{ fontSize: 11, color: "#15803D" }}>Optional</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#166534", display: "block", marginBottom: 4 }}>Offer Price (LKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 3500 (Leave empty for none)"
                  value={formState.offer_price}
                  onChange={e => setFormState(f => ({ ...f, offer_price: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86EFAC", fontSize: 13, background: "#fff", color: "#0F172A", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#166534", display: "block", marginBottom: 4 }}>Offer Badge Label</label>
                <input
                  type="text"
                  placeholder="e.g. 30% OFF, SPECIAL OFFER"
                  value={formState.discount_badge}
                  onChange={e => setFormState(f => ({ ...f, discount_badge: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86EFAC", fontSize: 13, background: "#fff", color: "#0F172A", outline: "none" }}
                />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#166534", margin: 0 }}>
              * When an Offer Price is active, it becomes the default student fee across all months unless customized individually.
            </p>
          </div>
          {/* File Upload */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 6 }}>Course Thumbnail</label>
            <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleImageUpload(e); }}
              style={{ border: `2px dashed ${dragOver ? "#2563EB" : "#CBD5E1"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", background: dragOver ? "#EFF6FF" : "#F8FAFC", transition: "all 0.2s", cursor: "pointer", position: "relative", overflow: "hidden" }}>
              {formState.thumbnail ? (
                <div style={{ position: "absolute", inset: 0 }}>
                  <img src={getImageUrl(formState.thumbnail)} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
  const [months, setMonths] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [notices, setNotices] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [contents, setContents] = useState([]);

  const [noticeForm, setNoticeForm] = useState({ title: "", message: "" });
  const [recForm, setRecForm] = useState({ title: "", video_url: "", embed_code: "" });
  const [pdfForm, setPdfForm] = useState({ title: "", content_url: "" });
  const [linkForm, setLinkForm] = useState({ title: "", content_url: "" });

  // Fetch 12 course months
  const fetchMonths = async () => {
    try {
      const res = await fetch(`${API_URL}/api/courses/${course.id}/months`);
      if (res.ok) {
        const data = await res.json();
        setMonths(data);
        if (data.length > 0 && !selectedMonthId) {
          // Default to current month or first month
          const curMonthNum = new Date().getMonth() + 1;
          const matched = data.find(m => m.month_number === curMonthNum) || data[0];
          setSelectedMonthId(String(matched.id));
        }
      }
    } catch (err) {
      console.error("Fetch months error:", err);
    }
  };

  const fetchAll = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      try {
        const stored = JSON.parse(localStorage.getItem("currentUser") || "{}");
        if (stored.id) headers["x-user-id"] = String(stored.id);
      } catch (e) { }

      const nRes = await fetch(`${API_URL}/api/courses/${course.id}/notifications`);
      if (nRes.ok) setNotices(await nRes.json());

      const monthQuery = selectedMonthId ? `?course_month_id=${selectedMonthId}` : "";
      const rRes = await fetch(`${API_URL}/api/courses/${course.id}/recordings${monthQuery}`, { headers });
      if (rRes.ok) setRecordings(await rRes.json());

      const cRes = await fetch(`${API_URL}/api/courses/${course.id}/content${monthQuery}`, { headers });
      if (cRes.ok) setContents(await cRes.json());
    } catch (err) {
      console.error("Fetch content error:", err);
    }
  };

  React.useEffect(() => {
    fetchMonths();
  }, [course.id]);

  React.useEffect(() => {
    fetchAll();
  }, [course.id, selectedMonthId]);

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
        body: JSON.stringify({
          ...recForm,
          course_month_id: selectedMonthId ? parseInt(selectedMonthId) : null
        })
      });
      if (res.ok) {
        setRecForm({ title: "", video_url: "", embed_code: "" });
        fetchAll();
        fetchMonths();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRecording = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/recordings/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAll();
        fetchMonths();
      }
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
        body: JSON.stringify({
          title: form.title,
          content_url: form.content_url,
          content_type: type,
          course_month_id: selectedMonthId ? parseInt(selectedMonthId) : null
        })
      });
      if (res.ok) {
        setForm({ title: "", content_url: "" });
        fetchAll();
        fetchMonths();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteContent = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/api/courses/content/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAll();
        fetchMonths();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [monthPriceInput, setMonthPriceInput] = useState("");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  const currentSelectedMonth = months.find(m => String(m.id) === String(selectedMonthId));

  React.useEffect(() => {
    if (currentSelectedMonth) {
      setMonthPriceInput(String(currentSelectedMonth.monthly_price || 0));
    }
  }, [selectedMonthId, months]);

  const updateMonthPrice = async (isReset = false) => {
    if (!currentSelectedMonth) return;
    setIsUpdatingPrice(true);
    try {
      // Default course price (offer price if set, otherwise regular price)
      const courseDefaultPrice = (course.offer_price !== null && course.offer_price !== undefined && parseFloat(course.offer_price) > 0)
        ? parseFloat(course.offer_price)
        : (parseFloat(course.price) || 0);

      const targetPrice = isReset ? courseDefaultPrice : parseFloat(monthPriceInput) || 0;
      const customFlag = isReset ? 0 : 1;

      const res = await fetch(`${API_URL}/api/courses/${course.id}/months/${currentSelectedMonth.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_price: targetPrice,
          is_custom_price: customFlag
        })
      });

      if (res.ok) {
        await fetchMonths();
        alert(isReset ? `Reset ${currentSelectedMonth.title} to default course price (Rs. ${courseDefaultPrice.toLocaleString()})` : `Updated ${currentSelectedMonth.title} fee to Rs. ${targetPrice.toLocaleString()}!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to update month price");
      }
    } catch (err) {
      console.error(err);
      alert("Server error updating price: " + err.message);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (
    <Modal title="Manage Course Materials & Monthly Pricing" subtitle={`Course: ${course.title}`} onClose={onClose} width={720}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Month Selector Bar */}
        <div style={{ background: "#F1F5F9", padding: "12px 14px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>📅 Select Month:</span>
            <select
              value={selectedMonthId}
              onChange={e => setSelectedMonthId(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: "1.5px solid #CBD5E1",
                fontSize: 13,
                fontWeight: 600,
                color: "#1E293B",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              {months.map(m => (
                <option key={m.id} value={m.id}>
                  {m.title} {m.monthly_price > 0 ? `(Rs. ${Number(m.monthly_price).toLocaleString()})` : ""} {m.is_custom_price ? "★ Custom" : ""}
                </option>
              ))}
            </select>
          </div>
          {currentSelectedMonth && (
            <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
              <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}>
                {recordings.length} Videos
              </span>
              <span style={{ background: "#DCFCE7", color: "#166534", padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}>
                {contents.length} Materials
              </span>
            </div>
          )}
        </div>

        {/* Month Fee Control Strip */}
        {currentSelectedMonth && (
          <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF", display: "flex", alignItems: "center", gap: 6 }}>
                <span>💰 Fee for {currentSelectedMonth.title}:</span>
                <span style={{ color: "#2563EB", fontSize: 14 }}>Rs. {Number(currentSelectedMonth.monthly_price || 0).toLocaleString()}</span>
                {currentSelectedMonth.is_custom_price ? (
                  <span style={{ background: "#FEF3C7", color: "#92400E", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Customized</span>
                ) : (
                  <span style={{ background: "#E2E8F0", color: "#475569", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>Default Rate</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                Default course rate: Rs. {Number((course.offer_price > 0 ? course.offer_price : course.price) || 0).toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                value={monthPriceInput}
                onChange={e => setMonthPriceInput(e.target.value)}
                placeholder="Custom Fee"
                style={{ width: 110, padding: "6px 10px", borderRadius: 6, border: "1.5px solid #93C5FD", fontSize: 13, background: "#fff", color: "#0F172A", outline: "none" }}
              />
              <button
                onClick={() => updateMonthPrice(false)}
                disabled={isUpdatingPrice}
                style={{ padding: "6px 12px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              >
                Set Fee
              </button>
              {currentSelectedMonth.is_custom_price ? (
                <button
                  onClick={() => updateMonthPrice(true)}
                  disabled={isUpdatingPrice}
                  title="Reset this month to the default course fee"
                  style={{ padding: "6px 10px", borderRadius: 6, background: "#F1F5F9", color: "#475569", border: "1.5px solid #CBD5E1", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
                >
                  Reset Default
                </button>
              ) : null}
            </div>
          </div>
        )}

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
              {tab === "notices" ? "Notices" : tab === "recordings" ? "Recordings" : tab === "notes" ? "Notes / PDFs" : "External Links"}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={{ maxHeight: "350px", overflowY: "auto", paddingRight: 4, display: "flex", flexDirection: "column", gap: 12 }}>

          {/* RECORDINGS TAB */}
          {activeTab === "recordings" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>
                    Add Video Recording for <strong>{currentSelectedMonth?.title || "selected month"}</strong>
                  </h4>
                  <span style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>Month {currentSelectedMonth?.month_number || ""}</span>
                </div>
                <input
                  type="text"
                  placeholder="Video Title (e.g. Day 01 - Full Class Recording)"
                  value={recForm.title}
                  onChange={e => setRecForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <input
                  type="text"
                  placeholder="Video URL (Direct YouTube / Vimeo or MP4 link)"
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
                <button onClick={addRecording} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Add Video to {currentSelectedMonth?.title || "Month"}
                </button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>
                  Videos in {currentSelectedMonth?.title || "this month"} ({recordings.length})
                </h4>
                {recordings.map(r => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: 0, color: "#166534", fontSize: 13 }}>{r.title}</h5>
                      <span style={{ fontSize: 11, color: "#15803D", wordBreak: "break-all" }}>{r.video_url || "Embed HTML Code"}</span>
                    </div>
                    <button onClick={() => deleteRecording(r.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {recordings.length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No videos added for this month yet.</p>}
              </div>
            </>
          )}

          {/* NOTES/PDF TAB */}
          {activeTab === "notes" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>
                  Upload Note / PDF Link for <strong>{currentSelectedMonth?.title || "selected month"}</strong>
                </h4>
                <input
                  type="text"
                  placeholder="Document Title (e.g. Month 01 Theory Note)"
                  value={pdfForm.title}
                  onChange={e => setPdfForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <input
                  type="text"
                  placeholder="Document URL (PDF Direct link / Google Drive link)"
                  value={pdfForm.content_url}
                  onChange={e => setPdfForm(f => ({ ...f, content_url: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <button onClick={() => addContent("pdf", pdfForm, setPdfForm)} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Add PDF to {currentSelectedMonth?.title || "Month"}
                </button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>
                  Notes in {currentSelectedMonth?.title || "this month"} ({contents.filter(c => c.content_type === "pdf").length})
                </h4>
                {contents.filter(c => c.content_type === "pdf").map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: 0, color: "#991B1B", fontSize: 13 }}>{c.title}</h5>
                      <span style={{ fontSize: 11, color: "#B91C1C", wordBreak: "break-all" }}>{c.content_url}</span>
                    </div>
                    <button onClick={() => deleteContent(c.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {contents.filter(c => c.content_type === "pdf").length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No notes added for this month yet.</p>}
              </div>
            </>
          )}

          {/* EXTERNAL LINKS TAB */}
          {activeTab === "links" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>
                  Add External Link for <strong>{currentSelectedMonth?.title || "selected month"}</strong>
                </h4>
                <input
                  type="text"
                  placeholder="Material Title (e.g. Online Quiz / Resource Site)"
                  value={linkForm.title}
                  onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <input
                  type="text"
                  placeholder="Material URL (e.g. Website URL / Form link)"
                  value={linkForm.content_url}
                  onChange={e => setLinkForm(f => ({ ...f, content_url: e.target.value }))}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1.5px solid #CBD5E1", fontSize: 13, background: "#fff", color: "#000" }}
                />
                <button onClick={() => addContent("link", linkForm, setLinkForm)} style={{ alignSelf: "flex-end", padding: "6px 16px", borderRadius: 6, background: "#2563EB", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Add Link to {currentSelectedMonth?.title || "Month"}
                </button>
              </div>

              {/* List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>
                  Links in {currentSelectedMonth?.title || "this month"} ({contents.filter(c => c.content_type === "link").length})
                </h4>
                {contents.filter(c => c.content_type === "link").map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12, background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 8 }}>
                    <div style={{ flex: 1, marginRight: 10 }}>
                      <h5 style={{ margin: 0, color: "#6B21A8", fontSize: 13 }}>{c.title}</h5>
                      <span style={{ fontSize: 11, color: "#7E22CE", wordBreak: "break-all" }}>{c.content_url}</span>
                    </div>
                    <button onClick={() => deleteContent(c.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", borderRadius: 5, fontSize: 11, cursor: "pointer" }}>Delete</button>
                  </div>
                ))}
                {contents.filter(c => c.content_type === "link").length === 0 && <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "10px 0" }}>No external links added for this month yet.</p>}
              </div>
            </>
          )}

          {/* NOTICES TAB */}
          {activeTab === "notices" && (
            <>
              {/* Add form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                <h4 style={{ margin: 0, fontSize: 13, color: "#1E293B" }}>Create General Course Notice</h4>
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
                <h4 style={{ margin: "10px 0 0 0", fontSize: 13, color: "#64748B" }}>Course Notices ({notices.length})</h4>
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

        </div>

        {/* Close footer */}
        <button onClick={onClose} className="btn-primary" style={{ width: "100%", padding: "10px", borderRadius: 9, border: "none", background: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff", marginTop: 6 }}>Close & Done</button>
      </div>
    </Modal>
  );
}

/* ========================================================
   Enhanced Enroll Modal with Month-Access Selection
   ======================================================== */
function EnhancedEnrollModal({ student, courses, onClose, onEnrolled }) {
  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [expiry, setExpiry] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [grantAll, setGrantAll] = useState(true);
  const [months, setMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // When courseId changes, fetch months
  useEffect(() => {
    if (!courseId) return;
    let isMounted = true;
    setLoadingMonths(true);
    fetch(`${API_URL}/api/courses/${courseId}/months`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setMonths(Array.isArray(data) ? data : []);
          setSelectedMonths(Array.isArray(data) ? data.map(m => m.id) : []);
          setLoadingMonths(false);
        }
      })
      .catch(err => {
        console.error("Error loading months:", err);
        if (isMounted) setLoadingMonths(false);
      });
    return () => { isMounted = false; };
  }, [courseId]);

  const toggleMonth = (mId) => {
    setSelectedMonths(prev =>
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  const handleConfirm = async () => {
    if (!courseId || !expiry) {
      alert("Please select a course and expiry date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.id,
          course_id: courseId,
          expiry_date: expiry,
          grant_all_months: grantAll,
          month_ids: grantAll ? [] : selectedMonths
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Student enrolled successfully with selected month access!");
        onEnrolled();
      } else {
        alert(data.error || "Enrollment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <Modal
      title="Enroll Student"
      subtitle={`Enrolling ${student?.full_name || student?.name} (ID: ${student?.id})`}
      onClose={onClose}
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Select
          label="Select Course *"
          value={courseId}
          onChange={e => setCourseId(e.target.value)}
          options={courses.map(c => ({ value: c.id, label: `${c.title} (${c.students || 0} students)` }))}
        />

        {selectedCourse && (
          <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#166534" }}>
              <strong>Fee:</strong> Rs. {parseFloat(selectedCourse.offer_price || selectedCourse.price || 0).toLocaleString()}
              {selectedCourse.discount_badge && (
                <span style={{ marginLeft: 8, background: "#16A34A", color: "#fff", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                  {selectedCourse.discount_badge}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#15803D" }}>
              Category: <strong>{selectedCourse.course_category || "General"}</strong>
            </div>
          </div>
        )}

        <Input
          label="Course Access Expiry Date *"
          type="date"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
        />

        {/* Month Access Selection */}
        <div style={{ border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "14px", background: "#F8FAFC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1E293B" }}>
                📅 Monthly Content Access
              </h4>
              <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>
                Select which months of learning materials this student can unlock
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#2563EB", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={grantAll}
                onChange={e => {
                  setGrantAll(e.target.checked);
                  if (e.target.checked) {
                    setSelectedMonths(months.map(m => m.id));
                  } else {
                    setSelectedMonths([]);
                  }
                }}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              Unlock All 12 Months
            </label>
          </div>

          {loadingMonths ? (
            <div style={{ padding: "16px", textAlign: "center", fontSize: 12, color: "#94A3B8" }}>Loading months...</div>
          ) : !grantAll ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, maxHeight: 180, overflowY: "auto", padding: "4px" }}>
              {months.map(m => {
                const checked = selectedMonths.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMonth(m.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: checked ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0",
                      background: checked ? "#EFF6FF" : "#fff",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => { }}
                      style={{ cursor: "pointer" }}
                    />
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: checked ? "#1E40AF" : "#334155", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                        {m.title || `Month ${m.month_number}`}
                      </div>
                      <div style={{ fontSize: 10, color: "#94A3B8" }}>Rs. {parseFloat(m.monthly_price || 0).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: "#EFF6FF", border: "1px dashed #93C5FD", borderRadius: 8, padding: "10px", textAlign: "center", fontSize: 12, color: "#1E40AF" }}>
              ✓ All 12 monthly content modules (notices, videos, pdfs) will be automatically unlocked for this student.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            onClick={onClose}
            type="button"
            className="btn-ghost"
            style={{ flex: 1, padding: "10px", borderRadius: 9, border: "1.5px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", fontWeight: 500, fontSize: 14, color: "#64748B" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            disabled={!courseId || !expiry || submitting}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 9,
              border: "none",
              background: courseId && expiry && !submitting ? "#059669" : "#94A3B8",
              cursor: courseId && expiry && !submitting ? "pointer" : "not-allowed",
              fontWeight: 600,
              fontSize: 14,
              color: "#fff",
              transition: "all 0.2s"
            }}
          >
            {submitting ? "Enrolling..." : "Confirm & Unlock"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ========================================================
   Manage Student Enrolled Courses & Month Access Modal
   ======================================================== */
function ManageStudentAccessModal({ student, courses, onClose, onOpenEnroll }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${student.id}/enrollments`);
      if (res.ok) {
        const data = await res.json();
        setEnrollments(data);
        if (data.length > 0 && !activeCourseId) {
          setActiveCourseId(data[0].course_id);
        }
      }
    } catch (err) {
      console.error("Error fetching student enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [student.id]);

  // Toggle individual month
  const toggleMonth = async (courseId, monthId, currentStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${student.id}/courses/${courseId}/month-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_month_id: monthId,
          grant: !currentStatus
        })
      });
      if (res.ok) {
        await fetchEnrollments();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update month access");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle all months for course
  const toggleAllMonths = async (courseId, grant) => {
    if (!confirm(`Are you sure you want to ${grant ? "UNLOCK" : "LOCK"} all 12 months for this student?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${student.id}/courses/${courseId}/toggle-all-months`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant })
      });
      if (res.ok) {
        await fetchEnrollments();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to toggle months");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  // Unenroll / remove student from course
  const unenrollCourse = async (courseId, courseTitle) => {
    if (!confirm(`⚠️ Are you sure you want to REMOVE ${student.full_name || student.name} from "${courseTitle}"?\n\nThis will revoke all course & monthly content access immediately.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/students/${student.id}/courses/${courseId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Student removed from course successfully.");
        await fetchEnrollments();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to remove student from course");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server");
    } finally {
      setActionLoading(false);
    }
  };

  const activeEnr = enrollments.find(e => e.course_id === activeCourseId) || enrollments[0];

  return (
    <Modal
      title="Student Course & Month Access"
      subtitle={`Managing courses & permissions for ${student?.full_name || student?.name} · Phone: ${student?.phone_number || "N/A"}`}
      onClose={onClose}
      width={780}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Top Header bar with quick enroll button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F1F5F9", padding: "10px 14px", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#334155" }}>
            Enrolled in <strong>{enrollments.length}</strong> {enrollments.length === 1 ? "course" : "courses"}
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenEnroll(student);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              background: "#2563EB",
              color: "#fff",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {Ic.plus(12)} Enroll in Another Course
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: 14 }}>
            Loading student course data...
          </div>
        ) : enrollments.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", background: "#F8FAFC", borderRadius: 12, border: "1.5px dashed #CBD5E1" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
            <h3 style={{ margin: "0 0 6px 0", color: "#1E293B", fontSize: 16 }}>No Enrolled Courses Found</h3>
            <p style={{ margin: "0 0 16px 0", color: "#64748B", fontSize: 13 }}>
              This student has not been enrolled in any courses yet.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenEnroll(student);
              }}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                background: "#059669",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Enroll Student Now
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
            {/* Left side: Course list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: "0.5px" }}>
                Enrolled Courses ({enrollments.length})
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
                {enrollments.map(enr => {
                  const isSelected = activeCourseId === enr.course_id;
                  const unlockedCount = (enr.months || []).filter(m => m.has_access).length;
                  return (
                    <div
                      key={enr.enrollment_id}
                      onClick={() => setActiveCourseId(enr.course_id)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 9,
                        border: isSelected ? "1.5px solid #2563EB" : "1.5px solid #E2E8F0",
                        background: isSelected ? "#EFF6FF" : "#fff",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#1E40AF" : "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, paddingRight: 6 }}>
                          {enr.course_title}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            unenrollCourse(enr.course_id, enr.course_title);
                          }}
                          disabled={actionLoading}
                          title="Remove from Course"
                          style={{
                            padding: "3px 6px",
                            borderRadius: 5,
                            border: "1px solid #FECACA",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            fontSize: 10,
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          {Ic.trash(11)}
                        </button>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#64748B" }}>
                        <span>{enr.course_category || "General"}</span>
                        <span style={{ fontWeight: 600, color: unlockedCount > 0 ? "#16A34A" : "#94A3B8" }}>
                          {unlockedCount}/12 Unlocked
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Course details & Month Access toggles */}
            {activeEnr ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, borderLeft: "1px solid #E2E8F0", paddingLeft: 16 }}>
                {/* Course Banner */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 10, borderBottom: "1px solid #F1F5F9" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", color: "#0F172A", fontSize: 16, fontWeight: 700 }}>
                      {activeEnr.course_title}
                    </h3>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748B" }}>
                      <span>Expires: <strong>{activeEnr.expiry_date ? new Date(activeEnr.expiry_date).toLocaleDateString() : "Permanent"}</strong></span>
                      <span>Enrolled on: {new Date(activeEnr.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => unenrollCourse(activeEnr.course_id, activeEnr.course_title)}
                    disabled={actionLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 12px",
                      borderRadius: 7,
                      border: "1.5px solid rgba(239, 68, 68, 0.4)",
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#DC2626",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: actionLoading ? "not-allowed" : "pointer"
                    }}
                    title="Remove student from this course completely"
                  >
                    {Ic.trash(12)} Remove from Course
                  </button>
                </div>

                {/* Bulk Actions for months */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
                    Monthly Content Access (12 Months)
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => toggleAllMonths(activeEnr.course_id, true)}
                      disabled={actionLoading}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #86EFAC",
                        background: "#F0FDF4",
                        color: "#166534",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: actionLoading ? "not-allowed" : "pointer"
                      }}
                    >
                      ✓ Unlock All Months
                    </button>
                    <button
                      onClick={() => toggleAllMonths(activeEnr.course_id, false)}
                      disabled={actionLoading}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #FECACA",
                        background: "#FEF2F2",
                        color: "#991B1B",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: actionLoading ? "not-allowed" : "pointer"
                      }}
                    >
                      ✕ Lock All Months
                    </button>
                  </div>
                </div>

                {/* Grid of 12 Months */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxHeight: 260, overflowY: "auto", padding: "2px" }}>
                  {(activeEnr.months || []).map(m => {
                    const isUnlocked = m.has_access;
                    return (
                      <div
                        key={m.month_id}
                        style={{
                          padding: "10px",
                          borderRadius: 8,
                          border: isUnlocked ? "1.5px solid #86EFAC" : "1.5px solid #E2E8F0",
                          background: isUnlocked ? "#F0FDF4" : "#F8FAFC",
                          display: "flex",
                          flexDirection: "column",
                          gap: 6
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: isUnlocked ? "#166534" : "#475569" }}>
                            {m.month_title || `Month ${m.month_number}`}
                          </span>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: isUnlocked ? "#DCFCE7" : "#E2E8F0",
                              color: isUnlocked ? "#15803D" : "#64748B"
                            }}
                          >
                            {isUnlocked ? "UNLOCKED" : "LOCKED"}
                          </span>
                        </div>

                        <div style={{ fontSize: 10, color: "#64748B" }}>
                          Fee: Rs. {parseFloat(m.monthly_price || 0).toLocaleString()}
                        </div>

                        <button
                          onClick={() => toggleMonth(activeEnr.course_id, m.month_id, isUnlocked)}
                          disabled={actionLoading}
                          style={{
                            width: "100%",
                            padding: "5px 8px",
                            borderRadius: 6,
                            border: "none",
                            background: isUnlocked ? "#FEE2E2" : "#DBEAFE",
                            color: isUnlocked ? "#991B1B" : "#1E40AF",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: actionLoading ? "not-allowed" : "pointer",
                            transition: "all 0.15s"
                          }}
                        >
                          {isUnlocked ? "Lock Access" : "Unlock Access"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: "9px 22px",
              borderRadius: 8,
              border: "none",
              background: "#2563EB",
              color: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer"
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

