import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OrderSplit {
  id: string;
  original_order_id: string;
  split_orders: {
    id: string;
    items: { product_id: number; quantity: number; features: any[] }[];
    status: 'pending' | 'preparing' | 'ready' | 'delivered';
    assigned_to?: number;
  }[];
  created_at: Date;
  reason: string;
}

type OrderSplitState = {
  splits: OrderSplit[];
  splitOrder: (orderId: string, items: { product_id: number; quantity: number; features: any[] }[], splitCount: number, reason: string) => string[];
  updateSplitStatus: (splitId: string, splitIndex: number, status: string) => void;
  getSplitsByOrder: (orderId: string) => OrderSplit[];
  getSplitsByEmployee: (employeeId: number) => OrderSplit[];
};

export const useOrderSplitStore = create<OrderSplitState>()(
  persist(
    (set, get) => ({
      splits: [],

      splitOrder: (orderId, items, splitCount, reason) => {
        const itemsPerSplit = Math.ceil(items.length / splitCount);
        const splitOrders = [];

        for (let i = 0; i < splitCount; i++) {
          const splitItems = items.slice(i * itemsPerSplit, (i + 1) * itemsPerSplit);
          splitOrders.push({
            id: `${orderId}_split_${i + 1}`,
            items: splitItems,
            status: 'pending' as const,
          });
        }

        const split: OrderSplit = {
          id: Date.now().toString(),
          original_order_id: orderId,
          split_orders: splitOrders,
          created_at: new Date(),
          reason,
        };

        set((state) => ({ splits: [split, ...state.splits] }));

        return splitOrders.map(s => s.id);
      },

      updateSplitStatus: (splitId, splitIndex, status) => {
        set((state) => ({
          splits: state.splits.map(s => {
            if (s.id !== splitId) return s;
            const newSplitOrders = [...s.split_orders];
            newSplitOrders[splitIndex] = { ...newSplitOrders[splitIndex], status: status as 'pending' | 'preparing' | 'ready' | 'delivered' };
            return { ...s, split_orders: newSplitOrders };
          }),
        }));
      },

      getSplitsByOrder: (orderId) => {
        return get().splits.filter(s => s.original_order_id === orderId);
      },

      getSplitsByEmployee: (employeeId) => {
        return get().splits.filter(s =>
          s.split_orders.some(so => so.assigned_to === employeeId)
        );
      },
    }),
    {
      name: 'order-split-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);



