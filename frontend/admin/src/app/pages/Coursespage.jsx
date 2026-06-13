import React from "react";
import { CategoryBadge } from "../components/ui/Primitives";
import { Ic } from "../components/ui/icons";
import { API_URL, getImageUrl } from "../config";

// ── Course Thumbnail ──────────────────────────────────────────────────────────
function CourseThumbnail({ course }) {
  const accents = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];
  const accent = course.accent || accents[course.id % accents.length] || "#2563EB";
  const category = course.category || "Web Dev";
  const [imgError, setImgError] = React.useState(false);

  const patterns = {
    "#2563EB": <><circle cx="140" cy="50" r="60" fill="rgba(255,255,255,0.06)"/><circle cx="40" cy="90" r="40" fill="rgba(255,255,255,0.04)"/><rect x="160" y="10" width="80" height="80" rx="8" fill="rgba(255,255,255,0.05)" transform="rotate(20 200 50)"/></>,
    "#059669": <><circle cx="20" cy="20" r="50" fill="rgba(255,255,255,0.06)"/><rect x="100" y="30" width="100" height="60" rx="30" fill="rgba(255,255,255,0.05)"/></>,
    "#7C3AED": <><polygon points="180,0 240,90 120,90" fill="rgba(255,255,255,0.07)"/><circle cx="30" cy="80" r="45" fill="rgba(255,255,255,0.05)"/></>,
    "#D97706": <><rect x="120" y="-10" width="100" height="100" rx="12" fill="rgba(255,255,255,0.06)" transform="rotate(35 170 40)"/><circle cx="20" cy="70" r="35" fill="rgba(255,255,255,0.05)"/></>,
    "#DC2626": <><circle cx="220" cy="0" r="70" fill="rgba(255,255,255,0.06)"/><rect x="0" y="50" width="80" height="40" rx="8" fill="rgba(255,255,255,0.05)"/></>,
    "#0891B2": <><circle cx="200" cy="90" r="55" fill="rgba(255,255,255,0.06)"/><circle cx="40" cy="10" r="30" fill="rgba(255,255,255,0.05)"/></>,
  };

  const renderPattern = () => (
    <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "10px 10px 0 0", overflow: "hidden", background: accent, position: "relative", flexShrink: 0 }}>
      <svg width="100%" height="100%" viewBox="0 0 240 135" preserveAspectRatio="xMidYMid slice">
        <rect width="240" height="135" fill={accent} />
        {patterns[accent] || patterns["#2563EB"]}
        <text x="16" y="72" fontSize="28" fontWeight="700" fill="rgba(255,255,255,0.15)" fontFamily="DM Sans, sans-serif">{category}</text>
      </svg>
      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <CategoryBadge cat={category} accent="#fff" />
      </div>
    </div>
  );

  if ((course.thumbnail_url || course.thumbnail) && !imgError) {
    return (
      <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "10px 10px 0 0", overflow: "hidden", position: "relative", flexShrink: 0 }}>
        <img 
          src={getImageUrl(course.thumbnail_url || course.thumbnail)} 
          alt={course.title} 
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <CategoryBadge cat={category} accent={accent} />
        </div>
      </div>
    );
  }

  return renderPattern();
}

export default function CoursesPage({ courses, setCourses, setModal, globalSearch, setGlobalSearch }) {
  const deleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const res = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setCourses(prev => prev.filter(c => c.id !== courseId));
        } else {
          alert("Failed to delete course");
        }
      } catch (err) {
        console.error(err);
        alert("Server connection failed");
      }
    }
  };

  const filteredCourses = globalSearch
    ? courses.filter(c => 
        (c.title || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
        (c.category || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
        (c.description || c.desc || "").toLowerCase().includes(globalSearch.toLowerCase())
      )
    : courses;

  return (
    <div style={{ animation: "fadeIn 0.25s ease", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Course Management</h2>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>
            {globalSearch ? `${filteredCourses.length} of ${courses.length} courses found` : `${courses.length} courses available`}
          </p>
        </div>
        <button onClick={() => setModal("createCourse")} className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, background: "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s" }}>
          {Ic.plus(14)} New Course
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
        {filteredCourses.map(course => {
          const accents = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];
          const accent = course.accent || accents[course.id % accents.length] || "#2563EB";
          const category = course.category || "Web Dev";
          const description = course.description || course.desc || "";

          return (
            <div key={course.id} className="course-card" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden", transition: "all 0.25s", display: "flex", flexDirection: "column" }}>
              <CourseThumbnail course={course} />
              <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", lineHeight: 1.4, flex: 1 }}>{course.title}</h3>
                  <CategoryBadge cat={category} accent={accent} />
                </div>
                <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1.5px solid #F8FAFC" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontSize: 13 }}>
                    <svg style={{ width: 15, height: 15 }} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span style={{ fontWeight: 600, color: accent }}>{course.students || 0}</span>
                    <span style={{ color: "#94A3B8" }}>students</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setModal({ type: "manageContent", course })} className="btn-ghost"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#2563EB", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}>
                      📁 Content
                    </button>
                    <button onClick={() => setModal({ type: "editCourse", course })} className="btn-ghost"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#334155", cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all 0.15s" }}>
                      {Ic.edit(13)} Edit
                    </button>
                    <button onClick={() => deleteCourse(course.id)} className="btn-danger"
                      style={{ display: "flex", alignItems: "center", padding: "6px 10px", borderRadius: 7, border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#991B1B", cursor: "pointer", transition: "all 0.15s" }}>
                      {Ic.trash()}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filteredCourses.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "64px 32px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
            No courses found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}