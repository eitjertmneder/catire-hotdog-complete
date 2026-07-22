import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';

export interface Referral {
  id: string;
  referrer_id: number;
  referred_email: string;
  status: 'pending' | 'completed';
  reward_points: number;
  created_at: Date;
}

type SocialState = {
  referralCode: string;
  referrals: Referral[];
  totalReferralPoints: number;
  generateReferralCode: (userId: number) => string;
  shareApp: () => Promise<void>;
  shareProduct: (productName: string, productPrice: number) => Promise<void>;
  shareOrder: (orderId: string, total: number) => Promise<void>;
  applyReferralCode: (code: string) => boolean;
  getReferralStats: () => { total: number; completed: number; pending: number; points: number };
};

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      referralCode: '',
      referrals: [],
      totalReferralPoints: 0,

      generateReferralCode: (userId) => {
        const code = `CATIRE${userId}${Date.now().toString(36).toUpperCase().slice(-4)}`;
        set({ referralCode: code });
        return code;
      },

      shareApp: async () => {
        try {
          await Share.share({
            message: '¡Descarga Catire Hot Dog y ordena la mejor comida rápida! 🌭🍔\n\nUsa mi código de referido para obtener puntos extra.',
            title: 'Catire Hot Dog',
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      },

      shareProduct: async (productName, productPrice) => {
        try {
          await Share.share({
            message: `¡Mira este producto de Catire Hot Dog! ${productName} por solo $${productPrice} 🌭`,
            title: productName,
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      },

      shareOrder: async (orderId, total) => {
        try {
          await Share.share({
            message: `¡Acabo de hacer un pedido en Catire Hot Dog! Total: $${total} 🎉`,
            title: 'Mi Pedido',
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      },

      applyReferralCode: (code) => {
        const { referralCode } = get();
        if (code === referralCode) return false; // Can't use own code
        
        // In real app, this would validate with backend
        const newReferral: Referral = {
          id: Date.now().toString(),
          referrer_id: 0,
          referred_email: '',
          status: 'completed',
          reward_points: 100,
          created_at: new Date(),
        };
        
        set((state) => ({
          referrals: [...state.referrals, newReferral],
          totalReferralPoints: state.totalReferralPoints + 100,
        }));
        
        return true;
      },

      getReferralStats: () => {
        const { referrals, totalReferralPoints } = get();
        return {
          total: referrals.length,
          completed: referrals.filter(r => r.status === 'completed').length,
          pending: referrals.filter(r => r.status === 'pending').length,
          points: totalReferralPoints,
        };
      },
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
