"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Clock, User } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    // Slight tick to prevent SSR mismatch
    setMounted(true);
  }, []);

  const isMenu = pathname === "/";
  const isOrders = pathname.startsWith("/orders");
  const isProfile = pathname === "/profile" || pathname === "/login" || pathname === "/register";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-elevated sm:hidden transition-colors"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {/* 1. Menu */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isMenu
              ? "text-amber-700 dark:text-amber-400 font-bold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <UtensilsCrossed className="w-5 h-5 mb-0.5" />
            {isMenu && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Menu</span>
        </Link>

        {/* 2. Orders */}
        <Link
          href="/orders"
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isOrders
              ? "text-amber-700 dark:text-amber-400 font-bold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <Clock className="w-5 h-5 mb-0.5" />
            {isOrders && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Orders</span>
        </Link>

        {/* 3. Account / Profile */}
        <Link
          href={mounted && isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            isProfile
              ? "text-amber-700 dark:text-amber-400 font-bold"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5 mb-0.5" />
            {isProfile && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">
            {mounted && isAuthenticated ? "Account" : "Sign In"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
