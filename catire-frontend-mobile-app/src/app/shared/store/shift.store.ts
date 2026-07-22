import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Shift {
  id: string;
  employee_id: number;
  employee_name: string;
  branch_id: number;
  branch_name: string;
  start_time: Date;
  end_time?: Date;
  status: 'active' | 'completed' | 'scheduled';
  hours_worked: number;
}

type ShiftState = {
  currentShift: Shift | null;
  shifts: Shift[];
  startShift: (branchId: number, branchName: string, employeeId: number, employeeName: string) => void;
  endShift: () => void;
  getShifts: (employeeId?: number) => Shift[];
  getTotalHoursThisWeek: (employeeId: number) => number;
};

export const useShiftStore = create<ShiftState>()(
  persist(
    (set, get) => ({
      currentShift: null,
      shifts: [],

      startShift: (branchId, branchName, employeeId, employeeName) => {
        const newShift: Shift = {
          id: Date.now().toString(),
          employee_id: employeeId,
          employee_name: employeeName,
          branch_id: branchId,
          branch_name: branchName,
          start_time: new Date(),
          status: 'active',
          hours_worked: 0,
        };
        set({ currentShift: newShift });
      },

      endShift: () => {
        const { currentShift, shifts } = get();
        if (!currentShift) return;

        const endTime = new Date();
        const hoursWorked = (endTime.getTime() - new Date(currentShift.start_time).getTime()) / (1000 * 60 * 60);

        const completedShift: Shift = {
          ...currentShift,
          end_time: endTime,
          status: 'completed',
          hours_worked: Math.round(hoursWorked * 100) / 100,
        };

        set({
          currentShift: null,
          shifts: [completedShift, ...shifts],
        });
      },

      getShifts: (employeeId) => {
        const { shifts } = get();
        if (employeeId) return shifts.filter(s => s.employee_id === employeeId);
        return shifts;
      },

      getTotalHoursThisWeek: (employeeId) => {
        const { shifts } = get();
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        return shifts
          .filter(s => 
            s.employee_id === employeeId &&
            s.status === 'completed' &&
            new Date(s.start_time) >= weekStart
          )
          .reduce((total, s) => total + s.hours_worked, 0);
      },
    }),
    {
      name: 'shifts-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
