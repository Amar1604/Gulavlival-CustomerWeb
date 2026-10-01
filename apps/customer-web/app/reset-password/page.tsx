"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { BackButton } from "@/components/ui/back-button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError("Please provide a valid password reset token or request a new one.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: token.trim(),
          new_password: newPassword,
        }),
      });

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link or token may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-elevated text-center space-y-5 transition-colors">
          <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
              Password Reset Complete!
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Your password has been securely updated in our system. You can now log in with your new credentials.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 text-xs transition"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="mb-4">
        <BackButton label="Back to Sign In" fallbackHref="/login" />
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-elevated transition-colors">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
            Create New Password
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Choose a strong password to protect your Gulavlival Grand account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialToken && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Reset Token
              </label>
              <input
                type="text"
                required
                placeholder="Paste the reset token received"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full text-xs font-mono pl-3.5 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 transition text-xs"
          >
            <span>{loading ? "Resetting Password..." : "Save New Password"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500 dark:text-neutral-400">
          <span>Need a new reset request? </span>
          <Link href="/forgot-password" className="text-amber-800 dark:text-amber-400 font-bold hover:underline">
            Click here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-xs">Loading reset page...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
