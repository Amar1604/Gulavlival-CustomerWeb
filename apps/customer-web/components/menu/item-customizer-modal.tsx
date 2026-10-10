"use client";

import React, { useState } from "react";
import { X, Plus, Minus, Check, Star } from "lucide-react";
import { MenuItem, Variant, AddOn } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart-store";

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemCustomizerModal({ item, onClose }: ItemCustomizerModalProps) {
  const { addItem } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    item?.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  if (!item) return null;

  const toggleAddOn = (addon: AddOn) => {
    if (selectedAddOns.some((a) => a.id === addon.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const currentUnitPrice =
    (selectedVariant ? Number(selectedVariant.price) : Number(item.base_price)) +
    selectedAddOns.reduce((sum, a) => sum + Number(a.price), 0);

  const totalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    addItem(item, selectedVariant, selectedAddOns, note.trim(), quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-transparent dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-3.5 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-block w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center ${
                  item.is_veg ? "border-green-600 dark:border-green-500" : "border-red-600 dark:border-red-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    item.is_veg ? "bg-green-600 dark:bg-green-500" : "bg-red-600 dark:bg-red-500"
                  }`}
                />
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-neutral-900 dark:text-neutral-100">
                {item.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{(item.rating || 4.5).toFixed(1)}</span>
                {item.rating_count ? (
                  <span className="text-neutral-400 text-[10px] font-normal">({item.rating_count} reviews)</span>
                ) : null}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Variants / Size */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Choose Size / Variant
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {item.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`min-h-[46px] flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition active:scale-[0.99] ${
                      selectedVariant?.id === v.id
                        ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-300 font-semibold"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="font-bold">{formatCurrency(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {item.add_ons && item.add_ons.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                Custom Add-ons (Optional)
              </h4>
              <div className="space-y-2">
                {item.add_ons.map((addon) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon)}
                      className={`min-h-[46px] w-full flex items-center justify-between p-3 rounded-xl border text-sm transition active:scale-[0.99] ${
                        isChecked
                          ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                            isChecked
                              ? "bg-amber-600 border-amber-600 text-white"
                              : "border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                        +{formatCurrency(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Cooking Note */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Cooking Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less spicy, extra crispy, no garlic"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={150}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add Button */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 px-2 py-1 shadow-2xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition active:scale-90 font-bold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(20, quantity + 1))}
              className="w-8 h-8 flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition active:scale-90 font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 min-h-[48px] bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 font-bold py-3 px-5 rounded-xl shadow-warm flex items-center justify-between transition active:scale-95"
          >
            <span>Add Item</span>
            <span>{formatCurrency(totalPrice)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
