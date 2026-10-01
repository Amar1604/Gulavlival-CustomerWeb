"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface CategoryBarProps {
  categories: { id: string; name: string; slug: string }[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  vegOnly: boolean;
  onToggleVeg: () => void;
}

export function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  vegOnly,
  onToggleVeg,
}: CategoryBarProps) {
  return (
    <div className="sticky top-[56px] z-30 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800/80 py-2.5 sm:py-3 shadow-2xs transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 space-y-2.5">
        {/* Search and Veg Toggle Row */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              inputMode="search"
              placeholder="Search dishes (Pizza, Chai, Momos)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-8 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-850 focus:border-amber-500 focus:outline-hidden transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Veg Only Filter Switch */}
          <button
            type="button"
            onClick={onToggleVeg}
            aria-label="Filter vegetarian items only"
            className={`min-h-[42px] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 shrink-0 ${
              vegOnly
                ? "bg-green-50 dark:bg-green-950/50 border-green-500 dark:border-green-600/70 text-green-800 dark:text-green-300 font-bold"
                : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                vegOnly ? "bg-green-600 dark:bg-green-500 animate-pulse" : "bg-neutral-300 dark:bg-neutral-600"
              }`}
            />
            <span className="whitespace-nowrap text-[11px] sm:text-xs">Veg Only</span>
          </button>
        </div>

        {/* Horizontal Swipeable Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 scroll-smooth -mx-1 px-1">
          <button
            type="button"
            onClick={() => onSelectCategory("all")}
            className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${
              selectedCategory === "all"
                ? "bg-amber-600 dark:bg-amber-500 text-white dark:text-neutral-950 shadow-xs shadow-amber-500/20"
                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-transparent dark:border-neutral-800/80"
            }`}
          >
            All Items
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat.slug
                  ? "bg-amber-600 dark:bg-amber-500 text-white dark:text-neutral-950 shadow-xs shadow-amber-500/20"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-transparent dark:border-neutral-800/80"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
