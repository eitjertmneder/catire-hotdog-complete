import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// APIs gratuitas para tasas de cambio
const EXCHANGE_APIS = [
  'https://api.exchangerate-api.com/v4/latest/USD',
  'https://open.er-api.com/v6/latest/USD',
  'https://api.currencyfreaks.com/v2.0/rates/latest',
];

export interface ExchangeRate {
  base: string;
  target: string;
  rate: number;
  timestamp: Date;
  source: string;
}

export interface CurrencyPair {
  from: string;
  to: string;
  name: string;
  symbol: string;
}

type ExchangeRateState = {
  rates: Record<string, number>;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  supportedCurrencies: CurrencyPair[];
  fetchRates: () => Promise<boolean>;
  getRate: (from: string, to: string) => number;
  convert: (amount: number, from: string, to: string) => number;
  formatCurrency: (amount: number, currency: string) => string;
  getRateHistory: (from: string, to: string) => { date: string; rate: number }[];
};

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: {
        USD: 1,
        VES: 365.50,
        COP: 3950,
        EUR: 0.92,
        GBP: 0.79,
        BRL: 4.97,
      },
      lastUpdated: null,
      isLoading: false,
      error: null,
      supportedCurrencies: [
        { from: 'USD', to: 'VES', name: 'Dólar ? Bolívar', symbol: 'Bs.' },
        { from: 'USD', to: 'COP', name: 'Dólar ? Peso Colombiano', symbol: '$' },
        { from: 'USD', to: 'EUR', name: 'Dólar ? Euro', symbol: '€' },
        { from: 'USD', to: 'GBP', name: 'Dólar ? Libra', symbol: '£' },
        { from: 'USD', to: 'BRL', name: 'Dólar ? Real', symbol: 'R$' },
      ],

      fetchRates: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Try multiple APIs for reliability
          let ratesData: Record<string, number> | null = null;
          
          for (const apiUrl of EXCHANGE_APIS) {
            try {
              const response = await fetch(apiUrl);
              if (response.ok) {
                const data = await response.json();
                
                // Handle different API formats
                if (data.rates) {
                  ratesData = data.rates;
                } else if (data.result === 'success') {
                  ratesData = data.rates;
                }
                
                if (ratesData) break;
              }
            } catch (e) {
              console.log(`API ${apiUrl} failed, trying next...`);
            }
          }

          if (ratesData) {
            set({
              rates: {
                USD: 1,
                VES: ratesData.VES || 365.50,
                COP: ratesData.COP || 3950,
                EUR: ratesData.EUR || 0.92,
                GBP: ratesData.GBP || 0.79,
                BRL: ratesData.BRL || 4.97,
              },
              lastUpdated: new Date(),
              isLoading: false,
              error: null,
            });
            return true;
          }
          
          // Fallback to default rates
          set({
            rates: {
              USD: 1,
              VES: 365.50,
              COP: 3950,
              EUR: 0.92,
              GBP: 0.79,
              BRL: 4.97,
            },
            lastUpdated: new Date(),
            isLoading: false,
            error: 'Using default rates',
          });
          return false;
          
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch rates',
          });
          return false;
        }
      },

      getRate: (from, to) => {
        const { rates } = get();
        if (from === to) return 1;
        
        const fromRate = rates[from] || 1;
        const toRate = rates[to] || 1;
        
        return toRate / fromRate;
      },

      convert: (amount, from, to) => {
        const rate = get().getRate(from, to);
        return amount * rate;
      },

      formatCurrency: (amount, currency) => {
        const { rates } = get();
        const symbols: Record<string, string> = {
          USD: '$',
          VES: 'Bs.',
          COP: '$',
          EUR: '€',
          GBP: '£',
          BRL: 'R$',
        };

        const symbol = symbols[currency] || '$';
        const formatted = amount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        return `${symbol}${formatted}`;
      },

      getRateHistory: (from, to) => {
        // Simulated history - in real app, fetch from API
        const history = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          history.push({
            date: date.toISOString().split('T')[0],
            rate: get().getRate(from, to) * (0.98 + Math.random() * 0.04),
          });
        }
        return history;
      },
    }),
    {
      name: 'exchange-rate-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

