import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import {
  GraduationCap,
  LogOut,
  User,
  Clock,
  CreditCard,
  Copy,
  Check,
  Building2,
  Phone,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getDaysRemaining } from "../utils/mockData";
import { API_URL, LANDING_URL, getImageUrl } from "../config";
import { ThemeToggle } from "../components/ThemeToggle";

function CourseThumbnail({ thumbnail, title, accent, category }: { thumbnail: string; title: string; accent: string; category: string }) {
  const [imgError, setImgError] = useState(false);
  if (thumbnail && !imgError) {
    return (
      <img
        src={thumbnail}
        alt={title}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: accent }}>
      {category}
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  // Payment Details State
  const [paymentDetails, setPaymentDetails] = useState<any>({
    bank_name: "Bank of Ceylon (BOC)",
    bank_account_name: "ICT Academy",
    bank_account_number: "0000000000",
    bank_branch: "Colombo Super Branch",
    bank_accounts: [
      {
        id: "acc_1",
        bank_name: "Bank of Ceylon (BOC)",
        bank_account_name: "ICT Academy",
        bank_account_number: "0000000000",
        bank_branch: "Colombo Super Branch"
      }
    ],
    payment_contact_number: "+94 77 000 0000",
    payment_instructions: "Please include your Student ID / Phone Number and Month in your deposit slip or transfer remarks. Send receipt/slip photo to WhatsApp.",
    payment_notes: "Bank transfers and CDM deposits are verified and approved within 2-4 hours.",
    bank_payments_enabled: "true"
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
  const [isBankSectionExpanded, setIsBankSectionExpanded] = useState(true);

  useEffect(() => {
    // Check if arrived with token/user query parameters
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    const userParam = params.get("user");

    if (tokenParam && userParam) {
      try {
        localStorage.setItem("token", tokenParam);
        localStorage.setItem("currentUser", decodeURIComponent(userParam));
        // Clean URL params from address bar
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Error setting session tokens:", e);
      }
    }

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
      navigate("/");
      return;
    }
    const loggedInUser = JSON.parse(currentUser);
    setUser(loggedInUser);

    const fetchCourses = async () => {
      try {
        const enrolledRes = await fetch(`${API_URL}/api/student/${loggedInUser.id}/courses`);
        if (enrolledRes.ok) {
          const data = await enrolledRes.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };

    const fetchPaymentDetails = async () => {
      try {
        const payRes = await fetch(`${API_URL}/api/payment-details`);
        if (payRes.ok) {
          const data = await payRes.json();
          setPaymentDetails(data);
        }
      } catch (err) {
        console.error("Failed to fetch payment details:", err);
      }
    };

    fetchCourses();
    fetchPaymentDetails();
  }, [navigate]);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = LANDING_URL;
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        const updatedUser = { ...user, password: newPassword };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setUser(updatedUser);

        const users = JSON.parse(localStorage.getItem("lmsUsers") || "[]");
        const updatedUsers = users.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, password: newPassword };
          }
          return u;
        });
        localStorage.setItem("lmsUsers", JSON.stringify(updatedUsers));

        alert("Password updated successfully! Please use this new password for your next login.");
        setShowEditPassword(false);
        setNewPassword("");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err);
      alert("Server connection failed. Could not update password.");
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (e) {}
    }
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Normalizing bank accounts list
  const accounts: any[] = Array.isArray(paymentDetails?.bank_accounts) && paymentDetails.bank_accounts.length > 0
    ? paymentDetails.bank_accounts
    : [
        {
          id: "acc_1",
          bank_name: paymentDetails?.bank_name || "Bank of Ceylon (BOC)",
          bank_branch: paymentDetails?.bank_branch || "Colombo Super Branch",
          bank_account_number: paymentDetails?.bank_account_number || "0000000000",
          bank_account_name: paymentDetails?.bank_account_name || "ICT Academy"
        }
      ];

  const copyAllBankDetails = () => {
    let formatted = `ICT Academy Official Bank Details:\n\n`;
    accounts.forEach((acc, idx) => {
      formatted += `Bank Account #${idx + 1}:\n`;
      formatted += `Bank: ${acc.bank_name}\n`;
      formatted += `Branch: ${acc.bank_branch}\n`;
      formatted += `Account No: ${acc.bank_account_number}\n`;
      formatted += `Account Name: ${acc.bank_account_name}\n\n`;
    });
    formatted += `WhatsApp Support: ${paymentDetails.payment_contact_number}\n`;
    formatted += `Instructions: ${paymentDetails.payment_instructions}`;
    copyToClipboard(formatted, "all");
  };

  const cleanPhone = (paymentDetails.payment_contact_number || "+94770000000").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ICT Academy! I would like to submit my bank payment slip for class access.\n\nStudent Name: ${user?.name || ""}\nPhone: ${user?.phone || ""}\nDate: ${new Date().toLocaleDateString()}`
  )}`;

  if (!user) return null;

  const isBankEnabled = paymentDetails.bank_payments_enabled !== "false" && paymentDetails.bank_payments_enabled !== false;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <header className="bg-card shadow-xs border-b border-border transition-colors duration-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-400 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-foreground">ICT Academy With Anuradha Athukorala</span>
          </div>

          <div className="flex items-center gap-3">
            {isBankEnabled && (
              <button
                onClick={() => setShowPaymentInfoModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment Details ({accounts.length})</span>
              </button>
            )}
            <ThemeToggle />
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 sm:p-8 mb-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="mb-2 text-2xl sm:text-3xl font-bold">Welcome Back, {user.name}!</h1>
              <p className="text-blue-100 text-sm">Continue your learning journey with your enrolled courses and upcoming months</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {isBankEnabled && (
                <button
                  onClick={() => setShowPaymentInfoModal(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Details</span>
                </button>
              )}
              <button
                onClick={() => setShowEditPassword(!showEditPassword)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {showEditPassword && (
            <form onSubmit={handlePasswordUpdate} className="mt-4 pt-4 border-t border-white/20">
              <label className="block text-sm mb-2 text-blue-50">Change Password</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="flex-1 px-4 py-2 rounded-xl bg-white/20 border border-white/30 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors cursor-pointer text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bank & Payment Details Section */}
        {isBankEnabled && (
          <div className="mb-10 bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-all">
            {/* Section Header */}
            <div
              onClick={() => setIsBankSectionExpanded(!isBankSectionExpanded)}
              className="p-5 sm:p-6 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 flex items-center justify-between cursor-pointer border-b border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      Class Fee & Bank Payment Details
                    </h2>
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {accounts.length} Bank Account{accounts.length > 1 ? "s" : ""} Available
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    පන්ති ගාස්තු තැන්පත් කිරීමට පහත සඳහන් ඕනෑම බැංකු ගිණුමක් භාවිතා කළ හැක (Online / CDM / Transfer)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyAllBankDetails();
                  }}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer border border-border"
                >
                  {copiedField === "all" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied All!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Copy All Details</span>
                    </>
                  )}
                </button>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted">
                  {isBankSectionExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </div>

            {/* Expandable Content */}
            {isBankSectionExpanded && (
              <div className="p-5 sm:p-6 space-y-6">
                {/* Bank Accounts Grid */}
                <div className={`grid grid-cols-1 ${accounts.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
                  {accounts.map((acc, index) => (
                    <div
                      key={acc.id || index}
                      className="p-5 rounded-2xl bg-gradient-to-br from-card to-muted/30 border border-border hover:border-blue-500/50 flex flex-col justify-between group transition-all shadow-xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                            Bank #{index + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">{acc.bank_branch}</span>
                        </div>

                        <div>
                          <div className="text-base font-bold text-foreground group-hover:text-blue-600 transition-colors">
                            {acc.bank_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Account Holder: <strong className="text-foreground">{acc.bank_account_name}</strong>
                          </div>
                        </div>

                        {/* Account Number Box */}
                        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                              Account Number
                            </span>
                            <span className="text-base font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                              {acc.bank_account_number}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acc.bank_account_number, `acc_${index}`)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                          >
                            {copiedField === `acc_${index}` ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground mt-3">
                        <span>Use for CDM or Online Transfer</span>
                        <button
                          type="button"
                          onClick={() => {
                            const summary = `Bank: ${acc.bank_name}\nBranch: ${acc.bank_branch}\nA/C No: ${acc.bank_account_number}\nName: ${acc.bank_account_name}`;
                            copyToClipboard(summary, `card_${index}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer text-[11px]"
                        >
                          {copiedField === `card_${index}` ? "Copied All!" : "Copy Bank Info"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* WhatsApp Support Card */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                        <Phone className="w-4 h-4" />
                        <span>WhatsApp Slip Verification</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        ගෙවීම සිදු කළ පසු receipt පත හෝ screenshot එක අපගේ WhatsApp අංකයට යොමු කරන්න:
                      </p>
                      <div className="text-base font-bold text-foreground mt-2 font-mono">
                        {paymentDetails.payment_contact_number}
                      </div>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Payment Slip on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Instructions & Guidelines Box */}
                <div className="bg-muted/30 border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Payment & Activation Steps (පියවර):</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 pl-1 text-[12px] leading-relaxed">
                      <li>
                        Transfer or deposit your course fee to any of the above accounts via Online Banking, Mobile App, or CDM.
                      </li>
                      <li>
                        <strong>Reference/Remark:</strong> Mention your <span className="font-semibold text-foreground">Student Name</span> and <span className="font-semibold text-foreground">Student ID</span> on the deposit slip or online note.
                      </li>
                      <li>
                        Take a photo or screenshot of the receipt and click <strong className="text-emerald-600">"Send Slip on WhatsApp"</strong> to submit.
                      </li>
                    </ol>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-1">
                      ℹ️ {paymentDetails.payment_notes || "Bank transfers and CDM deposits are verified and approved within 2-4 hours."}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Submit Slip via WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Enrolled / Active Courses */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">My Enrolled Classes</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Classes you have active subscription or month access for</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {courses.length} Active
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground text-sm">You haven't enrolled or paid for any Classes yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Explore available Classes below to start learning month-by-month!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const expiryDate = course.expiry_date || course.expiryDate;
                const daysRemaining = getDaysRemaining(expiryDate);
                const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
                const isExpired = daysRemaining < 0;

                const accents = ["#2563EB", "#059669", "#7C3AED", "#D97706", "#DC2626", "#0891B2"];
                const accent = course.accent || accents[course.id % accents.length] || "#2563EB";
                const category = course.category || "Web Dev";
                const thumbnail = getImageUrl(course.thumbnail_url || course.thumbnail);

                return (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="bg-card rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-border hover:border-blue-500/50 flex flex-col group"
                  >
                    {/* Thumbnail Section */}
                    <div className="w-full h-40 bg-muted rounded-xl mb-4 overflow-hidden relative shrink-0">
                      <CourseThumbnail
                        thumbnail={thumbnail}
                        title={course.title}
                        accent={accent}
                        category={category}
                      />
                    </div>

                    {/* Card Content Section */}
                    <div className="flex flex-col flex-1">
                      <h3 className="mb-4 font-semibold text-lg text-card-foreground group-hover:text-blue-500 transition-colors">{course.title}</h3>

                      <div className="mt-auto">
                        {expiryDate ? (
                          <>
                            <div
                              className={`flex items-center gap-2 ${isExpired
                                ? "text-red-500"
                                : isExpiringSoon
                                  ? "text-orange-500"
                                  : "text-muted-foreground"
                                }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">
                                {isExpired ? (
                                  course.has_purchased_month ? "Month expired" : "Enrollment expired"
                                ) : (
                                  <>
                                    <span className="font-semibold text-foreground">{daysRemaining}</span> day
                                    {daysRemaining !== 1 ? "s" : ""} {course.has_purchased_month ? "for next month payment" : "to enroll / purchase months"}
                                  </>
                                )}
                              </span>
                            </div>

                            {!isExpired && (
                              <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${isExpiringSoon ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-blue-500 to-green-500"
                                    }`}
                                  style={{
                                    width: `${Math.min(100, (daysRemaining / 30) * 100)}%`,
                                  }}
                                />
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>Next Due / Window: {new Date(expiryDate).toLocaleDateString()}</span>
                              {Boolean(course.has_purchased_month) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  ✓ Active Month
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                              ✓ Lifetime Month Access
                            </span>
                            <div className="mt-3 text-xs text-muted-foreground">
                              Permanent access to your purchased months
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Payment Details Standalone Modal */}
      {showPaymentInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Official Bank Accounts ({accounts.length})</h3>
                  <p className="text-xs text-muted-foreground">Transfer via Online Banking, Mobile App, or CDM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentInfoModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {accounts.map((acc, index) => (
                <div key={acc.id || index} className="p-4 rounded-xl bg-muted/40 border border-border space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {acc.bank_name} ({acc.bank_branch})
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      Account #{index + 1}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
                    <span className="text-xs text-blue-800 dark:text-blue-300 font-medium">A/C Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                        {acc.bank_account_number}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(acc.bank_account_number, `m_acc_${index}`)}
                        className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-semibold cursor-pointer"
                      >
                        {copiedField === `m_acc_${index}` ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Account Holder:</span>
                    <strong className="text-foreground">{acc.bank_account_name}</strong>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">WhatsApp Slip Support:</span>
                <span className="text-xs font-bold text-emerald-600 font-mono">{paymentDetails.payment_contact_number}</span>
              </div>

              {/* Instructions */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground">Instructions:</div>
                <p>{paymentDetails.payment_instructions}</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 pt-1">
                  ⏳ {paymentDetails.payment_notes}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={copyAllBankDetails}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedField === "all" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedField === "all" ? "Copied All!" : "Copy All Details"}</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Slip on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Portal Footer with Legal & Compliance Links */}
      <footer className="mt-auto border-t border-border bg-card/40 py-6 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ICT Academy. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/refund-policy" className="hover:text-foreground transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-foreground">Do you want to log out?</h3>
              <p className="text-sm text-muted-foreground">
                You will be signed out from your student account and returned to the main home page.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-border bg-accent/50 hover:bg-accent text-foreground font-medium text-sm transition-all cursor-pointer"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
