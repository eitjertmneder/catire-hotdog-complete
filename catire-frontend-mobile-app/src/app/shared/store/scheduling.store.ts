import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Schedule {
  id: string;
  employee_id: number;
  employee_name: string;
  branch_id: number;
  branch_name: string;
  date: Date;
  start_time: string; // "08:00"
  end_time: string; // "17:00"
  status: 'scheduled' | 'confirmed' | 'completed' | 'absent';
  notes?: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  days: {
    day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
    start_time: string;
    end_time: string;
    active: boolean;
  }[];
}

type SchedulingState = {
  schedules: Schedule[];
  templates: ScheduleTemplate[];
  addSchedule: (schedule: Omit<Schedule, 'id'>) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
  getSchedulesByDate: (date: Date, branchId?: number) => Schedule[];
  getSchedulesByEmployee: (employeeId: number, startDate: Date, endDate: Date) => Schedule[];
  applyTemplate: (templateId: string, employeeId: number, startDate: Date, weeks: number) => void;
  addTemplate: (template: Omit<ScheduleTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  getWeeklyHours: (employeeId: number, startDate: Date) => number;
};

export const useSchedulingStore = create<SchedulingState>()(
  persist(
    (set, get) => ({
      schedules: [],
      templates: [],

      addSchedule: (schedule) => {
        const newSchedule: Schedule = {
          ...schedule,
          id: Date.now().toString(),
        };
        set((state) => ({ schedules: [newSchedule, ...state.schedules] }));
      },

      updateSchedule: (id, updates) => {
        set((state) => ({
          schedules: state.schedules.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter(s => s.id !== id),
        }));
      },

      getSchedulesByDate: (date, branchId) => {
        const { schedules } = get();
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter(s => {
          const sDate = new Date(s.date).toISOString().split('T')[0];
          if (sDate !== dateStr) return false;
          if (branchId && s.branch_id !== branchId) return false;
          return true;
        });
      },

      getSchedulesByEmployee: (employeeId, startDate, endDate) => {
        const { schedules } = get();
        return schedules.filter(s => {
          if (s.employee_id !== employeeId) return false;
          const sDate = new Date(s.date);
          return sDate >= startDate && sDate <= endDate;
        });
      },

      applyTemplate: (templateId, employeeId, startDate, weeks) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        for (let week = 0; week < weeks; week++) {
          template.days.forEach((day) => {
            if (!day.active) return;

            const dayIndex = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(day.day);
            const scheduleDate = new Date(startDate);
            scheduleDate.setDate(startDate.getDate() + (week * 7) + dayIndex);

            get().addSchedule({
              employee_id: employeeId,
              employee_name: '',
              branch_id: 0,
              branch_name: '',
              date: scheduleDate,
              start_time: day.start_time,
              end_time: day.end_time,
              status: 'scheduled',
            });
          });
        }
      },

      addTemplate: (template) => {
        const newTemplate: ScheduleTemplate = {
          ...template,
          id: Date.now().toString(),
        };
        set((state) => ({ templates: [...state.templates, newTemplate] }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id),
        }));
      },

      getWeeklyHours: (employeeId, startDate) => {
        const weekEnd = new Date(startDate);
        weekEnd.setDate(startDate.getDate() + 6);
        
        const weekSchedules = get().getSchedulesByEmployee(employeeId, startDate, weekEnd);
        
        return weekSchedules.reduce((total, s) => {
          const [startH, startM] = s.start_time.split(':').map(Number);
          const [endH, endM] = s.end_time.split(':').map(Number);
          const hours = (endH + endM / 60) - (startH + startM / 60);
          return total + hours;
        }, 0);
      },
    }),
    {
      name: 'scheduling-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
