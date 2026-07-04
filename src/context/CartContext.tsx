/** Carrinho simples + ingressos comprados (persistido em localStorage) */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PurchasedTicket = {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  tierName: string;
  price: number;
  qty: number;
  qrCode: string;
  buyerName: string;
  purchasedAt: string;
};

type Ctx = {
  tickets: PurchasedTicket[];
  addPurchase: (t: Omit<PurchasedTicket, "id" | "qrCode" | "purchasedAt">) => PurchasedTicket;
};

const CartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "ingresso-acessivel.tickets";

export function CartProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTickets(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); } catch { /* noop */ }
  }, [tickets]);

  // useCallback garante referência estável: addPurchase não muda entre
  // renders (só depende de setTickets, que é estável por ser um setter
  // de useState), então o useMemo do value abaixo não recria o objeto
  // desnecessariamente a cada render do CartProvider.
  const addPurchase = useCallback<Ctx["addPurchase"]>((t) => {
    const id = `TKT-${Date.now().toString(36).toUpperCase()}`;
    const purchased: PurchasedTicket = {
      ...t,
      id,
      qrCode: `${id}|${t.eventId}|${t.tierName}|${t.qty}`,
      purchasedAt: new Date().toISOString(),
    };
    setTickets((prev) => [purchased, ...prev]);
    return purchased;
  }, []);

  const value = useMemo(() => ({ tickets, addPurchase }), [tickets, addPurchase]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart deve ser usado dentro de CartProvider");
  return c;
}
