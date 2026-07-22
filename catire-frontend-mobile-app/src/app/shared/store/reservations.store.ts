import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Reservation {
  id: string;
  user_id: number;
  user_name: string;
  branch_id: number;
  branch_name: string;
  table_id?: string;
  date: Date;
  time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  notes?: string;
  special_requests?: string;
  created_at: Date;
  confirmed_at?: Date;
  seated_at?: Date;
  completed_at?: Date;
}

type ReservationsState = {
  reservations: Reservation[];
  createReservation: (reservation: Omit<Reservation, 'id' | 'status' | 'created_at'>) => string;
  updateReservationStatus: (reservationId: string, status: Reservation['status']) => void;
  cancelReservation: (reservationId: string) => void;
  getReservation: (reservationId: string) => Reservation | undefined;
  getReservationsByDate: (date: Date, branchId?: number) => Reservation[];
  getReservationsByUser: (userId: number) => Reservation[];
  getAvailableSlots: (branchId: number, date: Date) => string[];
  getUpcomingReservations: (userId: number) => Reservation[];
};

export const useReservationsStore = create<ReservationsState>()(
  persist(
    (set, get) => ({
      reservations: [],

      createReservation: (reservation) => {
        const id = Date.now().toString();
        const newReservation: Reservation = {
          ...reservation,
          id,
          status: 'pending',
          created_at: new Date(),
        };
        set((state) => ({
          reservations: [newReservation, ...state.reservations],
        }));
        return id;
      },

      updateReservationStatus: (reservationId, status) => {
        set((state) => ({
          reservations: state.reservations.map(r =>
            r.id === reservationId ? { ...r, status, [`${status}_at`]: new Date() } : r
          ),
        }));
      },

      cancelReservation: (reservationId) => {
        get().updateReservationStatus(reservationId, 'cancelled');
      },

      getReservation: (reservationId) => {
        return get().reservations.find(r => r.id === reservationId);
      },

      getReservationsByDate: (date, branchId) => {
        const dateStr = date.toISOString().split('T')[0];
        return get().reservations.filter(r => {
          const rDate = new Date(r.date).toISOString().split('T')[0];
          if (rDate !== dateStr) return false;
          if (branchId && r.branch_id !== branchId) return false;
          return true;
        });
      },

      getReservationsByUser: (userId) => {
        return get().reservations.filter(r => r.user_id === userId);
      },

      getAvailableSlots: (branchId, date) => {
        const bookedSlots = get().getReservationsByDate(date, branchId)
          .filter(r => r.status !== 'cancelled')
          .map(r => r.time);
        
        const allSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
        return allSlots.filter(slot => !bookedSlots.includes(slot));
      },

      getUpcomingReservations: (userId) => {
        const now = new Date();
        return get().reservations
          .filter(r => r.user_id === userId && new Date(r.date) >= now && r.status !== 'cancelled')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
    }),
    {
      name: 'reservations-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
