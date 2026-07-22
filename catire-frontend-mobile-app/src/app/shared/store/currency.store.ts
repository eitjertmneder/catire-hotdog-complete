import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Api } from '../api/api';

const api = new Api();

type CurrencyState = {
  currency: 'USD' | 'VES' | 'COP';
  rates: { rate_usd: number; rate_cop: number; rate_bs: number };
  loading: boolean;
  setCurrency: (c: 'USD' | 'VES' | 'COP') => void;
  fetchRates: () => Promise<void>;
  convertToVES: (usdPrice: number) => number;
  convertToCOP: (usdPrice: number) => number;
  formatPrice: (usdPrice: number) => string;
  formatAllPrices: (usdPrice: number) => string;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      rates: { rate_usd: 1, rate_cop: 4000, rate_bs: 800 },
      loading: false,

      setCurrency: (c) => set({ currency: c }),

      fetchRates: async () => {
        set({ loading: true });
        try {
          const res = await api.get<any>('finance', 'currency-rates', '');
          if (!res.error && res.data) {
            set({
              rates: {
                rate_usd: res.data.rate_usd || 1,
                rate_cop: res.data.rate_cop || 4000,
                rate_bs: res.data.rate_bs || 800,
              },
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        } catch {
          set({ loading: false });
        }
      },

      convertToVES: (usdPrice: number) => {
        const { rates } = get();
        return usdPrice * rates.rate_bs;
      },

      convertToCOP: (usdPrice: number) => {
        const { rates } = get();
        return usdPrice * rates.rate_cop;
      },

      formatPrice: (usdPrice: number) => {
        const { currency, rates } = get();
        if (currency === 'USD') return `$${usdPrice.toFixed(2)}`;
        if (currency === 'VES') return `Bs. ${(usdPrice * rates.rate_bs).toFixed(0)}`;
        if (currency === 'COP') return `$${(usdPrice * rates.rate_cop).toFixed(0)}`;
        return `$${usdPrice.toFixed(2)}`;
      },

      formatAllPrices: (usdPrice: number) => {
        const { rates } = get();
        const usd = `$${usdPrice.toFixed(2)}`;
        const cop = `$${(usdPrice * rates.rate_cop).toFixed(0)}`;
        const bs = `Bs. ${(usdPrice * rates.rate_bs).toFixed(0)}`;
        return `${usd} | ${cop} COP | ${bs}`;
      },
    }),
    {
      name: 'currency-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
