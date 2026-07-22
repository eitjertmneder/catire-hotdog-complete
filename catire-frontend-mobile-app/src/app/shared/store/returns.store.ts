import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: number;
  items: { product_id: number; quantity: number; reason: string }[];
  total_refund: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason: string;
  photos: string[];
  created_at: Date;
  processed_at?: Date;
  processed_by?: number;
  notes?: string;
}

type ReturnsState = {
  returns: ReturnRequest[];
  createReturn: (returnData: Omit<ReturnRequest, 'id' | 'status' | 'created_at'>) => string;
  updateReturnStatus: (returnId: string, status: ReturnRequest['status'], notes?: string) => void;
  getReturn: (returnId: string) => ReturnRequest | undefined;
  getReturnsByOrder: (orderId: string) => ReturnRequest[];
  getReturnsByUser: (userId: number) => ReturnRequest[];
  getPendingReturns: () => ReturnRequest[];
  calculateRefund: (orderId: string, items: { product_id: number; quantity: number }[]) => number;
};

export const useReturnsStore = create<ReturnsState>()(
  persist(
    (set, get) => ({
      returns: [],

      createReturn: (returnData) => {
        const id = Date.now().toString();
        const newReturn: ReturnRequest = {
          ...returnData,
          id,
          status: 'pending',
          created_at: new Date(),
        };
        set((state) => ({
          returns: [newReturn, ...state.returns],
        }));
        return id;
      },

      updateReturnStatus: (returnId, status, notes) => {
        set((state) => ({
          returns: state.returns.map(r =>
            r.id === returnId ? { ...r, status, notes, processed_at: new Date() } : r
          ),
        }));
      },

      getReturn: (returnId) => {
        return get().returns.find(r => r.id === returnId);
      },

      getReturnsByOrder: (orderId) => {
        return get().returns.filter(r => r.order_id === orderId);
      },

      getReturnsByUser: (userId) => {
        return get().returns.filter(r => r.user_id === userId);
      },

      getPendingReturns: () => {
        return get().returns.filter(r => r.status === 'pending');
      },

      calculateRefund: (orderId, items) => {
        // Simulated refund calculation
        return items.reduce((sum, item) => sum + item.quantity * 10, 0);
      },
    }),
    {
      name: 'returns-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);


