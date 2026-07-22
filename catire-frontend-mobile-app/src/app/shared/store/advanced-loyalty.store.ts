import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoyaltyTier {
  id: string;
  name: string;
  min_points: number;
  benefits: string[];
  discount_percentage: number;
  free_delivery: boolean;
  priority_support: boolean;
  exclusive_offers: boolean;
}

export interface UserLoyalty {
  user_id: number;
  points: number;
  total_spent: number;
  tier_id: string;
  tier_since: Date;
  expiring_points: number;
  expiring_date: Date;
}

type AdvancedLoyaltyState = {
  tiers: LoyaltyTier[];
  userLoyalties: Record<number, UserLoyalty>;
  earnPoints: (userId: number, amount: number, source: string) => void;
  redeemPoints: (userId: number, amount: number) => boolean;
  getUserTier: (userId: number) => LoyaltyTier;
  getUserBenefits: (userId: number) => string[];
  getTierProgress: (userId: number) => { current: number; next: number; percentage: number };
  getExpiringPoints: (userId: number) => { points: number; date: Date } | null;
  initDefaultTiers: () => void;
};

export const useAdvancedLoyaltyStore = create<AdvancedLoyaltyState>()(
  persist(
    (set, get) => ({
      tiers: [],
      userLoyalties: {},

      earnPoints: (userId, amount, source) => {
        const { userLoyalties } = get();
        const current = userLoyalties[userId] || {
          user_id: userId,
          points: 0,
          total_spent: 0,
          tier_id: 'bronze',
          tier_since: new Date(),
          expiring_points: 0,
          expiring_date: new Date(),
        };

        const pointsEarned = Math.floor(amount);
        const newPoints = current.points + pointsEarned;

        // Check for tier upgrade
        const { tiers } = get();
        let newTier = current.tier_id;
        for (const tier of tiers) {
          if (newPoints >= tier.min_points) {
            newTier = tier.id;
          }
        }

        set((state) => ({
          userLoyalties: {
            ...state.userLoyalties,
            [userId]: {
              ...current,
              points: newPoints,
              total_spent: current.total_spent + amount,
              tier_id: newTier,
              tier_since: newTier !== current.tier_id ? new Date() : current.tier_since,
            },
          },
        }));
      },

      redeemPoints: (userId, amount) => {
        const { userLoyalties } = get();
        const current = userLoyalties[userId];
        if (!current || current.points < amount) return false;

        set((state) => ({
          userLoyalties: {
            ...state.userLoyalties,
            [userId]: {
              ...current,
              points: current.points - amount,
            },
          },
        }));

        return true;
      },

      getUserTier: (userId) => {
        const { userLoyalties, tiers } = get();
        const loyalty = userLoyalties[userId];
        return tiers.find(t => t.id === loyalty?.tier_id) || tiers[0] || {
          id: 'bronze',
          name: 'Bronce',
          min_points: 0,
          benefits: [],
          discount_percentage: 0,
          free_delivery: false,
          priority_support: false,
          exclusive_offers: false,
        };
      },

      getUserBenefits: (userId) => {
        const tier = get().getUserTier(userId);
        return tier.benefits;
      },

      getTierProgress: (userId) => {
        const { userLoyalties, tiers } = get();
        const loyalty = userLoyalties[userId];
        const points = loyalty?.points || 0;

        let currentMin = 0;
        let nextMin = tiers[0]?.min_points || 100;

        for (let i = 0; i < tiers.length; i++) {
          if (points >= tiers[i].min_points) {
            currentMin = tiers[i].min_points;
            nextMin = tiers[i + 1]?.min_points || tiers[i].min_points;
          }
        }

        const range = nextMin - currentMin;
        const progress = points - currentMin;
        const percentage = range > 0 ? Math.min(100, (progress / range) * 100) : 100;

        return { current: points, next: nextMin, percentage };
      },

      getExpiringPoints: (userId) => {
        const { userLoyalties } = get();
        const loyalty = userLoyalties[userId];
        if (!loyalty?.expiring_points) return null;

        return {
          points: loyalty.expiring_points,
          date: new Date(loyalty.expiring_date),
        };
      },

      initDefaultTiers: () => {
        const defaultTiers: LoyaltyTier[] = [
          {
            id: 'bronze',
            name: 'Bronce',
            min_points: 0,
            benefits: ['Acumula 1 punto por cada $1'],
            discount_percentage: 0,
            free_delivery: false,
            priority_support: false,
            exclusive_offers: false,
          },
          {
            id: 'silver',
            name: 'Plata',
            min_points: 500,
            benefits: ['5% de descuento', 'Acumula 1.5x puntos'],
            discount_percentage: 5,
            free_delivery: false,
            priority_support: false,
            exclusive_offers: false,
          },
          {
            id: 'gold',
            name: 'Oro',
            min_points: 1500,
            benefits: ['10% de descuento', 'Delivery gratis', 'Acumula 2x puntos'],
            discount_percentage: 10,
            free_delivery: true,
            priority_support: false,
            exclusive_offers: false,
          },
          {
            id: 'platinum',
            name: 'Platino',
            min_points: 5000,
            benefits: ['15% de descuento', 'Delivery gratis', 'Soporte prioritario', 'Ofertas exclusivas'],
            discount_percentage: 15,
            free_delivery: true,
            priority_support: true,
            exclusive_offers: true,
          },
        ];

        set({ tiers: defaultTiers });
      },
    }),
    {
      name: 'advanced-loyalty-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
