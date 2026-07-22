import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecipeIngredient {
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  product_id: number;
  product_name: string;
  ingredients: RecipeIngredient[];
  estimated_cost: number;
  selling_price: number;
  profit_margin: number;
}

type RecipeState = {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  getRecipeByProduct: (productId: number) => Recipe | undefined;
  calculateCost: (productId: number) => number;
  checkIngredientAvailability: (productId: number, branchId: number) => { available: boolean; missing: string[] };
  deductIngredients: (productId: number, branchId: number, quantity: number) => boolean;
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],

      addRecipe: (recipe) => {
        const newRecipe: Recipe = {
          ...recipe,
          id: Date.now().toString(),
        };
        set((state) => ({ recipes: [...state.recipes, newRecipe] }));
      },

      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter(r => r.id !== id),
        }));
      },

      getRecipeByProduct: (productId) => {
        return get().recipes.find(r => r.product_id === productId);
      },

      calculateCost: (productId) => {
        const recipe = get().getRecipeByProduct(productId);
        return recipe?.estimated_cost || 0;
      },

      checkIngredientAvailability: (productId, branchId) => {
        const recipe = get().getRecipeByProduct(productId);
        if (!recipe) return { available: true, missing: [] };
        
        // In real app, this would check inventory from API
        // For now, return mock data
        return { available: true, missing: [] };
      },

      deductIngredients: (productId, branchId, quantity) => {
        const recipe = get().getRecipeByProduct(productId);
        if (!recipe) return false;
        
        // In real app, this would call API to deduct inventory
        return true;
      },
    }),
    {
      name: 'recipes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
