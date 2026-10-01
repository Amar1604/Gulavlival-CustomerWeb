"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Sync with current document state on mount - defaults to original Light Mode
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("gg_theme_v2") || "light";
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("gg_theme_v2", "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
      localStorage.setItem("gg_theme_v2", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
      localStorage.setItem("gg_theme_v2", "light");
    }
  };

  if (!mounted) {
    return (
      <div className="h-8 w-16 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border shadow-2xs select-none ${
        isDark
          ? "bg-neutral-800 hover:bg-neutral-700 text-amber-300 border-neutral-700/80 hover:border-amber-400/50"
          : "bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 hover:border-amber-400/60"
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
          <span className="text-[11px] font-semibold text-neutral-200">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-neutral-700 stroke-[2.5]" />
          <span className="text-[11px] font-semibold text-neutral-800">Dark</span>
        </>
      )}
    </button>
  );
}
