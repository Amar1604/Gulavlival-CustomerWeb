"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Smartphone, Mail, ArrowRight, AlertCircle, UserCheck, LogOut, Eye, EyeOff } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { BackButton } from "@/components/ui/back-button";
import { useAuthStore } from "@/lib/stores/auth-store";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { user, isAuthenticated, setAuth, logout } = useAuthStore();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = mobile.trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch<{
        access_token: string;
        user: { id: string; name: string; mobile: string; email?: string; is_active: boolean };
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanPhone,
          email: email.trim() || undefined,
          password,
        }),
      });

      setAuth(res.user, res.access_token);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  if (user && isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="mb-4">
          <BackButton label="Back to Menu" fallbackHref="/" />
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-elevated text-center space-y-5 transition-colors">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center mx-auto">
            <UserCheck className="w-7 h-7" />
          </div>

          <div>
            <h1 className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
              Already Signed In
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              You are signed in as <span className="font-bold text-neutral-800 dark:text-neutral-200">{user.name}</span>
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Link
              href={redirectUrl}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 text-xs transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Create New Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      {/* Clean single back button */}
      <div className="mb-4">
        <BackButton label="Back to Menu" fallbackHref="/" />
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-elevated transition-colors">
        <div className="text-center mb-6">
          <span className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold mx-auto mb-2 font-display">
            GG
          </span>
          <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
            Create Account
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Join Gulavlival Grand to checkout faster and track your dining
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                inputMode="tel"
                maxLength={10}
                required
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 transition"
          >
            <span>{loading ? "Creating Account..." : "Register"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>Already registered? </span>
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-amber-800 dark:text-amber-400 font-bold hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs">Loading registration...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
