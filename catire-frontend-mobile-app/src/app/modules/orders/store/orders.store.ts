import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderDTO } from '../models/Order';
import ordersApi from '../api/orders.api';
import { OrderStatusType } from '../../../shared/api/enums';

type OrdersState = {
  orders: Order[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  
  clearOrdersError: () => void;

  fetchOrders: (token: string) => Promise<void>;
  addOrder: (token: string, payload: OrderDTO) => Promise<void>;
  editOrder: (token: string, id: string | number, payload: Partial<Order>) => Promise<void>;
  removeOrder: (token: string, id: string | number) => Promise<void>;
  updateOrderStatus: (token: string, id: string | number, status: OrderStatusType, cancelReason?: string) => Promise<void>;
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      loading: false,
      actionLoading: false,
      error: null,

      clearOrdersError: () => set({ error: null }),

      fetchOrders: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await ordersApi.getOrders(token);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set({ orders: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      addOrder: async (token, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await ordersApi.createOrder(token, payload);
          
          if (res.error) {
            set({ error: res.message });
            return;
          }

          if (res.data) set((state) => ({ orders: [...state.orders, res.data!] }));
        } finally {
          set({ actionLoading: false });
        }
      },

      editOrder: async (token, id, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await ordersApi.updateOrder(token, id, payload);
          
          if (res.error) {
            set({ error: res.message });
            return;
          }

          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? { ...o, ...res.data } : o)),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      removeOrder: async (token, id) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await ordersApi.deleteOrder(token, id);
          
          if (res.error) {
            set({ error: res.message });
            return;
          }
          
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      updateOrderStatus: async (token, id, status, cancelReason) => {
        set({ actionLoading: true, error: null });
        try {
          const payload: any = { status };
          if (cancelReason) payload.cancel_reason = cancelReason;
          
          const res = await ordersApi.updateOrder(token, id, payload);
          
          if (res.error) {
            set({ error: res.message });
            return;
          }

          set((state) => ({
            orders: state.orders.map((o) => 
              o.id === id ? { ...o, status, cancel_reason: cancelReason || o.cancel_reason } : o
            ),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);