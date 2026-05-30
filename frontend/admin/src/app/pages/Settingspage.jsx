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
          maintenance_mode: String(tog.maintenance)
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

  return (
    <div style={{ animation: "fadeIn 0.25s ease", maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Settings</h2>
        <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Manage your LMS configuration</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* General */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #F8FAFC" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>General Settings</h3>
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
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #F8FAFC" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Notifications</h3>
          </div>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              { key: "email", label: "Email Notifications", desc: "Send enrollment and reset confirmations via email" },
              { key: "sms", label: "SMS Alerts", desc: "Send SMS alerts for critical account events" },
              { key: "maintenance", label: "Maintenance Mode", desc: "Put the platform in maintenance mode" },
            ].map(item => (
              <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F8FAFC" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{item.desc}</div>
                </div>
                <div onClick={() => setTog(t => ({ ...t, [item.key]: !t[item.key] }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: tog[item.key] ? "#2563EB" : "#E2E8F0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: tog[item.key] ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={save} className="btn-primary"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 28px", borderRadius: 10, background: saved ? "#059669" : "#2563EB", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, boxShadow: "0 2px 8px rgba(37,99,235,0.25)", transition: "all 0.2s", alignSelf: "flex-start" }}>
          {saved ? <>{Ic.check()} Saved!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}