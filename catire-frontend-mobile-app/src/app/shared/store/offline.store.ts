import { Api } from '../api/api';
const api = new Api();
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineOrder {
  id: string;
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  created_at: Date;
  retry_count: number;
}

type OfflineState = {
  isOnline: boolean;
  pendingOrders: OfflineOrder[];
  setOnline: (online: boolean) => void;
  addPendingOrder: (payload: any) => string;
  removePendingOrder: (id: string) => void;
  updateOrderStatus: (id: string, status: OfflineOrder['status']) => void;
  getPendingOrders: () => OfflineOrder[];
  syncPendingOrders: () => Promise<void>;
  initNetworkListener: () => void;
};

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      pendingOrders: [],

      setOnline: (online) => set({ isOnline: online }),

      addPendingOrder: (payload) => {
        const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const order: OfflineOrder = {
          id,
          payload,
          status: 'pending',
          created_at: new Date(),
          retry_count: 0,
        };
        set((state) => ({
          pendingOrders: [...state.pendingOrders, order],
        }));
        return id;
      },

      removePendingOrder: (id) => {
        set((state) => ({
          pendingOrders: state.pendingOrders.filter(o => o.id !== id),
        }));
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          pendingOrders: state.pendingOrders.map(o =>
            o.id === id ? { ...o, status } : o
          ),
        }));
      },

      getPendingOrders: () => get().pendingOrders,

      syncPendingOrders: async () => {
        const { pendingOrders } = get();
        const pending = pendingOrders.filter(o => o.status === 'pending');
        
        for (const order of pending) {
          try {
            get().updateOrderStatus(order.id, 'syncing');
            // Here you would make the actual API call
            await api.post('orders', 'orders', order.payload, '');
            get().updateOrderStatus(order.id, 'synced');
            get().removePendingOrder(order.id);
          } catch (error) {
            get().updateOrderStatus(order.id, 'failed');
            set((state) => ({
              pendingOrders: state.pendingOrders.map(o =>
                o.id === order.id ? { ...o, retry_count: o.retry_count + 1 } : o
              ),
            }));
          }
        }
      },

      initNetworkListener: () => {
        NetInfo.addEventListener((state) => {
          const isOnline = state.isConnected ?? true;
          set({ isOnline });
          
          if (isOnline) {
            get().syncPendingOrders();
          }
        });
      },
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


