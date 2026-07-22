import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Purchase, PurchaseDTO } from '../models/Purchase';
// import { Tax, TaxDTO } from '../models/Tax';
import financeApi from '../api/finance.api';

type FinanceState = {
  taxes: any[];
  purchases: Purchase[];
  // taxes: Tax[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  
  clearFinanceError: () => void;

  // --- PURCHASES ACTIONS ---
  fetchPurchases: (token: string) => Promise<void>;
  addPurchase: (token: string, payload: PurchaseDTO) => Promise<void>;
  editPurchase: (token: string, id: string | number, payload: Partial<Purchase>) => Promise<void>;
  removePurchase: (token: string, id: string | number) => Promise<void>;

  // fetchTaxes: (token: string) => Promise<void>;
  // addTax: (token: string, payload: TaxDTO) => Promise<void>;
  // editTax: (token: string, id: string | number, payload: Partial<Tax>) => Promise<void>;
  // removeTax: (token: string, id: string | number) => Promise<void>;
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      purchases: [],
      taxes: [],
      loading: false,
      actionLoading: false,
      error: null,

      clearFinanceError: () => set({ error: null }),

      fetchPurchases: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await financeApi.getPurchases(token);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          set({ purchases: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      addPurchase: async (token, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await financeApi.createPurchase(token, payload);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          if (res.data) set((state) => ({ purchases: [...state.purchases, res.data!] }));
        } finally {
          set({ actionLoading: false });
        }
      },

      editPurchase: async (token, id, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await financeApi.updatePurchase(token, id, payload);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          set((state) => ({
            purchases: state.purchases.map((p) => (p.id === id ? { ...p, ...res.data } : p)),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      removePurchase: async (token, id) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await financeApi.deletePurchase(token, id);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          set((state) => ({
            purchases: state.purchases.filter((p) => p.id !== id),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      // fetchTaxes: async (token) => {
      //   set({ loading: true, error: null });
      //   try {
      //     const res = await financeApi.getTaxes(token);
      //     if (res.error) {
      //       set({ error: res.message });
      //       return;
      //     }
      //     set({ taxes: res.data || [] });
      //   } finally {
      //     set({ loading: false });
      //   }
      // },

      // addTax: async (token, payload) => {
      //   set({ actionLoading: true, error: null });
      //   try {
      //     const res = await financeApi.createTax(token, payload);
      //     if (res.error) {
      //       set({ error: res.message });
      //       return;
      //     }
      //     if (res.data) set((state) => ({ taxes: [...state.taxes, res.data!] }));
      //   } finally {
      //     set({ actionLoading: false });
      //   }
      // },

      // editTax: async (token, id, payload) => {
      //   set({ actionLoading: true, error: null });
      //   try {
      //     const res = await financeApi.updateTax(token, id, payload);
      //     if (res.error) {
      //       set({ error: res.message });
      //       return;
      //     }
      //     set((state) => ({
      //       taxes: state.taxes.map((t) => (t.id === id ? { ...t, ...res.data } : t)),
      //     }));
      //   } finally {
      //     set({ actionLoading: false });
      //   }
      // },

      // removeTax: async (token, id) => {
      //   set({ actionLoading: true, error: null });
      //   try {
      //     const res = await financeApi.deleteTax(token, id);
      //     if (res.error) {
      //       set({ error: res.message });
      //       return;
      //     }
      //     set((state) => ({
      //       taxes: state.taxes.filter((t) => t.id !== id),
      //     }));
      //   } finally {
      //     set({ actionLoading: false });
      //   }
      // },
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        purchases: state.purchases,
        // taxes: state.taxes,
      }),
    }
  )
);


