// ─────────────────────────────────────────────────────────────────────────────
// src/pages/SettingsPage.jsx
// Platform configuration: general fields, toggle switches, save feedback.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Input } from "../components/ui/Primitives";
import { Ic } from "../components/ui/Icons";
import { saveSettings as apiSaveSettings } from "../../../api/api";

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, desc, value, onChange }) {
    return (
        <div className="flex justify-between items-center" style={{ padding: "14px 0", borderBottom: "1px solid #F8FAFC" }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0F172A" }}>{label}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{desc}</div>
            </div>
            <div
                className={`toggle-track toggle-track--${value ? "on" : "off"}`}
                onClick={onChange}
                role="switch"
                aria-checked={value}
            >
                <div className={`toggle-thumb toggle-thumb--${value ? "on" : "off"}`} />
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const [general, setGeneral] = useState({
        siteName: "NEXTERA LMS",
        email: "admin@nextera.lk",
        phone: "",
        url: "https://nextera.anuradhaathukorala.site",
    });
    const [toggles, setToggles] = useState({
        email: true,
        sms: false,
        maintenance: false,
    });
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiSaveSettings({ ...general, notifications: toggles });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleKey = (key) => setToggles(t => ({ ...t, [key]: !t[key] }));

    return (
        <div className="page-enter flex-col gap-16" style={{ maxWidth: 700 }}>

            {/* Page Header */}
            <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Settings</h2>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 3 }}>Manage your LMS configuration</p>
            </div>

            {/* ── General Settings Card ── */}
            <div className="card overflow-hidden">
                <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #F8FAFC" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>General Settings</h3>
                </div>
                <div className="flex-col gap-16" style={{ padding: 24 }}>
                    <Input
                        label="Platform Name"
                        value={general.siteName}
                        onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))}
                    />
                    <Input
                        label="Admin Email"
                        type="email"
                        value={general.email}
                        onChange={e => setGeneral(g => ({ ...g, email: e.target.value }))}
                    />
                    <Input
                        label="Support Phone"
                        value={general.phone}
                        onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))}
                        placeholder="+94 77 000 0000"
                    />
                    <Input
                        label="Platform URL"
                        value={general.url}
                        onChange={e => setGeneral(g => ({ ...g, url: e.target.value }))}
                        placeholder="https://nextera.anuradhaathukorala.site"
                    />
                </div>
            </div>

            {/* ── Notifications Card ── */}
            <div className="card overflow-hidden">
                <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #F8FAFC" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Notifications</h3>
                </div>
                <div style={{ padding: "4px 24px 8px" }}>
                    <ToggleRow
                        label="Email Notifications"
                        desc="Send enrollment and reset confirmations via email"
                        value={toggles.email}
                        onChange={() => toggleKey("email")}
                    />
                    <ToggleRow
                        label="SMS Alerts"
                        desc="Send SMS alerts for critical account events"
                        value={toggles.sms}
                        onChange={() => toggleKey("sms")}
                    />
                    <ToggleRow
                        label="Maintenance Mode"
                        desc="Put the platform in maintenance mode for all users"
                        value={toggles.maintenance}
                        onChange={() => toggleKey("maintenance")}
                    />
                </div>
            </div>

            {/* ── Save Button ── */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="btn btn--primary"
                style={{
                    alignSelf: "flex-start",
                    padding: "12px 28px",
                    background: saved ? "#059669" : "#2563EB",
                    gap: 8,
                }}
            >
                {saved
                    ? <>{Ic.check()} Saved!</>
                    : loading ? "Saving…" : "Save Changes"
                }
            </button>
        </div>
    );
}