"use client";

import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system"); // "light" | "dark" | "system"
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);

  // Apply theme class
  const applyTheme = (targetTheme) => {
    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = targetTheme === "dark" || (targetTheme === "system" && systemDark);

    if (isDark) {
      root.classList.add("dark");
      setResolvedTheme("dark");
    } else {
      root.classList.remove("dark");
      setResolvedTheme("light");
    }
  };

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("lms_theme") || "system";
    setTheme(stored);
    applyTheme(stored);

    // Watch system changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentStored = localStorage.getItem("lms_theme") || "system";
      if (currentStored === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("lms_theme", newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl border border-slate-200/40 dark:border-slate-800" />;
  }

  const options = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  const CurrentIcon =
    theme === "system"
      ? (resolvedTheme === "dark" ? Moon : Sun)
      : (theme === "dark" ? Moon : Sun);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme"
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/70 shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <CurrentIcon className="w-[18px] h-[18px] transition-transform duration-300 hover:rotate-12" />
        {theme === "system" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => selectTheme(opt.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
