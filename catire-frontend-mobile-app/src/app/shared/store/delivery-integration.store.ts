import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeliveryPartner {
  id: string;
  name: string;
  api_key: string;
  commission_rate: number;
  active: boolean;
  supported_areas: string[];
  estimated_delivery_time: number;
}

export interface ExternalOrder {
  id: string;
  partner_id: string;
  partner_order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  commission: number;
  status: 'received' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered';
  created_at: Date;
}

type DeliveryIntegrationState = {
  partners: DeliveryPartner[];
  externalOrders: ExternalOrder[];
  addPartner: (partner: Omit<DeliveryPartner, 'id'>) => void;
  updatePartner: (id: string, updates: Partial<DeliveryPartner>) => void;
  togglePartner: (id: string) => void;
  receiveExternalOrder: (order: Omit<ExternalOrder, 'id' | 'created_at'>) => string;
  updateExternalOrderStatus: (orderId: string, status: ExternalOrder['status']) => void;
  calculateCommission: (partnerId: string, total: number) => number;
  getPartnerStats: (partnerId: string) => { orders: number; revenue: number; commission: number };
  syncWithPartner: (partnerId: string) => Promise<void>;
};

export const useDeliveryIntegrationStore = create<DeliveryIntegrationState>()(
  persist(
    (set, get) => ({
      partners: [
        {
          id: 'ubereats',
          name: 'Uber Eats',
          api_key: '',
          commission_rate: 0.30,
          active: false,
          supported_areas: [],
          estimated_delivery_time: 30,
        },
        {
          id: 'rappi',
          name: 'Rappi',
          api_key: '',
          commission_rate: 0.25,
          active: false,
          supported_areas: [],
          estimated_delivery_time: 25,
        },
        {
          id: 'pedidosya',
          name: 'PedidosYa',
          api_key: '',
          commission_rate: 0.28,
          active: false,
          supported_areas: [],
          estimated_delivery_time: 35,
        },
      ],
      externalOrders: [],

      addPartner: (partner) => {
        const newPartner: DeliveryPartner = {
          ...partner,
          id: Date.now().toString(),
        };
        set((state) => ({ partners: [...state.partners, newPartner] }));
      },

      updatePartner: (id, updates) => {
        set((state) => ({
          partners: state.partners.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      togglePartner: (id) => {
        set((state) => ({
          partners: state.partners.map(p =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        }));
      },

      receiveExternalOrder: (order) => {
        const id = Date.now().toString();
        const newOrder: ExternalOrder = {
          ...order,
          id,
          created_at: new Date(),
        };
        set((state) => ({
          externalOrders: [newOrder, ...state.externalOrders],
        }));
        return id;
      },

      updateExternalOrderStatus: (orderId, status) => {
        set((state) => ({
          externalOrders: state.externalOrders.map(o =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },

      calculateCommission: (partnerId, total) => {
        const partner = get().partners.find(p => p.id === partnerId);
        return total * (partner?.commission_rate || 0);
      },

      getPartnerStats: (partnerId) => {
        const { externalOrders } = get();
        const partnerOrders = externalOrders.filter(o => o.partner_id === partnerId);
        return {
          orders: partnerOrders.length,
          revenue: partnerOrders.reduce((sum, o) => sum + o.total, 0),
          commission: partnerOrders.reduce((sum, o) => sum + o.commission, 0),
        };
      },

      syncWithPartner: async (partnerId) => {
        // Simulated sync - in real app would call partner API
        console.log(`Syncing with ${partnerId}...`);
      },
    }),
    {
      name: 'delivery-integration-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
