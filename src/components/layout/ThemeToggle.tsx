"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export default function ThemeToggle() {
  const [activeTheme, setActiveTheme] = useState<string>("system");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage safely on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const timer = setTimeout(() => {
      setActiveTheme(savedTheme);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Listen for system preference updates if activeTheme is 'system'
  useEffect(() => {
    if (activeTheme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [activeTheme]);

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    localStorage.setItem("theme", theme);

    if (
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    setActiveTheme(theme);
    setIsOpen(false);
    toast.success(`Theme updated to ${theme} mode`);
  };

  const renderIcon = (theme: string) => {
    switch (theme) {
      case "light":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.5 12h2.25m13.5 0H21M6.75 6.75l1.5 1.5m9 9l1.5 1.5M6.75 17.25l1.5-1.5m9-9l1.5-1.5M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
          </svg>
        );
      case "dark":
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25M19.5 3H4.5A1.5 1.5 0 003 4.5v10.5A1.5 1.5 0 004.5 16.5h15a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0019.5 3z" />
          </svg>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none">
      
      {/* Toggle trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl hover:bg-zinc-50 dark:bg-zinc-950/20 dark:hover:bg-zinc-900 p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer flex items-center justify-center"
        title="Toggle Theme"
      >
        {renderIcon(activeTheme)}
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 focus:outline-none z-50 animate-fade-in">
          
          {/* Option: Light */}
          <button
            onClick={() => applyTheme("light")}
            className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-left cursor-pointer transition-colors ${
              activeTheme === "light"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.5 12h2.25m13.5 0H21M6.75 6.75l1.5 1.5m9 9l1.5 1.5M6.75 17.25l1.5-1.5m9-9l1.5-1.5M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
              </svg>
              <span>Light</span>
            </div>
            {activeTheme === "light" && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {/* Option: Dark */}
          <button
            onClick={() => applyTheme("dark")}
            className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-left cursor-pointer transition-colors ${
              activeTheme === "dark"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
              <span>Dark</span>
            </div>
            {activeTheme === "dark" && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

          {/* Option: System */}
          <button
            onClick={() => applyTheme("system")}
            className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-left cursor-pointer transition-colors ${
              activeTheme === "system"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.25" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25M19.5 3H4.5A1.5 1.5 0 003 4.5v10.5A1.5 1.5 0 004.5 16.5h15a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0019.5 3z" />
              </svg>
              <span>System</span>
            </div>
            {activeTheme === "system" && (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            )}
          </button>

        </div>
      )}

    </div>
  );
}
