"use client";

import React, { useEffect, useState, useMemo } from "react";
import { CategoryBar } from "@/components/menu/category-bar";
import { FoodCard } from "@/components/menu/food-card";
import { Category, MenuItem } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { UtensilsCrossed, AlertCircle } from "lucide-react";

// Default seed categories matching the project specifications
const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Pizza",
    slug: "pizza",
    sort_order: 1,
    description: "Wood-fired artisanal pizzas with rich mozzarella",
    items: [
      {
        id: "p1",
        category_id: "cat-1",
        name: "Margherita Classica",
        slug: "margherita-classica",
        description: "San Marzano tomato sauce, fresh basil, bocconcini mozzarella, extra virgin olive oil.",
        base_price: 249,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "v1", name: "Regular (8\")", price: 249, is_available: true },
          { id: "v2", name: "Medium (10\")", price: 399, is_available: true },
          { id: "v3", name: "Large (12\")", price: 549, is_available: true },
        ],
        add_ons: [
          { id: "a1", name: "Extra Mozzarella Cheese", price: 49, is_available: true },
          { id: "a2", name: "Cheese Stuffed Crust", price: 69, is_available: true },
          { id: "a3", name: "Jalapeño & Olives", price: 39, is_available: true },
        ],
      },
      {
        id: "p2",
        category_id: "cat-1",
        name: "Paneer Tikka Supreme",
        slug: "paneer-tikka-supreme",
        description: "Tandoori marinated paneer cubes, crisp capsicum, charred red onions & creamy tikka drizzle.",
        base_price: 299,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "v4", name: "Regular (8\")", price: 299, is_available: true },
          { id: "v5", name: "Medium (10\")", price: 469, is_available: true },
        ],
        add_ons: [
          { id: "a4", name: "Extra Mozzarella Cheese", price: 49, is_available: true },
        ],
      },
    ],
  },
  {
    id: "cat-2",
    name: "Burger",
    slug: "burger",
    sort_order: 2,
    description: "Juicy artisanal gourmet burgers served in butter-toasted brioche buns",
    items: [
      {
        id: "b1",
        category_id: "cat-2",
        name: "Grand Veg Crunch Burger",
        slug: "grand-veg-crunch-burger",
        description: "Crispy golden herb potato patty, iceberg lettuce, melted cheddar slice, house signature sauce.",
        base_price: 149,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "b-v1", name: "Single Patty", price: 149, is_available: true },
          { id: "b-v2", name: "Double Trouble Patty", price: 219, is_available: true },
        ],
        add_ons: [
          { id: "b-a1", name: "Cheese Slice", price: 25, is_available: true },
          { id: "b-a2", name: "French Fries Combo", price: 69, is_available: true },
        ],
      },
      {
        id: "b2",
        category_id: "cat-2",
        name: "Spicy Paneer Royale Burger",
        slug: "spicy-paneer-royale-burger",
        description: "Panko crusted thick paneer slab tossed in hot paprika glaze with gherkins and chipotle mayo.",
        base_price: 189,
        is_veg: true,
        is_bestseller: false,
        is_available: true,
        variants: [],
        add_ons: [{ id: "b-a3", name: "Extra Cheese Melt", price: 30, is_available: true }],
      },
    ],
  },
  {
    id: "cat-3",
    name: "Maggi",
    slug: "maggi",
    sort_order: 3,
    description: "Comfort bowls prepared with special house spices and rich butter",
    items: [
      {
        id: "m1",
        category_id: "cat-3",
        name: "Cheese Butter Masala Maggi",
        slug: "cheese-butter-masala-maggi",
        description: "Double Maggi noodles simmered with roasted butter, bell peppers, sweet corn and mountain cheese.",
        base_price: 119,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [],
        add_ons: [{ id: "m-a1", name: "Extra Grated Cheese", price: 30, is_available: true }],
      },
      {
        id: "m2",
        category_id: "cat-3",
        name: "Schezwan Veg Blast Maggi",
        slug: "schezwan-veg-blast-maggi",
        description: "Fiery wok-tossed noodles with homemade schezwan chutney, spring onions and crunchy carrots.",
        base_price: 99,
        is_veg: true,
        is_bestseller: false,
        is_available: true,
        variants: [],
        add_ons: [],
      },
    ],
  },
  {
    id: "cat-4",
    name: "Chinese",
    slug: "chinese",
    sort_order: 4,
    description: "Wok-tossed aromatic noodles and sizzling appetizers",
    items: [
      {
        id: "c1",
        category_id: "cat-4",
        name: "Veg Hakka Noodles",
        slug: "veg-hakka-noodles",
        description: "Freshly pulled noodles tossed in a superheated wok with julienned cabbage and light soy.",
        base_price: 169,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "c-v1", name: "Half Portion", price: 119, is_available: true },
          { id: "c-v2", name: "Full Portion", price: 169, is_available: true },
        ],
        add_ons: [],
      },
      {
        id: "c2",
        category_id: "cat-4",
        name: "Crispy Chilli Paneer (Dry)",
        slug: "crispy-chilli-paneer-dry",
        description: "Wok-seared cottage cheese cubes tossed with garlic, green chillies, spring onions and dark soy.",
        base_price: 229,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [],
        add_ons: [],
      },
    ],
  },
  {
    id: "cat-5",
    name: "Momos",
    slug: "momos",
    sort_order: 5,
    description: "Steamed and crispy Himalayan dumplings served with spicy garlic dip",
    items: [
      {
        id: "mo1",
        category_id: "cat-5",
        name: "Steamed Veg Himalayan Momos (6 pcs)",
        slug: "steamed-veg-himalayan-momos",
        description: "Finely minced mountain veggies and herbs encased in paper-thin translucent dough.",
        base_price: 129,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "mo-v1", name: "Steamed (6 Pcs)", price: 129, is_available: true },
          { id: "mo-v2", name: "Pan Fried (6 Pcs)", price: 149, is_available: true },
          { id: "mo-v3", name: "Kurkure Fried (6 Pcs)", price: 169, is_available: true },
        ],
        add_ons: [
          { id: "mo-a1", name: "Spicy Red Chilli Garlic Dip", price: 15, is_available: true },
        ],
      },
    ],
  },
  {
    id: "cat-6",
    name: "Shakes",
    slug: "shakes",
    sort_order: 6,
    description: "Thick ice-cream blended signature shakes and fruit delights",
    items: [
      {
        id: "s1",
        category_id: "cat-6",
        name: "Belgian Dark Chocolate Shake",
        slug: "belgian-dark-chocolate-shake",
        description: "Rich 70% dark Belgian cocoa blended with whole milk and dairy ice cream, topped with cocoa curls.",
        base_price: 169,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "s-v1", name: "Regular (300ml)", price: 169, is_available: true },
          { id: "s-v2", name: "Grand Monster (500ml)", price: 229, is_available: true },
        ],
        add_ons: [
          { id: "s-a1", name: "Vanilla Ice Cream Scoop", price: 35, is_available: true },
        ],
      },
      {
        id: "s2",
        category_id: "cat-6",
        name: "Oreo Hazelnut Thickshake",
        slug: "oreo-hazelnut-thickshake",
        description: "Crushed Oreo cookies, roasted hazelnut spread, and vanilla cream froth.",
        base_price: 179,
        is_veg: true,
        is_bestseller: true,
        is_available: false, // SOLD OUT DEMONSTRATION
        variants: [],
        add_ons: [],
      },
    ],
  },
  {
    id: "cat-7",
    name: "Tea & Coffee",
    slug: "tea-coffee",
    sort_order: 7,
    description: "Freshly brewed artisanal teas, kulhad chai, and espresso coffees",
    items: [
      {
        id: "t1",
        category_id: "cat-7",
        name: "Gulavlival Special Masala Chai",
        slug: "gulavlival-special-masala-chai",
        description: "Steaming clay-pot (Kulhad) tea infused with crushed green cardamom, ginger, cloves and cinnamon.",
        base_price: 49,
        is_veg: true,
        is_bestseller: true,
        is_available: true,
        variants: [
          { id: "t-v1", name: "Single Kulhad", price: 49, is_available: true },
          { id: "t-v2", name: "Flask (Serves 4)", price: 169, is_available: true },
        ],
        add_ons: [],
      },
      {
        id: "t2",
        category_id: "cat-7",
        name: "Café Cappuccino",
        slug: "cafe-cappuccino",
        description: "Double espresso shot topped with velvety steamed milk foam and Dutch cocoa dusting.",
        base_price: 119,
        is_veg: true,
        is_bestseller: false,
        is_available: true,
        variants: [],
        add_ons: [],
      },
    ],
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  // Fetch menu from backend
  const loadBackendMenu = React.useCallback(async () => {
    try {
      const data = await apiFetch<Category[]>("/categories");
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch {
      // Silently keep seed fallback
    }
  }, []);

  useEffect(() => {
    loadBackendMenu();
  }, [loadBackendMenu]);

  // Real-time zero-refresh synchronization via WebSocket
  useEffect(() => {
    const rawWsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws";
    const wsUrl = rawWsUrl.endsWith("/menu")
      ? rawWsUrl
      : `${rawWsUrl.replace(/\/orders$/, "")}/menu`;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "AVAILABILITY_CHANGED") {
              setCategories((prev) =>
                prev.map((cat) => ({
                  ...cat,
                  items: cat.items.map((item) =>
                    item.id === data.item_id
                      ? { ...item, is_available: data.is_available }
                      : item
                  ),
                }))
              );
            } else if (data.type === "PRICE_CHANGED") {
              setCategories((prev) =>
                prev.map((cat) => ({
                  ...cat,
                  items: cat.items.map((item) =>
                    item.id === data.item_id
                      ? { ...item, base_price: data.new_price }
                      : item
                  ),
                }))
              );
            } else if (data.type === "MENU_ITEM_UPDATED" && data.item) {
              setCategories((prev) =>
                prev.map((cat) => ({
                  ...cat,
                  items: cat.items.map((item) =>
                    item.id === data.item.id
                      ? {
                          ...item,
                          name: data.item.name,
                          base_price: data.item.base_price,
                          description: data.item.description,
                          image_url: data.item.image_url,
                          is_veg: data.item.is_veg,
                          is_available: data.item.is_available,
                        }
                      : item
                  ),
                }))
              );
            } else if (
              data.type === "MENU_ITEM_CREATED" ||
              data.type === "MENU_ITEM_DELETED"
            ) {
              loadBackendMenu();
            }
          } catch {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        // Fallback silently if offline
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [loadBackendMenu]);

  // Filtered menu items
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (selectedCategory !== "all" && cat.slug !== selectedCategory) {
          return null;
        }

        const items = cat.items.filter((item) => {
          if (vegOnly && !item.is_veg) return false;
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchName = item.name.toLowerCase().includes(query);
            const matchDesc = item.description?.toLowerCase().includes(query);
            return matchName || matchDesc;
          }
          return true;
        });

        if (items.length === 0) return null;

        return {
          ...cat,
          items,
        };
      })
      .filter(Boolean) as Category[];
  }, [categories, selectedCategory, searchQuery, vegOnly]);

  return (
    <div className="space-y-6">
      {/* Brand Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 dark:from-neutral-900 dark:via-neutral-800 dark:to-amber-950 text-white p-6 sm:p-10 lg:p-12 shadow-warm dark:shadow-dark-card border border-amber-500/20 dark:border-amber-500/20 transition-all">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 dark:bg-amber-500/20 backdrop-blur-xs text-xs font-bold tracking-widest uppercase text-white dark:text-amber-300">
                Handcrafted Flavors
              </span>
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-amber-400/20 backdrop-blur-xs text-xs font-semibold text-amber-200">
                Fresh to Order
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              Gulavlival Grand Dining
            </h1>
            <p className="mt-2 text-sm sm:text-base text-amber-100 dark:text-neutral-300 font-normal leading-relaxed max-w-xl">
              Savor authentic wood-fired pizzas, gourmet brioche burgers, steamed Himalayan momos, and kulhad chai crafted fresh for your table.
            </p>

            {/* Order Action Button */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <a
                href="#menu"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-lg shadow-amber-500/20 transition active:scale-95"
              >
                <span>🍽️ Explore Menu & Order</span>
              </a>
            </div>
          </div>

          {/* Quick Highlight Badges for Wide Screens */}
          <div className="hidden lg:grid grid-cols-2 gap-3 text-xs shrink-0 max-w-sm">
            <div className="p-3 rounded-2xl bg-white/10 dark:bg-neutral-800/60 backdrop-blur-xs border border-white/15 dark:border-neutral-700/60">
              <p className="font-bold text-amber-200 dark:text-amber-300 text-sm">50+ Dishes</p>
              <p className="text-[11px] text-amber-100 dark:text-neutral-300">8 Curated Categories</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 dark:bg-neutral-800/60 backdrop-blur-xs border border-white/15 dark:border-neutral-700/60">
              <p className="font-bold text-amber-200 dark:text-amber-300 text-sm">Dine-in & QR</p>
              <p className="text-[11px] text-amber-100 dark:text-neutral-300">Direct Table Service</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 dark:bg-neutral-800/60 backdrop-blur-xs border border-white/15 dark:border-neutral-700/60">
              <p className="font-bold text-amber-200 dark:text-amber-300 text-sm">Pay at Counter</p>
              <p className="text-[11px] text-amber-100 dark:text-neutral-300">Cash & Digital Payments</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 dark:bg-neutral-800/60 backdrop-blur-xs border border-white/15 dark:border-neutral-700/60">
              <p className="font-bold text-amber-200 dark:text-amber-300 text-sm">Artisanal Kitchen</p>
              <p className="text-[11px] text-amber-100 dark:text-neutral-300">Fresh & Live Prep</p>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-amber-400/25 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sticky Category & Search Navigation */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        vegOnly={vegOnly}
        onToggleVeg={() => setVegOnly(!vegOnly)}
      />

      {/* Categories & Items Grid */}
      <div className="space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-xs">
            <UtensilsCrossed className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-neutral-800 dark:text-neutral-100">
              No dishes found
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Try adjusting your search query or removing the Veg-only filter.
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => (
            <section key={cat.id} id={cat.slug} className="space-y-4">
              <div className="border-b border-neutral-200/60 dark:border-neutral-800/80 pb-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
                  <span>{cat.name}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-transparent dark:border-amber-800/50">
                    {cat.items.length}
                  </span>
                </h2>
                {cat.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{cat.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-5">
                {cat.items.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

    </div>
  );
}
