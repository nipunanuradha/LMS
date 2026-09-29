"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModal";
import { RefreshCw, CreditCard, AlertCircle, HelpCircle, ShieldCheck, Clock } from "lucide-react";

export default function RefundPolicy() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onLoginClick={() => setIsLoginModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 mb-4 shadow-sm">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h1 className="font-display font-bold text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base">
            Effective Date: May 30, 2026. This policy outlines our terms and guidelines regarding course fee payments, monthly access subscriptions, and refund eligibility.
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 sm:p-12 space-y-10 text-slate-600 dark:text-slate-300">

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              1. Digital Content & Monthly Course Fees
            </h2>
            <p className="leading-relaxed">
              ICT Academy provides digital educational services, including live interactive online sessions, on-demand video lecture recordings, downloadable PDF lecture notes, code repositories, and online examination assessments.
            </p>
            <p className="leading-relaxed">
              Course fees on ICT Academy LMS are billed either as monthly modular access fees or full-course payments. Because instant digital access to copyrighted learning materials, video recordings, and cloud server resources is provisioned immediately upon transaction confirmation, payments are generally considered non-refundable once digital access has been granted, except under the circumstances outlined below.
            </p>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              2. Eligible Circumstances for Refund
            </h2>
            <p className="leading-relaxed">
              A refund or credit note may be granted strictly under the following verifiable conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Duplicate Payment / Overcharge:</strong> If your card or bank account was debited more than once for the same course or monthly fee due to a payment gateway timeout or technical failure.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Course Cancellation by Academy:</strong> If ICT Academy cancels a scheduled course or tutorial program prior to the start of lectures and is unable to provide a suitable alternative batch.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Technical Inaccessibility:</strong> If an active paid student experiences documented, verified technical system errors originating entirely from our servers that prevent any access to course materials for more than 7 consecutive business days, and our support engineering team cannot resolve the issue.
              </li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              3. Non-Refundable Scenarios
            </h2>
            <p className="leading-relaxed">
              Refunds will <strong>not</strong> be approved under any of the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500 dark:marker:text-blue-400">
              <li>Change of personal preference, schedule conflicts, lack of time, or inability to attend live online classes after payment has been completed. (All live classes are recorded and archived for on-demand playback).</li>
              <li>Student's personal device limitations, lack of compatible software, poor internet connectivity, or power interruptions on the student's end.</li>
              <li>Failure to submit assignments, sit for examinations, or achieve a passing grade.</li>
              <li>Disciplinary termination or account suspension resulting from academic dishonesty, harassment, or violation of our Terms of Service (such as sharing credentials or unauthorized distribution of course videos).</li>
              <li>Refund requests submitted more than 7 calendar days after the payment transaction date.</li>
            </ul>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              4. Refund Request Process & Timelines
            </h2>
            <p className="leading-relaxed">
              To submit a formal refund request, please adhere to the following procedure:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-sm leading-relaxed">
              <p>
                <strong>Step 1:</strong> Email our finance desk at <span className="text-blue-600 dark:text-blue-400 font-semibold">academyict3@gmail.com</span> within <strong>7 calendar days</strong> of the transaction.
              </p>
              <p>
                <strong>Step 2:</strong> Clearly provide your Registered Student Name, Registered Phone Number, Course Name, Selected Month, Transaction ID, Payment Slip/Receipt, and an explanation of the issue.
              </p>
              <p>
                <strong>Step 3:</strong> Our administrative review board will review the system audit logs and respond within <strong>3 to 5 business days</strong>.
              </p>
              <p>
                <strong>Step 4:</strong> If approved, refunds will be credited back exclusively to the original payment source (credit/debit card account or source bank account) within <strong>7 to 14 business days</strong>, subject to bank clearance schedules.
              </p>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          <section className="space-y-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              5. Contact Billing Support
            </h2>
            <p className="leading-relaxed">
              For any questions regarding fee receipts, payment verification, or billing inquiries, our support team is available during office hours:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950/60 p-6 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong className="text-slate-900 dark:text-slate-100">Billing Email:</strong> academyict3@gmail.com</p>
              <p><strong className="text-slate-900 dark:text-slate-100">Hotlines:</strong> +94 705688895 / +94 781066642</p>
              <p><strong className="text-slate-900 dark:text-slate-100">Registered Office:</strong> 94/05, Swarnabhumi Mawatha, Nawagamuwa, Ranala, Sri Lanka</p>
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
