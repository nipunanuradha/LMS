"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import { Shield, Eye, Lock, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-base">
            Last Updated: May 30, 2026. This Privacy Policy describes how ICT Academy collects, uses, and protects your information.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 sm:p-12 space-y-10 text-slate-600">
          
          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              1. Information We Collect
            </h2>
            <p className="leading-relaxed">
              We collect information that you provide directly to us when registering for a course, creating an account on our Student LMS, or contacting us for support. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal details:</strong> Name, date of birth, gender, and national identity card (NIC) number.</li>
              <li><strong>Contact information:</strong> Email address, mobile phone number, and physical billing/postal address.</li>
              <li><strong>Academic records:</strong> Courses enrolled, course progress, grades, assignments, and certification statuses.</li>
              <li><strong>Technical data:</strong> IP address, browser type, and system logs when you interact with our LMS platform.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed">
              ICT Academy utilizes the collected data for various purposes in order to provide and improve our educational services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To manage your enrollment and authorize access to your personal Student LMS dashboard.</li>
              <li>To track your academic progress, issue certifications, and evaluate assignments.</li>
              <li>To send vital administrative updates, announcements, and promotional newsletters (which you can opt-out of at any time).</li>
              <li>To analyze LMS system performance, fix technical bugs, and improve the overall learning experience.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              3. Information Sharing & Disclosure
            </h2>
            <p className="leading-relaxed">
              We highly value your privacy and do not sell or rent your personal information to third parties. We may disclose your information only under the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With trusted third-party services that host our systems, process online payments, or distribute emails.</li>
              <li><strong>Legal Compliance:</strong> If required to do so by Sri Lankan law or in response to valid requests by public authorities.</li>
              <li><strong>Corporate Partners:</strong> If you are enrolled through an employer-sponsored or institutional program, we may share progress reports with them.</li>
            </ul>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              4. Data Security & Retention
            </h2>
            <p className="leading-relaxed">
              We employ industry-standard encryption and security measures to protect your personal information against unauthorized access, loss, or alteration. 
            </p>
            <p className="leading-relaxed">
              Your account credentials and student records are stored on secure cloud servers. We retain your personal data for as long as your student account is active or as needed to provide you services and maintain official academic registry archives.
            </p>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900">
              5. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our administration:
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
