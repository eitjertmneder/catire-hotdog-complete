import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WaitTimeEstimate {
  branch_id: number;
  branch_name: string;
  estimated_wait_minutes: number;
  current_orders: number;
  average_preparation_time: number;
  staff_on_duty: number;
  last_updated: Date;
}

export interface WalkInCustomer {
  id: string;
  name: string;
  phone: string;
  party_size: number;
  branch_id: number;
  check_in_time: Date;
  estimated_wait: number;
  status: 'waiting' | 'seated' | 'completed' | 'no_show';
  table_assigned?: string;
}

type WaitTimeState = {
  estimates: Record<number, WaitTimeEstimate>;
  walkInQueue: WalkInCustomer[];
  calculateWaitTime: (branchId: number, orderComplexity: 'simple' | 'medium' | 'complex') => number;
  addWalkIn: (customer: Omit<WalkInCustomer, 'id' | 'check_in_time' | 'estimated_wait' | 'status'>) => string;
  seatCustomer: (customerId: string, tableNumber: string) => void;
  completeCustomer: (customerId: string) => void;
  markNoShow: (customerId: string) => void;
  getQueueByBranch: (branchId: number) => WalkInCustomer[];
  getEstimatedPosition: (customerId: string) => number;
};

export const useWaitTimeStore = create<WaitTimeState>()(
  persist(
    (set, get) => ({
      estimates: {},
      walkInQueue: [],

      calculateWaitTime: (branchId, orderComplexity) => {
        const baseTime = orderComplexity === 'simple' ? 5 : orderComplexity === 'medium' ? 10 : 15;
        const queueLength = get().getQueueByBranch(branchId).length;
        const waitTime = baseTime + (queueLength * 3);
        return Math.min(waitTime, 60); // Max 60 minutes
      },

      addWalkIn: (customer) => {
        const id = Date.now().toString();
        const estimatedWait = get().calculateWaitTime(customer.branch_id, 'medium');
        
        const newCustomer: WalkInCustomer = {
          ...customer,
          id,
          check_in_time: new Date(),
          estimated_wait: estimatedWait,
          status: 'waiting',
        };

        set((state) => ({
          walkInQueue: [...state.walkInQueue, newCustomer],
        }));

        return id;
      },

      seatCustomer: (customerId, tableNumber) => {
        set((state) => ({
          walkInQueue: state.walkInQueue.map(c =>
            c.id === customerId ? { ...c, status: 'seated', table_assigned: tableNumber } : c
          ),
        }));
      },

      completeCustomer: (customerId) => {
        set((state) => ({
          walkInQueue: state.walkInQueue.filter(c => c.id !== customerId),
        }));
      },

      markNoShow: (customerId) => {
        set((state) => ({
          walkInQueue: state.walkInQueue.map(c =>
            c.id === customerId ? { ...c, status: 'no_show' } : c
          ),
        }));
      },

      getQueueByBranch: (branchId) => {
        return get().walkInQueue.filter(c => c.branch_id === branchId && c.status === 'waiting');
      },

      getEstimatedPosition: (customerId) => {
        const customer = get().walkInQueue.find(c => c.id === customerId);
        if (!customer) return -1;
        
        const queue = get().getQueueByBranch(customer.branch_id);
        return queue.findIndex(c => c.id === customerId) + 1;
      },
    }),
    {
      name: 'wait-time-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
