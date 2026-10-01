"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { BackButton } from "@/components/ui/back-button";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch<{
        message: string;
        reset_token?: string | null;
      }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      setSuccessMessage(res.message);
      if (res.reset_token) {
        setResetToken(res.reset_token);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="mb-4">
        <BackButton label="Back to Sign In" fallbackHref="/login" />
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-elevated transition-colors">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold mx-auto mb-3">
            <KeyRound className="w-6 h-6 text-amber-700 dark:text-amber-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
            Forgot Password
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
            Enter your registered mobile number or email address. We&apos;ll help you reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-neutral-900 dark:text-neutral-100">Reset Request Dispatched</p>
                <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{successMessage}</p>
              </div>
            </div>

            {resetToken ? (
              <div className="pt-2 space-y-3">
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  A verification reset session is active. You can now set your new password:
                </p>
                <button
                  onClick={() => router.push(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 text-xs transition"
                >
                  <span>Set New Password Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-block bg-neutral-900 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition"
                >
                  Return to Sign In
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1">
                Registered Mobile or Email
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876500001 or user@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-warm flex items-center justify-center gap-2 transition text-xs"
            >
              <span>{loading ? "Sending..." : "Continue"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
              <span>Remember your password? </span>
              <Link href="/login" className="text-amber-800 dark:text-amber-400 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
