import { Link } from "react-router";
import { ArrowLeft, Shield, Eye, Lock, FileText, CheckCircle } from "lucide-react";

export function PrivacyPolicy() {
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
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Last Updated: May 30, 2026. How ICT Academy collects, safeguards, and respects your student data.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 space-y-8 shadow-sm text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              1. Information We Collect
            </h2>
            <p>
              When you enroll or create an LMS profile, we store your name, contact phone number, province, district, enrolled courses, and exam performance.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              2. Online Payments & Card Security
            </h2>
            <p>
              We prioritize the highest security for payment transactions. All online card processing is routed through PCI-DSS Level 1 compliant financial gateway partners. ICT Academy servers <strong>never</strong> view, process, or store credit/debit card numbers or security CVVs.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              3. Data Usage & Disclosure
            </h2>
            <p>
              Your data is exclusively used to deliver courses, track academic records, issue certificates, and facilitate billing. We never sell, rent, or trade student personal information to any commercial advertisers.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              4. Contact & Compliance
            </h2>
            <p>
              In compliance with the Sri Lanka Personal Data Protection Act No. 9 of 2022, you may request data updates by writing to our administration at <span className="font-semibold text-foreground">academyict3@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
