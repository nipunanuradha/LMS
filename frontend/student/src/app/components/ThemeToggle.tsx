import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { id: "light" as const, label: "Light", icon: Sun },
    { id: "dark" as const, label: "Dark", icon: Moon },
    { id: "system" as const, label: "System", icon: Laptop },
  ];

  const CurrentIcon =
    theme === "system"
      ? (resolvedTheme === "dark" ? Moon : Sun)
      : (theme === "dark" ? Moon : Sun);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-card border border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-accent transition-colors shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <CurrentIcon className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
        {theme === "system" && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-card" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md">
          <div className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`} />
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
