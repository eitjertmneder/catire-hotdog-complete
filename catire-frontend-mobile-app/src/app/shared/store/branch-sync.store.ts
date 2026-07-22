import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BranchInventory {
  branch_id: number;
  branch_name: string;
  last_sync: Date;
  items: { ingredient_id: number; name: string; stock: number }[];
}

export interface TransferRequest {
  id: string;
  from_branch_id: number;
  to_branch_id: number;
  items: { ingredient_id: number; quantity: number }[];
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requested_by: number;
  approved_by?: number;
  created_at: Date;
  completed_at?: Date;
}

type BranchSyncState = {
  branchInventory: BranchInventory[];
  transferRequests: TransferRequest[];
  syncBranchInventory: (branchId: number) => Promise<void>;
  syncAllBranches: () => Promise<void>;
  createTransferRequest: (from: number, to: number, items: { ingredient_id: number; quantity: number }[], userId: number) => string;
  approveTransfer: (requestId: string, approverId: number) => void;
  completeTransfer: (requestId: string) => void;
  rejectTransfer: (requestId: string) => void;
  getTransferRequests: (branchId?: number, status?: string) => TransferRequest[];
  getInventoryByBranch: (branchId: number) => BranchInventory | undefined;
};

export const useBranchSyncStore = create<BranchSyncState>()(
  persist(
    (set, get) => ({
      branchInventory: [],
      transferRequests: [],

      syncBranchInventory: async (branchId) => {
        // Simulated sync - in real app would fetch from API
        const sync: BranchInventory = {
          branch_id: branchId,
          branch_name: `Sucursal ${branchId}`,
          last_sync: new Date(),
          items: [],
        };
        
        set((state) => ({
          branchInventory: [
            ...state.branchInventory.filter(b => b.branch_id !== branchId),
            sync,
          ],
        }));
      },

      syncAllBranches: async () => {
        const branchIds = [1, 2, 3, 4, 11, 12, 13, 16, 17];
        for (const id of branchIds) {
          await get().syncBranchInventory(id);
        }
      },

      createTransferRequest: (from, to, items, userId) => {
        const request: TransferRequest = {
          id: Date.now().toString(),
          from_branch_id: from,
          to_branch_id: to,
          items,
          status: 'pending',
          requested_by: userId,
          created_at: new Date(),
        };
        
        set((state) => ({
          transferRequests: [request, ...state.transferRequests],
        }));
        
        return request.id;
      },

      approveTransfer: (requestId, approverId) => {
        set((state) => ({
          transferRequests: state.transferRequests.map(r =>
            r.id === requestId ? { ...r, status: 'approved', approved_by: approverId } : r
          ),
        }));
      },

      completeTransfer: (requestId) => {
        set((state) => ({
          transferRequests: state.transferRequests.map(r =>
            r.id === requestId ? { ...r, status: 'completed', completed_at: new Date() } : r
          ),
        }));
      },

      rejectTransfer: (requestId) => {
        set((state) => ({
          transferRequests: state.transferRequests.map(r =>
            r.id === requestId ? { ...r, status: 'rejected' } : r
          ),
        }));
      },

      getTransferRequests: (branchId, status) => {
        const { transferRequests } = get();
        return transferRequests.filter(r => {
          if (branchId && r.from_branch_id !== branchId && r.to_branch_id !== branchId) return false;
          if (status && r.status !== status) return false;
          return true;
        });
      },

      getInventoryByBranch: (branchId) => {
        return get().branchInventory.find(b => b.branch_id === branchId);
      },
    }),
    {
      name: 'branch-sync-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
