"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

export function StickyCartBar() {
  const pathname = usePathname();
  const { items, getItemCount, getGrandTotal } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || items.length === 0) return null;
  // Hide on Cart and Checkout pages to free up mobile vertical room
  if (pathname === "/cart" || pathname === "/checkout") return null;

  const count = getItemCount();
  const total = getGrandTotal();

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-0 right-0 z-40 px-3 sm:px-4 pointer-events-none transition-all">
      <div className="max-w-md mx-auto pointer-events-auto">
        <Link
          href="/cart"
          className="flex items-center justify-between bg-neutral-900/95 dark:bg-neutral-900/95 border border-amber-500/40 text-white px-4 py-3 rounded-2xl shadow-elevated dark:shadow-warm-glow hover:bg-neutral-800 dark:hover:bg-neutral-800 backdrop-blur-md transition transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="relative bg-amber-500 text-neutral-950 p-2 rounded-xl">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 bg-white text-neutral-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            </div>
            <div>
              <p className="text-[11px] sm:text-xs text-neutral-300 font-medium">
                {count} {count === 1 ? "item" : "items"}
              </p>
              <p className="text-xs sm:text-sm font-extrabold tracking-tight text-white">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 sm:bg-transparent px-3 py-1.5 sm:px-0 sm:py-0 rounded-xl">
            <span>View Cart</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
