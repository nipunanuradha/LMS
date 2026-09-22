import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

// Icons for Admin Theme Switcher
const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const MonitorIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { id: "light", label: "Light", Icon: SunIcon },
    { id: "dark", label: "Dark", Icon: MoonIcon },
    { id: "system", label: "System", Icon: MonitorIcon },
  ];

  const CurrentIcon =
    theme === "system"
      ? (resolvedTheme === "dark" ? MoonIcon : SunIcon)
      : (theme === "dark" ? MoonIcon : SunIcon);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          border: "1.5px solid var(--border-color, #E2E8F0)",
          background: "var(--bg-card, #fff)",
          color: "var(--text-primary, #475569)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          position: "relative",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <CurrentIcon />
        {theme === "system" && (
          <span
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#2563EB",
              border: "1.5px solid var(--bg-card, #fff)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            background: "var(--bg-card, #fff)",
            border: "1.5px solid var(--border-color, #E2E8F0)",
            borderRadius: 12,
            boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
            padding: "6px",
            minWidth: 140,
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div style={{ padding: "4px 8px", fontSize: 10, fontWeight: 700, color: "var(--text-secondary, #94A3B8)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Appearance
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.id;
            const Icon = opt.Icon;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  setTheme(opt.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  background: isSelected ? "rgba(37,99,235,0.12)" : "transparent",
                  color: isSelected ? "#2563EB" : "var(--text-primary, #334155)",
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: 13,
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <span style={{ color: isSelected ? "#2563EB" : "var(--text-secondary, #64748B)", display: "flex" }}>
                  <Icon />
                </span>
                <span>{opt.label}</span>
                {isSelected && (
                  <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#2563EB" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
