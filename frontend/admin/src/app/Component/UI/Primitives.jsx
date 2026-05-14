// ─────────────────────────────────────────────────────────────────────────────
// src/components/ui/Primitives.jsx
// Reusable atomic UI components used throughout the dashboard.
// ─────────────────────────────────────────────────────────────────────────────

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 36, bg = "#2563EB" }) {
    return (
        <div
            className="avatar"
            style={{
                width: size,
                height: size,
                background: bg,
                fontSize: size * 0.33,
            }}
        >
            {initials}
        </div>
    );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
    const active = status === "Active";
    return (
        <span className={`status-badge status-badge--${active ? "active" : "expired"}`}>
            <span
                className="status-badge__dot"
                style={{ background: active ? "#16A34A" : "#DC2626" }}
            />
            {status}
        </span>
    );
}

// ── CategoryBadge ─────────────────────────────────────────────────────────────
export function CategoryBadge({ cat, accent }) {
    return (
        <span
            className="category-badge"
            style={{
                background: `${accent}18`,
                color: accent,
            }}
        >
            {cat}
        </span>
    );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, type = "text", value, onChange, placeholder, style: s }) {
    return (
        <div className="form-group" style={s}>
            {label && <label className="form-label">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="form-input"
            />
        </div>
    );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, style: s }) {
    return (
        <div className="form-group" style={s}>
            {label && <label className="form-label">{label}</label>}
            <select value={value} onChange={onChange} className="form-select">
                {options.map((o) => (
                    <option key={o.value || o} value={o.value || o}>
                        {o.label || o}
                    </option>
                ))}
            </select>
        </div>
    );
}