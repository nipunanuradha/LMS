"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import { FileText, BookOpen, AlertCircle, ShieldAlert, BadgeCheck } from "lucide-react";

export default function TermsOfService() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-base">
            Effective Date: May 30, 2026. Please read these Terms of Service carefully before enrolling or using the ICT Academy LMS platform.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-12 space-y-10 text-slate-600">
          
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing, browsing, or registering for courses at ICT Academy (online or offline), and by utilizing the Student Learning Management System (LMS) portal, you agree to be bound by these Terms of Service and all applicable laws and regulations in Sri Lanka.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              2. Student Account Registration
            </h2>
            <p className="leading-relaxed">
              To access course materials, assignments, and certifications, you must create a Student Account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete personal and academic information during registration.</li>
              <li>Maintain the confidentiality of your unique LMS login credentials (username and password).</li>
              <li>Be fully responsible for all activities and updates occurring under your account.</li>
              <li>Notify the Academy immediately if you suspect any unauthorized breach of your account.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-500" />
              3. Intellectual Property Rights
            </h2>
            <p className="leading-relaxed">
              All learning materials, including but not limited to videos, slides, source code, quizzes, assignments, textbooks, and documentation hosted on the ICT Academy landing site and LMS portal, are the intellectual property of ICT Academy. 
            </p>
            <p className="leading-relaxed">
              You are granted a limited, personal, non-transferable license to view and download these materials solely for your own educational purposes. You may not distribute, reproduce, sell, resell, or publicly display any of the course content without written consent from our management.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-500" />
              4. Code of Conduct & Academic Integrity
            </h2>
            <p className="leading-relaxed">
              Students of ICT Academy are held to high standards of honesty and academic integrity. By utilizing our LMS:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree that all submitted quizzes, examinations, coding assignments, and projects are strictly your own work.</li>
              <li>Plagiarism, cheat codes, or sharing assessment questions/answers is strictly prohibited and can result in immediate termination of course access without refund.</li>
              <li>You must respect instructors and peers in community forums, chat portals, and virtual classroom sessions.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900">
              5. Governing Law
            </h2>
            <p className="leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes arising from these terms or educational services shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900">
              6. Contact Information
            </h2>
            <p className="leading-relaxed">
              For any questions concerning the Terms of Service, please contact us:
            </p>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-2 text-sm text-slate-700">
              <p><strong>Email:</strong> support@ictacademy.lk</p>
              <p><strong>Hotline:</strong> +94 705688895 / +94 781066642</p>
              <p><strong>Address:</strong> 98 High Level Rd, Nawagamuwa, Kaduwela, Sri Lanka</p>
            </div>
          </section>

        </div>
      </main>

      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
