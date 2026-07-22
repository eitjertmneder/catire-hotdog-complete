import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Api } from '../api/api';

const api = new Api();

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  branch_id: number;
  reorder_level: number;
  cost_per_unit: number;
  last_restocked: Date;
}

export interface StockMovement {
  id: string;
  ingredient_id: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference_id?: string;
  created_at: Date;
}

type AdvancedInventoryState = {
  items: InventoryItem[];
  movements: StockMovement[];
  alerts: InventoryAlert[];
  fetchInventory: (branchId: number, token: string) => Promise<void>;
  deductStock: (ingredientId: number, quantity: number, reason: string, referenceId?: string) => boolean;
  addStock: (ingredientId: number, quantity: number, reason: string) => void;
  adjustStock: (ingredientId: number, newQuantity: number, reason: string) => void;
  checkLowStock: () => InventoryAlert[];
  getInventoryValue: (branchId: number) => number;
  getMovements: (ingredientId?: number) => StockMovement[];
  bulkDeduct: (items: { ingredient_id: number; quantity: number }[]) => boolean;
};

export interface InventoryAlert {
  id: string;
  ingredient_id: number;
  ingredient_name: string;
  current_stock: number;
  reorder_level: number;
  branch_id: number;
  severity: 'low' | 'critical' | 'out';
}

export const useAdvancedInventoryStore = create<AdvancedInventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      movements: [],
      alerts: [],

      fetchInventory: async (branchId, token) => {
        const res = await api.get<InventoryItem[]>('catalog', 'ingredients', token);
        if (!res.error && res.data) {
          const filtered = res.data.filter((i: InventoryItem) => i.branch_id === branchId);
          set({ items: filtered });
          get().checkLowStock();
        }
      },

      deductStock: (ingredientId, quantity, reason, referenceId) => {
        const { items, movements } = get();
        const item = items.find(i => i.id === ingredientId);
        
        if (!item || item.stock < quantity) return false;

        const movement: StockMovement = {
          id: Date.now().toString(),
          ingredient_id: ingredientId,
          type: 'out',
          quantity,
          reason,
          reference_id: referenceId,
          created_at: new Date(),
        };

        set({
          items: items.map(i =>
            i.id === ingredientId ? { ...i, stock: i.stock - quantity } : i
          ),
          movements: [movement, ...movements],
        });

        get().checkLowStock();
        return true;
      },

      addStock: (ingredientId, quantity, reason) => {
        const { items, movements } = get();
        
        const movement: StockMovement = {
          id: Date.now().toString(),
          ingredient_id: ingredientId,
          type: 'in',
          quantity,
          reason,
          created_at: new Date(),
        };

        set({
          items: items.map(i =>
            i.id === ingredientId ? { ...i, stock: i.stock + quantity, last_restocked: new Date() } : i
          ),
          movements: [movement, ...movements],
        });
      },

      adjustStock: (ingredientId, newQuantity, reason) => {
        const { items, movements } = get();
        const item = items.find(i => i.id === ingredientId);
        if (!item) return;

        const adjustment = newQuantity - item.stock;
        const movement: StockMovement = {
          id: Date.now().toString(),
          ingredient_id: ingredientId,
          type: 'adjustment',
          quantity: Math.abs(adjustment),
          reason,
          created_at: new Date(),
        };

        set({
          items: items.map(i =>
            i.id === ingredientId ? { ...i, stock: newQuantity } : i
          ),
          movements: [movement, ...movements],
        });
      },

      checkLowStock: () => {
        const { items } = get();
        const alerts: InventoryAlert[] = [];

        items.forEach(item => {
          if (item.stock === 0) {
            alerts.push({
              id: `out_${item.id}`,
              ingredient_id: item.id,
              ingredient_name: item.name,
              current_stock: item.stock,
              reorder_level: item.reorder_level,
              branch_id: item.branch_id,
              severity: 'out',
            });
          } else if (item.stock <= item.reorder_level * 0.5) {
            alerts.push({
              id: `critical_${item.id}`,
              ingredient_id: item.id,
              ingredient_name: item.name,
              current_stock: item.stock,
              reorder_level: item.reorder_level,
              branch_id: item.branch_id,
              severity: 'critical',
            });
          } else if (item.stock <= item.reorder_level) {
            alerts.push({
              id: `low_${item.id}`,
              ingredient_id: item.id,
              ingredient_name: item.name,
              current_stock: item.stock,
              reorder_level: item.reorder_level,
              branch_id: item.branch_id,
              severity: 'low',
            });
          }
        });

        set({ alerts });
        return alerts;
      },

      getInventoryValue: (branchId) => {
        const { items } = get();
        return items
          .filter(i => i.branch_id === branchId)
          .reduce((total, item) => total + item.stock * item.cost_per_unit, 0);
      },

      getMovements: (ingredientId) => {
        const { movements } = get();
        if (ingredientId) return movements.filter(m => m.ingredient_id === ingredientId);
        return movements;
      },

      bulkDeduct: (items) => {
        const success = items.every(item =>
          get().deductStock(item.ingredient_id, item.quantity, 'Pedido confirmado')
        );
        return success;
      },
    }),
    {
      name: 'advanced-inventory-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
