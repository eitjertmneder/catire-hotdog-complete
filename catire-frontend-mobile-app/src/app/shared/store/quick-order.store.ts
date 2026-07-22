import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QuickOrderItem {
  id: string;
  name: string;
  product_id: number;
  quantity: number;
  last_ordered: Date;
  order_count: number;
}

type QuickOrderState = {
  recentOrders: QuickOrderItem[];
  favoriteOrders: QuickOrderItem[];
  addRecentOrder: (item: Omit<QuickOrderItem, 'id' | 'last_ordered' | 'order_count'>) => void;
  addToFavorites: (item: QuickOrderItem) => void;
  removeFromFavorites: (id: string) => void;
  reorder: (item: QuickOrderItem) => void;
  getTopItems: (count: number) => QuickOrderItem[];
  clearRecent: () => void;
};

export const useQuickOrderStore = create<QuickOrderState>()(
  persist(
    (set, get) => ({
      recentOrders: [],
      favoriteOrders: [],

      addRecentOrder: (item) => {
        const existing = get().recentOrders.find(r => r.product_id === item.product_id);
        
        if (existing) {
          set((state) => ({
            recentOrders: state.recentOrders.map(r =>
              r.product_id === item.product_id
                ? { ...r, quantity: r.quantity + item.quantity, last_ordered: new Date(), order_count: r.order_count + 1 }
                : r
            ),
          }));
        } else {
          const newItem: QuickOrderItem = {
            ...item,
            id: Date.now().toString(),
            last_ordered: new Date(),
            order_count: 1,
          };
          set((state) => ({
            recentOrders: [newItem, ...state.recentOrders].slice(0, 20),
          }));
        }
      },

      addToFavorites: (item) => {
        const exists = get().favoriteOrders.some(f => f.id === item.id);
        if (!exists) {
          set((state) => ({
            favoriteOrders: [...state.favoriteOrders, item],
          }));
        }
      },

      removeFromFavorites: (id) => {
        set((state) => ({
          favoriteOrders: state.favoriteOrders.filter(f => f.id !== id),
        }));
      },

      reorder: (item) => {
        get().addRecentOrder({
          name: item.name,
          product_id: item.product_id,
          quantity: item.quantity,
        });
      },

      getTopItems: (count) => {
        return get().recentOrders
          .sort((a, b) => b.order_count - a.order_count)
          .slice(0, count);
      },

      clearRecent: () => set({ recentOrders: [] }),
    }),
    {
      name: 'quick-order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
