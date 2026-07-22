import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WasteRecord {
  id: string;
  ingredient_id: number;
  ingredient_name: string;
  branch_id: number;
  quantity_wasted: number;
  unit: string;
  reason: 'expired' | 'spoiled' | 'overcooked' | 'customer_refund' | 'other';
  cost: number;
  recorded_by: number;
  recorded_at: Date;
  notes?: string;
}

export interface WasteReport {
  branch_id: number;
  period: 'daily' | 'weekly' | 'monthly';
  total_items_wasted: number;
  total_cost_lost: number;
  top_wasted_items: { name: string; quantity: number; cost: number }[];
  waste_by_reason: { reason: string; count: number; cost: number }[];
}

type WasteTrackingState = {
  records: WasteRecord[];
  addRecord: (record: Omit<WasteRecord, 'id' | 'recorded_at'>) => void;
  getRecordsByBranch: (branchId: number, startDate?: Date, endDate?: Date) => WasteRecord[];
  getRecordsByIngredient: (ingredientId: number) => WasteRecord[];
  generateReport: (branchId: number, period: 'daily' | 'weekly' | 'monthly') => WasteReport;
  getTotalWasteCost: (branchId: number, startDate?: Date, endDate?: Date) => number;
  getWasteTrend: (branchId: number, days: number) => { date: string; cost: number }[];
};

export const useWasteTrackingStore = create<WasteTrackingState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) => {
        const newRecord: WasteRecord = {
          ...record,
          id: Date.now().toString(),
          recorded_at: new Date(),
        };
        set((state) => ({ records: [newRecord, ...state.records] }));
      },

      getRecordsByBranch: (branchId, startDate, endDate) => {
        const { records } = get();
        return records.filter((r) => {
          if (r.branch_id !== branchId) return false;
          if (startDate && new Date(r.recorded_at) < startDate) return false;
          if (endDate && new Date(r.recorded_at) > endDate) return false;
          return true;
        });
      },

      getRecordsByIngredient: (ingredientId) => {
        return get().records.filter((r) => r.ingredient_id === ingredientId);
      },

      generateReport: (branchId, period) => {
        const now = new Date();
        const startDate = new Date();

        switch (period) {
          case 'daily':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'weekly':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'monthly':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        const records = get().getRecordsByBranch(branchId, startDate, now);
        const totalItemsWasted = records.reduce((sum, r) => sum + r.quantity_wasted, 0);
        const totalCostLost = records.reduce((sum, r) => sum + r.cost, 0);

        // Group by ingredient
        const byIngredient: Record<string, { name: string; quantity: number; cost: number }> = {};
        records.forEach((r) => {
          if (!byIngredient[r.ingredient_id]) {
            byIngredient[r.ingredient_id] = { name: r.ingredient_name, quantity: 0, cost: 0 };
          }
          byIngredient[r.ingredient_id].quantity += r.quantity_wasted;
          byIngredient[r.ingredient_id].cost += r.cost;
        });

        const topWastedItems = Object.values(byIngredient)
          .sort((a, b) => b.cost - a.cost)
          .slice(0, 5);

        // Group by reason
        const byReason: Record<string, { count: number; cost: number }> = {};
        records.forEach((r) => {
          if (!byReason[r.reason]) {
            byReason[r.reason] = { count: 0, cost: 0 };
          }
          byReason[r.reason].count++;
          byReason[r.reason].cost += r.cost;
        });

        const wasteByReason = Object.entries(byReason).map(([reason, data]) => ({
          reason,
          ...data,
        }));

        return {
          branch_id: branchId,
          period,
          total_items_wasted: totalItemsWasted,
          total_cost_lost: totalCostLost,
          top_wasted_items: topWastedItems,
          waste_by_reason: wasteByReason,
        };
      },

      getTotalWasteCost: (branchId, startDate, endDate) => {
        const records = get().getRecordsByBranch(branchId, startDate, endDate);
        return records.reduce((sum, r) => sum + r.cost, 0);
      },

      getWasteTrend: (branchId, days) => {
        const records = get().getRecordsByBranch(branchId);
        const trend: { date: string; cost: number }[] = [];

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayRecords = records.filter((r) => {
            const rDate = new Date(r.recorded_at).toISOString().split('T')[0];
            return rDate === dateStr;
          });

          trend.push({
            date: dateStr,
            cost: dayRecords.reduce((sum, r) => sum + r.cost, 0),
          });
        }

        return trend;
      },
    }),
    {
      name: 'waste-tracking-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
