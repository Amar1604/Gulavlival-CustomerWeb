"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  fallbackHref?: string;
  className?: string;
  variant?: "pill" | "icon" | "ghost";
  preferFallback?: boolean;
}

export function BackButton({
  label = "Back",
  fallbackHref = "/",
  className = "",
  variant = "pill",
  preferFallback = true, // By default prioritize clean fallback route to prevent redirect loops
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (preferFallback && fallbackHref) {
      router.push(fallbackHref);
    } else if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleBack}
        aria-label={label}
        className={`p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:text-amber-900 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-neutral-800/80 active:scale-95 transition-all group ${className}`}
      >
        <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={handleBack}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-amber-900 dark:hover:text-amber-400 transition-all group ${className}`}
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 hover:bg-amber-50 dark:hover:bg-neutral-800 hover:border-amber-300 dark:hover:border-amber-500/40 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:text-amber-950 dark:hover:text-amber-300 shadow-2xs active:scale-95 transition-all group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-amber-600 dark:text-amber-400 transition-transform duration-200 group-hover:-translate-x-1" />
      <span>{label}</span>
    </button>
  );
}

