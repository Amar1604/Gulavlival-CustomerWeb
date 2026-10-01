"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag, Utensils, Info } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    orderType,
    setOrderType,
    getSubtotal,
    getTax,
    getDeliveryCharge,
    getGrandTotal,
  } = useCartStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 shadow-elevated dark:shadow-dark-card">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-display font-bold text-xl text-neutral-900 dark:text-neutral-100">
          Your Cart is Empty
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 mb-6">
          Explore our artisan menu to add delicious pizzas, burgers, momos, and kulhad chai.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow-warm transition"
        >
          Browse Restaurant Menu
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryCharge = getDeliveryCharge();
  const grandTotal = getGrandTotal();

  const handleProceed = () => {
    const token = localStorage.getItem("gg_access_token");
    if (!token) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackButton label="Back to Menu" fallbackHref="/" />
        <button
          onClick={clearCart}
          className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold transition"
        >
          Clear All
        </button>
      </div>

      <div className="pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100 tracking-tight">
          Review Order Cart
        </h1>
      </div>

      {/* Order Mode Switcher */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-2xs space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Dining Type
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(["DINE_IN", "TAKEAWAY", "DELIVERY"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition active:scale-95 ${
                orderType === type
                  ? "bg-amber-600 dark:bg-amber-500 text-white dark:text-neutral-950 shadow-xs"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {type === "DINE_IN" ? "Dine-In" : type === "TAKEAWAY" ? "Takeaway" : "Delivery"}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-2xs divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-3 h-3 rounded-xs border-2 flex items-center justify-center ${
                    item.menuItem.is_veg ? "border-green-600 dark:border-green-500" : "border-red-600 dark:border-red-500"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${
                      item.menuItem.is_veg ? "bg-green-600 dark:bg-green-500" : "bg-red-600 dark:bg-red-500"
                    }`}
                  />
                </span>
                <h4 className="font-display font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {item.menuItem.name}
                </h4>
              </div>

              {/* Variant and Add-ons note */}
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 space-y-0.5 pl-4">
                {item.selectedVariant && (
                  <p className="font-medium text-amber-900 dark:text-amber-300">
                    Size: {item.selectedVariant.name}
                  </p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p>
                    Add-ons: {item.selectedAddOns.map((a) => a.name).join(", ")}
                  </p>
                )}
                {item.specialNote && (
                  <p className="italic text-neutral-400 dark:text-neutral-500">Note: {item.specialNote}</p>
                )}
              </div>

              <p className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100 mt-2 pl-4">
                {formatCurrency(item.itemTotal)}
              </p>
            </div>

            {/* Quantity Controller & Delete */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-neutral-800 px-2 py-1">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Breakdown */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-2xs space-y-3">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
          Bill Details
        </h3>
        <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="flex justify-between">
            <span>Item Subtotal</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & Restaurant GST (5%)</span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(tax)}</span>
          </div>
          {orderType === "DELIVERY" && (
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{formatCurrency(deliveryCharge)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
            <span>To Pay (Pay at Restaurant / COD)</span>
            <span className="text-amber-700 dark:text-amber-400 font-display text-base">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        type="button"
        onClick={handleProceed}
        className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 font-bold py-3.5 px-6 rounded-2xl shadow-warm flex items-center justify-between transition active:scale-95"
      >
        <span>Proceed to Checkout</span>
        <div className="flex items-center gap-2">
          <span>{formatCurrency(grandTotal)}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}

