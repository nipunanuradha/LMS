// ─────────────────────────────────────────────────────────────────────────────
// src/components/modals/ModalManager.jsx
// Routes to the correct modal based on the `modal` state value.
// Each inner component is self-contained with its own local form state.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Modal from "./Modal";
import { Input, Select } from "../UI/Primitives";
import { Ic } from "../UI/icons";
import { DISTRICTS, COURSE_CATEGORIES } from "../../../../Constants/config";
import { STUDENT_COLORS, COURSE_ACCENTS } from "../../../../mock data/Mockdata";
import {
    createStudent, resetStudentPassword,
    enrollStudent, createCourse, updateCourse,
} from "../../../api/api";

// ─────────────────────────────────────────────────────────────────────────────
// ADD STUDENT
// ─────────────────────────────────────────────────────────────────────────────
function AddStudentModal({ onClose, setStudents }) {
    const [form, setForm] = useState({ name: "", phone: "", district: "Colombo", status: "Active" });
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!form.name.trim()) return;
        setLoading(true);
        try {
            const newStudent = await createStudent(form);
            setStudents(prev => [...prev, {
                ...newStudent,
                color: STUDENT_COLORS[prev.length % STUDENT_COLORS.length],
            }]);
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Add New Student" subtitle="Create a new student account" onClose={onClose}>
            <div className="flex-col gap-14">
                <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Amara Perera" />
                <Input label="Phone Number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+94 77 000 0000" />
                <Select label="District" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} options={DISTRICTS.slice(1)} />
                <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} options={["Active", "Expired"]} />

                <div className="flex gap-10" style={{ marginTop: 6 }}>
                    <button onClick={onClose} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleAdd} disabled={loading} className="btn btn--primary" style={{ flex: 1 }}>
                        {loading ? "Adding…" : "Add Student"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────────────────────────────
function ResetPasswordModal({ onClose, student }) {
    const [pw, setPw] = useState({ pass: "", confirm: "" });
    const [loading, setLoading] = useState(false);
    const ok = pw.pass.length >= 6 && pw.pass === pw.confirm;

    const handleReset = async () => {
        if (!ok) return;
        setLoading(true);
        try {
            await resetStudentPassword(student.id, { password: pw.pass, passwordConfirm: pw.confirm });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Reset Password" subtitle={`Resetting password for ${student?.name}`} onClose={onClose}>
            <div className="flex-col gap-14">
                {/* Warning callout */}
                <div className="callout callout--warning">
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <p style={{ fontSize: 12, lineHeight: 1.6 }}>
                        This will immediately reset the student's password. They will need to log in with the new credentials.
                    </p>
                </div>

                <Input label="New Password" type="password" value={pw.pass} onChange={e => setPw(p => ({ ...p, pass: e.target.value }))} placeholder="Min. 6 characters" />
                <Input label="Confirm Password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Re-enter password" />

                {pw.confirm && !ok && (
                    <p style={{ fontSize: 12, color: "#DC2626" }}>Passwords don't match or too short.</p>
                )}
                {ok && (
                    <p style={{ fontSize: 12, color: "#059669", display: "flex", alignItems: "center", gap: 5 }}>
                        {Ic.check()} Passwords match!
                    </p>
                )}

                <div className="flex gap-10" style={{ marginTop: 6 }}>
                    <button onClick={onClose} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleReset} disabled={!ok || loading}
                        style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: ok ? "#D97706" : "#E2E8F0", cursor: ok ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14, color: ok ? "#fff" : "#94A3B8", transition: "all 0.2s" }}>
                        {loading ? "Resetting…" : "Reset Password"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENROLL STUDENT
// ─────────────────────────────────────────────────────────────────────────────
function EnrollModal({ onClose, student, courses }) {
    const [form, setForm] = useState({ courseId: courses[0]?.id || "", expiry: "" });
    const [loading, setLoading] = useState(false);
    const canSubmit = form.courseId && form.expiry;
    const selectedCourse = courses.find(c => c.id === form.courseId);

    const handleEnroll = async () => {
        if (!canSubmit) return;
        setLoading(true);
        try {
            await enrollStudent({ studentId: student.id, courseId: form.courseId, expiryDate: form.expiry });
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Enroll Student" subtitle={`Enrolling ${student?.name} into a course`} onClose={onClose}>
            <div className="flex-col gap-14">
                <Select
                    label="Select Course"
                    value={form.courseId}
                    onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                    options={courses.map(c => ({ value: c.id, label: `${c.title} (${c.students} students)` }))}
                />

                {/* Selected course preview */}
                {selectedCourse && (
                    <div style={{ background: `${selectedCourse.accent}10`, border: `1.5px solid ${selectedCourse.accent}30`, borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: selectedCourse.accent, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#334155" }}>
                            <strong>{selectedCourse.title}</strong> · {selectedCourse.students} students currently enrolled
                        </span>
                    </div>
                )}

                <Input label="Expiry Date *" type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />

                <div className="flex gap-10" style={{ marginTop: 6 }}>
                    <button onClick={onClose} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleEnroll} disabled={!canSubmit || loading}
                        style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: canSubmit ? "#059669" : "#E2E8F0", cursor: canSubmit ? "pointer" : "not-allowed", fontWeight: 600, fontSize: 14, color: canSubmit ? "#fff" : "#94A3B8", transition: "all 0.2s" }}>
                        {loading ? "Enrolling…" : "Confirm Enrollment"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / EDIT COURSE
// ─────────────────────────────────────────────────────────────────────────────
function CourseFormModal({ onClose, course, courses, setCourses }) {
    const isEdit = Boolean(course);
    const [form, setForm] = useState({
        title: isEdit ? course.title : "",
        desc: isEdit ? course.desc : "",
        category: isEdit ? course.category : "Web Dev",
    });
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setLoading(true);
        try {
            if (isEdit) {
                await updateCourse(course.id, form);
                setCourses(prev => prev.map(c => c.id === course.id ? { ...c, ...form } : c));
            } else {
                const newCourse = await createCourse(form);
                setCourses(prev => [...prev, { ...newCourse, accent: COURSE_ACCENTS[prev.length % COURSE_ACCENTS.length] }]);
            }
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Course" : "Create New Course"}
            subtitle={isEdit ? `Editing: ${course.title}` : "Fill in the details below"}
            onClose={onClose}
            width={520}
        >
            <div className="flex-col gap-14">
                <Input
                    label="Course Title *"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Advanced React Development"
                />

                {/* Textarea */}
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        value={form.desc}
                        onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                        rows={3}
                        placeholder="Brief course description…"
                        className="form-textarea"
                    />
                </div>

                <Select
                    label="Category"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    options={COURSE_CATEGORIES}
                />

                {/* File Upload Zone */}
                <div>
                    <label className="form-label" style={{ display: "block", marginBottom: 6 }}>Course Thumbnail</label>
                    <div
                        className={`upload-zone ${dragOver ? "upload-zone--drag-over" : ""}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); }}
                    >
                        <div className="flex-col items-center gap-10" style={{ color: dragOver ? "#2563EB" : "#94A3B8" }}>
                            {Ic.upload(32)}
                            <div style={{ fontSize: 14, fontWeight: 500, color: dragOver ? "#1D4ED8" : "#64748B" }}>
                                Drag &amp; drop image here
                            </div>
                            <div style={{ fontSize: 12, color: "#94A3B8" }}>PNG, JPG, WEBP · Max 5MB · 16:9 ratio</div>
                            <button style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #CBD5E1", background: "#fff", color: "#374151", cursor: "pointer", fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                                Browse Files
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10" style={{ marginTop: 4 }}>
                    <button onClick={onClose} className="btn btn--ghost" style={{ flex: 1 }}>Cancel</button>
                    <button onClick={handleSave} disabled={loading} className="btn btn--primary" style={{ flex: 1 }}>
                        {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Course"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT ROUTER
// ─────────────────────────────────────────────────────────────────────────────
export default function ModalManager({ modal, setModal, students, setStudents, courses, setCourses }) {
    const close = () => setModal(null);
    if (!modal) return null;

    if (modal === "addStudent")
        return <AddStudentModal onClose={close} setStudents={setStudents} />;

    if (modal?.type === "resetPw")
        return <ResetPasswordModal onClose={close} student={modal.student} />;

    if (modal?.type === "enroll")
        return <EnrollModal onClose={close} student={modal.student} courses={courses} />;

    if (modal?.type === "editCourse" || modal === "createCourse")
        return <CourseFormModal onClose={close} course={modal?.course} courses={courses} setCourses={setCourses} />;

    return null;
}