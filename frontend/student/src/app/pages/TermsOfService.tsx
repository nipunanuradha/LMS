import { Link } from "react-router";
import { ArrowLeft, BookOpen, AlertCircle, ShieldAlert, BadgeCheck, FileText } from "lucide-react";

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-10 px-4 py-4 sm:px-8 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to LMS
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          ICT Academy LMS
        </span>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Effective Date: May 30, 2026. Guidelines, subscription rules, and terms governing your student LMS account and educational services.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 space-y-8 shadow-sm text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the ICT Academy Student Learning Management System (LMS), logging into your portal, or submitting payments for courses and monthly modules, you agree to comply with and be bound by these Terms & Conditions.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              2. Student Account Security & Login Integrity
            </h2>
            <p>
              Each student is issued a unique login profile tied to their registered phone number. You are strictly prohibited from sharing your account credentials with other individuals. The LMS employs automated session tracking; concurrent logins from disparate locations or excessive IP discrepancies may lead to temporary account suspension.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-600" />
              3. Course Fees, Monthly Payments & Currency
            </h2>
            <p>
              All fees for courses and monthly lecture modules are designated in <strong>Sri Lankan Rupees (LKR)</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-blue-600">
              <li>Payments completed online via Credit/Debit card or Bank Transfer are securely processed by licensed payment partners.</li>
              <li>A paid month grants access to that specific month's live lectures, recordings, assignments, and notes.</li>
              <li>All payments are final and governed by our <Link to="/refund-policy" className="text-blue-600 hover:underline font-semibold">Refund Policy</Link>.</li>
            </ul>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
              4. Intellectual Property & Video Piracy Prohibition
            </h2>
            <p>
              All lecture videos, notes, downloadable PDFs, and source code are the proprietary intellectual property of ICT Academy. Screen recording, unauthorized downloading, reproduction, or redistributing materials across social media, Telegram, YouTube, or Google Drive is strictly forbidden and constitutes a criminal offense under Sri Lankan Intellectual Property laws.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Governing Law</h2>
            <p>
              These terms are governed by the laws of Sri Lanka. Any disputes shall fall under the jurisdiction of the courts of Colombo, Sri Lanka.
            </p>
            <div className="bg-muted/50 p-4 rounded-xl border border-border text-xs space-y-1 mt-4">
              <p><strong>Support & Inquiries:</strong> academyict3@gmail.com</p>
              <p><strong>Hotlines:</strong> +94 705688895 / +94 781066642</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
