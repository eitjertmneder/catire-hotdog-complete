import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QualityChecklist {
  id: string;
  name: string;
  category: 'opening' | 'closing' | 'food_safety' | 'cleanliness' | 'equipment';
  items: QualityCheckItem[];
  frequency: 'daily' | 'weekly' | 'monthly';
}

export interface QualityCheckItem {
  id: string;
  text: string;
  checked: boolean;
  notes?: string;
  photo_required: boolean;
}

export interface QualityInspection {
  id: string;
  checklist_id: string;
  branch_id: number;
  inspector_id: number;
  inspector_name: string;
  items_checked: number;
  items_total: number;
  score: number; // percentage
  completed_at: Date;
  notes?: string;
  photos: string[];
  issues: string[];
}

type QualityControlState = {
  checklists: QualityChecklist[];
  inspections: QualityInspection[];
  addChecklist: (checklist: Omit<QualityChecklist, 'id'>) => void;
  updateChecklist: (id: string, updates: Partial<QualityChecklist>) => void;
  deleteChecklist: (id: string) => void;
  startInspection: (checklistId: string, branchId: number, inspectorId: number, inspectorName: string) => string;
  updateInspectionItem: (inspectionId: string, itemId: string, checked: boolean, notes?: string) => void;
  completeInspection: (inspectionId: string, notes?: string) => void;
  getInspectionsByBranch: (branchId: number) => QualityInspection[];
  getInspectionScore: (inspectionId: string) => number;
  getComplianceRate: (branchId: number, days: number) => number;
  getChecklistsByCategory: (category: string) => QualityChecklist[];
};

export const useQualityControlStore = create<QualityControlState>()(
  persist(
    (set, get) => ({
      checklists: [
        {
          id: 'opening_check',
          name: 'Apertura de Sucursal',
          category: 'opening',
          frequency: 'daily',
          items: [
            { id: 'oc1', text: 'Verificar limpieza del local', checked: false, photo_required: false },
            { id: 'oc2', text: 'Revisar inventario básico', checked: false, photo_required: false },
            { id: 'oc3', text: 'Encender equipos de cocina', checked: false, photo_required: false },
            { id: 'oc4', text: 'Verificar temperatura de refrigeradores', checked: false, photo_required: true },
            { id: 'oc5', text: 'Preparar estaciones de trabajo', checked: false, photo_required: false },
          ],
        },
        {
          id: 'closing_check',
          name: 'Cierre de Sucursal',
          category: 'closing',
          frequency: 'daily',
          items: [
            { id: 'cc1', text: 'Limpiar todas las áreas de trabajo', checked: false, photo_required: false },
            { id: 'cc2', text: 'Almacenar alimentos correctamente', checked: false, photo_required: false },
            { id: 'cc3', text: 'Apagar equipos de cocina', checked: false, photo_required: false },
            { id: 'cc4', text: 'Contar caja y registrar ingresos', checked: false, photo_required: false },
            { id: 'cc5', text: 'Barrer y trapear pisos', checked: false, photo_required: false },
          ],
        },
        {
          id: 'food_safety',
          name: 'Seguridad Alimentaria',
          category: 'food_safety',
          frequency: 'weekly',
          items: [
            { id: 'fs1', text: 'Verificar temperaturas de refrigeración', checked: false, photo_required: true },
            { id: 'fs2', text: 'Revisar fechas de caducidad', checked: false, photo_required: false },
            { id: 'fs3', text: 'Verificar higiene del personal', checked: false, photo_required: false },
            { id: 'fs4', text: 'Limpiar y desinfectar superficies', checked: false, photo_required: true },
            { id: 'fs5', text: 'Revisar estado de alimentos', checked: false, photo_required: false },
          ],
        },
      ],
      inspections: [],

      addChecklist: (checklist) => {
        const newChecklist: QualityChecklist = {
          ...checklist,
          id: Date.now().toString(),
        };
        set((state) => ({ checklists: [...state.checklists, newChecklist] }));
      },

      updateChecklist: (id, updates) => {
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteChecklist: (id) => {
        set((state) => ({
          checklists: state.checklists.filter((c) => c.id !== id),
        }));
      },

      startInspection: (checklistId, branchId, inspectorId, inspectorName) => {
        const checklist = get().checklists.find((c) => c.id === checklistId);
        if (!checklist) return '';

        const id = Date.now().toString();
        const inspection: QualityInspection = {
          id,
          checklist_id: checklistId,
          branch_id: branchId,
          inspector_id: inspectorId,
          inspector_name: inspectorName,
          items_checked: 0,
          items_total: checklist.items.length,
          score: 0,
          completed_at: new Date(),
          photos: [],
          issues: [],
        };

        set((state) => ({ inspections: [inspection, ...state.inspections] }));
        return id;
      },

      updateInspectionItem: (inspectionId, itemId, checked, notes) => {
        set((state) => ({
          inspections: state.inspections.map((i) => {
            if (i.id !== inspectionId) return i;
            return {
              ...i,
              items_checked: checked ? i.items_checked + 1 : i.items_checked - 1,
            };
          }),
        }));
      },

      completeInspection: (inspectionId, notes) => {
        set((state) => ({
          inspections: state.inspections.map((i) => {
            if (i.id !== inspectionId) return i;
            const score = (i.items_checked / i.items_total) * 100;
            return { ...i, score, notes, completed_at: new Date() };
          }),
        }));
      },

      getInspectionsByBranch: (branchId) => {
        return get().inspections.filter((i) => i.branch_id === branchId);
      },

      getInspectionScore: (inspectionId) => {
        const inspection = get().inspections.find((i) => i.id === inspectionId);
        return inspection?.score || 0;
      },

      getComplianceRate: (branchId, days) => {
        const inspections = get().getInspectionsByBranch(branchId);
        const recentInspections = inspections.filter((i) => {
          const inspectionDate = new Date(i.completed_at);
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - days);
          return inspectionDate >= cutoff;
        });

        if (recentInspections.length === 0) return 0;
        return recentInspections.reduce((sum, i) => sum + i.score, 0) / recentInspections.length;
      },

      getChecklistsByCategory: (category) => {
        return get().checklists.filter((c) => c.category === category);
      },
    }),
    {
      name: 'quality-control-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
