"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import { Shield, Eye, Lock, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 mb-4 shadow-sm">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base">
            Last Updated: May 30, 2026. This Privacy Policy describes how ICT Academy collects, uses, and protects your information.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-10 text-slate-600 dark:text-slate-300">

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              1. Information We Collect
            </h2>
            <p className="leading-relaxed">
              We collect information that you provide directly to us when registering for a course, creating an account on our Student LMS, or contacting us for support. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">
              <li><strong className="text-slate-900 dark:text-slate-100">Personal details:</strong> Full name, date of birth, gender, and national identity card (NIC) number.</li>
              <li><strong className="text-slate-900 dark:text-slate-100">Contact information:</strong> Email address, mobile phone number, district, and province.</li>
              <li><strong className="text-slate-900 dark:text-slate-100">Academic & LMS records:</strong> Courses enrolled, monthly modular access records, attendance, video playback logs, quiz and assignment results.</li>
              <li><strong className="text-slate-900 dark:text-slate-100">Payment & Transaction records:</strong> Transaction references, payment dates, amounts paid, payment method (e.g. Card or Bank Transfer), and invoice numbers. <em>(Note: Sensitive card details such as full 16-digit card numbers, PINs, and CVV security codes are handled directly by certified bank gateways and are NEVER stored or seen by ICT Academy).</em></li>
              <li><strong className="text-slate-900 dark:text-slate-100">Technical logs:</strong> IP address, device fingerprints, operating system, and browser information recorded for security verification and preventing account sharing.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed">
              ICT Academy utilizes the collected data for various purposes in order to provide and improve our educational services:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">
              <li>To authenticate your student login and unlock access to paid course months and learning materials.</li>
              <li>To process course fee payments, generate official receipts, and manage billing records.</li>
              <li>To evaluate exams, calculate rankings, track course completion, and issue verifiable certificates.</li>
              <li>To send essential SMS or email alerts regarding class schedules, payment confirmations, and system updates.</li>
              <li>To enforce copyright protection, deter unauthorized account sharing or video piracy, and maintain platform security.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              3. Payment Processing & Third-Party Gateways
            </h2>
            <p className="leading-relaxed">
              Online credit card and debit card transactions on ICT Academy are handled by accredited, PCI-DSS Level 1 compliant financial payment aggregators and licensed Sri Lankan banking partners.
            </p>
            <p className="leading-relaxed">
              When processing an online payment, your financial details are securely transmitted via 256-bit TLS encryption directly from your browser to the payment processor. ICT Academy strictly complies with the Personal Data Protection Act (PDPA) No. 9 of 2022 of Sri Lanka.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              4. Data Protection & Student Rights
            </h2>
            <p className="leading-relaxed">
              We employ strict industry-standard security practices, encrypted databases, and role-based permissions to safeguard your data. Students possess the right to review their registered profile details, request corrections, or request account deactivation subject to academic record retention policies.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              5. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to our administration:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong className="text-slate-900 dark:text-slate-100">Email:</strong> academyict3@gmail.com</p>
              <p><strong className="text-slate-900 dark:text-slate-100">Hotline:</strong> +94 705688895 / +94 781066642</p>
              <p><strong className="text-slate-900 dark:text-slate-100">Address:</strong> 94/05, Swarnabhumi Mawatha, Nawagamuwa, Ranala, Sri Lanka</p>
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
