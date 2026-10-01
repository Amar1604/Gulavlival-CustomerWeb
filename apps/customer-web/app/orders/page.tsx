"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, ArrowRight, ShoppingBag, LogOut, User } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Order, CustomerUser } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<"all" | "active" | "delivered">("all");
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, logout } = useAuthStore();


  useEffect(() => {
    const token = localStorage.getItem("gg_access_token");

    if (!token && !isAuthenticated) {
      router.push("/login?redirect=/orders");
      return;
    }

    async function loadOrders() {
      try {
        const data = await apiFetch<Order[]>("/orders");
        setOrders(data);
      } catch {
        // Fallback to local demo orders
        const demo: Order[] = JSON.parse(
          localStorage.getItem("gg_demo_orders") || "[]"
        );
        setOrders(demo);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router, isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "active") return o.status === "RECEIVED" || o.status === "CONFIRMED";
    if (orderFilter === "delivered") return o.status === "DELIVERED" || o.status === "CANCELLED";
    return true;
  });

  if (loading) {

    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-neutral-500">Loading order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <BackButton label="Back to Restaurant Menu" fallbackHref="/" />
      </div>

      {/* Account Info Header */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-2xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold">
            <User className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100">
              {user?.name || "Customer Account"}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.mobile || ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-300 dark:hover:border-amber-500 text-xs font-semibold transition"
          >
            <User className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/60 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2 text-xs font-bold">
        {[
          { key: "all", label: "All Orders" },
          { key: "active", label: "Active Orders" },
          { key: "delivered", label: "Delivered & Past" },
        ].map((tab) => {
          const isActive = orderFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setOrderFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl transition ${
                isActive
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-xs">
          <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-base text-neutral-800 dark:text-neutral-200">
            No orders in this view
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-5">
            {orderFilter === "active"
              ? "You do not have any active kitchen or delivery orders right now."
              : "You haven't placed any dining or takeaway orders yet."}
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-warm transition"
          >
            Explore Restaurant Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => (
            <Link
              key={ord.id}
              href={`/orders/${ord.id}`}
              className="block bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-elevated transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-display font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    {ord.order_number}
                  </span>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {new Date(ord.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ord.status === "DELIVERED"
                      ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                      : ord.status === "CANCELLED"
                      ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                      : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 animate-pulse"
                  }`}
                >
                  {ord.status}
                </span>
              </div>

              <div className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-1 mb-3">
                {ord.items?.map((it) => `${it.quantity}x ${it.item_name_snapshot}`).join(", ")}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(ord.total)}
                </span>
                <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                  <span>Track Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
