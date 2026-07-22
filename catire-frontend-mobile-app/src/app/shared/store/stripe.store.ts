import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  client_secret: string;
  created_at: Date;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  payment_methods: PaymentMethod[];
  created_at: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

type StripeState = {
  customer: StripeCustomer | null;
  paymentIntents: PaymentIntent[];
  createPaymentIntent: (amount: number, currency: string) => Promise<PaymentIntent>;
  confirmPayment: (paymentIntentId: string) => Promise<boolean>;
  createCustomer: (email: string, name: string) => StripeCustomer;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
  getPaymentMethods: () => PaymentMethod[];
  getDefaultPaymentMethod: () => PaymentMethod | undefined;
};

export const useStripeStore = create<StripeState>()(
  persist(
    (set, get) => ({
      customer: null,
      paymentIntents: [],

      createPaymentIntent: async (amount, currency) => {
        const intent: PaymentIntent = {
          id: `pi_${Date.now()}`,
          amount,
          currency,
          status: 'requires_payment_method',
          client_secret: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date(),
        };

        set((state) => ({
          paymentIntents: [intent, ...state.paymentIntents],
        }));

        return intent;
      },

      confirmPayment: async (paymentIntentId) => {
        // Simulate payment confirmation
        await new Promise(resolve => setTimeout(resolve, 1500));

        set((state) => ({
          paymentIntents: state.paymentIntents.map(pi =>
            pi.id === paymentIntentId ? { ...pi, status: 'succeeded' } : pi
          ),
        }));

        return true;
      },

      createCustomer: (email, name) => {
        const customer: StripeCustomer = {
          id: `cus_${Date.now()}`,
          email,
          name,
          payment_methods: [],
          created_at: new Date(),
        };

        set({ customer });
        return customer;
      },

      addPaymentMethod: (method) => {
        const newMethod: PaymentMethod = {
          ...method,
          id: `pm_${Date.now()}`,
        };

        set((state) => ({
          customer: state.customer ? {
            ...state.customer,
            payment_methods: [...state.customer.payment_methods, newMethod],
          } : null,
        }));
      },

      removePaymentMethod: (methodId) => {
        set((state) => ({
          customer: state.customer ? {
            ...state.customer,
            payment_methods: state.customer.payment_methods.filter(m => m.id !== methodId),
          } : null,
        }));
      },

      setDefaultPaymentMethod: (methodId) => {
        set((state) => ({
          customer: state.customer ? {
            ...state.customer,
            payment_methods: state.customer.payment_methods.map(m => ({
              ...m,
              is_default: m.id === methodId,
            })),
          } : null,
        }));
      },

      getPaymentMethods: () => {
        return get().customer?.payment_methods || [];
      },

      getDefaultPaymentMethod: () => {
        return get().customer?.payment_methods.find(m => m.is_default);
      },
    }),
    {
      name: 'stripe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
