// ─────────────────────────────────────────────────────────────────────────────
// src/App.jsx
// Root shell: wires sidebar, header, breadcrumb, page router, and modal manager.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ModalManager from "./components/modals/ModalManager";

import DashboardPage from "./pages/Dashboardpage";
import StudentsPage from "./pages/Studentspage";
import CoursesPage from "./pages/Coursespage";
import RevenuePage from "./pages/Revenuepage";
import SettingsPage from "./pages/Settingspage";

import { STUDENTS_INIT, COURSES_INIT } from "./data/mockData";
import { PAGE_NAMES } from "./constants";

export default function App() {
    // ── Global state ─────────────────────────────────────────────────────────────
    const [page, setPage] = useState("dashboard");
    const [sidebarOpen, setSidebar] = useState(true);
    const [modal, setModal] = useState(null);
    const [students, setStudents] = useState(STUDENTS_INIT);
    const [courses, setCourses] = useState(COURSES_INIT);
    const [globalSearch, setGlobalSearch] = useState("");

    // ── Page router ───────────────────────────────────────────────────────────────
    const renderPage = () => {
        switch (page) {
            case "dashboard": return <DashboardPage students={students} courses={courses} setModal={setModal} />;
            case "students": return <StudentsPage students={students} setStudents={setStudents} setModal={setModal} />;
            case "courses": return <CoursesPage courses={courses} setCourses={setCourses} setModal={setModal} />;
            case "revenue": return <RevenuePage />;
            case "settings": return <SettingsPage />;
            default: return null;
        }
    };

    return (
        <div className="app-shell">

            {/* ── Sidebar ── */}
            <Sidebar
                page={page}
                setPage={setPage}
                open={sidebarOpen}
            />

            {/* ── Main area ── */}
            <div className="main-area">

                {/* Top header bar */}
                <Header
                    setSidebarOpen={setSidebar}
                    notifCount={3}
                    searchVal={globalSearch}
                    onSearch={setGlobalSearch}
                />

                {/* Breadcrumb strip */}
                <div className="breadcrumb">
                    <span className="breadcrumb__root">NEXTERA</span>
                    <span className="breadcrumb__sep">/</span>
                    <span className="breadcrumb__page">{PAGE_NAMES[page]}</span>
                </div>

                {/* Scrollable page content */}
                <main className="page-content">
                    {renderPage()}
                </main>
            </div>

            {/* ── Global Modal Layer ── */}
            <ModalManager
                modal={modal}
                setModal={setModal}
                students={students}
                setStudents={setStudents}
                courses={courses}
                setCourses={setCourses}
            />
        </div>
    );
}