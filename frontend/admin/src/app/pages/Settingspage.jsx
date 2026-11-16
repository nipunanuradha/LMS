import React, { useState, useEffect } from "react";
import { Input } from "../components/ui/Primitives";
import { Ic } from "../components/ui/icons";
import { API_URL } from "../config";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("ICT Academy LMS");
  const [email, setEmail] = useState("EMAIL_ADDRESS");
  const [phone, setPhone] = useState("+94 77 000 0000");
  const [platformUrl, setPlatformUrl] = useState("[url hosting]");
  const [baseStudentsEnrolled, setBaseStudentsEnrolled] = useState("15000");
  const [examPassRate, setExamPassRate] = useState("98");
  const [expertTutors, setExpertTutors] = useState("12");
  const [saved, setSaved] = useState(false);
  const [tog, setTog] = useState({ email: true, sms: false, maintenance: false });

  // Bank & Payment Details State
  const [bankName, setBankName] = useState("Bank of Ceylon (BOC)");
  const [bankAccountName, setBankAccountName] = useState("ICT Academy");
  const [bankAccountNumber, setBankAccountNumber] = useState("0000000000");
  const [bankBranch, setBankBranch] = useState("Colombo Super Branch");
  const [paymentContactNumber, setPaymentContactNumber] = useState("+94 77 000 0000");
  const [paymentInstructions, setPaymentInstructions] = useState(
    "Please include your Student ID / Phone Number and Month in your deposit slip or transfer remarks. Send receipt/slip photo to WhatsApp."
  );
  const [paymentNotes, setPaymentNotes] = useState(
    "Bank transfers and CDM deposits are verified and approved within 2-4 hours."
  );
  const [bankPaymentsEnabled, setBankPaymentsEnabled] = useState(true);
  const [previewCopied, setPreviewCopied] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.platform_name) setSiteName(data.platform_name);
        if (data.admin_email) setEmail(data.admin_email);
        if (data.support_phone) setPhone(data.support_phone);
        if (data.platform_url) setPlatformUrl(data.platform_url);
        if (data.base_students_enrolled) setBaseStudentsEnrolled(data.base_students_enrolled);
        if (data.exam_pass_rate) setExamPassRate(data.exam_pass_rate);
        if (data.expert_tutors) setExpertTutors(data.expert_tutors);

        // Bank details
        if (data.bank_name) setBankName(data.bank_name);
        if (data.bank_account_name) setBankAccountName(data.bank_account_name);
        if (data.bank_account_number) setBankAccountNumber(data.bank_account_number);
        if (data.bank_branch) setBankBranch(data.bank_branch);
        if (data.payment_contact_number) setPaymentContactNumber(data.payment_contact_number);
        if (data.payment_instructions) setPaymentInstructions(data.payment_instructions);
        if (data.payment_notes) setPaymentNotes(data.payment_notes);
        if (data.bank_payments_enabled !== undefined) {
          setBankPaymentsEnabled(data.bank_payments_enabled === "true" || data.bank_payments_enabled === true);
        }

        setTog({
          email: data.email_notifications === "true",
          sms: data.sms_alerts === "true",
          maintenance: data.maintenance_mode === "true"
        });
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  const save = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          platform_name: siteName,
          admin_email: email,
          support_phone: phone,
          platform_url: platformUrl,
          base_students_enrolled: baseStudentsEnrolled,
          exam_pass_rate: examPassRate,
          expert_tutors: expertTutors,
          email_notifications: String(tog.email),
          sms_alerts: String(tog.sms),
          maintenance_mode: String(tog.maintenance),
          bank_name: bankName,
          bank_account_name: bankAccountName,
          bank_account_number: bankAccountNumber,
          bank_branch: bankBranch,
          payment_contact_number: paymentContactNumber,
          payment_instructions: paymentInstructions,
          payment_notes: paymentNotes,
          bank_payments_enabled: String(bankPaymentsEnabled)
        })
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        console.error("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  const copyPreview = (text) => {
    navigator.clipboard?.writeText(text);
    setPreviewCopied(true);
    setTimeout(() => setPreviewCopied(false), 2000);
  };

  return (
    <div style={{ animation: "fadeIn 0.25s ease", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>Settings</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Manage your LMS configuration & student payment details</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Bank & Payment Details Card */}
        <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, border: "1.5px solid var(--border-color)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1.5px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(37,99,235,0.1)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {Ic.bank(20)}
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Student Payment & Bank Transfer Details</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                  Set the bank account and payment guidelines visible on the student dashboard
                </p>
              </div>
            </div>
            
            {/* Bank Transfer Enable/Disable Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card-subtle)", padding: "6px 12px", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: bankPaymentsEnabled ? "#059669" : "var(--text-muted)" }}>
                {bankPaymentsEnabled ? "Active on Student Portal" : "Hidden from Students"}
              </span>
              <div
                onClick={() => setBankPaymentsEnabled(!bankPaymentsEnabled)}
                style={{ width: 40, height: 22, borderRadius: 11, background: bankPaymentsEnabled ? "#059669" : "var(--border-subtle)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
              >
                <div style={{ position: "absolute", top: 2, left: bankPaymentsEnabled ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
              </div>
            </div>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input
                label="Bank Name (බැංකුවේ නම) *"
                placeholder="e.g. Bank of Ceylon (BOC) / Commercial Bank"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
              />
              <Input
                label="Bank Branch (ශාඛාව) *"
                placeholder="e.g. Colombo Super Branch / Kandy"
                value={bankBranch}
                onChange={e => setBankBranch(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Input
                label="Account Number (ගිණුම් අංකය) *"
                placeholder="e.g. 8001234567"
                value={bankAccountNumber}
                onChange={e => setBankAccountNumber(e.target.value)}
              />
              <Input
                label="Account Holder Name (ගිණුම් හිමියාගේ නම) *"
                placeholder="e.g. ICT Academy / Anuradha Athukorala"
                value={bankAccountName}
                onChange={e => setBankAccountName(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              <Input
                label="WhatsApp / Slip Verification Number (ගෙවීම් රිසිට්පත් එවිය යුතු WhatsApp අංකය) *"
                placeholder="e.g. +94 77 123 4567"
                value={paymentContactNumber}
                onChange={e => setPaymentContactNumber(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary, #64748B)" }}>
                Payment Instructions for Students (ශිෂ්‍යයන්ට ගෙවීම් උපදෙස්)
              </label>
              <textarea
                rows={3}
                value={paymentInstructions}
                onChange={e => setPaymentInstructions(e.target.value)}
                placeholder="Instructions on what reference to add in transfer or deposit slip..."
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1.5px solid var(--border-subtle, #E2E8F0)",
                  fontSize: 13,
                  color: "var(--text-primary, #0F172A)",
                  background: "var(--input-bg, #FAFAFA)",
                  transition: "all 0.2s",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary, #64748B)" }}>
                Verification / Processing Note (තහවුරු කිරීමේ කාලසීමාව)
              </label>
              <input
                type="text"
                value={paymentNotes}
                onChange={e => setPaymentNotes(e.target.value)}
                placeholder="e.g. Slips will be verified and access granted within 2-4 hours."
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1.5px solid var(--border-subtle, #E2E8F0)",
                  fontSize: 13,
                  color: "var(--text-primary, #0F172A)",
                  background: "var(--input-bg, #FAFAFA)",
                  transition: "all 0.2s"
                }}
              />
            </div>

            {/* Live Student Portal Preview */}
            <div style={{ marginTop: 6, padding: "16px", borderRadius: 12, background: "var(--bg-card-subtle)", border: "1px dashed var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>
                  Live Preview (ශිෂ්‍ය Dashboard එකේ පෙනෙන ආකාරය)
                </span>
                <span style={{ fontSize: 11, color: bankPaymentsEnabled ? "#059669" : "#EF4444", fontWeight: 600 }}>
                  {bankPaymentsEnabled ? "● Visible to Students" : "○ Hidden from Students"}
                </span>
              </div>

              <div style={{ background: "var(--bg-card)", padding: "16px", borderRadius: 10, border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2563EB" }}>{bankName || "Bank Name"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Branch: {bankBranch || "Branch"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyPreview(bankAccountNumber)}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border-subtle)", background: "var(--bg-card-subtle)", fontSize: 11, cursor: "pointer", color: "var(--text-primary)" }}
                  >
                    {previewCopied ? "✓ Copied" : "Copy A/C"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 6, borderTop: "1px solid var(--border-color)", fontSize: 12 }}>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Account No: </span>
                    <strong style={{ fontFamily: "monospace", fontSize: 13 }}>{bankAccountNumber || "0000000000"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text-muted)" }}>Name: </span>
                    <strong>{bankAccountName || "Account Holder"}</strong>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", background: "rgba(37,99,235,0.06)", padding: "8px 10px", borderRadius: 6 }}>
                  💬 WhatsApp Slip to: <strong>{paymentContactNumber || "+94 77 000 0000"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, border: "1.5px solid var(--border-color)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1.5px solid var(--border-color)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>General Settings</h3>
          </div>
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Platform Name" value={siteName} onChange={e => setSiteName(e.target.value)} />
            <Input label="Admin Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input label="Support Phone" placeholder="+94 77 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Platform URL" placeholder="[url hosting]" value={platformUrl} onChange={e => setPlatformUrl(e.target.value)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label="Base Students" type="number" value={baseStudentsEnrolled} onChange={e => setBaseStudentsEnrolled(e.target.value)} />
              <Input label="Pass Rate (%)" type="number" value={examPassRate} onChange={e => setExamPassRate(e.target.value)} />
              <Input label="Base Tutors" type="number" value={expertTutors} onChange={e => setExpertTutors(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card" style={{ background: "var(--bg-card)", borderRadius: 14, border: "1.5px solid var(--border-color)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1.5px solid var(--border-color)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Notifications</h3>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              { key: "email", label: "Email Notifications", desc: "Send enrollment and reset confirmations via email" },
              { key: "sms", label: "SMS Alerts", desc: "Send SMS alerts for critical account events" },
              { key: "maintenance", label: "Maintenance Mode", desc: "Put the platform in maintenance mode" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.desc}</div>
                </div>
                <div onClick={() => setTog(t => ({ ...t, [item.key]: !t[item.key] }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: tog[item.key] ? "#2563EB" : "var(--border-subtle)", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: tog[item.key] ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} className="btn-primary"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 28px", borderRadius: 10, background: saved ? "#059669" : "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s", alignSelf: "flex-start" }}>
          {saved ? <>{Ic.check()} Saved Successfully!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
