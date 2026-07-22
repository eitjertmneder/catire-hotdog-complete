import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface KitchenOrder {
  id: string;
  order_number: number;
  items: {
    name: string;
    quantity: number;
    features: string[];
    status: 'pending' | 'preparing' | 'ready';
    notes?: string;
  }[];
  priority: 'normal' | 'rush' | 'vip';
  order_type: 'dine_in' | 'takeout' | 'delivery';
  table_number?: string;
  customer_name?: string;
  created_at: Date;
  started_at?: Date;
  estimated_ready_at?: Date;
}

export interface KitchenStation {
  id: string;
  name: string;
  type: 'grill' | 'fryer' | 'prep' | 'drinks';
  status: 'active' | 'busy' | 'offline';
  current_orders: string[];
}

type KitchenState = {
  orders: KitchenOrder[];
  stations: KitchenStation[];
  addOrder: (order: Omit<KitchenOrder, 'id' | 'order_number' | 'created_at'>) => string;
  updateItemStatus: (orderId: string, itemIndex: number, status: 'pending' | 'preparing' | 'ready') => void;
  completeOrder: (orderId: string) => void;
  setPriority: (orderId: string, priority: KitchenOrder['priority']) => void;
  getOrdersByStatus: (status: 'pending' | 'preparing' | 'ready') => KitchenOrder[];
  getOrdersByStation: (stationId: string) => KitchenOrder[];
  getAveragePrepTime: () => number;
  getBacklogCount: () => number;
};

export const useKitchenStore = create<KitchenState>()(
  persist(
    (set, get) => ({
      orders: [],
      stations: [],

      addOrder: (order) => {
        const id = Date.now().toString();
        const orderNumber = get().orders.length + 1;
        
        const newOrder: KitchenOrder = {
          ...order,
          id,
          order_number: orderNumber,
          created_at: new Date(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return id;
      },

      updateItemStatus: (orderId, itemIndex, status) => {
        set((state) => ({
          orders: state.orders.map(o => {
            if (o.id !== orderId) return o;
            const newItems = [...o.items];
            newItems[itemIndex] = { ...newItems[itemIndex], status };
            
            // Check if all items are ready
            const allReady = newItems.every(i => i.status === 'ready');
            if (allReady) {
              return { ...o, items: newItems };
            }
            return { ...o, items: newItems, started_at: o.started_at || new Date() };
          }),
        }));
      },

      completeOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(o => o.id !== orderId),
        }));
      },

      setPriority: (orderId, priority) => {
        set((state) => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, priority } : o
          ),
        }));
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter(o => {
          if (status === 'pending') return o.items.some(i => i.status === 'pending');
          if (status === 'preparing') return o.items.some(i => i.status === 'preparing');
          if (status === 'ready') return o.items.every(i => i.status === 'ready');
          return false;
        });
      },

      getOrdersByStation: (stationId) => {
        // Simplified - in real app would map items to stations
        return get().orders;
      },

      getAveragePrepTime: () => {
        const completedOrders = get().orders.filter(o => o.started_at);
        if (completedOrders.length === 0) return 0;
        
        const totalTime = completedOrders.reduce((sum, o) => {
          return sum + (new Date().getTime() - new Date(o.started_at!).getTime());
        }, 0);
        
        return Math.round(totalTime / completedOrders.length / 60000); // minutes
      },

      getBacklogCount: () => {
        return get().orders.filter(o => o.items.some(i => i.status === 'pending')).length;
      },
    }),
    {
      name: 'kitchen-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
