"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { product } from "@/config/product";

type CartValue = {
  quantity: number;
  bagCount: number;
  colour: string;
  setQuantity: (q: number) => void;
  setColour: (c: string) => void;
  checkoutOpen: boolean;
  openCheckout: (q?: number) => void;
  closeCheckout: () => void;
};

const CartContext = createContext<CartValue | null>(null);
const KEY = "kl_bag";

export const clampQty = (q: number) => Math.min(product.maxQuantity, Math.max(1, Math.round(q) || 1));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantity, setQ] = useState(1);
  const [inBag, setInBag] = useState(false);
  const [colour, setColour] = useState<string>(product.colours[0].id);
  const [checkoutOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const v = JSON.parse(raw) as { q?: number };
        if (v.q) {
          setQ(clampQty(v.q));
          setInBag(true);
        }
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const persist = (q: number | null) => {
    try {
      if (q === null) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify({ q }));
    } catch {
      /* ignore */
    }
  };

  const setQuantity = useCallback(
    (q: number) => {
      const v = clampQty(q);
      setQ(v);
      if (inBag) persist(v);
    },
    [inBag]
  );

  const openCheckout = useCallback((q?: number) => {
    setQ((cur) => {
      const v = clampQty(q ?? cur);
      persist(v);
      return v;
    });
    setInBag(true);
    setOpen(true);
  }, []);

  const closeCheckout = useCallback(() => setOpen(false), []);

  const value = useMemo<CartValue>(
    () => ({
      quantity,
      bagCount: inBag ? quantity : 0,
      colour,
      setQuantity,
      setColour,
      checkoutOpen,
      openCheckout,
      closeCheckout,
    }),
    [quantity, inBag, colour, setQuantity, checkoutOpen, openCheckout, closeCheckout]
  );

  // expose a way to clear the bag after a successful order
  useEffect(() => {
    const onClear = () => {
      setInBag(false);
      setQ(1);
      persist(null);
    };
    window.addEventListener("kl:clear-bag", onClear);
    return () => window.removeEventListener("kl:clear-bag", onClear);
  }, []);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
