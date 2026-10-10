"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Sparkles, Star } from "lucide-react";
import { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ItemCustomizerModal } from "./item-customizer-modal";
import { useCartStore } from "@/lib/stores/cart-store";

interface FoodCardProps {
  item: MenuItem;
}

// Fallback high-resolution food images
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
  bread: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?q=80&w=600&auto=format&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
  maggi: "https://images.unsplash.com/photo-1612927601601-6638404737ce?q=80&w=600&auto=format&fit=crop",
  chinese: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=600&auto=format&fit=crop",
  momos: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=600&auto=format&fit=crop",
  shakes: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop",
  "tea-coffee": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
  "tea/coffee": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop",
};

export function FoodCard({ item }: FoodCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [item.image_url]);
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const hasOptions =
    (item.variants && item.variants.length > 0) ||
    (item.add_ons && item.add_ons.length > 0);

  // Check if this item is currently in the cart
  const cartItem = items.find((ci) => ci.menuItem.id === item.id && !ci.selectedVariant);
  const inCartQuantity = cartItem?.quantity || 0;

  const handleAddClick = () => {
    if (!item.is_available) return;
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      addItem(item);
    }
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        updateQuantity(cartItem.id, cartItem.quantity - 1);
      } else {
        removeItem(cartItem.id);
      }
    }
  };

  // Determine image URL
  const catKey = (item.category_name || item.category_id || "").toLowerCase();
  const fallbackImg = DEFAULT_CATEGORY_IMAGES[catKey] || DEFAULT_CATEGORY_IMAGES["pizza"];
  const displayImage = (!imgError && item.image_url) ? item.image_url : fallbackImg;

  return (
    <>
      <div
        className={`group bg-white dark:bg-neutral-900/90 rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-elevated dark:hover:shadow-dark-card hover:-translate-y-1 ${
          item.is_available
            ? "border-neutral-100 dark:border-neutral-800/80 hover:border-amber-300 dark:hover:border-amber-500/40"
            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 opacity-80"
        }`}
      >
        <div>
          {/* Food Photography Container */}
          <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <Image
              src={displayImage}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                !item.is_available ? "grayscale" : ""
              }`}
              onError={() => setImgError(true)}
            />

            {/* Gradient Overlay for badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Badges on Image */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              {/* Veg / Non-veg indicator */}
              <span
                className={`w-4 h-4 rounded-xs border-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs flex items-center justify-center shadow-xs ${
                  item.is_veg ? "border-green-600 dark:border-green-500" : "border-red-600 dark:border-red-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.is_veg ? "bg-green-600 dark:bg-green-500" : "bg-red-600 dark:bg-red-500"
                  }`}
                />
              </span>

              {item.is_bestseller && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  Bestseller
                </span>
              )}
            </div>

            {/* Star Rating Badge (Top Right) */}
            <div className="absolute top-2.5 right-2.5">
              <span className="flex items-center gap-1 text-[10px] font-extrabold bg-neutral-900/85 backdrop-blur-xs text-amber-400 px-2 py-0.5 rounded-md shadow-xs border border-amber-500/30">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span>{(item.rating || 4.5).toFixed(1)}</span>
                {item.rating_count ? (
                  <span className="text-neutral-400 text-[9px] font-normal">({item.rating_count})</span>
                ) : null}
              </span>
            </div>

            {/* Sold-out or Multi-variant tag */}
            <div className="absolute bottom-2.5 right-2.5">
              {!item.is_available ? (
                <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                  Sold Out
                </span>
              ) : item.variants && item.variants.length > 0 ? (
                <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md">
                  {item.variants.length} Sizes
                </span>
              ) : null}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-3.5 sm:p-4">
            <h3 className="font-display font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition leading-snug">
              {item.name}
            </h3>

            {item.description && (
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 flex items-center justify-between border-t border-neutral-100/80 dark:border-neutral-800/80">
          <div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium block">
              {item.variants && item.variants.length > 0 ? "Starts from" : "Price"}
            </span>
            <p className="font-display font-extrabold text-base sm:text-lg text-neutral-900 dark:text-neutral-100">
              {formatCurrency(item.base_price)}
            </p>
          </div>

          {/* Mobile-Friendly Stepper or ADD Button */}
          {!hasOptions && inCartQuantity > 0 ? (
            <div className="flex items-center bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-600/60 rounded-xl px-1 py-0.5 shadow-2xs">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label={`Decrease ${item.name} quantity`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-900 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition active:scale-90 font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-7 text-center font-display font-extrabold text-xs sm:text-sm text-amber-950 dark:text-amber-200">
                {inCartQuantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label={`Increase ${item.name} quantity`}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-900 dark:text-amber-300 hover:bg-amber-200/60 dark:hover:bg-amber-900/60 transition active:scale-90 font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!item.is_available}
              onClick={handleAddClick}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
                item.is_available
                  ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 active:scale-95 shadow-warm dark:shadow-none"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 border-transparent cursor-not-allowed"
              }`}
            >
              <span>{hasOptions ? "CUSTOMIZE" : "ADD"}</span>
              {item.is_available && <Plus className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ItemCustomizerModal item={item} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
