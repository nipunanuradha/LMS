import { Link } from "react-router";
import { ArrowLeft, RefreshCw, CreditCard, ShieldCheck, AlertCircle, Clock, HelpCircle } from "lucide-react";

export function RefundPolicy() {
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
            <RefreshCw className="h-6 w-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Refund & Cancellation Policy</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Effective Date: May 30, 2026. Important terms concerning online course fee transactions, monthly modular access, and refund claims.
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-10 space-y-8 shadow-sm text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              1. Digital Access & Non-Refundable Policy
            </h2>
            <p>
              Course enrollments and monthly fees grant instant digital access to copyrighted lecture videos, study notes, live sessions, and coding resources. Because access is provisioned immediately upon transaction confirmation, payments are generally <strong>non-refundable</strong> once digital access has been granted.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              2. Eligible Circumstances for Refund
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-blue-600">
              <li>
                <strong>Duplicate / Erroneous Billing:</strong> If your card or bank account was debited multiple times for the same transaction due to a network glitch.
              </li>
              <li>
                <strong>Batch Cancellation by Academy:</strong> If a scheduled program is cancelled by ICT Academy before class commencement and no equivalent alternative batch can be provided.
              </li>
              <li>
                <strong>Persistent Technical Malfunction:</strong> Documented, verified platform outages originating from our infrastructure that prevent any access for over 7 consecutive days.
              </li>
            </ul>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              3. Non-Refundable Scenarios
            </h2>
            <p>
              Refunds will not be issued for personal schedule changes, failure to attend live lectures (all sessions are recorded and archived), poor personal internet connection, or disciplinary account suspensions resulting from sharing credentials or video piracy.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              4. How to Request a Refund
            </h2>
            <p>
              Formal refund requests must be submitted within <strong>7 calendar days</strong> of the transaction date by emailing <span className="font-semibold text-foreground">academyict3@gmail.com</span> with your Student Name, Phone Number, Course Name, and Bank Transaction Slip. Approved refunds will be credited back to the original payment source within 7-14 business days.
            </p>
          </section>

          <hr className="border-border" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              5. Billing Help Desk
            </h2>
            <div className="bg-muted/50 p-4 rounded-xl border border-border text-xs space-y-1">
              <p><strong>Hotlines:</strong> +94 705688895 / +94 781066642</p>
              <p><strong>Address:</strong> 94/05, Swarnabhumi Mawatha, Nawagamuwa, Ranala, Sri Lanka</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
