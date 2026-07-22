import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Table {
  id: string;
  number: number;
  branch_id: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  current_order_id?: string;
  customer_name?: string;
  occupied_since?: Date;
  reservation_time?: Date;
  notes?: string;
}

export interface TableReservation {
  id: string;
  table_id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  reservation_time: Date;
  duration_minutes: number;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
  notes?: string;
}

type TableState = {
  tables: Table[];
  reservations: TableReservation[];
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTableStatus: (tableId: string, status: Table['status'], orderId?: string, customerName?: string) => void;
  reserveTable: (reservation: Omit<TableReservation, 'id'>) => string;
  cancelReservation: (reservationId: string) => void;
  seatReservation: (reservationId: string) => void;
  getTablesByBranch: (branchId: number) => Table[];
  getAvailableTables: (branchId: number, partySize: number) => Table[];
  getReservationsByDate: (date: Date, branchId?: number) => TableReservation[];
  getTableUtilization: (branchId: number) => { total: number; occupied: number; percentage: number };
};

export const useTableStore = create<TableState>()(
  persist(
    (set, get) => ({
      tables: [],
      reservations: [],

      addTable: (table) => {
        const newTable: Table = {
          ...table,
          id: Date.now().toString(),
        };
        set((state) => ({ tables: [...state.tables, newTable] }));
      },

      updateTableStatus: (tableId, status, orderId, customerName) => {
        set((state) => ({
          tables: state.tables.map(t =>
            t.id === tableId ? {
              ...t,
              status,
              current_order_id: orderId || t.current_order_id,
              customer_name: customerName || t.customer_name,
              occupied_since: status === 'occupied' ? new Date() : undefined,
            } : t
          ),
        }));
      },

      reserveTable: (reservation) => {
        const id = Date.now().toString();
        const newReservation: TableReservation = {
          ...reservation,
          id,
          status: 'confirmed',
        };
        
        set((state) => ({
          reservations: [...state.reservations, newReservation],
        }));

        return id;
      },

      cancelReservation: (reservationId) => {
        set((state) => ({
          reservations: state.reservations.map(r =>
            r.id === reservationId ? { ...r, status: 'cancelled' } : r
          ),
        }));
      },

      seatReservation: (reservationId) => {
        set((state) => ({
          reservations: state.reservations.map(r =>
            r.id === reservationId ? { ...r, status: 'seated' } : r
          ),
        }));
      },

      getTablesByBranch: (branchId) => {
        return get().tables.filter(t => t.branch_id === branchId);
      },

      getAvailableTables: (branchId, partySize) => {
        return get().tables.filter(t =>
          t.branch_id === branchId &&
          t.status === 'available' &&
          t.capacity >= partySize
        );
      },

      getReservationsByDate: (date, branchId) => {
        const { reservations } = get();
        const dateStr = date.toISOString().split('T')[0];
        return reservations.filter(r => {
          const rDate = new Date(r.reservation_time).toISOString().split('T')[0];
          return rDate === dateStr;
        });
      },

      getTableUtilization: (branchId) => {
        const tables = get().getTablesByBranch(branchId);
        const occupied = tables.filter(t => t.status === 'occupied').length;
        return {
          total: tables.length,
          occupied,
          percentage: tables.length > 0 ? (occupied / tables.length) * 100 : 0,
        };
      },
    }),
    {
      name: 'tables-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
