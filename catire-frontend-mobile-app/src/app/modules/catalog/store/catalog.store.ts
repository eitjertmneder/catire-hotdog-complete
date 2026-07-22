import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Branch, BranchDTO } from '../models/Branch';
import { Menu, MenuDTO } from '../models/Menu';
import { Product, ProductDTO } from '../models/Product';
import catalogApi from '../api/catalog.api';

type CatalogState = {
  branches: Branch[];
  menus: Menu[];
  products: Product[];
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  
  clearCatalogError: () => void;

  // --- BRANCHES ACTIONS ---
  fetchBranches: (token: string) => Promise<void>;
  addBranch: (token: string, payload: BranchDTO) => Promise<void>;
  editBranch: (token: string, id: string | number, payload: Partial<Branch>) => Promise<void>;
  removeBranch: (token: string, id: string | number) => Promise<void>;

  // --- MENUS ACTIONS ---
  fetchMenus: (token: string, branchId?: string) => Promise<void>;
  addMenu: (token: string, payload: MenuDTO) => Promise<void>;
  editMenu: (token: string, id: string | number, payload: Partial<Menu>) => Promise<void>;
  removeMenu: (token: string, id: string | number) => Promise<void>;

  // --- PRODUCTS ACTIONS ---
  fetchProducts: (token: string, menuId?: string) => Promise<void>;
  addProduct: (token: string, payload: ProductDTO) => Promise<void>;
  editProduct: (token: string, id: string | number, payload: Partial<Product>) => Promise<void>;
  removeProduct: (token: string, id: string | number) => Promise<void>;
};

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      branches: [],
      menus: [],
      products: [],
      loading: false,
      actionLoading: false,
      error: null,

      clearCatalogError: () => set({ error: null }),

      fetchBranches: async (token) => {
        set({ loading: true, error: null });
        try {
          const res = await catalogApi.getBranches(token);

          if (res.error) {
            set({ error: res.message });
            return
          }

          set({ branches: res.data || [] });
        } catch {
          set({ loading: false });
        } finally {
          set({ loading: false }); 
        }
      },

      addBranch: async (token, payload) => {
        set({ actionLoading: true, error: null });

        try {
          const res = await catalogApi.createBranch(token, payload);
          if (res.error) {
            set({ error: res.message })
            return;
          }

          if (res.data) set((state) => ({ branches: [...state.branches, res.data!] }));
        } finally {
          set({ actionLoading: false });
        }
      },

      editBranch: async (token, id, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await catalogApi.updateBranch(token, id, payload);
          
          if (res.error) {
            set({ error: res.message });
            return;
          }

          set((state) => ({
            branches: state.branches.map((b) => (b.id === id ? { ...b, ...res.data } : b)),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      removeBranch: async (token, id) => {
        set({ actionLoading: true, error: null });

        try {
          const res = await catalogApi.deleteBranch(token, id);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          
          set((state) => ({
            branches: state.branches.filter((b) => b.id !== id),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      fetchMenus: async (token, branchId) => {
        set({ loading: true, error: null });

        try {
          const res = await catalogApi.getMenus(token, branchId);
          if (res.error) {
            set({ error: res.message });
            return;
          }

          set({ menus: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      addMenu: async (token, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await catalogApi.createMenu(token, payload);
          if (res.error) {
            set({ error: res.message });
            return;
          }

          if (res.data) set((state) => ({ menus: [...state.menus, res.data!] }));
        } finally {
          set({ actionLoading: false });
        }
      },

      editMenu: async (token, id, payload) => {
        set({ actionLoading: true, error: null });

        try {
          const res = await catalogApi.updateMenu(token, id, payload);

          if (res.error) {
            set({ error: res.message });
            return;
          }

          set((state) => ({
            menus: state.menus.map((m) => (m.id === id ? { ...m, ...res.data } : m)),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      removeMenu: async (token, id) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await catalogApi.deleteMenu(token, id);
          
          if (res.error) {
            set({ error: res.message });
            return;
          }

          set((state) => ({
            menus: state.menus.filter((m) => m.id !== id),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      fetchProducts: async (token, menuId) => {
        set({ loading: true, error: null });
        try {
          const res = await catalogApi.getProducts(token, menuId);

          if (res.error) {
            set({ error: res.message });
            return;
          }
          
          set({ products: res.data || [] });
        } finally {
          set({ loading: false });
        }
      },

      addProduct: async (token, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await catalogApi.createProduct(token, payload);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          if (res.data) set((state) => ({ products: [...state.products, res.data!] }));
        } finally {
          set({ actionLoading: false });
        }
      },

      editProduct: async (token, id, payload) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await catalogApi.updateProduct(token, id, payload);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          set((state) => ({
            products: state.products.map((p) => (p.id === id ? { ...p, ...res.data } : p)),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },

      removeProduct: async (token, id) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await catalogApi.deleteProduct(token, id);
          if (res.error) {
            set({ error: res.message });
            return;
          }
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));
        } finally {
          set({ actionLoading: false });
        }
      },
    }),
    {
      name: 'catalog-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        branches: state.branches,
        menus: state.menus,
        products: state.products,
      }),
    }
  )
);