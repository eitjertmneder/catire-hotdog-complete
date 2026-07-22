import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteProduct {
  id: number;
  name: string;
  base_price: number;
  img_src?: string;
  category_name?: string;
  added_at: Date;
}

type FavoritesState = {
  favorites: FavoriteProduct[];
  addFavorite: (product: Omit<FavoriteProduct, 'added_at'>) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Omit<FavoriteProduct, 'added_at'>) => void;
  clearFavorites: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (product) => {
        const { favorites } = get();
        const exists = favorites.some(f => f.id === product.id);
        if (!exists) {
          set({ favorites: [...favorites, { ...product, added_at: new Date() }] });
        }
      },

      removeFavorite: (productId) => {
        set({ favorites: get().favorites.filter(f => f.id !== productId) });
      },

      isFavorite: (productId) => {
        return get().favorites.some(f => f.id === productId);
      },

      toggleFavorite: (product) => {
        const { favorites } = get();
        const exists = favorites.some(f => f.id === product.id);
        if (exists) {
          set({ favorites: favorites.filter(f => f.id !== product.id) });
        } else {
          set({ favorites: [...favorites, { ...product, added_at: new Date() }] });
        }
      },

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
