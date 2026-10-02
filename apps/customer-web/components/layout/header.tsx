"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ShoppingBag,
  User as UserIcon,
  QrCode,
  LogOut,
  Clock,
  ChevronDown,
  MapPin,
  Lock,
} from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";


export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tableParam = searchParams.get("table");
  const { tableNumber, setTableNumber, getItemCount } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (tableParam) {
      setTableNumber(tableParam);
    }
  }, [tableParam, setTableNumber]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    router.push("/");
  };

  const itemCount = mounted ? getItemCount() : 0;
  const activeTable = tableNumber || tableParam;
  
  // Show header back icon only on sub-pages (excluding login/register to avoid duplicates)
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const showHeaderBack = mounted && pathname !== "/" && !isAuthPage;

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-neutral-950/85 backdrop-blur-md border-b border-amber-100/70 dark:border-neutral-800/80 shadow-xs dark:shadow-none transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 flex items-center justify-between">
        {/* Brand & Optional Back Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showHeaderBack && (
            <BackButton variant="icon" label="Back to Previous Page" className="mr-0.5" />
          )}

          <Link href="/" className="flex flex-col group">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                GG
              </span>
              <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-neutral-900 dark:text-neutral-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                GULAVLIVAL GRAND
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-widest text-amber-800 dark:text-amber-400 font-medium uppercase pl-10">
              Stay • Dine • Experience
            </span>
          </Link>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* QR Table indicator if active */}
          {activeTable && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-semibold shadow-xs">
              <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Table {activeTable}</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User Profile / Dropdown */}
          {mounted && (
            user && isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800/90 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-medium border border-transparent dark:border-neutral-700/60 transition"
                >
                  <UserIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-900 rounded-2xl shadow-elevated dark:shadow-dark-card border border-neutral-100 dark:border-neutral-800 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {user.mobile}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-neutral-800 hover:text-amber-900 dark:hover:text-amber-300 transition"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/profile?tab=addresses"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-neutral-800 hover:text-amber-900 dark:hover:text-amber-300 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Saved Addresses</span>
                    </Link>

                    <Link
                      href="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-neutral-800 hover:text-amber-900 dark:hover:text-amber-300 transition"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/profile?tab=security"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-neutral-800 hover:text-amber-900 dark:hover:text-amber-300 transition"
                    >
                      <Lock className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                      <span>Change Password</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition border-t border-neutral-100 dark:border-neutral-800 mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-amber-900 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
              >
                Sign In
              </Link>
            )
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            aria-label="View Shopping Cart"
            className="relative p-2 rounded-full text-neutral-700 dark:text-neutral-200 hover:bg-amber-50 dark:hover:bg-neutral-800 hover:text-amber-800 dark:hover:text-amber-400 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>

  );
}
