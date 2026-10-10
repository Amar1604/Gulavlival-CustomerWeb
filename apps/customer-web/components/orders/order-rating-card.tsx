"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, ThumbsUp, Sparkles, Send, RefreshCw } from "lucide-react";
import { Order } from "@/types";
import { apiFetch } from "@/lib/api-client";

interface OrderRatingCardProps {
  order: Order;
}

const REVIEW_TAGS = [
  "🔥 Hot & Fresh",
  "⚡ Super Fast",
  "❤️ Delicious Taste",
  "📦 Great Packaging",
  "👨‍🍳 Generous Portions",
  "✨ Hygienic & Clean",
];

export function OrderRatingCard({ order }: OrderRatingCardProps) {
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Overall restaurant rating state
  const [restaurantRating, setRestaurantRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(["❤️ Delicious Taste"]);
  const [restaurantComment, setRestaurantComment] = useState("");

  // Individual dish ratings state: map of menu_item_id -> rating
  const [dishRatings, setDishRatings] = useState<Record<string, { rating: number; text: string }>>({});

  // Initialize dish ratings
  useEffect(() => {
    if (order.items && order.items.length > 0) {
      const initial: Record<string, { rating: number; text: string }> = {};
      order.items.forEach((item) => {
        const idKey = item.menu_item_id || item.id;
        initial[idKey] = { rating: 5, text: "" };
      });
      setDishRatings(initial);
    }
  }, [order.items]);

  // Check if this order was already reviewed
  useEffect(() => {
    async function checkReviewStatus() {
      try {
        const res = await apiFetch<{
          already_reviewed: boolean;
          restaurant_review?: { rating: number; comment?: string };
        }>(`/reviews/orders/${order.id}`);
        if (res.already_reviewed) {
          setAlreadyReviewed(true);
          if (res.restaurant_review) {
            setRestaurantRating(res.restaurant_review.rating);
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoadingStatus(false);
      }
    }

    checkReviewStatus();
  }, [order.id]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const setItemStar = (itemKey: string, stars: number) => {
    setDishRatings((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        rating: stars,
      },
    }));
  };

  const setItemComment = (itemKey: string, text: string) => {
    setDishRatings((prev) => ({
      ...prev,
      [itemKey]: {
        ...prev[itemKey],
        text: text,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formattedDishRatings = Object.entries(dishRatings).map(([itemKey, val]) => {
        // Find matching item from order to get true menu_item_id
        const orderItem = order.items.find(
          (i) => (i.menu_item_id || i.id) === itemKey
        );
        return {
          menu_item_id: orderItem?.menu_item_id || itemKey,
          rating: val.rating,
          review_text: val.text.trim() || null,
        };
      });

      await apiFetch(`/reviews/orders/${order.id}`, {
        method: "POST",
        body: JSON.stringify({
          restaurant_rating: restaurantRating,
          restaurant_tags: selectedTags.join(", "),
          restaurant_comment: restaurantComment.trim() || null,
          dish_ratings: formattedDishRatings,
        }),
      });

      setSubmittedSuccess(true);
      setAlreadyReviewed(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) {
    return null;
  }

  // If already reviewed or just submitted
  if (alreadyReviewed || submittedSuccess) {
    return (
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-5 text-center space-y-2 animate-fade-in">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="font-display font-extrabold text-base text-neutral-900 dark:text-neutral-100">
          Thank you for rating Gulavlival Grand!
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto">
          Your feedback helps us continuously perfect our dishes and powers our local community ranking.
        </p>
        <div className="flex items-center justify-center gap-1 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= restaurantRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-300 dark:text-neutral-700"
              }`}
            />
          ))}
          <span className="text-xs font-bold text-amber-500 ml-1">Verified Diner</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-warm space-y-6 animate-fade-in transition-colors">
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-display font-bold text-base text-neutral-900 dark:text-neutral-100">
            How was your meal? Rate your experience
          </h3>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Rate the restaurant and individual dishes to help food lovers in the area discover top dishes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Overall Restaurant Experience */}
        <div className="space-y-3 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200">
              Overall Restaurant Experience
            </span>
            <span className="text-xs font-black text-amber-500">
              {restaurantRating} / 5 Stars
            </span>
          </div>

          {/* Interactive Star Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRestaurantRating(star)}
                className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title={`${star} Star`}
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    star <= restaurantRating
                      ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                      : "text-neutral-300 dark:text-neutral-700 hover:text-amber-200"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Quick Reaction Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {REVIEW_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    active
                      ? "bg-amber-500 text-black font-bold shadow-xs"
                      : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-amber-400"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Optional Restaurant Comment */}
          <input
            type="text"
            placeholder="Write a quick comment about the restaurant (optional)..."
            value={restaurantComment}
            onChange={(e) => setRestaurantComment(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* 2. Individual Dish Ratings */}
        <div className="space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Rate Your Ordered Dishes
          </span>

          <div className="space-y-3">
            {order.items.map((item) => {
              const itemKey = item.menu_item_id || item.id;
              const currentItemRating = dishRatings[itemKey]?.rating ?? 5;
              const currentItemComment = dishRatings[itemKey]?.text ?? "";

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
                        {item.item_name_snapshot}
                      </h4>
                      {item.variant_name_snapshot && (
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {item.variant_name_snapshot}
                        </span>
                      )}
                    </div>

                    {/* 5-Star Dish Selector */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setItemStar(itemKey, s)}
                          className="hover:scale-115 active:scale-90 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              s <= currentItemRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-300 dark:text-neutral-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Dish Feedback */}
                  <input
                    type="text"
                    placeholder={`How was the ${item.item_name_snapshot}? (optional)`}
                    value={currentItemComment}
                    onChange={(e) => setItemComment(itemKey, e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60 cursor-pointer"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Submitting Your Verified Review...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-black" />
              <span>Submit Verified Ratings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
