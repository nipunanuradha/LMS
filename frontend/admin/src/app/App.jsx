import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/Dashboardpage";
import StudentsPage from "./pages/Studentspage";
import CoursesPage from "./pages/CoursesPage";
import RevenuePage from "./pages/Revenuepage";
import SettingsPage from "./pages/Settingspage";
import InquiriesPage from "./pages/InquiriesPage";
import ModalManager from "./components/modals/ModalManager";
import AdminChatWidget from "./components/AdminChatWidget";
import { STUDENTS_INIT, COURSES_INIT } from "./data/mockData";
import { API_URL, LANDING_URL } from "./config";

// ── Font & Global Styles ──────────────────────────────────────────────────────
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'DM Sans', sans-serif; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
      .nav-item.active { background: rgba(37,99,235,0.25) !important; }
      .btn-primary:hover { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important; }
      .btn-primary:active { transform: translateY(0); }
      .btn-ghost:hover { background: #F1F5F9 !important; }
      .btn-danger:hover { background: #FEF2F2 !important; }
      .btn-success:hover { background: #F0FDF4 !important; }
      .btn-warning:hover { background: #FFFBEB !important; }
      .card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
      .course-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important; }
      .table-row:hover td { background: #F8FAFC !important; }
      input, select, textarea { font-family: 'DM Sans', sans-serif; outline: none; }
      input:focus, select:focus, textarea:focus { border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }
      .kpi-card:hover { transform: translateY(-2px); }
      .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.3) !important; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);
  return null;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    const loggedInParam = params.get("admin_isLoggedIn");
    const userParam = params.get("user");
    if (loggedInParam === "true" && tokenParam) {
      localStorage.setItem("admin_isLoggedIn", "true");
      localStorage.setItem("token", tokenParam);
      if (userParam) {
        localStorage.setItem("currentUser", decodeURIComponent(userParam));
      }
      // Clean query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    return localStorage.getItem("admin_isLoggedIn") === "true";
  });
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(true);
  const [modal, setModal] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          const sRes = await fetch(`${API_URL}/api/admin/students`);
          const cRes = await fetch(`${API_URL}/api/courses`);
          if (sRes.ok) setStudents(await sRes.json());
          if (cRes.ok) setCourses(await cRes.json());
        } catch (err) {
          console.error("Data fetch failed:", err);
        }
      };

      const fetchNotifications = async () => {
        try {
          const nRes = await fetch(`${API_URL}/api/admin/notifications`);
          if (nRes.ok) setNotifications(await nRes.json());
        } catch (err) {
          console.error("Notifications fetch failed:", err);
        }
      };

      fetchData();
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  const [globalSearch, setGlobalSearch] = useState("");

  if (!isLoggedIn) {
    window.location.href = LANDING_URL;
    return null;
  }

  const pageNames = { dashboard: "Dashboard", students: "Student Management", admins: "Admin Management", courses: "Course Management", revenue: "Revenue & Enrollments", inquiries: "Contact Inquiries", settings: "Settings" };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#F9FAFB", overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebar(false)} />
        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Header
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebar}
            notifications={notifications} setNotifications={setNotifications}
            searchVal={globalSearch} onSearch={setGlobalSearch}
            setPage={setPage} setModal={setModal}
            students={students} courses={courses}
          />
          {/* Breadcrumb */}
          <div style={{ padding: "10px 28px", background: "#fff", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>ICT With Anuradha Nipun</span>
            <span style={{ fontSize: 12, color: "#CBD5E1" }}>/</span>
            <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 500 }}>{pageNames[page]}</span>
          </div>
          <main style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
            {page === "dashboard" && <DashboardPage students={students} courses={courses} setModal={setModal} />}
            {page === "students" && <StudentsPage students={students.filter(s => !s.role || s.role === 'student')} setStudents={setStudents} setModal={setModal} type="student" globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />}
            {page === "admins" && <StudentsPage students={students.filter(s => s.role === 'admin')} setStudents={setStudents} setModal={setModal} type="admin" globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />}
            {page === "courses" && <CoursesPage courses={courses} setCourses={setCourses} setModal={setModal} globalSearch={globalSearch} setGlobalSearch={setGlobalSearch} />}
            {page === "revenue" && <RevenuePage />}
            {page === "inquiries" && <InquiriesPage />}
            {page === "settings" && <SettingsPage />}
          </main>
        </div>
        {/* Modals */}
        {modal && (
          <ModalManager
            modal={modal} setModal={setModal}
            students={students} setStudents={setStudents}
            courses={courses} setCourses={setCourses}
          />
        )}
        <AdminChatWidget students={students} />
      </div>
    </>
  );
}
