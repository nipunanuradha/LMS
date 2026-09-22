import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardPage from "./pages/Dashboardpage";
import StudentsPage from "./pages/Studentspage";
import CoursesPage from "./pages/Coursespage";
import RevenuePage from "./pages/Revenuepage";
import SettingsPage from "./pages/Settingspage";
import InquiriesPage from "./pages/InquiriesPage";
import ModalManager from "./components/modals/ModalManager";
import AdminChatWidget from "./components/AdminChatWidget";
import { ThemeProvider } from "./context/ThemeContext";
import { STUDENTS_INIT, COURSES_INIT } from "./data/mockData";
import { API_URL, LANDING_URL } from "./config";

// ── Font & Global Theme Styles ────────────────────────────────────────────────
function GlobalStyles() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --bg-main: #F9FAFB;
        --bg-card: #FFFFFF;
        --bg-card-subtle: #F8FAFC;
        --border-color: #F1F5F9;
        --border-subtle: #E2E8F0;
        --text-primary: #0F172A;
        --text-secondary: #64748B;
        --text-muted: #94A3B8;
        --input-bg: #FAFAFA;
        --table-header-bg: #F8FAFC;
        --table-row-hover: #F8FAFC;
        --breadcrumb-bg: #FFFFFF;
      }

      html.dark, [data-theme="dark"] {
        --bg-main: #0B1120;
        --bg-card: #131E32;
        --bg-card-subtle: #19263E;
        --border-color: #1E293B;
        --border-subtle: #334155;
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --text-muted: #64748B;
        --input-bg: #0F172A;
        --table-header-bg: #162238;
        --table-row-hover: #192742;
        --breadcrumb-bg: #131E32;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'DM Sans', sans-serif;
        background: var(--bg-main);
        color: var(--text-primary);
        transition: background-color 0.2s ease, color 0.2s ease;
      }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
      html.dark ::-webkit-scrollbar-thumb { background: #334155; }
      
      @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      
      .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
      .nav-item.active { background: rgba(37,99,235,0.25) !important; }
      .btn-primary:hover { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important; }
      .btn-primary:active { transform: translateY(0); }
      
      .btn-ghost:hover { background: var(--border-color) !important; }
      .btn-danger:hover { background: rgba(239, 68, 68, 0.15) !important; }
      .btn-success:hover { background: rgba(34, 197, 94, 0.15) !important; }
      .btn-warning:hover { background: rgba(245, 158, 11, 0.15) !important; }
      
      .card {
        background: var(--bg-card) !important;
        border-color: var(--border-color) !important;
        color: var(--text-primary) !important;
        transition: all 0.25s ease;
      }
      .card:hover {
        box-shadow: 0 8px 30px rgba(0,0,0,0.12) !important;
      }
      
      .course-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.15) !important; }
      .table-row:hover td { background: var(--table-row-hover) !important; }
      
      input, select, textarea {
        font-family: 'DM Sans', sans-serif;
        outline: none;
        background: var(--input-bg) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-subtle) !important;
      }
      input:focus, select:focus, textarea:focus {
        border-color: #2563EB !important;
        box-shadow: 0 0 0 3px rgba(37,99,235,0.18) !important;
      }
      
      .kpi-card:hover { transform: translateY(-2px); }
      .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.3) !important; }

      /* Responsive rules for tables */
      .responsive-table-container {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .responsive-table-container table {
        min-width: 800px;
      }

      /* Mobile responsiveness media queries */
      @media (max-width: 768px) {
        .admin-sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 240px !important;
          min-width: 240px !important;
          transform: translateX(-100%);
          z-index: 2000 !important;
        }
        .admin-sidebar.open {
          transform: translateX(0) !important;
        }
        .sidebar-overlay {
          display: block !important;
        }
        
        /* Main dashboard container padding */
        main {
          padding: 16px 14px !important;
        }
        .breadcrumb-container {
          padding: 8px 14px !important;
        }
        .dashboard-grid {
          grid-template-columns: 1fr !important;
        }
        .inquiry-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(link); document.head.removeChild(style); };
  }, []);
  return null;
}

function AdminLayout() {
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
  const [globalSearch, setGlobalSearch] = useState("");

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

  if (!isLoggedIn) {
    window.location.href = LANDING_URL;
    return null;
  }

  const pageNames = { dashboard: "Dashboard", students: "Student Management", admins: "Admin Management", courses: "Course Management", revenue: "Revenue & Enrollments", inquiries: "Contact Inquiries", settings: "Settings" };

  return (
    <>
      <GlobalStyles />
      <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "var(--bg-main)", color: "var(--text-primary)", overflow: "hidden" }}>
        {/* Sidebar */}
        <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebar(false)} />
        {/* Main Content Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <Header
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebar}
            notifications={notifications} setNotifications={setNotifications}
            searchVal={globalSearch} onSearch={setGlobalSearch}
            setPage={setPage} setModal={setModal}
            students={students} courses={courses}
          />
          {/* Breadcrumb */}
          <div className="breadcrumb-container" style={{ padding: "10px 28px", background: "var(--breadcrumb-bg)", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>ICT With Anuradha Nipun</span>
            <span style={{ fontSize: 12, color: "var(--border-subtle)" }}>/</span>
            <span style={{ fontSize: 12, color: "#2563EB", fontWeight: 600 }}>{pageNames[page]}</span>
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

export default function App() {
  return (
    <ThemeProvider>
      <AdminLayout />
    </ThemeProvider>
  );
}
