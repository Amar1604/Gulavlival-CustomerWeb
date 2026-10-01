import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, MenuItem, Variant, AddOn, OrderType } from "@/types";

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string | null;
  deliveryAddress: string;
  specialInstructions: string;
  changeFor: string;
  whatsappUpdates: boolean;

  // Actions
  addItem: (item: MenuItem, variant?: Variant, addOns?: AddOn[], note?: string, quantity?: number) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (table: string | null) => void;
  setDeliveryAddress: (address: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  setChangeFor: (change: string) => void;
  setWhatsappUpdates: (enabled: boolean) => void;

  // Computed
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryCharge: () => number;
  getGrandTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      orderType: "DINE_IN",
      tableNumber: null,
      deliveryAddress: "",
      specialInstructions: "",
      changeFor: "",
      whatsappUpdates: false,

      addItem: (menuItem, variant, addOns = [], note = "", quantity = 1) => {
        const variantId = variant?.id || "default";
        const addOnIds = addOns.map((a) => a.id).sort().join("-");
        const uniqueId = `${menuItem.id}-${variantId}-${addOnIds}-${note}`;

        const basePrice = variant ? Number(variant.price) : Number(menuItem.base_price);
        const addOnsPrice = addOns.reduce((sum, a) => sum + Number(a.price), 0);
        const unitPrice = basePrice + addOnsPrice;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === uniqueId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            itemTotal: newQty * unitPrice,
          };
          set({ items: updated });
        } else {
          const newItem: CartItem = {
            id: uniqueId,
            menuItem,
            selectedVariant: variant,
            selectedAddOns: addOns,
            quantity,
            specialNote: note,
            itemTotal: unitPrice * quantity,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      updateQuantity: (cartItemId, delta) => {
        const currentItems = get().items;
        const index = currentItems.findIndex((i) => i.id === cartItemId);
        if (index === -1) return;

        const item = currentItems[index];
        const newQty = item.quantity + delta;

        if (newQty <= 0) {
          get().removeItem(cartItemId);
        } else {
          const unitPrice = item.itemTotal / item.quantity;
          const updated = [...currentItems];
          updated[index] = {
            ...item,
            quantity: newQty,
            itemTotal: newQty * unitPrice,
          };
          set({ items: updated });
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => i.id !== cartItemId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      setOrderType: (orderType) => set({ orderType }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
      setSpecialInstructions: (specialInstructions) => set({ specialInstructions }),
      setChangeFor: (changeFor) => set({ changeFor }),
      setWhatsappUpdates: (whatsappUpdates) => set({ whatsappUpdates }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.itemTotal, 0);
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      },

      getDeliveryCharge: () => {
        return get().orderType === "DELIVERY" && get().items.length > 0 ? 40 : 0;
      },

      getGrandTotal: () => {
        return get().getSubtotal() + get().getTax() + get().getDeliveryCharge();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "gulavlival-grand-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
