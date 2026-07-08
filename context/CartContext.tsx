"use client";

import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { Product } from "@/services/productService";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; product: Product }
  | { type: "REMOVE"; productId: string }
  | { type: "INCREMENT"; productId: string }
  | { type: "DECREMENT"; productId: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

interface CartContextValue {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
  totalTax: number;
  grandTotal: number;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(i => i.product.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { product: action.product, quantity: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter(i => i.product.id !== action.productId) };
    case "INCREMENT":
      return {
        items: state.items.map(i =>
          i.product.id === action.productId ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    case "DECREMENT":
      return {
        items: state.items
          .map(i =>
            i.product.id === action.productId ? { ...i, quantity: i.quantity - 1 } : i
          )
          .filter(i => i.quantity > 0),
      };
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "dentline_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const subtotal = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const totalTax = state.items.reduce(
    (s, i) => s + (i.product.price * i.quantity * i.product.taxPercentage) / 100,
    0
  );
  const grandTotal = subtotal + totalTax;
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        add: (product) => dispatch({ type: "ADD", product }),
        remove: (productId) => dispatch({ type: "REMOVE", productId }),
        increment: (productId) => dispatch({ type: "INCREMENT", productId }),
        decrement: (productId) => dispatch({ type: "DECREMENT", productId }),
        clear: () => dispatch({ type: "CLEAR" }),
        totalItems,
        subtotal,
        totalTax,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
