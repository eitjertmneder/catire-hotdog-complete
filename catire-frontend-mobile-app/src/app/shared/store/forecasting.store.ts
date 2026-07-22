import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ForecastData {
  ingredient_id: number;
  ingredient_name: string;
  branch_id: number;
  current_stock: number;
  daily_usage: number;
  days_until_stockout: number;
  reorder_point: number;
  suggested_reorder_quantity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  products: string[];
  lead_time_days: number;
  minimum_order: number;
  rating: number;
  notes?: string;
}

type ForecastingState = {
  forecasts: ForecastData[];
  suppliers: Supplier[];
  usageHistory: { ingredient_id: number; date: string; quantity: number }[];
  addUsageRecord: (ingredientId: number, quantity: number) => void;
  calculateForecast: (ingredientId: number, branchId: number) => ForecastData;
  getLowStockAlerts: (branchId: number) => ForecastData[];
  getReorderSuggestions: (branchId: number) => { ingredient: string; quantity: number; supplier?: Supplier }[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSuppliersByProduct: (product: string) => Supplier[];
  predictDemand: (ingredientId: number, days: number) => number;
};

export const useForecastingStore = create<ForecastingState>()(
  persist(
    (set, get) => ({
      forecasts: [],
      suppliers: [],
      usageHistory: [],

      addUsageRecord: (ingredientId, quantity) => {
        const record = {
          ingredient_id: ingredientId,
          date: new Date().toISOString().split('T')[0],
          quantity,
        };
        set((state) => ({
          usageHistory: [record, ...state.usageHistory].slice(0, 1000),
        }));
      },

      calculateForecast: (ingredientId, branchId) => {
        const { usageHistory } = get();
        const last7Days = usageHistory.filter(r => {
          const recordDate = new Date(r.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return r.ingredient_id === ingredientId && recordDate >= weekAgo;
        });

        const dailyUsage = last7Days.reduce((sum, r) => sum + r.quantity, 0) / 7;
        const currentStock = 100; // Would come from inventory
        const daysUntilStockout = dailyUsage > 0 ? Math.floor(currentStock / dailyUsage) : 999;
        const reorderPoint = dailyUsage * 3; // 3 days safety stock
        const suggestedReorder = dailyUsage * 7; // 1 week supply

        return {
          ingredient_id: ingredientId,
          ingredient_name: '',
          branch_id: branchId,
          current_stock: currentStock,
          daily_usage: Math.round(dailyUsage * 100) / 100,
          days_until_stockout: daysUntilStockout,
          reorder_point: Math.round(reorderPoint),
          suggested_reorder_quantity: Math.round(suggestedReorder),
          trend: 'stable',
        };
      },

      getLowStockAlerts: (branchId) => {
        return get().forecasts.filter(f =>
          f.branch_id === branchId && f.days_until_stockout <= 3
        );
      },

      getReorderSuggestions: (branchId) => {
        const alerts = get().getLowStockAlerts(branchId);
        return alerts.map(alert => ({
          ingredient: alert.ingredient_name,
          quantity: alert.suggested_reorder_quantity,
          supplier: get().suppliers.find(s => s.products.includes(alert.ingredient_name)),
        }));
      },

      addSupplier: (supplier) => {
        const newSupplier: Supplier = {
          ...supplier,
          id: Date.now().toString(),
        };
        set((state) => ({ suppliers: [...state.suppliers, newSupplier] }));
      },

      updateSupplier: (id, updates) => {
        set((state) => ({
          suppliers: state.suppliers.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSupplier: (id) => {
        set((state) => ({
          suppliers: state.suppliers.filter(s => s.id !== id),
        }));
      },

      getSuppliersByProduct: (product) => {
        return get().suppliers.filter(s => s.products.includes(product));
      },

      predictDemand: (ingredientId, days) => {
        const { usageHistory } = get();
        const last30Days = usageHistory.filter(r => {
          const recordDate = new Date(r.date);
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          return r.ingredient_id === ingredientId && recordDate >= monthAgo;
        });

        const avgDaily = last30Days.reduce((sum, r) => sum + r.quantity, 0) / 30;
        return Math.round(avgDaily * days);
      },
    }),
    {
      name: 'forecasting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
