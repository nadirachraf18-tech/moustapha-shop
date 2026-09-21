import { CART_STORAGE_KEY, type CartLine, type PersistedCart } from "@/types";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PersistedCart;
    if (!parsed || !Array.isArray(parsed.lines)) return [];
    return parsed.lines.filter(
      (line) =>
        typeof line.productId === "string" &&
        typeof line.name === "string" &&
        typeof line.price === "number" &&
        typeof line.quantity === "number" &&
        line.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readStoredCart());
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const payload: PersistedCart = { version: 1, lines };
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage can be unavailable (private mode); the cart still works in memory.
    }
  }, [lines]);

  const addItem = useCallback(
    (line: Omit<CartLine, "quantity">, quantity = 1) => {
      if (quantity <= 0) return;
      setLines((current) => {
        const existing = current.find(
          (entry) => entry.productId === line.productId,
        );
        if (existing) {
          return current.map((entry) =>
            entry.productId === line.productId
              ? { ...entry, quantity: entry.quantity + quantity }
              : entry,
          );
        }
        return [...current, { ...line, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setLines((current) =>
      current.filter((entry) => entry.productId !== productId),
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) {
        return current.filter((entry) => entry.productId !== productId);
      }
      return current.map((entry) =>
        entry.productId === productId ? { ...entry, quantity } : entry,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const itemCount = useMemo(
    () => lines.reduce((total, line) => total + line.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () => lines.reduce((total, line) => total + line.price * line.quantity, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotal,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      lines,
      itemCount,
      subtotal,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
