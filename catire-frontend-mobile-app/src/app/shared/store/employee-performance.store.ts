import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetric {
  employee_id: number;
  employee_name: string;
  period: 'daily' | 'weekly' | 'monthly';
  orders_handled: number;
  average_order_time: number; // minutes
  customer_rating: number;
  items_sold: number;
  revenue_generated: number;
  attendance_rate: number; // percentage
  punctuality_score: number; // 0-100
}

export interface EmployeeGoal {
  id: string;
  employee_id: number;
  type: 'orders' | 'revenue' | 'rating' | 'time';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  start_date: Date;
  end_date: Date;
}

type EmployeePerformanceState = {
  metrics: PerformanceMetric[];
  goals: EmployeeGoal[];
  trackOrder: (employeeId: number, orderId: string, revenue: number) => void;
  updateRating: (employeeId: number, rating: number) => void;
  getEmployeeMetrics: (employeeId: number, period?: string) => PerformanceMetric | undefined;
  getTopPerformers: (count: number) => PerformanceMetric[];
  setGoal: (goal: Omit<EmployeeGoal, 'id' | 'current'>) => void;
  updateGoalProgress: (goalId: string, increment: number) => void;
  getGoalProgress: (employeeId: number) => EmployeeGoal[];
  calculateBonus: (employeeId: number) => number;
};

export const useEmployeePerformanceStore = create<EmployeePerformanceState>()(
  persist(
    (set, get) => ({
      metrics: [],
      goals: [],

      trackOrder: (employeeId, orderId, revenue) => {
        const { metrics } = get();
        const existing = metrics.find(m => m.employee_id === employeeId);
        
        if (existing) {
          set((state) => ({
            metrics: state.metrics.map(m =>
              m.employee_id === employeeId ? {
                ...m,
                orders_handled: m.orders_handled + 1,
                revenue_generated: m.revenue_generated + revenue,
                items_sold: m.items_sold + 1,
              } : m
            ),
          }));
        } else {
          const newMetric: PerformanceMetric = {
            employee_id: employeeId,
            employee_name: '',
            period: 'daily',
            orders_handled: 1,
            average_order_time: 0,
            customer_rating: 0,
            items_sold: 1,
            revenue_generated: revenue,
            attendance_rate: 100,
            punctuality_score: 100,
          };
          set((state) => ({ metrics: [...state.metrics, newMetric] }));
        }
      },

      updateRating: (employeeId, rating) => {
        set((state) => ({
          metrics: state.metrics.map(m =>
            m.employee_id === employeeId ? {
              ...m,
              customer_rating: (m.customer_rating + rating) / 2,
            } : m
          ),
        }));
      },

      getEmployeeMetrics: (employeeId) => {
        return get().metrics.find(m => m.employee_id === employeeId);
      },

      getTopPerformers: (count) => {
        return get().metrics
          .sort((a, b) => b.revenue_generated - a.revenue_generated)
          .slice(0, count);
      },

      setGoal: (goal) => {
        const newGoal: EmployeeGoal = {
          ...goal,
          id: Date.now().toString(),
          current: 0,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },

      updateGoalProgress: (goalId, increment) => {
        set((state) => ({
          goals: state.goals.map(g =>
            g.id === goalId ? { ...g, current: g.current + increment } : g
          ),
        }));
      },

      getGoalProgress: (employeeId) => {
        return get().goals.filter(g => g.employee_id === employeeId);
      },

      calculateBonus: (employeeId) => {
        const metrics = get().getEmployeeMetrics(employeeId);
        if (!metrics) return 0;

        let bonus = 0;
        // Bonus for high ratings
        if (metrics.customer_rating >= 4.5) bonus += 100;
        else if (metrics.customer_rating >= 4.0) bonus += 50;
        
        // Bonus for high orders
        if (metrics.orders_handled >= 50) bonus += 150;
        else if (metrics.orders_handled >= 30) bonus += 100;
        else if (metrics.orders_handled >= 20) bonus += 50;
        
        // Bonus for punctuality
        if (metrics.punctuality_score >= 95) bonus += 75;
        
        return bonus;
      },
    }),
    {
      name: 'employee-performance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
