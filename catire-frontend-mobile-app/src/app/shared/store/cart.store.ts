import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NameTag } from '../api/enums';

export interface CartItem {
  cart_id: string;
  product_id: number;
  name: string;
  quantity: number;
  base_price: number;
  img_src?: string;
  features: { name_tag: NameTag; value: string }[];
}

interface CartState {
  items: CartItem[];
  paymentProof: string | null;
  branchId: number | null;
  addItem: (item: CartItem) => void;
  removeItem: (cart_id: string) => void;
  updateQuantity: (cart_id: string, quantity: number) => void;
  clearCart: () => void;
  setPaymentProof: (uri: string | null) => void;
  setBranchId: (id: number | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      paymentProof: null,
      branchId: null,
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.cart_id === item.cart_id);
        if (existing) {
          return { 
            items: state.items.map(i => 
              i.cart_id === item.cart_id 
                ? { ...i, quantity: i.quantity + item.quantity } 
                : i
            ) 
          };
        }
        return { items: [...state.items, item] };
      }),
      
      removeItem: (cart_id) => set((state) => ({
        items: state.items.filter((i) => i.cart_id !== cart_id),
      })),
      
      updateQuantity: (cart_id, quantity) => set((state) => ({
        items: state.items.map((i) => (i.cart_id === cart_id ? { ...i, quantity } : i)),
      })),
      
      clearCart: () => set({ items: [], paymentProof: null }),
      
      setPaymentProof: (uri) => set({ paymentProof: uri }),
      
      setBranchId: (id) => set({ branchId: id }),
      
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.base_price * item.quantity), 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        paymentProof: state.paymentProof,
        branchId: state.branchId,
      }),
    }
  )
);
