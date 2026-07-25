import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number;
  current_uses: number;
  valid_from: Date;
  valid_until: Date;
  active: boolean;
  applicable_products?: number[];
  applicable_branches?: string[];
  notes?: string;
  valid_days?: string;
}

type PromotionState = {
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id' | 'current_uses'>) => void;
  validatePromo: (code: string, total: number) => { valid: boolean; discount: number; message: string };
  applyPromo: (code: string) => void;
  getActivePromotions: () => Promotion[];
};

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set, get) => ({
      promotions: [],

      addPromotion: (promo) => {
        const newPromo: Promotion = {
          ...promo,
          id: Date.now().toString(),
          current_uses: 0,
        };
        set((state) => ({ promotions: [...state.promotions, newPromo] }));
      },

      validatePromo: (code, total) => {
        const { promotions } = get();
        const promo = promotions.find(p => p.code.toUpperCase() === code.toUpperCase());
        
        if (!promo) {
          return { valid: false, discount: 0, message: 'Código no válido' };
        }
        
        if (!promo.active) {
          return { valid: false, discount: 0, message: 'Promoción inactiva' };
        }
        
        const now = new Date();
        if (now < new Date(promo.valid_from) || now > new Date(promo.valid_until)) {
          return { valid: false, discount: 0, message: 'Promoción expirada' };
        }
        
        if (promo.current_uses >= promo.max_uses) {
          return { valid: false, discount: 0, message: 'Promoción agotada' };
        }
        
        if (total < promo.min_purchase) {
          return { valid: false, discount: 0, message: `Compra mínima: $${promo.min_purchase}` };
        }
        
        let discount = 0;
        if (promo.discount_type === 'percentage') {
          discount = (total * promo.discount_value) / 100;
        } else {
          discount = Math.min(promo.discount_value, total);
        }
        
        return { valid: true, discount, message: `Descuento: $${discount.toFixed(2)}` };
      },

      applyPromo: (code) => {
        set((state) => ({
          promotions: state.promotions.map(p =>
            p.code.toUpperCase() === code.toUpperCase()
              ? { ...p, current_uses: p.current_uses + 1 }
              : p
          ),
        }));
      },

      getActivePromotions: () => {
        const { promotions } = get();
        const now = new Date();
        return promotions.filter(p => 
          p.active && 
          now >= new Date(p.valid_from) && 
          now <= new Date(p.valid_until) &&
          p.current_uses < p.max_uses
        );
      },
    }),
    {
      name: 'promotions-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
