export interface Variant {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_veg: boolean;
  is_bestseller: boolean;
  is_available: boolean;
  rating?: number;
  rating_count?: number;
  variants: Variant[];
  add_ons: AddOn[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  items: MenuItem[];
}

export interface CartItem {
  id: string; // Unique cart line item ID (e.g. itemId + variantId + addonsHash)
  menuItem: MenuItem;
  selectedVariant?: Variant;
  selectedAddOns: AddOn[];
  quantity: number;
  specialNote?: string;
  itemTotal: number;
}

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type OrderStatus = "RECEIVED" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  menu_item_id?: string;
  item_name_snapshot: string;
  variant_name_snapshot?: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  addons_summary?: string;
  note?: string;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: OrderType;
  status: OrderStatus;
  table_number?: string;
  delivery_address?: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  tax: number;
  delivery_charge: number;
  total: number;
  payment_method: string;
  change_for?: string;
  special_instructions?: string;
  whatsapp_updates: boolean;
  created_at: string;
  items: OrderItem[];
}

export interface CustomerUser {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  is_active: boolean;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string; // Home, Work, Hotel Room, Other
  address_line: string;
  landmark?: string;
  city: string;
  pincode?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

