import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Report {
  id: string;
  type: 'sales' | 'inventory' | 'orders' | 'products' | 'employees';
  title: string;
  date_from: Date;
  date_to: Date;
  data: any;
  generated_at: Date;
}

type ReportingState = {
  reports: Report[];
  generateReport: (type: Report['type'], dateFrom: Date, dateTo: Date) => Promise<Report>;
  getReports: (type?: Report['type']) => Report[];
  deleteReport: (id: string) => void;
  exportToPDF: (reportId: string) => Promise<string>;
  exportToCSV: (reportId: string) => Promise<string>;
};

export const useReportingStore = create<ReportingState>()(
  persist(
    (set, get) => ({
      reports: [],

      generateReport: async (type, dateFrom, dateTo) => {
        // Simulated report generation
        const report: Report = {
          id: Date.now().toString(),
          type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          date_from: dateFrom,
          date_to: dateTo,
          data: {},
          generated_at: new Date(),
        };

        set((state) => ({ reports: [report, ...state.reports] }));
        return report;
      },

      getReports: (type) => {
        const { reports } = get();
        if (type) return reports.filter(r => r.type === type);
        return reports;
      },

      deleteReport: (id) => {
        set((state) => ({
          reports: state.reports.filter(r => r.id !== id),
        }));
      },

      exportToPDF: async (reportId) => {
        // In real app, this would generate PDF
        return `report_${reportId}.pdf`;
      },

      exportToCSV: async (reportId) => {
        // In real app, this would generate CSV
        return `report_${reportId}.csv`;
      },
    }),
    {
      name: 'reporting-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
