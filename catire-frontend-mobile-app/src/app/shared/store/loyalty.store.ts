import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoyaltyTransaction {
  id: string;
  user_id: number;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  order_id?: string;
  created_at: Date;
}

type LoyaltyState = {
  transactions: LoyaltyTransaction[];
  userPoints: Record<number, number>;
  addPoints: (userId: number, points: number, description: string, orderId?: string) => void;
  redeemPoints: (userId: number, points: number, description: string) => boolean;
  getPoints: (userId: number) => number;
  getTransactionHistory: (userId: number) => LoyaltyTransaction[];
  calculatePointsForOrder: (total: number) => number;
};

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      transactions: [],
      userPoints: {},

      addPoints: (userId, points, description, orderId) => {
        const transaction: LoyaltyTransaction = {
          id: Date.now().toString(),
          user_id: userId,
          points,
          type: 'earned',
          description,
          order_id: orderId,
          created_at: new Date(),
        };

        set((state) => ({
          transactions: [...state.transactions, transaction],
          userPoints: {
            ...state.userPoints,
            [userId]: (state.userPoints[userId] || 0) + points,
          },
        }));
      },

      redeemPoints: (userId, points, description) => {
        const currentPoints = get().userPoints[userId] || 0;
        if (currentPoints < points) return false;

        const transaction: LoyaltyTransaction = {
          id: Date.now().toString(),
          user_id: userId,
          points,
          type: 'redeemed',
          description,
          created_at: new Date(),
        };

        set((state) => ({
          transactions: [...state.transactions, transaction],
          userPoints: {
            ...state.userPoints,
            [userId]: currentPoints - points,
          },
        }));

        return true;
      },

      getPoints: (userId) => {
        return get().userPoints[userId] || 0;
      },

      getTransactionHistory: (userId) => {
        return get().transactions.filter(t => t.user_id === userId);
      },

      calculatePointsForOrder: (total) => {
        // 1 punto por cada $1 gastado
        return Math.floor(total);
      },
    }),
    {
      name: 'loyalty-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
