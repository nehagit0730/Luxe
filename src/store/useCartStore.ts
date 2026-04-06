import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === newItem.productId);
        
        let updatedItems;
        if (existingItem) {
          updatedItems = items.map((i) =>
            i.productId === newItem.productId
              ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.stock) }
              : i
          );
        } else {
          updatedItems = [...items, newItem];
        }
        
        const total = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items: updatedItems, total });
      },
      removeItem: (productId) => {
        const updatedItems = get().items.filter((i) => i.productId !== productId);
        const total = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items: updatedItems, total });
      },
      updateQuantity: (productId, quantity) => {
        const updatedItems = get().items.map((i) =>
          i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
        );
        const total = updatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items: updatedItems, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
