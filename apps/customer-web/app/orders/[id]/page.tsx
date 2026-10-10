"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Bike,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Order, OrderStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { OrderRatingCard } from "@/components/orders/order-rating-card";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll order status every 7 seconds
  const fetchOrder = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await apiFetch<Order>(`/orders/${orderId}`);
      setOrder(data);
    } catch {
      // Look in local demo orders if offline
      const demoOrders: Order[] = JSON.parse(
        localStorage.getItem("gg_demo_orders") || "[]"
      );
      const found = demoOrders.find((o) => o.id === orderId);
      if (found) {
        setOrder(found);
      }
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      fetchOrder();
    }, 7000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-500 font-medium">Connecting to restaurant...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-neutral-100 shadow-2xs">
        <h2 className="font-display font-bold text-lg text-neutral-800">
          Order Not Found
        </h2>
        <p className="text-xs text-neutral-500">
          We couldn&apos;t retrieve the details for this order.
        </p>
        <Link
          href="/"
          className="inline-block bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-warm"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    {
      status: "RECEIVED",
      label: "Order Received",
      desc: "Sent to the Gulavlival Grand kitchen.",
    },
    {
      status: "CONFIRMED",
      label: "Confirmed & Cooking",
      desc: "Freshly preparing your artisanal meal.",
    },
    {
      status: "DELIVERED",
      label: "Delivered & Enjoy",
      desc: "Handed over at counter or delivered.",
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === "RECEIVED") return 0;
    if (status === "CONFIRMED") return 1;
    if (status === "DELIVERED") return 2;
    return -1; // CANCELLED
  };

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Back & Refresh */}
      <div className="flex items-center justify-between">
        <BackButton label="My Orders" fallbackHref="/orders" />

        <button
          onClick={() => fetchOrder(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Live Refresh</span>
        </button>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-warm space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Order Number
            </span>
            <h1 className="font-display font-extrabold text-xl text-neutral-900 dark:text-neutral-100">
              {order.order_number}
            </h1>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.status === "DELIVERED"
                ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                : order.status === "CANCELLED"
                ? "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 animate-pulse"
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Live Stepper Tracker */}
        {!isCancelled ? (
          <div className="space-y-4 py-2">
            {steps.map((s, idx) => {
              const isCompleted = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div key={s.status} className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isCurrent
                          ? "bg-amber-500 text-white shadow-md ring-4 ring-amber-100 dark:ring-amber-950/80 animate-pulse"
                          : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 my-1 ${
                          isCompleted ? "bg-green-600" : "bg-neutral-200 dark:bg-neutral-800"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pt-0.5">
                    <h3
                      className={`font-display font-bold text-sm ${
                        isCurrent
                          ? "text-amber-950 dark:text-amber-300 font-extrabold"
                          : isCompleted
                          ? "text-neutral-800 dark:text-neutral-200"
                          : "text-neutral-400 dark:text-neutral-500"
                      }`}
                    >
                      {s.label}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <p className="font-bold">This order was cancelled.</p>
              <p className="text-red-600 dark:text-red-400">Please speak with our restaurant team for any questions.</p>
            </div>
          </div>
        )}

        {/* Order Details & Summary Snapshot */}
        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Order Summary
          </h2>

          <div className="space-y-2">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300">
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {it.quantity}x {it.item_name_snapshot}
                  </span>
                  {it.variant_name_snapshot && (
                    <span className="text-neutral-400 dark:text-neutral-500 ml-1">
                      ({it.variant_name_snapshot})
                    </span>
                  )}
                  {it.addons_summary && (
                    <p className="text-[11px] text-amber-800 dark:text-amber-400">{it.addons_summary}</p>
                  )}
                </div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(it.line_total)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
            <span>Total Billed Amount</span>
            <span className="text-base font-display text-amber-700 dark:text-amber-400">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {/* Support note */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
          <span>Need quick assistance with your order?</span>
          <span className="font-bold text-amber-800 dark:text-amber-400">Please speak with our counter staff</span>
        </div>
      </div>

      {/* Verified Experience & Dish Rating Card */}
      {!isCancelled && (
        <OrderRatingCard order={order} />
      )}
    </div>
  );
}
